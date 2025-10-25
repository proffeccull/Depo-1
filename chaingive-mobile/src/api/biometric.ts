import { apiClient } from './client';

export interface BiometricChallenge {
  challengeId: string;
  challenge: string;
  expiresAt: string;
}

export interface BiometricRegistrationRequest {
  publicKey: string;
  deviceId: string;
  deviceInfo: {
    platform: string;
    model: string;
    osVersion: string;
  };
  signature: string;
}

export interface BiometricAuthRequest {
  userId?: string;
  biometricToken: string;
  deviceId: string;
  challengeId?: string;
}

export interface BiometricRegistration {
  biometricKey: string;
  deviceId: string;
  deviceInfo: {
    platform: string;
    model: string;
    osVersion: string;
  };
  lastUsed: string;
  isActive: boolean;
}

export interface BiometricStatus {
  hasBiometricEnabled: boolean;
  registrations: BiometricRegistration[];
}

export interface BiometricSettings {
  enabled: boolean;
  deviceId?: string;
}

/**
 * Generate a biometric authentication challenge
 */
export const generateBiometricChallenge = async (): Promise<BiometricChallenge> => {
  const response = await apiClient.post('/biometric/challenge');
  return response.data.data;
};

/**
 * Register biometric credentials
 */
export const registerBiometric = async (
  registrationData: BiometricRegistrationRequest
): Promise<{ biometricKey: string; deviceId: string; registeredAt: string }> => {
  const response = await apiClient.post('/biometric/register', registrationData);
  return response.data.data;
};

/**
 * Authenticate using biometric credentials
 */
export const authenticateBiometric = async (
  authData: BiometricAuthRequest
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: any;
}> => {
  const response = await apiClient.post('/biometric/authenticate', authData);
  return response.data.data;
};

/**
 * Get user's biometric registrations
 */
export const getBiometricRegistrations = async (): Promise<BiometricStatus> => {
  const response = await apiClient.get('/biometric/registrations');
  return response.data.data;
};

/**
 * Check biometric status
 */
export const checkBiometricStatus = async (): Promise<{ hasBiometricEnabled: boolean }> => {
  const response = await apiClient.get('/biometric/status');
  return response.data.data;
};

/**
 * Update biometric settings
 */
export const updateBiometricSettings = async (
  settings: BiometricSettings
): Promise<{ enabled: boolean; deviceId?: string }> => {
  const response = await apiClient.put('/biometric/settings', settings);
  return response.data.data;
};

/**
 * Remove biometric registration for a device
 */
export const removeBiometricRegistration = async (deviceId: string): Promise<void> => {
  await apiClient.delete(`/biometric/registrations/${deviceId}`);
};