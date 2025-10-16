import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import {
  generateTOTPSecret,
  verifyTOTPToken,
  enableTOTP as enableTOTPFn,
  disableTOTP as disableTOTPFn,
  regenerateBackupCodes as regenerateBackupCodesFn,
  isTOTPEnabled
} from '../services/totp.service';
import {
  createSession,
  destroySession,
  destroyAllUserSessions,
  getUserSessions,
  validateSession
} from '../services/session.service';

/**
 * Admin login with MFA support
 */
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, password, totpToken, backupCode } = req.body;

    // Find admin user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if user has admin role
    if (!['agent', 'csc_council'].includes(user.role)) {
      throw new AppError('Admin access required', 403, 'ADMIN_ACCESS_REQUIRED');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    if (user.isBanned) {
      throw new AppError('Account is banned', 403, 'ACCOUNT_BANNED', {
        reason: user.banReason,
      });
    }

    // Check if phone is verified
    const phoneVerified = await prisma.kycRecord.findFirst({
      where: {
        userId: user.id,
        verificationType: 'phone',
        status: 'approved',
      },
    });

    if (!phoneVerified) {
      throw new AppError('Phone number not verified', 403, 'PHONE_NOT_VERIFIED');
    }

    // Check if MFA is enabled
    const mfaEnabled = await isTOTPEnabled(user.id);

    if (mfaEnabled) {
      // MFA is required
      if (!totpToken && !backupCode) {
        return res.status(200).json({
          success: true,
          message: 'MFA verification required',
          data: {
            requiresMFA: true,
            phoneNumber,
          },
        });
      }

      // Verify MFA
      const isValidMFA = await verifyTOTPToken(
        user.id,
        totpToken || backupCode,
        !!backupCode
      );

      if (!isValidMFA) {
        throw new AppError('Invalid MFA token', 401, 'INVALID_MFA_TOKEN');
      }
    }

    // Create session
    const sessionId = await createSession(user.id, {
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      role: user.role,
      tier: user.tier,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      deviceInfo: {
        platform: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`Admin logged in: ${user.id}, session: ${sessionId}`);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tier: user.tier,
          trustScore: user.trustScore,
          charityCoinsBalance: user.charityCoinsBalance,
          wallet: user.wallet,
          mfaEnabled,
        },
        sessionId,
        mfaVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify MFA token during login
 */
export const verifyMFAToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, totpToken, backupCode } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify MFA token
    const isValid = await verifyTOTPToken(
      user.id,
      totpToken || backupCode,
      !!backupCode
    );

    if (!isValid) {
      throw new AppError('Invalid MFA token', 401, 'INVALID_MFA_TOKEN');
    }

    // Create session
    const sessionId = await createSession(user.id, {
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      role: user.role,
      tier: user.tier,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      deviceInfo: {
        platform: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`MFA verified and session created for admin: ${user.id}`);

    res.status(200).json({
      success: true,
      message: 'MFA verified successfully',
      data: {
        sessionId,
        mfaVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Setup TOTP for admin user
 */
export const setupTOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError('Session required', 401, 'SESSION_REQUIRED');
    }

    // Check if MFA is already enabled
    const alreadyEnabled = await isTOTPEnabled(userId);
    if (alreadyEnabled) {
      throw new AppError('MFA is already enabled', 400, 'MFA_ALREADY_ENABLED');
    }

    // Generate TOTP secret
    const totpData = await generateTOTPSecret(userId);

    logger.info(`TOTP setup initiated for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'TOTP setup initiated. Scan QR code with authenticator app.',
      data: {
        qrCodeUrl: totpData.qrCodeUrl,
        secret: totpData.secret,
        backupCodes: totpData.backupCodes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable TOTP after verification
 */
export const enableTOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    const { totpToken } = req.body;

    if (!userId) {
      throw new AppError('Session required', 401, 'SESSION_REQUIRED');
    }

    if (!totpToken) {
      throw new AppError('TOTP token required', 400, 'TOTP_TOKEN_REQUIRED');
    }

    // Verify the token
    const isValid = await verifyTOTPToken(userId, totpToken);
    if (!isValid) {
      throw new AppError('Invalid TOTP token', 401, 'INVALID_TOTP_TOKEN');
    }

    // Enable TOTP
    await enableTOTPFn(userId);

    logger.info(`TOTP enabled for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'TOTP enabled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable TOTP
 */
export const disableTOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError('Session required', 401, 'SESSION_REQUIRED');
    }

    await disableTOTPFn(userId);

    logger.info(`TOTP disabled for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'TOTP disabled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError('Session required', 401, 'SESSION_REQUIRED');
    }

    const backupCodes = await regenerateBackupCodesFn(userId);

    logger.info(`Backup codes regenerated for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Backup codes regenerated successfully',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get MFA status
 */
export const getMFAStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError('Session required', 401, 'SESSION_REQUIRED');
    }

    const mfaEnabled = await isTOTPEnabled(userId);

    res.status(200).json({
      success: true,
      data: {
        mfaEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active sessions for current user
 */
export const getActiveSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new AppError('Session required', 401, 'SESSION_REQUIRED');
    }

    const sessions = await getUserSessions(userId);

    res.status(200).json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          ...session,
          // Don't expose sensitive data
          lastActivity: session.lastActivity,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          deviceInfo: session.deviceInfo,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from current session
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.sessionId;
    if (sessionId) {
      await destroySession(sessionId);
      logger.info(`User logged out: ${req.session?.userId}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from all sessions (logout everywhere)
 */
export const logoutAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    if (userId) {
      await destroyAllUserSessions(userId);
      logger.info(`User logged out from all devices: ${userId}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate current session
 */
export const validateCurrentSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.sessionId;
    if (!sessionId) {
      throw new AppError('Session ID required', 401, 'SESSION_ID_MISSING');
    }

    const session = await validateSession(sessionId);
    if (!session) {
      throw new AppError('Invalid session', 401, 'INVALID_SESSION');
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        session: {
          userId: session.userId,
          role: session.role,
          lastActivity: session.lastActivity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};