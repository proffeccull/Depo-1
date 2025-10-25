import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { sendKYCApprovalEmail } from '../services/email.service';
import { sendKYCApprovalSMS } from '../services/sms.service';
import bcrypt from 'bcrypt';

/**
 * Get all users with filters and pagination
 */
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      tier, 
      kycStatus, 
      isActive, 
      isBanned,
      city,
      search 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    if (role) where.role = role;
    if (tier) where.tier = Number(tier);
    if (kycStatus) where.kycStatus = kycStatus;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isBanned !== undefined) where.isBanned = isBanned === 'true';
    if (city) where.locationCity = city;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { phoneNumber: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          phoneNumber: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tier: true,
          trustScore: true,
          totalCyclesCompleted: true,
          totalDonated: true,
          totalReceived: true,
          charityCoinsBalance: true,
          kycStatus: true,
          isActive: true,
          isBanned: true,
          locationCity: true,
          locationState: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details with full activity history
 */
export const getUserDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        cycles: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        sentTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        receivedTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        kycRecords: true,
        agent: true,
        leaderboard: true,
        referralsGiven: {
          include: {
            referredUser: {
              select: {
                firstName: true,
                lastName: true,
                totalCyclesCompleted: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ban a user
 */
export const banUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        isActive: false,
        banReason: reason,
      },
    });

    logger.warn(`User ${userId} banned by admin ${req.user!.id}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'User banned successfully',
      data: {
        userId: user.id,
        isBanned: user.isBanned,
        banReason: user.banReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unban a user
 */
export const unbanUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        isActive: true,
        banReason: null,
      },
    });

    logger.info(`User ${userId} unbanned by admin ${req.user!.id}`);

    res.status(200).json({
      success: true,
      message: 'User unbanned successfully',
      data: {
        userId: user.id,
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform dashboard statistics
 */
export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalVolume,
      pendingEscrows,
      completedCycles,
      pendingKYC,
      totalAgents,
      totalCoinsInCirculation,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true, isBanned: false } }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['completed', 'in_transit'] } },
      }),
      prisma.escrow.aggregate({
        _sum: { amount: true },
        where: { status: 'holding' },
      }),
      prisma.cycle.count({ where: { status: 'fulfilled' } }),
      prisma.kYCRecord.count({ where: { status: 'pending' } }),
      prisma.agent.count({ where: { isActive: true } }),
      prisma.user.aggregate({
        _sum: { charityCoinsBalance: true },
      }),
    ]);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayUsers, todayTransactions, todayVolume] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: today },
          status: { in: ['completed', 'in_transit'] },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalTransactions,
          totalVolume: Number(totalVolume._sum.amount || 0),
          pendingEscrows: Number(pendingEscrows._sum.amount || 0),
          completedCycles,
          totalAgents,
          totalCoinsInCirculation: totalCoinsInCirculation._sum.charityCoinsBalance || 0,
        },
        today: {
          newUsers: todayUsers,
          transactions: todayTransactions,
          volume: Number(todayVolume._sum.amount || 0),
        },
        pending: {
          kycVerifications: pendingKYC,
          escrowAmount: Number(pendingEscrows._sum.amount || 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get suspicious transactions
 */
export const getSuspiciousTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 50 } = req.query;

    // Criteria for suspicious transactions:
    // - Large amounts (>₦50,000)
    // - Failed status
    // - Users with low trust score (<3.0)
    const suspicious = await prisma.transaction.findMany({
      where: {
        OR: [
          { amount: { gte: 50000 } },
          { status: 'failed' },
          {
            fromUser: {
              trustScore: { lt: 3.0 },
            },
          },
        ],
      },
      take: Number(limit),
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            trustScore: true,
          },
        },
        toUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            trustScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        transactions: suspicious,
        total: suspicious.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending KYC verifications
 */
export const getPendingKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 50 } = req.query;

    const pending = await prisma.kYCRecord.findMany({
      where: { status: 'pending' },
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
            tier: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: {
        kycRecords: pending,
        total: pending.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve KYC verification
 */
export const approveKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { kycId } = req.params;
    const adminId = req.user!.id;

    const kYCRecord = await prisma.kYCRecord.update({
      where: { id: kycId },
      data: {
        status: 'approved',
        verifiedByUserId: adminId,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    // Update user tier based on verification type
    if (kYCRecord.verificationType === 'bvn' || kYCRecord.verificationType === 'nin') {
      await prisma.user.update({
        where: { id: kYCRecord.userId },
        data: {
          tier: 2,
          kycStatus: 'approved',
        },
      });
    }

    logger.info(`KYC ${kycId} approved by admin ${adminId} for user ${kYCRecord.userId}`);

    // Send approval email
    if (kYCRecord.user.email) {
      await sendKYCApprovalEmail(
        kYCRecord.user.email,
        kYCRecord.user.firstName,
        kYCRecord.verificationType
      );
    }

    // Send SMS notification
    await sendKYCApprovalSMS(
      kYCRecord.user.phoneNumber,
      kYCRecord.user.firstName
    );

    res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
      data: kYCRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject KYC verification
 */
export const rejectKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { kycId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    const kYCRecord = await prisma.kYCRecord.update({
      where: { id: kycId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        verifiedByUserId: adminId,
        verifiedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    logger.info(`KYC ${kycId} rejected by admin ${adminId}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'KYC rejected',
      data: kYCRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue report
 */
export const getRevenueReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const [coinSales, redemptions, transactionFees] = await Promise.all([
      // Coin sales revenue
      prisma.coinSaleToUser.aggregate({
        _sum: { totalPrice: true },
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
      // Marketplace redemptions
      prisma.redemption.aggregate({
        _sum: { coinsSpent: true },
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
          status: 'approved',
        },
      }),
      // Transaction fees (2%)
      prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          createdAt: { gte: start, lte: end },
          status: 'completed',
        },
      }),
    ]);

    const totalTransactionVolume = Number(transactionFees._sum.amount || 0);
    const estimatedFees = totalTransactionVolume * 0.02; // 2% fee

    const totalRevenue = 
      Number(coinSales._sum.totalPrice || 0) +
      estimatedFees;

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
        },
        revenue: {
          coinSales: Number(coinSales._sum.totalPrice || 0),
          transactionFees: estimatedFees,
          total: totalRevenue,
        },
        metrics: {
          coinsSold: coinSales._count,
          itemsRedeemed: redemptions._count,
          transactionsProcessed: transactionFees._count,
          totalVolume: totalTransactionVolume,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user growth metrics
 */
export const getUserGrowthReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [newUsers, activeUsers, retentionData] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.user.count({
        where: {
          lastLoginAt: { gte: startDate },
          isActive: true,
        },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          createdAt: true,
          lastLoginAt: true,
        },
      }),
    ]);

    // Calculate retention rate
    const retainedUsers = retentionData.filter(u =>
      u.lastLoginAt && u.lastLoginAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const retentionRate = newUsers > 0 ? (retainedUsers / newUsers) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        period: `${days} days`,
        newUsers,
        activeUsers,
        retentionRate: retentionRate.toFixed(2),
        dailyAverage: (newUsers / days).toFixed(1),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      phoneNumber,
      email,
      firstName,
      lastName,
      role = 'beginner',
      tier = 1,
      locationCity,
      locationState,
      isActive = true
    } = req.body;
    const adminId = req.user!.id;

    // Check if phone number already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new AppError('User with this phone number or email already exists', 409, 'USER_EXISTS');
    }

    // Generate a temporary password for admin-created users
    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        phoneNumber,
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        tier,
        locationCity,
        locationState,
        isActive,
        kycStatus: 'not_required', // Admin created users skip KYC
      },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tier: true,
        isActive: true,
        createdAt: true,
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'create_user',
        targetId: newUser.id,
        details: JSON.stringify({
          phoneNumber,
          email,
          firstName,
          lastName,
          role,
          tier
        })
      }
    });

    logger.info(`Admin ${adminId} created new user ${newUser.id}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        ...newUser,
        tempPassword, // Include temp password in response for admin
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user details
 */
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      email,
      locationCity,
      locationState,
      isActive,
      trustScore,
      tier
    } = req.body;
    const adminId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        locationCity: true,
        locationState: true,
        isActive: true,
        trustScore: true,
        tier: true,
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (locationCity !== undefined) updateData.locationCity = locationCity;
    if (locationState !== undefined) updateData.locationState = locationState;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (trustScore !== undefined) updateData.trustScore = trustScore;
    if (tier !== undefined) updateData.tier = tier;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        locationCity: true,
        locationState: true,
        isActive: true,
        trustScore: true,
        tier: true,
        updatedAt: true,
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'update_user',
        targetId: userId,
        details: JSON.stringify({
          oldData: user,
          newData: updatedUser,
          changes: Object.keys(updateData)
        })
      }
    });

    logger.info(`Admin ${adminId} updated user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (soft delete - mark as inactive)
 */
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isActive: true,
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('User is already deactivated', 400, 'USER_ALREADY_DEACTIVATED');
    }

    // Soft delete - mark as inactive
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        isBanned: true,
        banReason: reason || `Deactivated by admin ${adminId}`,
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'delete_user',
        targetId: userId,
        details: JSON.stringify({
          reason,
          softDelete: true
        })
      }
    });

    logger.warn(`Admin ${adminId} deactivated user ${userId}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        userId,
        action: 'deactivated',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user permissions and roles
 */
export const getUserPermissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        tier: true,
        kycStatus: true,
        trustScore: true,
        isActive: true,
        isBanned: true,
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Define role-based permissions
    const rolePermissions = {
      beginner: ['donate', 'receive', 'view_profile'],
      agent: ['donate', 'receive', 'view_profile', 'sell_coins', 'manage_inventory'],
      power_partner: ['donate', 'receive', 'view_profile', 'sell_coins', 'manage_inventory', 'view_analytics'],
      csc_council: ['donate', 'receive', 'view_profile', 'sell_coins', 'manage_inventory', 'view_analytics', 'admin_access'],
    };

    // Define tier-based permissions
    const tierPermissions = {
      1: ['basic_donations'],
      2: ['basic_donations', 'verified_beneficiary'],
      3: ['basic_donations', 'verified_beneficiary', 'premium_features'],
    };

    const permissions = {
      role: user.role,
      tier: user.tier,
      kycStatus: user.kycStatus,
      trustScore: user.trustScore,
      isActive: user.isActive,
      isBanned: user.isBanned,
      rolePermissions: rolePermissions[user.role as keyof typeof rolePermissions] || [],
      tierPermissions: tierPermissions[user.tier as keyof typeof tierPermissions] || [],
      customPermissions: [], // No custom permissions field in schema
    };

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Override donation transaction (admin manual correction)
 */
export const overrideDonation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;
    const { amount, status, reason } = req.body;
    const adminId = req.user!.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { fromUser: true, toUser: true }
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    const validStatuses = ['pending', 'in_transit', 'completed', 'failed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400, 'INVALID_STATUS');
    }

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (status !== undefined) updateData.status = status;
    if (reason) updateData.notes = reason;

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: { fromUser: true, toUser: true }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'override_donation',
        targetId: transactionId,
        details: JSON.stringify({
          oldAmount: transaction.amount,
          newAmount: updatedTransaction.amount,
          oldStatus: transaction.status,
          newStatus: updatedTransaction.status,
          reason
        })
      }
    });

    logger.warn(`Admin ${adminId} overrode donation ${transactionId}: amount ${transaction.amount} -> ${updatedTransaction.amount}, status ${transaction.status} -> ${updatedTransaction.status}`);

    res.status(200).json({
      success: true,
      message: 'Donation overridden successfully',
      data: {
        transactionId,
        oldAmount: transaction.amount,
        newAmount: updatedTransaction.amount,
        oldStatus: transaction.status,
        newStatus: updatedTransaction.status,
        reason
      }
    });
  } catch (error) {
    next(error);
  }
};
