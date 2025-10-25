import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: LocalAuthentication.AuthenticationType;
}

export interface BiometricConfig {
  promptMessage: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
  requireConfirmation?: boolean;
}

class BiometricService {
  private static instance: BiometricService;
  private biometricType: LocalAuthentication.AuthenticationType | null = null;

  private constructor() {}

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async isBiometricAvailable(): Promise<{
    available: boolean;
    biometricType: LocalAuthentication.AuthenticationType | null;
    error?: string;
  }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (!hasHardware) {
        return {
          available: false,
          biometricType: null,
          error: 'Biometric hardware not available'
        };
      }

      if (!isEnrolled) {
        return {
          available: false,
          biometricType: null,
          error: 'No biometric data enrolled'
        };
      }

      // Get the primary biometric type
      const biometricType = supportedTypes.length > 0 ? supportedTypes[0] : null;
      this.biometricType = biometricType;

      return {
        available: true,
        biometricType
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        available: false,
        biometricType: null,
        error: 'Failed to check biometric availability'
      };
    }
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(config: BiometricConfig): Promise<BiometricAuthResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: config.promptMessage,
        cancelLabel: config.cancelLabel,
        disableDeviceFallback: config.disableDeviceFallback || false,
        requireConfirmation: config.requireConfirmation || false,
      });

      if (result.success) {
        // Store successful authentication timestamp
        await this.storeLastAuthTime();

        return {
          success: true,
          biometricType: this.biometricType || undefined
        };
      } else {
        let error = 'Authentication failed';

        switch (result.error) {
          case 'user_cancel':
            error = 'User cancelled authentication';
            break;
          case 'system_cancel':
            error = 'System cancelled authentication';
            break;
          case 'timeout':
            error = 'Authentication timeout';
            break;
          case 'lockout':
            error = 'Too many failed attempts';
            break;
          case 'not_enrolled':
            error = 'No biometric data enrolled';
            break;
          default:
            error = result.error || 'Unknown authentication error';
        }

        return {
          success: false,
          error
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Biometric authentication failed'
      };
    }
  }

  /**
   * Get biometric type name for display
   */
  getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris';
      default:
        return 'Biometric';
    }
  }

  /**
   * Store the last successful authentication time
   */
  private async storeLastAuthTime(): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      await AsyncStorage.setItem('biometric_last_auth', timestamp);
    } catch (error) {
      console.error('Failed to store auth time:', error);
    }
  }

  /**
   * Get the last successful authentication time
   */
  async getLastAuthTime(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem('biometric_last_auth');
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Failed to get auth time:', error);
      return null;
    }
  }

  /**
   * Check if biometric authentication should be required based on time
   */
  async shouldRequireBiometric(maxAgeMinutes: number = 30): Promise<boolean> {
    const lastAuth = await this.getLastAuthTime();
    if (!lastAuth) return true;

    const now = Date.now();
    const ageMinutes = (now - lastAuth) / (1000 * 60);

    return ageMinutes > maxAgeMinutes;
  }

  /**
   * Enable biometric authentication for the user
   */
  async enableBiometric(): Promise<{ success: boolean; error?: string }> {
    const availability = await this.isBiometricAvailable();

    if (!availability.available) {
      return {
        success: false,
        error: availability.error || 'Biometric authentication not available'
      };
    }

    // Test authentication
    const testResult = await this.authenticate({
      promptMessage: 'Enable biometric authentication for ChainGive',
      requireConfirmation: true
    });

    if (testResult.success) {
      await AsyncStorage.setItem('biometric_enabled', 'true');
      return { success: true };
    } else {
      return {
        success: false,
        error: testResult.error || 'Failed to enable biometric authentication'
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    await AsyncStorage.removeItem('biometric_enabled');
    await AsyncStorage.removeItem('biometric_last_auth');
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }
}

export default BiometricService.getInstance();