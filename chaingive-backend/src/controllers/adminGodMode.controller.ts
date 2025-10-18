import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * GOD MODE ADMIN CONTROLLER
 * Full access overrides - bypass all restrictions and validations
 * WARNING: These endpoints provide unrestricted access to platform data
 */

/**
 * Override any transaction status (bypass escrow, validation, etc.)
 */
export const overrideTransactionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user!.id;

    const validStatuses = ['pending', 'in_transit', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400, 'INVALID_STATUS');
    }

    // Get current transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { escrows: true }
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    // Override transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    // If completing transaction, release escrow if exists
    if (status === 'completed' && transaction.escrows.length > 0) {
      await prisma.escrow.update({
        where: { id: transaction.escrows[0].id },
        data: {
          status: 'released',
          releasedAt: new Date()
        }
      });
    }

    // Log god mode action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'god_mode_override_transaction',
        targetId: transactionId,
        details: JSON.stringify({
          oldStatus: transaction.status,
          newStatus: status,
          notes,
          godMode: true
        })
      }
    });

    logger.warn(`GOD MODE: Admin ${adminId} overrode transaction ${transactionId} status from ${transaction.status} to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Transaction status overridden successfully',
      data: {
        transactionId,
        oldStatus: transaction.status,
        newStatus: status,
        godModeOverride: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Force release any escrow (bypass all conditions)
 */
export const forceReleaseEscrow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { escrowId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { transaction: true }
    });

    if (!escrow) {
      throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
    }

    if (escrow.status === 'released') {
      throw new AppError('Escrow already released', 400, 'ALREADY_RELEASED');
    }

    // Force release escrow
    const updatedEscrow = await prisma.escrow.update({
      where: { id: escrowId },
      data: {
        status: 'released',
        releasedAt: new Date(),
        releasedBy: adminId,
        notes: reason || `Force released by admin ${adminId}`
      }
    });

    // Update transaction status if still in escrow
    if (escrow.transaction && escrow.transaction.status === 'pending') {
      await prisma.transaction.update({
        where: { id: escrow.transaction.id },
        data: {
          status: 'completed',
          notes: `Escrow force released by admin ${adminId}`
        }
      });
    }

    // Log god mode action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'god_mode_force_release_escrow',
        targetId: escrowId,
        details: JSON.stringify({
          amount: escrow.amount,
          reason,
          godMode: true
        })
      }
    });

    logger.warn(`GOD MODE: Admin ${adminId} force released escrow ${escrowId} for ₦${escrow.amount}`);

    res.status(200).json({
      success: true,
      message: 'Escrow force released successfully',
      data: {
        escrowId,
        amount: escrow.amount,
        releasedBy: adminId,
        godModeOverride: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Override user balance (add/subtract any amount)
 */
export const overrideUserBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { amount, reason, balanceType = 'wallet' } = req.body;
    const adminId = req.user!.id;

    if (typeof amount !== 'number' || amount < -1000000 || amount > 1000000) {
      throw new AppError('Invalid amount (-1M to +1M range)', 400, 'INVALID_AMOUNT');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        walletBalance: true,
        charityCoinsBalance: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    let updateData: any = {};
    let oldBalance: number;

    if (balanceType === 'wallet') {
      oldBalance = Number(user.walletBalance || 0);
      updateData.walletBalance = { increment: amount };
    } else if (balanceType === 'coins') {
      oldBalance = user.charityCoinsBalance;
      updateData.charityCoinsBalance = { increment: amount };
    } else {
      throw new AppError('Invalid balance type. Use "wallet" or "coins"', 400, 'INVALID_BALANCE_TYPE');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        walletBalance: true,
        charityCoinsBalance: true
      }
    });

    // Log god mode action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'god_mode_override_balance',
        targetId: userId,
        details: JSON.stringify({
          balanceType,
          amount,
          oldBalance,
          newBalance: balanceType === 'wallet' ? updatedUser.walletBalance : updatedUser.charityCoinsBalance,
          reason,
          godMode: true
        })
      }
    });

    logger.warn(`GOD MODE: Admin ${adminId} adjusted ${user.firstName} ${user.lastName}'s ${balanceType} balance by ₦${amount}`);

    res.status(200).json({
      success: true,
      message: 'User balance overridden successfully',
      data: {
        userId,
        balanceType,
        amount,
        oldBalance,
        newBalance: balanceType === 'wallet' ? updatedUser.walletBalance : updatedUser.charityCoinsBalance,
        godModeOverride: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Override user tier/KYC status (bypass verification)
 */
export const overrideUserVerification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { tier, kycStatus, trustScore, reason } = req.body;
    const adminId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        tier: true,
        kycStatus: true,
        trustScore: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const validTiers = [1, 2, 3];
    const validKycStatuses = ['pending', 'approved', 'rejected', 'not_required'];

    if (tier && !validTiers.includes(tier)) {
      throw new AppError(`Invalid tier. Must be one of: ${validTiers.join(', ')}`, 400, 'INVALID_TIER');
    }

    if (kycStatus && !validKycStatuses.includes(kycStatus)) {
      throw new AppError(`Invalid KYC status. Must be one of: ${validKycStatuses.join(', ')}`, 400, 'INVALID_KYC_STATUS');
    }

    if (trustScore !== undefined && (trustScore < 0 || trustScore > 5)) {
      throw new AppError('Trust score must be between 0 and 5', 400, 'INVALID_TRUST_SCORE');
    }

    const updateData: any = {};
    if (tier !== undefined) updateData.tier = tier;
    if (kycStatus !== undefined) updateData.kycStatus = kycStatus;
    if (trustScore !== undefined) updateData.trustScore = trustScore;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        tier: true,
        kycStatus: true,
        trustScore: true
      }
    });

    // Log god mode action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'god_mode_override_verification',
        targetId: userId,
        details: JSON.stringify({
          oldTier: user.tier,
          newTier: updatedUser.tier,
          oldKycStatus: user.kycStatus,
          newKycStatus: updatedUser.kycStatus,
          oldTrustScore: user.trustScore,
          newTrustScore: updatedUser.trustScore,
          reason,
          godMode: true
        })
      }
    });

    logger.warn(`GOD MODE: Admin ${adminId} overrode verification for ${user.firstName} ${user.lastName}`);

    res.status(200).json({
      success: true,
      message: 'User verification overridden successfully',
      data: {
        userId,
        oldVerification: {
          tier: user.tier,
          kycStatus: user.kycStatus,
          trustScore: user.trustScore
        },
        newVerification: {
          tier: updatedUser.tier,
          kycStatus: updatedUser.kycStatus,
          trustScore: updatedUser.trustScore
        },
        godModeOverride: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Force delete any record (bypass foreign key constraints)
 */
export const forceDeleteRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tableName, recordId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    const validTables = [
      'user', 'transaction', 'escrow', 'cycle', 'match', 'agent',
      'kYCRecord', 'adminAction', 'featureFlag', 'cryptoWallet'
    ];

    if (!validTables.includes(tableName)) {
      throw new AppError(`Invalid table. Must be one of: ${validTables.join(', ')}`, 400, 'INVALID_TABLE');
    }

    // Check if record exists
    const prismaModel = (prisma as any)[tableName];
    const record = await prismaModel.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      throw new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
    }

    // Force delete (this will cascade or fail based on DB constraints)
    await prismaModel.delete({
      where: { id: recordId }
    });

    // Log god mode action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'god_mode_force_delete',
        targetId: recordId,
        details: JSON.stringify({
          tableName,
          recordData: record,
          reason,
          godMode: true
        })
      }
    });

    logger.error(`GOD MODE: Admin ${adminId} force deleted ${tableName} record ${recordId}`);

    res.status(200).json({
      success: true,
      message: 'Record force deleted successfully',
      data: {
        tableName,
        recordId,
        deletedRecord: record,
        godModeOverride: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute raw SQL query (EXTREME DANGER - full database access)
 */
export const executeRawQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { query, params = [] } = req.body;
    const adminId = req.user!.id;

    if (!query || typeof query !== 'string') {
      throw new AppError('Query is required and must be a string', 400, 'INVALID_QUERY');
    }

    // Basic safety checks (not foolproof)
    const dangerousKeywords = ['drop', 'truncate', 'delete from', 'update', 'insert into'];
    const lowerQuery = query.toLowerCase();

    if (dangerousKeywords.some(keyword => lowerQuery.includes(keyword))) {
      throw new AppError('Raw queries with DML operations are not allowed', 403, 'DANGEROUS_QUERY');
    }

    // Execute read-only query
    const result = await prisma.$queryRawUnsafe(query, ...params);

    // Log god mode action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'god_mode_raw_query',
        details: JSON.stringify({
          query: query.substring(0, 500), // Truncate for logging
          params,
          resultCount: Array.isArray(result) ? result.length : 'N/A',
          godMode: true
        })
      }
    });

    logger.error(`GOD MODE: Admin ${adminId} executed raw query: ${query.substring(0, 100)}...`);

    res.status(200).json({
      success: true,
      message: 'Raw query executed successfully',
      data: {
        query: query.substring(0, 500),
        result,
        godModeOverride: true
      }
    });
  } catch (error) {
    next(error);
  }
};