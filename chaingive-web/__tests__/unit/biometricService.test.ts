import { WebBiometricService } from '../../src/services/biometricService';

// Mock the apiClient
jest.mock('../../src/services/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock navigator.credentials
const mockCredentials = {
  create: jest.fn(),
  get: jest.fn(),
};

Object.defineProperty(window, 'navigator', {
  value: {
    credentials: mockCredentials,
  },
  writable: true,
});

// Mock PublicKeyCredential
global.PublicKeyCredential = jest.fn().mockImplementation(() => ({
  rawId: new Uint8Array([1, 2, 3, 4]),
  response: {
    attestationObject: new Uint8Array([5, 6, 7, 8]),
    clientDataJSON: new Uint8Array([9, 10, 11, 12]),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('WebBiometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mocks
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  describe('isWebAuthnSupported', () => {
    it('should return true when WebAuthn is supported', () => {
      Object.defineProperty(window, 'PublicKeyCredential', {
        value: {},
        writable: true,
      });

      expect(WebBiometricService.isWebAuthnSupported()).toBe(true);
    });

    it('should return false when WebAuthn is not supported', () => {
      Object.defineProperty(window, 'PublicKeyCredential', {
        value: undefined,
        writable: true,
      });

      expect(WebBiometricService.isWebAuthnSupported()).toBe(false);
    });
  });

  describe('isBiometricAvailable', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'PublicKeyCredential', {
        value: {
          isUserVerifyingPlatformAuthenticatorAvailable: jest.fn(),
        },
        writable: true,
      });
    });

    it('should return true when biometric is available', async () => {
      (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable as jest.Mock).mockResolvedValue(true);

      const result = await WebBiometricService.isBiometricAvailable();
      expect(result).toBe(true);
    });

    it('should return false when biometric is not available', async () => {
      (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable as jest.Mock).mockResolvedValue(false);

      const result = await WebBiometricService.isBiometricAvailable();
      expect(result).toBe(false);
    });

    it('should return false when check fails', async () => {
      (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable as jest.Mock).mockRejectedValue(new Error('Not available'));

      const result = await WebBiometricService.isBiometricAvailable();
      expect(result).toBe(false);
    });
  });

  describe('generateChallenge', () => {
    it('should generate and store biometric challenge', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      const mockChallenge = {
        challengeId: 'test-challenge-id',
        challenge: 'dGVzdC1jaGFsbGVuZ2U=', // base64 encoded
        expiresAt: '2025-12-31T23:59:59Z',
      };

      mockApiClient.post.mockResolvedValue({
        data: mockChallenge,
      });

      const result = await WebBiometricService.generateChallenge('user-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/biometric/challenge', { userId: 'user-123' });
      expect(localStorage.setItem).toHaveBeenCalledWith('biometric_challenge', JSON.stringify(mockChallenge));
      expect(result).toEqual(mockChallenge);
    });

    it('should throw error when challenge generation fails', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.post.mockRejectedValue(new Error('API Error'));

      await expect(WebBiometricService.generateChallenge('user-123')).rejects.toThrow('Unable to initialize biometric authentication');
    });
  });

  describe('registerBiometric', () => {
    beforeEach(() => {
      // Mock successful challenge generation
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.post.mockImplementation((endpoint: string) => {
        if (endpoint.includes('challenge')) {
          return Promise.resolve({
            data: {
              challengeId: 'test-challenge-id',
              challenge: 'dGVzdC1jaGFsbGVuZ2U=',
              expiresAt: '2025-12-31T23:59:59Z',
            },
          });
        }
        if (endpoint.includes('register')) {
          return Promise.resolve({
            data: {
              credentialId: 'test-credential-id',
              publicKey: 'test-public-key',
              deviceInfo: {
                platform: 'Web',
                userAgent: 'Test Browser',
                timestamp: '2025-01-01T00:00:00Z',
              },
            },
          });
        }
      });

      // Mock navigator.credentials.create
      mockCredentials.create.mockResolvedValue(new PublicKeyCredential({
        rawId: new Uint8Array([1, 2, 3, 4]),
        response: {
          attestationObject: new Uint8Array([5, 6, 7, 8]),
          clientDataJSON: new Uint8Array([9, 10, 11, 12]),
        },
      } as any));
    });

    it('should register biometric credential successfully', async () => {
      const result = await WebBiometricService.registerBiometric('user-123');

      expect(mockCredentials.create).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('biometric_credential', expect.any(String));
      expect(result).toHaveProperty('credentialId');
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('deviceInfo');
    });

    it('should throw error when WebAuthn create fails', async () => {
      mockCredentials.create.mockRejectedValue(new Error('User cancelled'));

      await expect(WebBiometricService.registerBiometric('user-123')).rejects.toThrow('Biometric registration failed');
    });
  });

  describe('authenticateBiometric', () => {
    beforeEach(() => {
      // Mock stored credential
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        credentialId: 'dGVzdC1jcmVkZW50aWFsLWlk', // base64 encoded
        publicKey: 'test-public-key',
      }));

      // Mock successful challenge generation
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.post.mockImplementation((endpoint: string) => {
        if (endpoint.includes('challenge')) {
          return Promise.resolve({
            data: {
              challengeId: 'test-challenge-id',
              challenge: 'dGVzdC1jaGFsbGVuZ2U=',
              expiresAt: '2025-12-31T23:59:59Z',
            },
          });
        }
        if (endpoint.includes('authenticate')) {
          return Promise.resolve({
            data: { success: true, userId: 'user-123' },
          });
        }
      });

      // Mock navigator.credentials.get
      mockCredentials.get.mockResolvedValue(new PublicKeyCredential({
        rawId: new Uint8Array([1, 2, 3, 4]),
        response: {
          authenticatorData: new Uint8Array([5, 6, 7, 8]),
          clientDataJSON: new Uint8Array([9, 10, 11, 12]),
          signature: new Uint8Array([13, 14, 15, 16]),
          userHandle: new Uint8Array([17, 18, 19, 20]),
        },
      } as any));
    });

    it('should authenticate with biometric successfully', async () => {
      const result = await WebBiometricService.authenticateBiometric('user-123');

      expect(mockCredentials.get).toHaveBeenCalled();
      expect(result).toEqual({ success: true, userId: 'user-123' });
    });

    it('should throw error when no credential is stored', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await expect(WebBiometricService.authenticateBiometric('user-123')).rejects.toThrow('No biometric credential found');
    });

    it('should throw error when WebAuthn get fails', async () => {
      mockCredentials.get.mockRejectedValue(new Error('User cancelled'));

      await expect(WebBiometricService.authenticateBiometric('user-123')).rejects.toThrow('Biometric authentication failed');
    });
  });

  describe('removeBiometric', () => {
    it('should remove biometric registration successfully', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.delete.mockResolvedValue({ data: { success: true } });

      await WebBiometricService.removeBiometric('user-123', 'device-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/v1/biometric/devices/device-123');
      expect(localStorage.removeItem).toHaveBeenCalledWith('biometric_credential');
      expect(localStorage.removeItem).toHaveBeenCalledWith('biometric_challenge');
    });

    it('should throw error when API call fails', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.delete.mockRejectedValue(new Error('API Error'));

      await expect(WebBiometricService.removeBiometric('user-123', 'device-123')).rejects.toThrow('Failed to remove biometric authentication');
    });
  });

  describe('hasBiometricEnabled', () => {
    it('should return true when biometric is enabled', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.get.mockResolvedValue({
        data: { hasBiometric: true },
      });

      const result = await WebBiometricService.hasBiometricEnabled('user-123');
      expect(result).toBe(true);
    });

    it('should return false when biometric is not enabled', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.get.mockResolvedValue({
        data: { hasBiometric: false },
      });

      const result = await WebBiometricService.hasBiometricEnabled('user-123');
      expect(result).toBe(false);
    });

    it('should return false when API call fails', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      const result = await WebBiometricService.hasBiometricEnabled('user-123');
      expect(result).toBe(false);
    });
  });

  describe('getBiometricStatus', () => {
    it('should return biometric status successfully', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      const mockStatus = {
        hasBiometric: true,
        devices: [{ id: 'device-1', name: 'Chrome on Windows' }],
        lastUsed: '2025-01-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue({
        data: mockStatus,
      });

      const result = await WebBiometricService.getBiometricStatus('user-123');
      expect(result).toEqual(mockStatus);
    });

    it('should return default status when API call fails', async () => {
      const mockApiClient = require('../../src/services/apiClient').apiClient;
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      const result = await WebBiometricService.getBiometricStatus('user-123');
      expect(result).toEqual({ hasBiometric: false, devices: [] });
    });
  });
});