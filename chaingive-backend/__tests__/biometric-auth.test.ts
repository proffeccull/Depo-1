import { BiometricService } from '../src/services/biometric.service';
import prisma from '../src/utils/prisma';

// Mock Prisma
jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    biometricRegistration: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
  },
}));

describe('Biometric Authentication Service', () => {
  let biometricService: BiometricService;

  beforeEach(() => {
    jest.clearAllMocks();
    biometricService = new BiometricService();
  });

  describe('generateChallenge', () => {
    it('should generate a valid challenge', async () => {
      const userId = 'user-1';

      const challenge = await biometricService.generateChallenge(userId);

      expect(challenge).toHaveProperty('challengeId');
      expect(challenge).toHaveProperty('challenge');
      expect(challenge).toHaveProperty('expiresAt');
      expect(challenge.userId).toBe(userId);
      expect(challenge.used).toBe(false);
      expect(challenge.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('registerBiometric', () => {
    it('should register biometric credentials successfully', async () => {
      const userId = 'user-1';
      const registrationData = {
        publicKey: 'biometric-key-123',
        deviceId: 'device-123',
        deviceInfo: {
          platform: 'iOS',
          model: 'iPhone 12',
          osVersion: '14.0',
        },
        signature: 'signature-123',
      };

      // Mock user exists
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        isActive: true,
        kycStatus: 'approved',
      });

      const result = await biometricService.registerBiometric(userId, registrationData);

      expect(result).toHaveProperty('biometricKey');
      expect(result).toHaveProperty('deviceId');
      expect(result).toHaveProperty('deviceInfo');
      expect(result.userId).toBe(userId);
      expect(result.isActive).toBe(true);
    });

    it('should reject registration for inactive user', async () => {
      const userId = 'user-1';
      const registrationData = {
        publicKey: 'biometric-key-123',
        deviceId: 'device-123',
        deviceInfo: { platform: 'iOS', model: 'iPhone 12', osVersion: '14.0' },
        signature: 'signature-123',
      };

      // Mock user is inactive
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        isActive: false,
        kycStatus: 'approved',
      });

      await expect(
        biometricService.registerBiometric(userId, registrationData)
      ).rejects.toThrow('User not found or inactive');
    });
  });

  describe('authenticateBiometric', () => {
    it('should authenticate successfully with valid token', async () => {
      const authRequest = {
        userId: 'user-1',
        biometricToken: 'valid-jwt-token',
        deviceId: 'device-123',
        challengeId: 'challenge-123',
      };

      // Mock user exists
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phoneNumber: '+2341234567890',
        firstName: 'John',
        lastName: 'Doe',
        trustScore: 0.9,
        charityCoins: 1000,
        isActive: true,
      });

      // Mock biometric registration exists
      (biometricService as any).getBiometricRegistration = jest.fn().mockResolvedValue({
        userId: 'user-1',
        deviceId: 'device-123',
        isActive: true,
      });

      // Mock token validation
      (biometricService as any).validateBiometricToken = jest.fn().mockReturnValue(true);

      const result = await biometricService.authenticateBiometric(authRequest);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe('user-1');
    });

    it('should reject invalid biometric token', async () => {
      const authRequest = {
        userId: 'user-1',
        biometricToken: 'invalid-token',
        deviceId: 'device-123',
      };

      // Mock token validation fails
      (biometricService as any).validateBiometricToken = jest.fn().mockReturnValue(false);

      await expect(
        biometricService.authenticateBiometric(authRequest)
      ).rejects.toThrow('Invalid biometric authentication');
    });

    it('should reject authentication for unregistered device', async () => {
      const authRequest = {
        userId: 'user-1',
        biometricToken: 'valid-jwt-token',
        deviceId: 'unregistered-device',
      };

      // Mock no biometric registration found
      (biometricService as any).getBiometricRegistration = jest.fn().mockResolvedValue(null);

      await expect(
        biometricService.authenticateBiometric(authRequest)
      ).rejects.toThrow('Invalid biometric authentication');
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid access token', () => {
      const user = {
        id: 'user-1',
        phoneNumber: '+2341234567890',
        firstName: 'John',
        lastName: 'Doe',
      };

      const token = (biometricService as any).generateAccessToken(user);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Decode and verify token structure
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      expect(decoded.userId).toBe('user-1');
      expect(decoded.type).toBe('access');
    });

    it('should generate valid refresh token', async () => {
      const userId = 'user-1';

      const token = await (biometricService as any).generateRefreshToken(userId);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Verify refresh token was stored
      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            token: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Device Management', () => {
    it('should remove biometric registration', async () => {
      const userId = 'user-1';
      const deviceId = 'device-123';

      await biometricService.removeBiometricRegistration(userId, deviceId);

      expect((biometricService as any).deleteBiometricRegistration).toHaveBeenCalledWith(
        userId,
        deviceId
      );
    });

    it('should check biometric status', async () => {
      const userId = 'user-1';

      // Mock registrations exist
      (biometricService as any).getUserBiometricRegistrations = jest.fn().mockResolvedValue([
        { userId: 'user-1', deviceId: 'device-1', isActive: true },
        { userId: 'user-1', deviceId: 'device-2', isActive: false },
      ]);

      const hasBiometric = await biometricService.hasBiometricEnabled(userId);

      expect(hasBiometric).toBe(true);
    });

    it('should return false when no active registrations', async () => {
      const userId = 'user-1';

      // Mock no active registrations
      (biometricService as any).getUserBiometricRegistrations = jest.fn().mockResolvedValue([
        { userId: 'user-1', deviceId: 'device-1', isActive: false },
      ]);

      const hasBiometric = await biometricService.hasBiometricEnabled(userId);

      expect(hasBiometric).toBe(false);
    });
  });
});