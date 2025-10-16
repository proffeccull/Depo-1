import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Generate TOTP secret and QR code for user
 */
export const generateTOTPSecret = async (userId: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> => {
  try {
    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `ChainGive Admin (${userId})`,
      issuer: 'ChainGive',
      length: 32,
    });

    // Generate QR code URL
    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `ChainGive Admin (${userId})`,
      issuer: 'ChainGive',
      encoding: 'base32',
    });

    // Generate backup codes (10 codes, each 8 characters)
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    // Store in database (but don't enable yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret.base32,
        mfaBackupCodes: backupCodes,
        mfaEnabled: false, // Will be enabled after verification
      },
    });

    logger.info(`TOTP secret generated for user: ${userId}`);

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  } catch (error) {
    logger.error('Error generating TOTP secret:', error);
    throw new AppError('Failed to generate TOTP secret', 500, 'TOTP_GENERATION_FAILED');
  }
};

/**
 * Verify TOTP token
 */
export const verifyTOTPToken = async (
  userId: string,
  token: string,
  useBackupCode: boolean = false
): Promise<boolean> => {
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

    if (!user.mfaSecret) {
      throw new AppError('TOTP not set up for this user', 400, 'TOTP_NOT_SETUP');
    }

    if (useBackupCode) {
      // Check if token is a valid backup code
      if (!user.mfaBackupCodes.includes(token)) {
        return false;
      }

      // Remove used backup code
      const updatedBackupCodes = user.mfaBackupCodes.filter(code => code !== token);
      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaBackupCodes: updatedBackupCodes,
        },
      });

      logger.info(`Backup code used for user: ${userId}`);
      return true;
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps (30 seconds) tolerance
    });

    if (verified) {
      logger.info(`TOTP token verified for user: ${userId}`);
    }

    return verified;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error verifying TOTP token:', error);
    throw new AppError('Failed to verify TOTP token', 500, 'TOTP_VERIFICATION_FAILED');
  }
};

/**
 * Enable TOTP for user after successful verification
 */
export const enableTOTP = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
      },
    });

    logger.info(`TOTP enabled for user: ${userId}`);
  } catch (error) {
    logger.error('Error enabling TOTP:', error);
    throw new AppError('Failed to enable TOTP', 500, 'TOTP_ENABLE_FAILED');
  }
};

/**
 * Disable TOTP for user
 */
export const disableTOTP = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: null,
        mfaBackupCodes: [],
        mfaEnabled: false,
      },
    });

    logger.info(`TOTP disabled for user: ${userId}`);
  } catch (error) {
    logger.error('Error disabling TOTP:', error);
    throw new AppError('Failed to disable TOTP', 500, 'TOTP_DISABLE_FAILED');
  }
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (userId: string): Promise<string[]> => {
  try {
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaBackupCodes: backupCodes,
      },
    });

    logger.info(`Backup codes regenerated for user: ${userId}`);

    return backupCodes;
  } catch (error) {
    logger.error('Error regenerating backup codes:', error);
    throw new AppError('Failed to regenerate backup codes', 500, 'BACKUP_CODE_REGENERATION_FAILED');
  }
};

/**
 * Check if user has TOTP enabled
 */
export const isTOTPEnabled = async (userId: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true },
    });

    return user?.mfaEnabled || false;
  } catch (error) {
    logger.error('Error checking TOTP status:', error);
    return false;
  }
};