import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { findBestMatch } from '../services/matching.service';
import { updateLeaderboardAfterCycle } from '../services/leaderboard.service';
import { sendTemplateNotification } from '../services/notification.service';
import { markSecondDonation } from '../services/forceRecycle.service';
import { sendDonationConfirmationSMS, sendReceiptConfirmationSMS } from '../services/sms.service';
import { sendDonationReceiptEmail, sendReceiptConfirmationEmail } from '../services/email.service';

/**
 * Give donation
 */
export const giveDonation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { amount, recipientPreference, recipientId, locationPreference, faithPreference } = req.body;

    // Check wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.fiatBalance < amount) {
      throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_BALANCE');
    }

    // Find or select recipient
    let finalRecipientId = recipientId;

    if (recipientPreference === 'algorithm' || !recipientId) {
      // Use matching algorithm
      const match = await findBestMatch(userId, amount, {
        location: locationPreference,
        faith: faithPreference,
      });

      if (!match) {
        throw new AppError('No suitable recipient found', 404, 'NO_MATCH_FOUND');
      }

      finalRecipientId = match.recipientId;
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: finalRecipientId },
    });

    if (!recipient) {
      throw new AppError('Recipient not found', 404, 'RECIPIENT_NOT_FOUND');
    }

    // Generate transaction reference
    const transactionRef = generateTransactionRef();

    // Create donation transaction in escrow
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction
      const txn = await tx.transaction.create({
        data: {
          transactionRef,
          type: 'donation_sent',
          fromUserId: userId,
          toUserId: finalRecipientId,
          amount,
          fee: 0,
          netAmount: amount,
          status: 'in_transit',
        },
      });

      // --- TRUST SCORE LOGIC: START ---
      // Check if the donor is fulfilling an obligated cycle
      const obligatedCycle = await tx.cycle.findFirst({
        where: {
          userId,
          status: 'obligated',
        },
        orderBy: {
          dueDate: 'asc', // Fulfill the oldest obligation first
        },
      });

      if (obligatedCycle) {
        // User is paying it forward, fulfilling their obligation
        await tx.cycle.update({
          where: { id: obligatedCycle.id },
          data: {
            status: 'fulfilled',
            givenTransactionId: txn.id,
            givenAt: new Date(),
          },
        });

        // Reward user for on-time completion
        await tx.user.update({
          where: { id: userId },
          data: {
            trustScore: { increment: 0.25 },
            totalCyclesCompleted: { increment: 1 },
          },
        });

        logger.info(`User ${userId} fulfilled cycle ${obligatedCycle.id} and earned +0.25 trust score.`);
      }
      // --- TRUST SCORE LOGIC: END ---

      // Create escrow (48-hour hold)
      await tx.escrow.create({
        data: {
          transactionId: txn.id,
          amount,
          status: 'holding',
          holdUntil: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        },
      });

      // Update donor wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          fiatBalance: { decrement: amount },
          totalOutflows: { increment: amount },
        },
      });

      // Update recipient receivable balance
      const recipientWallet = await tx.wallet.findUnique({
        where: { userId: finalRecipientId },
      });

      if (recipientWallet) {
        await tx.wallet.update({
          where: { userId: finalRecipientId },
          data: {
            receivableBalance: { increment: amount },
          },
        });
      }

      // Create or update cycle for recipient
      await tx.cycle.create({
        data: {
          userId: finalRecipientId,
          amount,
          status: 'in_transit',
          receivedFromUserId: userId,
          receivedTransactionId: txn.id,
          receivedAt: new Date(),
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days to pay forward
        },
      });

      return txn;
    });

    logger.info(`Donation initiated: ${transaction.id} from ${userId} to ${finalRecipientId}`);

    // Send notification to recipient (Push + SMS + Email)
    await sendTemplateNotification(
      finalRecipientId,
      'DONATION_RECEIVED',
      amount,
      req.user!.firstName
    );

    // Send SMS
    await sendDonationConfirmationSMS(
      recipient.phoneNumber,
      amount,
      req.user!.firstName
    );

    // Send email if available
    if (recipient.email) {
      await sendDonationReceiptEmail(
        recipient.email,
        recipient.firstName,
        amount,
        donor.firstName
      );
    }

    res.status(201).json({
      success: true,
      data: {
        transactionRef,
        recipient: {
          id: recipient.id,
          firstName: recipient.firstName,
          location: recipient.locationCity,
          trustScore: recipient.trustScore,
        },
        amount,
        status: 'in_transit',
        escrowReleaseAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm receipt of donation
 */
export const confirmReceipt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { transactionId, confirm } = req.body;

    // Find transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        toUserId: userId,
        type: 'donation_sent',
      },
      include: {
        escrows: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    if (transaction.status !== 'in_transit') {
      throw new AppError('Transaction cannot be confirmed', 400, 'INVALID_STATUS');
    }

    if (confirm) {
      // Confirm receipt - release escrow after 48 hours
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'completed', completedAt: new Date() },
      });

      // Update leaderboard for donor (they completed a donation)
      if (transaction.fromUserId) {
        // Mark as second donation if applicable (for leaderboard boost)
        const cycle = await prisma.cycle.findFirst({
          where: {
            userId: transaction.fromUserId,
            givenTransactionId: transaction.id,
          },
        });
        
        if (cycle) {
          await markSecondDonation(transaction.fromUserId, cycle.id);
        }

        await updateLeaderboardAfterCycle(transaction.fromUserId);
      }

      // Notify donor (Push + SMS)
      if (transaction.fromUserId) {
        await sendTemplateNotification(
          transaction.fromUserId,
          'DONATION_CONFIRMED',
          Number(transaction.amount)
        );

        const donor = await prisma.user.findUnique({
          where: { id: transaction.fromUserId },
          select: { phoneNumber: true, firstName: true, email: true },
        });

        if (donor) {
          await sendReceiptConfirmationSMS(
            donor.phoneNumber,
            donor.firstName,
            Number(transaction.amount)
          );

          // Send email confirmation
          if (donor.email) {
            await sendReceiptConfirmationEmail(
              donor.email,
              donor.firstName,
              Number(transaction.amount),
              recipient.firstName,
              transaction.transactionRef
            );
          }
        }
      }

      logger.info(`Receipt confirmed: ${transactionId}`);

      res.status(200).json({
        success: true,
        message: 'Receipt confirmed. Funds will be released in 48 hours.',
        data: {
          escrowReleaseAt: transaction.escrows[0]?.holdUntil,
        },
      });
    } else {
      // Reject - initiate dispute
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'failed' },
      });

      res.status(200).json({
        success: true,
        message: 'Transaction disputed. Support team will review.',
      });
    }
  } catch (error) {
    next(error);
  }
};

function generateTransactionRef(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TXN-${dateStr}-${random}`;
}
