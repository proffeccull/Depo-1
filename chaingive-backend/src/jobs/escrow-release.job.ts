import { Job } from 'bull';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { sendTemplateNotification } from '../services/notification.service';
import { updateReferralOnFirstCycle, updateReferralOnCompletion } from '../controllers/referral.controller';
import { sendEscrowReleaseSMS } from '../services/sms.service';
import { sendEscrowReleaseEmail } from '../services/email.service';

/**
 * Process escrow releases (48-hour holds)
 * Runs: Every hour
 */
export async function processEscrowRelease(job: Job) {
  logger.info('Starting escrow release job...');

  try {
    // Find all escrows ready for release
    const readyEscrows = await prisma.escrow.findMany({
      where: {
        status: 'holding',
        holdUntil: {
          lt: new Date(),
        },
      },
      include: {
        transaction: {
          include: {
            fromUser: {
              select: { id: true, firstName: true },
            },
            toUser: {
              select: { id: true, firstName: true },
            },
          },
        },
      },
    });

    logger.info(`Found ${readyEscrows.length} escrows ready for release`);

    for (const escrow of readyEscrows) {
      try {
        await releaseEscrow(escrow);
      } catch (error) {
        logger.error(`Failed to release escrow ${escrow.id}:`, error);
        // Continue with other escrows
      }
    }

    logger.info(`Escrow release job completed. Processed ${readyEscrows.length} escrows.`);
    return { processed: readyEscrows.length };
  } catch (error) {
    logger.error('Escrow release job failed:', error);
    throw error;
  }
}

/**
 * Release a single escrow
 */
async function releaseEscrow(escrow: any) {
  const transaction = escrow.transaction;

  logger.info(`Releasing escrow ${escrow.id} for transaction ${transaction.transactionRef}`);

  await prisma.$transaction([
    // Update escrow status
    prisma.escrow.update({
      where: { id: escrow.id },
      data: {
        status: 'released',
        releasedAt: new Date(),
      },
    }),
    // Credit recipient wallet (move from receivable to available)
    prisma.wallet.update({
      where: { userId: transaction.toUserId },
      data: {
        fiatBalance: { increment: escrow.amount },
        receivableBalance: { decrement: escrow.amount },
      },
    }),
    // Update recipient's cycle to obligated
    prisma.cycle.updateMany({
      where: {
        receivedTransactionId: transaction.id,
        status: 'in_transit',
      },
      data: {
        status: 'obligated',
      },
    }),
    // Award Charity Coins to donor
    prisma.user.update({
      where: { id: transaction.fromUserId },
      data: {
        charityCoinsBalance: { increment: 50 }, // 50 coins per donation
      },
    }),
  ]);

  logger.info(`Escrow ${escrow.id} released successfully`);

  // Send push notification to recipient
  await sendTemplateNotification(
    transaction.toUserId,
    'ESCROW_RELEASED',
    Number(escrow.amount)
  );

  // Send SMS to recipient
  if (transaction.toUser) {
    await sendEscrowReleaseSMS(
      transaction.toUser.phoneNumber,
      transaction.toUser.firstName,
      Number(escrow.amount)
    );

    // Send email if available
    if (transaction.toUser.email) {
      await sendEscrowReleaseEmail(
        transaction.toUser.email,
        transaction.toUser.firstName,
        Number(escrow.amount)
      );
    }
  }

  // Notify donor about coins earned
  await sendTemplateNotification(
    transaction.fromUserId,
    'COINS_EARNED',
    50
  );

  // Check and update referral milestones
  if (transaction.toUserId) {
    // Check if this is recipient's first cycle completion
    const cycleCount = await prisma.cycle.count({
      where: {
        userId: transaction.toUserId,
        status: 'fulfilled',
      },
    });

    if (cycleCount === 1) {
      // First cycle - award 100 coins to referrer
      await updateReferralOnFirstCycle(transaction.toUserId);
    } else if (cycleCount === 3) {
      // Third cycle - award final 175 coins to referrer
      await updateReferralOnCompletion(transaction.toUserId);
    }
  }
}
