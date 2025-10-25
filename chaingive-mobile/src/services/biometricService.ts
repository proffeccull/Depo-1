import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateBiometricChallenge,
  registerBiometric,
  authenticateBiometric,
  getBiometricRegistrations,
  checkBiometricStatus,
  updateBiometricSettings,
  removeBiometricRegistration,
  BiometricChallenge,
  BiometricRegistrationRequest,
  BiometricAuthRequest,
} from '../api/biometric';
import logger from '../utils/logger';

export interface BiometricCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  securityLevel: LocalAuthentication.SecurityLevel;
}

export interface BiometricAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  error?: string;
}

export class BiometricService {
  private static readonly BIOMETRIC_ENABLED_KEY = '@biometric_enabled';
  private static readonly DEVICE_ID_KEY = '@device_id';

  /**
   * Check device biometric capabilities
   */
  static async checkBiometricCapabilities(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      return {
        hasHardware,
        isEnrolled,
        supportedTypes,
        securityLevel,
      };
    } catch (error) {
      logger.error('Failed to check biometric capabilities', { error });
      return {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        securityLevel: LocalAuthentication.SecurityLevel.NONE,
      };
    }
  }

  /**
   * Check if biometric authentication is enabled for the user
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  static async enableBiometric(): Promise<boolean> {
    try {
      const capabilities = await this.checkBiometricCapabilities();

      if (!capabilities.hasHardware || !capabilities.isEnrolled) {
        throw new Error('Biometric authentication not available on this device');
      }

      // Authenticate user first to verify identity
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable Biometric Authentication',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!authResult.success) {
        throw new Error('Authentication failed');
      }

      // Generate device ID
      const deviceId = await this.getOrCreateDeviceId();

      // Register with backend
      const challenge = await generateBiometricChallenge();

      // Create a mock public key for demo (in production, use actual biometric keys)
      const publicKey = `biometric_key_${Date.now()}_${deviceId}`;

      const registrationData: BiometricRegistrationRequest = {
        publicKey,
        deviceId,
        deviceInfo: {
          platform: Platform.OS,
          model: 'Device Model', // Would get from device info
          osVersion: Platform.Version?.toString() || 'Unknown',
        },
        signature: `signature_${Date.now()}`, // Would be actual signature
      };

      await registerBiometric(registrationData);

      // Store locally
      await AsyncStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');
      await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);

      logger.info('Biometric authentication enabled', { deviceId });

      return true;
    } catch (error) {
      logger.error('Failed to enable biometric authentication', { error });
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<boolean> {
    try {
      const deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);

      if (deviceId) {
        await removeBiometricRegistration(deviceId);
      }

      await AsyncStorage.removeItem(this.BIOMETRIC_ENABLED_KEY);
      await AsyncStorage.removeItem(this.DEVICE_ID_KEY);

      logger.info('Biometric authentication disabled');

      return true;
    } catch (error) {
      logger.error('Failed to disable biometric authentication', { error });
      return false;
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticateWithBiometric(userId?: string): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.checkBiometricCapabilities();

      if (!capabilities.hasHardware || !capabilities.isEnrolled) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        return {
          success: false,
          error: 'Biometric authentication not enabled',
        };
      }

      // Perform biometric authentication
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Biometrics',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error || 'Authentication failed',
        };
      }

      // Get device ID
      const deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      if (!deviceId) {
        return {
          success: false,
          error: 'Device not registered for biometric authentication',
        };
      }

      // Generate challenge
      const challenge = await generateBiometricChallenge();

      // Create biometric token (in production, this would be a signed JWT)
      const biometricToken = `biometric_token_${Date.now()}_${deviceId}_${challenge.challengeId}`;

      // Authenticate with backend
      const authRequest: BiometricAuthRequest = {
        userId,
        biometricToken,
        deviceId,
        challengeId: challenge.challengeId,
      };

      const backendResult = await authenticateBiometric(authRequest);

      logger.info('Biometric authentication successful', { deviceId });

      return {
        success: true,
        accessToken: backendResult.accessToken,
        refreshToken: backendResult.refreshToken,
        user: backendResult.user,
      };
    } catch (error: any) {
      logger.error('Biometric authentication failed', { error });
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  /**
   * Get biometric registration status
   */
  static async getBiometricStatus(): Promise<{
    enabled: boolean;
    hasHardware: boolean;
    isEnrolled: boolean;
    registrations: any[];
  }> {
    try {
      const [enabled, capabilities, registrations] = await Promise.all([
        this.isBiometricEnabled(),
        this.checkBiometricCapabilities(),
        getBiometricRegistrations().catch(() => ({ registrations: [] })),
      ]);

      return {
        enabled,
        hasHardware: capabilities.hasHardware,
        isEnrolled: capabilities.isEnrolled,
        registrations: registrations.registrations || [],
      };
    } catch (error) {
      logger.error('Failed to get biometric status', { error });
      return {
        enabled: false,
        hasHardware: false,
        isEnrolled: false,
        registrations: [],
      };
    }
  }

  /**
   * Get or create device ID
   */
  private static async getOrCreateDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);

      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }

      return deviceId;
    } catch (error) {
      // Fallback device ID
      return `fallback_device_${Date.now()}`;
    }
  }

  /**
   * Check if biometric authentication can be used for login
   */
  static async canUseBiometricForLogin(): Promise<boolean> {
    try {
      const [capabilities, enabled] = await Promise.all([
        this.checkBiometricCapabilities(),
        this.isBiometricEnabled(),
      ]);

      return capabilities.hasHardware && capabilities.isEnrolled && enabled;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get supported biometric types for display
   */
  static getBiometricTypeNames(types: LocalAuthentication.AuthenticationType[]): string[] {
    return types.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Biometric';
      }
    });
  }
}