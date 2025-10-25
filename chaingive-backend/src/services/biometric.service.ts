import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

export interface BiometricChallenge {
  challengeId: string;
  userId: string;
  challenge: string;
  expiresAt: Date;
  used: boolean;
}

export interface BiometricRegistration {
  userId: string;
  biometricKey: string;
  deviceId: string;
  deviceInfo: {
    platform: string;
    model: string;
    osVersion: string;
  };
  lastUsed: Date;
  isActive: boolean;
}

export interface BiometricAuthRequest {
  userId: string;
  biometricToken: string;
  deviceId: string;
  challengeId?: string;
}

export class BiometricService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly CHALLENGE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

  /**
   * Generate a biometric authentication challenge
   */
  async generateChallenge(userId: string): Promise<BiometricChallenge> {
    const challengeId = crypto.randomUUID();
    const challenge = crypto.randomBytes(32).toString('base64');

    const challengeData: BiometricChallenge = {
      challengeId,
      userId,
      challenge,
      expiresAt: new Date(Date.now() + this.CHALLENGE_EXPIRY),
      used: false,
    };

    // Store challenge in database (would need a biometric_challenges table)
    // For now, we'll use Redis or in-memory store in production
    await this.storeChallenge(challengeData);

    logger.info(`Generated biometric challenge for user ${userId}`, { challengeId });

    return challengeData;
  }

  /**
   * Register biometric credentials for a user
   */
  async registerBiometric(
    userId: string,
    biometricData: {
      publicKey: string;
      deviceId: string;
      deviceInfo: any;
      signature: string;
    }
  ): Promise<BiometricRegistration> {
    try {
      // Verify the user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true, kycStatus: true },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate a unique biometric key
      const biometricKey = crypto.randomUUID();

      // Hash the public key for storage (never store plain keys)
      const hashedPublicKey = crypto
        .createHash('sha256')
        .update(biometricData.publicKey)
        .digest('hex');

      const registration: BiometricRegistration = {
        userId,
        biometricKey,
        deviceId: biometricData.deviceId,
        deviceInfo: biometricData.deviceInfo,
        lastUsed: new Date(),
        isActive: true,
      };

      // Store registration in database (would need a biometric_registrations table)
      await this.storeBiometricRegistration(registration, hashedPublicKey);

      logger.info(`Registered biometric credentials for user ${userId}`, {
        deviceId: biometricData.deviceId,
        platform: biometricData.deviceInfo.platform,
      });

      return registration;
    } catch (error) {
      logger.error('Failed to register biometric credentials', { error, userId });
      throw error;
    }
  }

  /**
   * Authenticate using biometric credentials
   */
  async authenticateBiometric(authRequest: BiometricAuthRequest): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    try {
      // Verify the biometric token and challenge
      const isValid = await this.verifyBiometricToken(authRequest);

      if (!isValid) {
        throw new Error('Invalid biometric authentication');
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: authRequest.userId },
        select: {
          id: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          trustScore: true,
          charityCoins: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Update last used timestamp
      await this.updateBiometricLastUsed(authRequest.userId, authRequest.deviceId);

      // Generate JWT tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user.id);

      logger.info(`Successful biometric authentication for user ${authRequest.userId}`, {
        deviceId: authRequest.deviceId,
      });

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      logger.error('Biometric authentication failed', {
        error,
        userId: authRequest.userId,
        deviceId: authRequest.deviceId,
      });
      throw error;
    }
  }

  /**
   * Verify biometric token against stored credentials
   */
  private async verifyBiometricToken(authRequest: BiometricAuthRequest): Promise<boolean> {
    try {
      // Get stored biometric registration
      const registration = await this.getBiometricRegistration(
        authRequest.userId,
        authRequest.deviceId
      );

      if (!registration || !registration.isActive) {
        return false;
      }

      // If challenge was provided, verify it
      if (authRequest.challengeId) {
        const challenge = await this.getChallenge(authRequest.challengeId);

        if (!challenge ||
            challenge.userId !== authRequest.userId ||
            challenge.used ||
            challenge.expiresAt < new Date()) {
          return false;
        }

        // Mark challenge as used
        await this.markChallengeUsed(authRequest.challengeId);
      }

      // In a real implementation, you would verify the biometric token
      // against the stored public key using cryptographic verification
      // For now, we'll do basic validation
      return this.validateBiometricToken(authRequest.biometricToken, registration);
    } catch (error) {
      logger.error('Biometric token verification failed', { error });
      return false;
    }
  }

  /**
   * Validate biometric token (simplified for demo)
   */
  private validateBiometricToken(token: string, registration: BiometricRegistration): boolean {
    // In production, this would involve:
    // 1. Decoding the JWT token
    // 2. Verifying the signature with the stored public key
    // 3. Checking token expiry
    // 4. Validating claims

    try {
      // Basic JWT verification
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;

      // Check if token is for the correct user and device
      return decoded.userId === registration.userId &&
             decoded.deviceId === registration.deviceId &&
             decoded.type === 'biometric';
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate access token for authenticated user
   */
  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        type: 'access',
      },
      this.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = jwt.sign(
      {
        userId,
        type: 'refresh',
        tokenId: crypto.randomUUID(),
      },
      this.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Store refresh token in database for invalidation capability
    await this.storeRefreshToken(userId, refreshToken);

    return refreshToken;
  }

  /**
   * Remove biometric registration (for device management)
   */
  async removeBiometricRegistration(userId: string, deviceId: string): Promise<void> {
    try {
      await this.deleteBiometricRegistration(userId, deviceId);
      logger.info(`Removed biometric registration for user ${userId}`, { deviceId });
    } catch (error) {
      logger.error('Failed to remove biometric registration', { error, userId, deviceId });
      throw error;
    }
  }

  /**
   * Get all biometric registrations for a user
   */
  async getUserBiometricRegistrations(userId: string): Promise<BiometricRegistration[]> {
    try {
      return await this.fetchUserBiometricRegistrations(userId);
    } catch (error) {
      logger.error('Failed to get user biometric registrations', { error, userId });
      return [];
    }
  }

  /**
   * Check if user has biometric authentication enabled
   */
  async hasBiometricEnabled(userId: string): Promise<boolean> {
    try {
      const registrations = await this.getUserBiometricRegistrations(userId);
      return registrations.some(reg => reg.isActive);
    } catch (error) {
      return false;
    }
  }

  // Database/storage methods (would be implemented with actual database tables)

  private async storeChallenge(challenge: BiometricChallenge): Promise<void> {
    // Implementation would store in biometric_challenges table
    // For now, using a simple in-memory store for demo
  }

  private async getChallenge(challengeId: string): Promise<BiometricChallenge | null> {
    // Implementation would fetch from biometric_challenges table
    return null;
  }

  private async markChallengeUsed(challengeId: string): Promise<void> {
    // Implementation would update biometric_challenges table
  }

  private async storeBiometricRegistration(
    registration: BiometricRegistration,
    hashedPublicKey: string
  ): Promise<void> {
    // Implementation would store in biometric_registrations table
  }

  private async getBiometricRegistration(
    userId: string,
    deviceId: string
  ): Promise<BiometricRegistration | null> {
    // Implementation would fetch from biometric_registrations table
    return null;
  }

  private async updateBiometricLastUsed(userId: string, deviceId: string): Promise<void> {
    // Implementation would update biometric_registrations table
  }

  private async deleteBiometricRegistration(userId: string, deviceId: string): Promise<void> {
    // Implementation would delete from biometric_registrations table
  }

  private async fetchUserBiometricRegistrations(userId: string): Promise<BiometricRegistration[]> {
    // Implementation would fetch from biometric_registrations table
    return [];
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Implementation would store in refresh_tokens table
  }
}