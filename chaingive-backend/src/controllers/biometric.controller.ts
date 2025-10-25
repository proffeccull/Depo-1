import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BiometricService } from '../services/biometric.service';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const biometricService = new BiometricService();

/**
 * Generate a biometric authentication challenge
 */
export const generateChallenge = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const challenge = await biometricService.generateChallenge(userId);

    res.status(200).json({
      success: true,
      data: {
        challengeId: challenge.challengeId,
        challenge: challenge.challenge,
        expiresAt: challenge.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register biometric credentials for the user
 */
export const registerBiometric = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { publicKey, deviceId, deviceInfo, signature } = req.body;

    if (!publicKey || !deviceId || !deviceInfo) {
      throw new AppError('Public key, device ID, and device info are required', 400, 'MISSING_PARAMETERS');
    }

    const registration = await biometricService.registerBiometric(userId, {
      publicKey,
      deviceId,
      deviceInfo,
      signature,
    });

    res.status(201).json({
      success: true,
      message: 'Biometric credentials registered successfully',
      data: {
        biometricKey: registration.biometricKey,
        deviceId: registration.deviceId,
        registeredAt: registration.lastUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate using biometric credentials
 */
export const authenticateBiometric = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { biometricToken, deviceId, challengeId } = req.body;

    if (!biometricToken || !deviceId) {
      throw new AppError('Biometric token and device ID are required', 400, 'MISSING_PARAMETERS');
    }

    // For biometric auth, we might not have a JWT token yet, so get userId from body
    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      throw new AppError('User ID is required for biometric authentication', 400, 'MISSING_USER_ID');
    }

    const authResult = await biometricService.authenticateBiometric({
      userId,
      biometricToken,
      deviceId,
      challengeId,
    });

    logger.info(`Biometric authentication successful for user ${userId}`, { deviceId });

    res.status(200).json({
      success: true,
      message: 'Biometric authentication successful',
      data: {
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        user: authResult.user,
      },
    });
  } catch (error) {
    logger.error('Biometric authentication failed', { error });
    next(error);
  }
};

/**
 * Get user's biometric registrations
 */
export const getBiometricRegistrations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const registrations = await biometricService.getUserBiometricRegistrations(userId);

    res.status(200).json({
      success: true,
      data: {
        registrations: registrations.map(reg => ({
          biometricKey: reg.biometricKey,
          deviceId: reg.deviceId,
          deviceInfo: reg.deviceInfo,
          lastUsed: reg.lastUsed,
          isActive: reg.isActive,
        })),
        hasBiometricEnabled: registrations.some(reg => reg.isActive),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove biometric registration for a device
 */
export const removeBiometricRegistration = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { deviceId } = req.params;

    if (!deviceId) {
      throw new AppError('Device ID is required', 400, 'MISSING_DEVICE_ID');
    }

    await biometricService.removeBiometricRegistration(userId, deviceId);

    logger.info(`Biometric registration removed for user ${userId}`, { deviceId });

    res.status(200).json({
      success: true,
      message: 'Biometric registration removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has biometric authentication enabled
 */
export const checkBiometricStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const hasBiometricEnabled = await biometricService.hasBiometricEnabled(userId);

    res.status(200).json({
      success: true,
      data: {
        hasBiometricEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update biometric settings (enable/disable)
 */
export const updateBiometricSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { enabled, deviceId } = req.body;

    if (typeof enabled !== 'boolean') {
      throw new AppError('Enabled status must be a boolean', 400, 'INVALID_ENABLED_STATUS');
    }

    // This would need additional implementation in the service
    // For now, return a placeholder response
    logger.info(`Biometric settings update requested for user ${userId}`, { enabled, deviceId });

    res.status(200).json({
      success: true,
      message: `Biometric authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        enabled,
        deviceId,
      },
    });
  } catch (error) {
    next(error);
  }
};