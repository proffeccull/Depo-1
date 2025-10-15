import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import * as LocalAuthentication from 'expo-local-authentication';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface BiometricAuthProps {
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
  onCancel?: () => void;
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
  requireConfirmation?: boolean;
  style?: ViewStyle;
  buttonStyle?: ViewStyle;
  iconSize?: number;
  showInstructions?: boolean;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({
  onSuccess,
  onFailure,
  onCancel,
  promptMessage = 'Authenticate to continue',
  cancelLabel = 'Cancel',
  disableDeviceFallback = false,
  requireConfirmation = false,
  style,
  buttonStyle,
  iconSize = 48,
  showInstructions = true,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      setIsBiometricAvailable(hasHardware && isEnrolled && supportedTypes.length > 0);

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType(LocalAuthentication.AuthenticationType.FINGERPRINT);
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType(LocalAuthentication.AuthenticationType.IRIS);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsBiometricAvailable(false);
    }
  };

  const authenticate = async () => {
    if (!isBiometricAvailable) {
      Alert.alert(
        'Biometric Authentication',
        'Biometric authentication is not available on this device.',
        [{ text: 'OK' }]
      );
      onFailure?.('Biometric authentication not available');
      return;
    }

    try {
      setIsAuthenticating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        disableDeviceFallback,
        requireConfirmation,
      });

      setIsAuthenticating(false);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        if (result.error === 'user_cancel') {
          onCancel?.();
        } else {
          const errorMessage = getErrorMessage(result.error);
          onFailure?.(errorMessage);
        }
      }
    } catch (error) {
      setIsAuthenticating(false);
      console.error('Authentication error:', error);
      onFailure?.('Authentication failed');
    }
  };

  const getErrorMessage = (error: string | undefined): string => {
    switch (error) {
      case 'app_cancel':
        return 'Authentication was cancelled by the app';
      case 'authentication_failed':
        return 'Authentication failed. Please try again';
      case 'invalid_context':
        return 'Invalid authentication context';
      case 'not_interactive':
        return 'Authentication is not interactive';
      case 'passcode_not_set':
        return 'Passcode is not set on the device';
      case 'system_cancel':
        return 'Authentication was cancelled by the system';
      case 'user_cancel':
        return 'Authentication was cancelled by the user';
      case 'user_fallback':
        return 'User chose to fallback to password';
      case 'lockout':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'Authentication failed';
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'face';
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'fingerprint';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'visibility';
      default:
        return 'lock';
    }
  };

  const getBiometricLabel = () => {
    switch (biometricType) {
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Touch ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris Scan';
      default:
        return 'Biometric Auth';
    }
  };

  if (!isBiometricAvailable) {
    return (
      <View
        style={[
          {
            padding: 20,
            alignItems: 'center',
            backgroundColor: colors.gray[100],
            borderRadius: 12,
          },
          style,
        ]}
      >
        <Icon name="lock" size={iconSize} color={colors.gray[500]} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: colors.text.secondary,
            textAlign: 'center',
          }}
        >
          Biometric authentication is not available on this device
        </Text>
      </View>
    );
  }

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      {showInstructions && (
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text.primary,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Secure Authentication
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.text.secondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Use {getBiometricLabel()} to securely access your account
          </Text>
        </View>
      )}

      <MotiView
        animate={{
          scale: isAuthenticating ? 1.1 : 1,
          opacity: isAuthenticating ? 0.8 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      >
        <TouchableOpacity
          onPress={authenticate}
          disabled={isAuthenticating}
          style={[
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: isAuthenticating ? colors.gray[300] : colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isAuthenticating ? 0 : 0.3,
              shadowRadius: 8,
              elevation: isAuthenticating ? 0 : 8,
            },
            buttonStyle,
          ]}
        >
          {isAuthenticating ? (
            <MotiView
              from={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
              }}
            >
              <Icon name="refresh" size={iconSize} color={colors.gray[500]} />
            </MotiView>
          ) : (
            <MotiView
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                type: 'timing',
                duration: 2000,
                loop: true,
              }}
            >
              <Icon
                name={getBiometricIcon()}
                size={iconSize}
                color="white"
              />
            </MotiView>
          )}
        </TouchableOpacity>
      </MotiView>

      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          color: colors.text.primary,
          textAlign: 'center',
        }}
      >
        {isAuthenticating ? 'Authenticating...' : `Tap to use ${getBiometricLabel()}`}
      </Text>

      {isAuthenticating && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.info,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: 'white', fontSize: 14 }}>
            {biometricType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
              ? 'Look at the camera'
              : biometricType === LocalAuthentication.AuthenticationType.FINGERPRINT
              ? 'Place your finger on the sensor'
              : 'Complete biometric authentication'}
          </Text>
        </MotiView>
      )}
    </View>
  );
};

export default BiometricAuth;