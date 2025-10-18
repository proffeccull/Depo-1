import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get agent dashboard statistics
 */
export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const agent = await prisma.agent.findUnique({
      where: { userId },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    // Get pending verifications
    const pendingVerifications = await prisma.kYCRecord.count({
      where: {
        status: 'pending',
        verificationType: { in: ['agent', 'bvn', 'nin'] },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        agentCode: agent.agentCode,
        totalVerifications: agent.totalVerifications,
        totalCommissions: agent.totalCommissions,
        rating: agent.rating,
        pendingVerifications,
        isActive: agent.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a user (KYC)
 */
export const verifyUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const agentId = req.user!.id;
    const { phoneNumber, verificationType, verificationData } = req.body;

    // Find user to verify
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Create KYC record
    const kYCRecord = await prisma.kYCRecord.create({
      data: {
        userId: user.id,
        verificationType,
        verificationData,
        status: 'approved',
        verifiedByUserId: agentId,
        verifiedAt: new Date(),
      },
    });

    // Update user tier if BVN/NIN verified
    if (verificationType === 'bvn' || verificationType === 'nin') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          tier: 2,
          kycStatus: 'approved',
        },
      });
    }

    // Update agent stats and pay commission
    const commission = 100; // ₦100 per verification
    await prisma.agent.update({
      where: { userId: agentId },
      data: {
        totalVerifications: { increment: 1 },
        totalCommissions: { increment: commission },
      },
    });

    logger.info(`User ${user.id} verified by agent ${agentId}`);

    res.status(201).json({
      success: true,
      message: 'User verified successfully',
      data: {
        kYCRecordId: kYCRecord.id,
        commission,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log cash deposit
 */
export const logCashDeposit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const agentId = req.user!.id;
    const { phoneNumber, amount } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Calculate fee (2%)
    const fee = amount * 0.02;
    const netAmount = amount - fee;

    // Generate transaction reference
    const transactionRef = generateTransactionRef();

    // Create transaction and update wallet
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          transactionRef,
          type: 'deposit',
          toUserId: user.id,
          amount,
          fee,
          netAmount,
          status: 'completed',
          paymentMethod: 'cash',
          metadata: { agentId, depositType: 'cash' },
          completedAt: new Date(),
        },
      }),
      prisma.wallet.update({
        where: { userId: user.id },
        data: {
          fiatBalance: { increment: netAmount },
          totalInflows: { increment: netAmount },
        },
      }),
      prisma.agent.update({
        where: { userId: agentId },
        data: {
          totalCommissions: { increment: fee },
        },
      }),
    ]);

    logger.info(`Cash deposit logged by agent ${agentId} for user ${user.id}`);

    res.status(201).json({
      success: true,
      message: 'Cash deposit logged successfully',
      data: {
        transactionRef,
        amount,
        fee,
        netAmount,
        commission: fee,
      },
    });
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
