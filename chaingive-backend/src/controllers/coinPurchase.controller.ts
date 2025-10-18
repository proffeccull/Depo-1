import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { sendTemplateNotification } from '../services/notification.service';
import { sendSMS } from '../services/sms.service';
import gamificationService from '../services/gamification.service';

/**
 * Validate escrow state before operations
 */
const validateEscrowState = (transaction: any, expectedStates: string[], operation: string) => {
  if (!expectedStates.includes(transaction.status)) {
    throw new AppError(
      `Cannot ${operation}: transaction is in ${transaction.status} status. Expected: ${expectedStates.join(', ')}`,
      400,
      'INVALID_ESCROW_STATE'
    );
  }

  if (transaction.expiresAt && new Date() > transaction.expiresAt) {
    throw new AppError('Transaction has expired', 400, 'TRANSACTION_EXPIRED');
  }
};

/**
 * Log escrow state changes for audit compliance
 */
const logEscrowChange = async (transactionId: string, oldStatus: string, newStatus: string, userId: string, action: string, details?: any) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action: `ESCROW_${action}`,
        details: {
          transactionId,
          oldStatus,
          newStatus,
          ...details,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to log escrow change:', error);
  }
};

/**
 * Get available agents for coin purchase
 */
export const getAvailableAgents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { city } = req.query;

    const where: any = {
      isActive: true,
      coinBalance: { gt: 0 }, // Must have coins in stock
    };

    if (city) {
      where.user = {
        locationCity: city,
      };
    }

    const agents = await prisma.agent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            locationCity: true,
            locationState: true,
            trustScore: true,
          },
        },
      },
      orderBy: [
        { coinBalance: 'desc' },
        { rating: 'desc' },
      ],
      take: 20,
    });

    res.status(200).json({
      success: true,
      data: {
        agents: agents.map(agent => ({
          agentId: agent.id,
          agentCode: agent.agentCode,
          name: `${agent.user.firstName} ${agent.user.lastName}`,
          city: agent.user.locationCity,
          state: agent.user.locationState,
          coinsAvailable: agent.coinBalance,
          rating: agent.rating,
          trustScore: agent.user.trustScore,
          pricePerCoin: 55, // ₦55 per coin (standard rate)
        })),
        total: agents.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request to buy coins from agent (initiates escrow)
 */
export const requestCoinPurchase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { agentId, quantity } = req.body;

    if (quantity < 10 || quantity > 10000) {
      throw new AppError('Quantity must be between 10 and 10,000 coins', 400, 'INVALID_QUANTITY');
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!agent || !agent.isActive) {
      throw new AppError('Agent not found or inactive', 404, 'AGENT_NOT_FOUND');
    }

    // Check if agent has enough coins
    if (agent.coinBalance < quantity) {
      throw new AppError(
        `Agent only has ${agent.coinBalance} coins available`,
        400,
        'INSUFFICIENT_COINS'
      );
    }

    const pricePerCoin = 55; // ₦55 standard rate
    const totalPrice = quantity * pricePerCoin;

    const oldStatus = 'pending';

    // Create escrow transaction with row-level locking
    const transaction = await prisma.$transaction(async (tx) => {
      // Lock agent's coins
      await tx.agent.update({
        where: { id: agentId },
        data: {
          coinBalance: { decrement: quantity },
        },
      });

      // Create sale record with escrow
      const sale = await tx.coinSaleToUser.create({
        data: {
          agentId,
          userId,
          quantity,
          pricePerCoin,
          totalPrice,
          status: 'escrowed',
          coinsLocked: true,
          lockedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
      });

      return sale;
    });

    logger.info(`Coin purchase escrow created: ${transaction.id} - ${quantity} coins locked from agent ${agentId}`);

    res.status(201).json({
      success: true,
      message: 'Coin purchase request created. Please send payment to agent.',
      data: {
        transactionId: transaction.id,
        agentName: `${agent.user.firstName} ${agent.user.lastName}`,
        agentPhone: agent.user.phoneNumber,
        quantity,
        pricePerCoin,
        totalPrice,
        expiresAt: transaction.expiresAt,
        paymentInstructions: `Send ₦${totalPrice.toLocaleString()} to agent ${agent.user.firstName} ${agent.user.lastName} (${agent.user.phoneNumber})`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User confirms they have sent payment
 */
export const confirmPaymentSent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { transactionId } = req.params;
    const { paymentMethod, paymentProof } = req.body;

    // Get transaction
    const transaction = await prisma.coinSaleToUser.findUnique({
      where: { id: transactionId },
      include: {
        agent: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    if (transaction.userId !== userId) {
      throw new AppError('Not authorized', 403, 'NOT_AUTHORIZED');
    }

    // Validate escrow state
    validateEscrowState(transaction, ['escrowed'], 'confirm payment');

    if (transaction.status !== 'escrowed') {
      throw new AppError('Transaction is not in escrowed status', 400, 'INVALID_STATUS');
    }

    // Check expiration
    if (transaction.expiresAt && new Date() > transaction.expiresAt) {
      throw new AppError('Transaction has expired', 400, 'TRANSACTION_EXPIRED');
    }

    // Update transaction
    const updated = await prisma.coinSaleToUser.update({
      where: { id: transactionId },
      data: {
        status: 'pending', // Waiting for agent confirmation
        paymentMethod,
        paymentProof,
        paidAt: new Date(),
      },
    });

    logger.info(`User ${userId} confirmed payment sent for transaction ${transactionId}`);

    // Notify agent via push + SMS
    await sendTemplateNotification(
      transaction.agent.user.id,
      'PAYMENT_PENDING',
      Number(transaction.totalPrice)
    );

    await sendSMS(
      transaction.agent.user.phoneNumber,
      `ChainGive: Payment pending confirmation. ${transaction.quantity} coins. Check app to verify.`
    );

    res.status(200).json({
      success: true,
      message: 'Payment confirmation submitted. Waiting for agent to verify.',
      data: {
        transactionId: updated.id,
        status: updated.status,
        agentName: `${transaction.agent.user.firstName}`,
        message: 'Agent will confirm your payment shortly. You will be notified once coins are released.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agent confirms payment received and releases coins
 */
export const agentConfirmPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const agentUserId = req.user!.id;
    const { transactionId } = req.params;

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: agentUserId },
    });

    if (!agent) {
      throw new AppError('Agent profile not found', 404, 'AGENT_NOT_FOUND');
    }

    // Get transaction
    const transaction = await prisma.coinSaleToUser.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            charityCoinsBalance: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    if (transaction.agentId !== agent.id) {
      throw new AppError('Not authorized', 403, 'NOT_AUTHORIZED');
    }

    // Validate escrow state
    validateEscrowState(transaction, ['pending'], 'confirm payment');

    if (transaction.status !== 'pending') {
      throw new AppError('Transaction is not pending confirmation', 400, 'INVALID_STATUS');
    }

    // Release coins to user
    const result = await prisma.$transaction(async (tx) => {
      // Credit user with coins
      const updatedUser = await tx.user.update({
        where: { id: transaction.userId },
        data: {
          charityCoinsBalance: { increment: transaction.quantity },
        },
      });

      // Update agent stats
      await tx.agent.update({
        where: { id: agent.id },
        data: {
          totalCoinsSold: { increment: transaction.quantity },
          lifetimeRevenue: { increment: transaction.totalPrice },
        },
      });

      // Update transaction
      const updatedTransaction = await tx.coinSaleToUser.update({
        where: { id: transactionId },
        data: {
          status: 'completed',
          confirmedAt: new Date(),
          coinsLocked: false,
        },
      });

      return { updatedTransaction, updatedUser };
    });

    logger.info(`Agent ${agent.id} confirmed payment for transaction ${transactionId} - ${transaction.quantity} coins released to user ${transaction.userId}`);

    // Get agent user details for notification
    const agentUser = await prisma.user.findUnique({
      where: { id: agent.userId },
      select: { firstName: true, lastName: true },
    });

    // Notify user via push + SMS
    await sendTemplateNotification(
      transaction.userId,
      'COINS_PURCHASED',
      transaction.quantity,
      agentUser ? `${agentUser.firstName} ${agentUser.lastName}` : 'Agent'
    );

    const user = await prisma.user.findUnique({
      where: { id: transaction.userId },
      select: { phoneNumber: true },
    });

    if (user) {
      await sendSMS(
        user.phoneNumber,
        `ChainGive: ${transaction.quantity} coins added to your account! New balance: ${result.updatedUser.charityCoinsBalance} coins.`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed. Coins released to user.',
      data: {
        transactionId: result.updatedTransaction.id,
        status: result.updatedTransaction.status,
        userName: transaction.user.firstName,
        quantity: transaction.quantity,
        userNewBalance: result.updatedUser.charityCoinsBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agent rejects payment (releases escrow back to agent)
 */
export const agentRejectPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const agentUserId = req.user!.id;
    const { transactionId } = req.params;
    const { reason } = req.body;

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: agentUserId },
    });

    if (!agent) {
      throw new AppError('Agent profile not found', 404, 'AGENT_NOT_FOUND');
    }

    // Get transaction
    const transaction = await prisma.coinSaleToUser.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    if (transaction.agentId !== agent.id) {
      throw new AppError('Not authorized', 403, 'NOT_AUTHORIZED');
    }

    // Validate escrow state for rejection
    validateEscrowState(transaction, ['pending', 'escrowed'], 'reject payment');

    if (transaction.status !== 'pending' && transaction.status !== 'escrowed') {
      throw new AppError('Cannot reject this transaction', 400, 'INVALID_STATUS');
    }

    // Return coins to agent and cancel transaction
    await prisma.$transaction(async (tx) => {
      // Return locked coins to agent
      await tx.agent.update({
        where: { id: agent.id },
        data: {
          coinBalance: { increment: transaction.quantity },
        },
      });

      // Update transaction
      await tx.coinSaleToUser.update({
        where: { id: transactionId },
        data: {
          status: 'cancelled',
          coinsLocked: false,
        },
      });
    });

    logger.info(`Agent ${agent.id} rejected transaction ${transactionId}. Reason: ${reason}`);

    // Notify user via push + SMS
    await sendTemplateNotification(
      transaction.userId,
      'PAYMENT_REJECTED'
    );

    const user = await prisma.user.findUnique({
      where: { id: transaction.userId },
      select: { phoneNumber: true },
    });

    if (user) {
      await sendSMS(
        user.phoneNumber,
        `ChainGive: Coin purchase cancelled. Reason: ${reason}. Please contact agent or try again.`
      );
    }

    res.status(200).json({
      success: true,
      message: 'Transaction cancelled. Coins returned to your inventory.',
      data: {
        transactionId,
        reason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's coin purchase history
 */
export const getUserPurchaseHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const purchases = await prisma.coinSaleToUser.findMany({
      where: { userId },
      include: {
        agent: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json({
      success: true,
      data: {
        purchases: purchases.map(p => ({
          id: p.id,
          agentName: `${p.agent.user.firstName} ${p.agent.user.lastName}`,
          agentPhone: p.agent.user.phoneNumber,
          quantity: p.quantity,
          totalPrice: p.totalPrice,
          status: p.status,
          paymentMethod: p.paymentMethod,
          createdAt: p.createdAt,
          paidAt: p.paidAt,
          confirmedAt: p.confirmedAt,
          expiresAt: p.expiresAt,
        })),
        total: purchases.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get agent's pending confirmations
 */
export const getAgentPendingConfirmations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const agentUserId = req.user!.id;

    const agent = await prisma.agent.findUnique({
      where: { userId: agentUserId },
    });

    if (!agent) {
      throw new AppError('Agent profile not found', 404, 'AGENT_NOT_FOUND');
    }

    const pending = await prisma.coinSaleToUser.findMany({
      where: {
        agentId: agent.id,
        status: { in: ['pending', 'escrowed'] },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        pendingConfirmations: pending.map(p => ({
          id: p.id,
          userName: `${p.user.firstName} ${p.user.lastName}`,
          userPhone: p.user.phoneNumber,
          quantity: p.quantity,
          totalPrice: p.totalPrice,
          status: p.status,
          paymentMethod: p.paymentMethod,
          paymentProof: p.paymentProof,
          createdAt: p.createdAt,
          paidAt: p.paidAt,
          expiresAt: p.expiresAt,
        })),
        total: pending.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel expired transactions (background job)
 */
export async function cancelExpiredCoinPurchases() {
  try {
    const expired = await prisma.coinSaleToUser.findMany({
      where: {
        status: 'escrowed',
        expiresAt: { lt: new Date() },
      },
    });

    for (const transaction of expired) {
      await prisma.$transaction(async (tx) => {
        // Return coins to agent
        await tx.agent.update({
          where: { id: transaction.agentId },
          data: {
            coinBalance: { increment: transaction.quantity },
          },
        });

        // Update transaction with expiration
        await tx.coinSaleToUser.update({
          where: { id: transaction.id },
          data: {
            status: 'expired',
            coinsLocked: false,
          },
        });
      });

      logger.info(`Expired coin purchase ${transaction.id} - coins returned to agent`);
    }

    return expired.length;
  } catch (error) {
    logger.error('Failed to cancel expired coin purchases:', error);
    throw error;
  }
}
