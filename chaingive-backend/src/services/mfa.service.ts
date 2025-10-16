import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Multi-Factor Authentication Service
 * Handles TOTP (Time-based One-Time Password) for admin users
 */

export interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerificationResult {
  verified: boolean;
  message: string;
}

/**
 * Generate MFA setup data for a user
 */
export async function generateMFASetup(userId: string): Promise<MFASetupData> {
  try {
    // Generate a secret key
    const secret = speakeasy.generateSecret({
      name: `ChainGive Admin (${userId})`,
      issuer: 'ChainGive',
      length: 32,
    });

    // Generate QR code URL
    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `ChainGive Admin (${userId})`,
      issuer: 'ChainGive',
      encoding: 'ascii',
    });

    // Generate backup codes (8 codes, each 8 characters)
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Store MFA setup in database (but not yet enabled)
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret.base32,
        mfaBackupCodes: backupCodes,
        mfaEnabled: false,
      },
    });

    logger.info(`MFA setup generated for user ${userId}`);

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  } catch (error) {
    logger.error('Failed to generate MFA setup:', error);
    throw new AppError('Failed to generate MFA setup', 500, 'MFA_SETUP_FAILED');
  }
}

/**
 * Verify MFA token
 */
export async function verifyMFAToken(
  userId: string,
  token: string,
  useBackupCode: boolean = false
): Promise<MFAVerificationResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaSecret: true,
        mfaBackupCodes: true,
        mfaEnabled: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.mfaEnabled) {
      return {
        verified: true,
        message: 'MFA not enabled for this user',
      };
    }

    if (useBackupCode) {
      // Check backup codes
      if (!user.mfaBackupCodes || !user.mfaBackupCodes.includes(token)) {
        return {
          verified: false,
          message: 'Invalid backup code',
        };
      }

      // Remove used backup code
      const updatedBackupCodes = user.mfaBackupCodes.filter(code => code !== token);
      await prisma.user.update({
        where: { id: userId },
        data: { mfaBackupCodes: updatedBackupCodes },
      });

      logger.info(`User ${userId} used backup code for MFA verification`);
      return {
        verified: true,
        message: 'Backup code verified successfully',
      };
    } else {
      // Verify TOTP token
      if (!user.mfaSecret) {
        return {
          verified: false,
          message: 'MFA secret not found',
        };
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time windows (30 seconds each)
      });

      if (verified) {
        logger.info(`User ${userId} successfully verified MFA token`);
        return {
          verified: true,
          message: 'MFA token verified successfully',
        };
      } else {
        return {
          verified: false,
          message: 'Invalid MFA token',
        };
      }
    }
  } catch (error) {
    logger.error('Failed to verify MFA token:', error);
    return {
      verified: false,
      message: 'MFA verification failed',
    };
  }
}

/**
 * Enable MFA for a user (after successful setup verification)
 */
export async function enableMFA(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaSecret: true,
        mfaEnabled: true,
      },
    });

    if (!user || !user.mfaSecret) {
      throw new AppError('MFA setup not completed', 400, 'MFA_NOT_SETUP');
    }

    if (user.mfaEnabled) {
      throw new AppError('MFA already enabled', 400, 'MFA_ALREADY_ENABLED');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    logger.info(`MFA enabled for user ${userId}`);
  } catch (error) {
    logger.error('Failed to enable MFA:', error);
    throw error;
  }
}

/**
 * Disable MFA for a user
 */
export async function disableMFA(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      },
    });

    logger.info(`MFA disabled for user ${userId}`);
  } catch (error) {
    logger.error('Failed to disable MFA:', error);
    throw new AppError('Failed to disable MFA', 500, 'MFA_DISABLE_FAILED');
  }
}

/**
 * Get MFA status for a user
 */
export async function getMFAStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaEnabled: true,
        mfaBackupCodes: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      enabled: user.mfaEnabled,
      backupCodesCount: user.mfaBackupCodes?.length || 0,
    };
  } catch (error) {
    logger.error('Failed to get MFA status:', error);
    throw error;
  }
}

/**
 * Regenerate backup codes for a user
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaEnabled: true,
      },
    });

    if (!user || !user.mfaEnabled) {
      throw new AppError('MFA not enabled for this user', 400, 'MFA_NOT_ENABLED');
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    await prisma.user.update({
      where: { id: userId },
      data: { mfaBackupCodes: backupCodes },
    });

    logger.info(`Backup codes regenerated for user ${userId}`);

    return backupCodes;
  } catch (error) {
    logger.error('Failed to regenerate backup codes:', error);
    throw error;
  }
}