import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { sendEmail } from '../services/email.service';
import { getAllFeatureFlags, toggleFeature } from '../services/featureFlags.service';

/**
 * Promote user to agent role
 */
export const promoteToAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const adminId = req.user!.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.role === 'agent') {
      throw new AppError('User is already an agent', 400, 'ALREADY_AGENT');
    }

    // Promote to agent
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'agent' },
    });

    // Create agent profile
    const agentCode = `AG${userId.substring(0, 6).toUpperCase()}`;
    await prisma.agent.create({
      data: {
        userId,
        agentCode,
      },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'promote_to_agent',
        targetId: userId,
        details: JSON.stringify({ agentCode }),
      },
    });

    logger.info(`User ${userId} promoted to agent by admin ${adminId}`);

    res.status(200).json({
      success: true,
      message: 'User promoted to agent successfully',
      data: {
        userId: updatedUser.id,
        role: updatedUser.role,
        agentCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Promote user to next in match queue (priority matching)
 */
export const promoteInMatchQueue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const adminId = req.user!.id;

    // Get or create pending match for this user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        recipientMatches: {
          where: { status: 'pending' },
          orderBy: { matchedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Create high-priority match or update existing
    if (user.recipientMatches.length > 0) {
      // Update existing match with max priority
      const match = user.recipientMatches[0];
      await prisma.match.update({
        where: { id: match.id },
        data: {
          priorityScore: 999, // Maximum priority
        },
      });
    } else {
      // User has no pending matches - they need to be matched first
      throw new AppError(
        'User has no pending matches. They will be prioritized in next matching round.',
        400,
        'NO_PENDING_MATCH'
      );
    }

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'promote_match_queue',
        targetId: userId,
        details: JSON.stringify({ priorityScore: 999 }),
      },
    });

    logger.info(`User ${userId} promoted in match queue by admin ${adminId}`);

    res.status(200).json({
      success: true,
      message: 'User promoted to top of match queue',
      data: {
        userId,
        priorityScore: 999,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate and send coins to user/agent
 */
export const sendCoins = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, amount, reason } = req.body;
    const adminId = req.user!.id;

    if (amount <= 0 || amount > 100000) {
      throw new AppError('Invalid coin amount (1-100,000)', 400, 'INVALID_AMOUNT');
    }

    // Update user's coin balance
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        charityCoinsBalance: { increment: amount },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        charityCoinsBalance: true,
      },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'send_coins',
        targetId: userId,
        details: JSON.stringify({ amount, reason, newBalance: user.charityCoinsBalance }),
      },
    });

    logger.info(`Admin ${adminId} sent ${amount} coins to user ${userId}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: `${amount} coins sent to ${user.firstName} ${user.lastName}`,
      data: {
        userId: user.id,
        coinsSent: amount,
        newBalance: user.charityCoinsBalance,
        reason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send bulk email notifications
 */
export const sendBulkEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, body, filters } = req.body;
    const adminId = req.user!.id;

    // Build user filter
    const where: any = {
      isActive: true,
      email: { not: null },
    };

    if (filters?.role) where.role = filters.role;
    if (filters?.tier) where.tier = filters.tier;
    if (filters?.city) where.locationCity = filters.city;
    if (filters?.kycStatus) where.kycStatus = filters.kycStatus;

    // Get recipients
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (users.length === 0) {
      throw new AppError('No users match the filters', 400, 'NO_RECIPIENTS');
    }

    // Send emails (batch processing to avoid overwhelming SMTP)
    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const personalizedBody = body.replace('{firstName}', user.firstName);
        await sendEmail(user.email!, subject, personalizedBody);
        sent++;

        // Rate limit: pause every 50 emails
        if (sent % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        logger.error(`Failed to send email to ${user.id}:`, error);
        failed++;
      }
    }

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'bulk_email',
        details: JSON.stringify({ subject, filters, sent, failed, total: users.length }),
      },
    });

    logger.info(`Bulk email sent by admin ${adminId}: ${sent} sent, ${failed} failed`);

    res.status(200).json({
      success: true,
      message: 'Bulk email sent',
      data: {
        totalRecipients: users.length,
        sent,
        failed,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send single email notification
 */
export const sendSingleEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, subject, body } = req.body;
    const adminId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (!user || !user.email) {
      throw new AppError('User not found or has no email', 404, 'USER_NOT_FOUND');
    }

    const personalizedBody = body.replace('{firstName}', user.firstName);
    await sendEmail(user.email, subject, personalizedBody);

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'single_email',
        targetId: userId,
        details: JSON.stringify({ subject }),
      },
    });

    logger.info(`Admin ${adminId} sent email to user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        userId: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all feature flags
 */
export const getFeatureFlags = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const flags = await getAllFeatureFlags();

    res.status(200).json({
      success: true,
      data: {
        flags,
        total: flags.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle feature flag
 */
export const toggleFeatureFlag = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { featureName, isEnabled } = req.body;
    const adminId = req.user!.id;

    await toggleFeature(featureName, isEnabled, adminId);

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'toggle_feature',
        details: JSON.stringify({ featureName, isEnabled }),
      },
    });

    logger.warn(`Admin ${adminId} ${isEnabled ? 'enabled' : 'disabled'} feature: ${featureName}`);

    res.status(200).json({
      success: true,
      message: `Feature '${featureName}' ${isEnabled ? 'enabled' : 'disabled'}`,
      data: {
        featureName,
        isEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin action logs
 */
export const getAdminActionLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 100, actionType } = req.query;

    const where: any = {};
    if (actionType) where.action = actionType;

    const actions = await prisma.adminAction.findMany({
      where,
      take: Number(limit),
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        target: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        actions,
        total: actions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = req.user!.id;

    const validRoles = ['beginner', 'agent', 'power_partner', 'csc_council'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400, 'INVALID_ROLE');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'update_user_role',
        targetId: userId,
        details: JSON.stringify({ newRole: role }),
      },
    });

    logger.info(`Admin ${adminId} updated user ${userId} role to ${role}`);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset leaderboard (clear all scores and rankings)
 */
export const resetLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const adminId = req.user!.id;

    // Get current leaderboard stats before reset
    const leaderboardStats = await prisma.leaderboard.findMany({
      select: {
        userId: true,
        totalScore: true,
        rank: true,
      }
    });

    // Reset all leaderboard entries
    await prisma.leaderboard.updateMany({
      data: {
        totalScore: 0,
        rank: null,
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'reset_leaderboard',
        details: JSON.stringify({
          reason,
          affectedUsers: leaderboardStats.length,
          previousStats: leaderboardStats
        })
      }
    });

    logger.warn(`Admin ${adminId} reset leaderboard for ${leaderboardStats.length} users. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'Leaderboard reset successfully',
      data: {
        affectedUsers: leaderboardStats.length,
        reason
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust user leaderboard score
 */
export const adjustLeaderboardScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { scoreAdjustment, reason } = req.body;
    const adminId = req.user!.id;

    if (typeof scoreAdjustment !== 'number') {
      throw new AppError('Score adjustment must be a number', 400, 'INVALID_SCORE');
    }

    // Get current leaderboard entry
    const currentEntry = await prisma.leaderboard.findUnique({
      where: { userId },
      select: {
        totalScore: true,
        rank: true,
      }
    });

    if (!currentEntry) {
      throw new AppError('User not found in leaderboard', 404, 'USER_NOT_IN_LEADERBOARD');
    }

    // Update score
    const newScore = Math.max(0, Number(currentEntry.totalScore) + scoreAdjustment); // Prevent negative scores

    await prisma.leaderboard.update({
      where: { userId },
      data: {
        totalScore: newScore,
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'adjust_leaderboard_score',
        targetId: userId,
        details: JSON.stringify({
          oldScore: currentEntry.totalScore,
          scoreAdjustment,
          newScore,
          reason
        })
      }
    });

    logger.info(`Admin ${adminId} adjusted leaderboard score for user ${userId}: ${currentEntry.totalScore} -> ${newScore}`);

    res.status(200).json({
      success: true,
      message: 'Leaderboard score adjusted successfully',
      data: {
        userId,
        oldScore: currentEntry.totalScore,
        scoreAdjustment,
        newScore,
        reason
      }
    });
  } catch (error) {
    next(error);
  }
};
