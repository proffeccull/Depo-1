import { apiClient } from './apiClient';

export interface WebAuthnCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject: ArrayBuffer;
  };
  type: string;
}

export interface BiometricChallenge {
  challengeId: string;
  challenge: string;
  expiresAt: string;
}

export interface BiometricRegistration {
  credentialId: string;
  publicKey: string;
  deviceInfo: {
    platform: string;
    userAgent: string;
    timestamp: string;
  };
}

export class WebBiometricService {
  private static readonly CHALLENGE_KEY = 'biometric_challenge';
  private static readonly CREDENTIAL_KEY = 'biometric_credential';

  /**
   * Check if WebAuthn is supported
   */
  static isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' &&
           window.PublicKeyCredential &&
           typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
  }

  /**
   * Check if biometric authentication is available
   */
  static async isBiometricAvailable(): Promise<boolean> {
    if (!this.isWebAuthnSupported()) {
      return false;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.warn('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Generate a biometric challenge from backend
   */
  static async generateChallenge(userId: string): Promise<BiometricChallenge> {
    try {
      const response = await apiClient.post('/api/v1/biometric/challenge', { userId });
      const challenge: BiometricChallenge = response.data.data;

      // Store challenge locally for verification
      localStorage.setItem(this.CHALLENGE_KEY, JSON.stringify(challenge));

      return challenge;
    } catch (error) {
      console.error('Failed to generate biometric challenge:', error);
      throw new Error('Unable to initialize biometric authentication');
    }
  }

  /**
   * Register biometric credential
   */
  static async registerBiometric(userId: string): Promise<BiometricRegistration> {
    try {
      // Generate challenge first
      const challenge = await this.generateChallenge(userId);

      // Create WebAuthn credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: this.base64ToArrayBuffer(challenge.challenge),
          rp: {
            name: 'ChainGive',
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16), // User ID as bytes
            name: `user-${userId}@chaingive.com`,
            displayName: `ChainGive User ${userId}`,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false,
          },
          timeout: 60000,
          attestation: 'direct',
        },
      }) as PublicKeyCredential;

      // Prepare registration data
      const registrationData = {
        credentialId: this.arrayBufferToBase64(credential.rawId),
        publicKey: this.arrayBufferToBase64((credential.response as any).attestationObject),
        deviceInfo: {
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
        challengeId: challenge.challengeId,
      };

      // Register with backend
      const response = await apiClient.post('/api/v1/biometric/register', registrationData);
      const registration: BiometricRegistration = response.data.data;

      // Store credential locally
      localStorage.setItem(this.CREDENTIAL_KEY, JSON.stringify(registration));

      return registration;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw new Error('Biometric registration failed. Please try again.');
    }
  }

  /**
   * Authenticate with biometric
   */
  static async authenticateBiometric(userId: string): Promise<any> {
    try {
      // Generate challenge
      const challenge = await this.generateChallenge(userId);

      // Get stored credential
      const storedCredential = localStorage.getItem(this.CREDENTIAL_KEY);
      if (!storedCredential) {
        throw new Error('No biometric credential found. Please register first.');
      }

      const credentialData = JSON.parse(storedCredential);

      // Authenticate with WebAuthn
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: this.base64ToArrayBuffer(challenge.challenge),
          allowCredentials: [{
            id: this.base64ToArrayBuffer(credentialData.credentialId),
            type: 'public-key',
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      // Prepare authentication data
      const authData = {
        credentialId: this.arrayBufferToBase64(credential.rawId),
        authenticatorData: this.arrayBufferToBase64((credential.response as any).authenticatorData),
        clientDataJSON: this.arrayBufferToBase64(credential.response.clientDataJSON),
        signature: this.arrayBufferToBase64((credential.response as any).signature),
        userHandle: credential.response.userHandle ? this.arrayBufferToBase64(credential.response.userHandle) : null,
        challengeId: challenge.challengeId,
        userId,
      };

      // Authenticate with backend
      const response = await apiClient.post('/api/v1/biometric/authenticate', authData);

      return response.data.data;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw new Error('Biometric authentication failed. Please try again or use password login.');
    }
  }

  /**
   * Remove biometric registration
   */
  static async removeBiometric(userId: string, deviceId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/biometric/devices/${deviceId}`);

      // Clear local storage
      localStorage.removeItem(this.CREDENTIAL_KEY);
      localStorage.removeItem(this.CHALLENGE_KEY);
    } catch (error) {
      console.error('Failed to remove biometric registration:', error);
      throw new Error('Failed to remove biometric authentication');
    }
  }

  /**
   * Check if user has biometric enabled
   */
  static async hasBiometricEnabled(userId: string): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/v1/biometric/status');
      return response.data.data.hasBiometric;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get biometric registration status
   */
  static async getBiometricStatus(userId: string): Promise<{
    hasBiometric: boolean;
    devices: any[];
    lastUsed?: string;
  }> {
    try {
      const response = await apiClient.get('/api/v1/biometric/status');
      return response.data.data;
    } catch (error) {
      return { hasBiometric: false, devices: [] };
    }
  }

  // Utility methods for WebAuthn
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}