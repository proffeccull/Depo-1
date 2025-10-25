import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BiometricService } from '../../services/biometricService';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';

interface BiometricLoginScreenProps {
  route?: {
    params?: {
      userId?: string;
      onSuccess?: (result: any) => void;
    };
  };
}

export const BiometricLoginScreen = ({ route }: BiometricLoginScreenProps) => {
  const navigation = useNavigation();
  const { userId, onSuccess } = route?.params || {};

  const [authenticating, setAuthenticating] = useState(false);
  const [canUseBiometric, setCanUseBiometric] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await BiometricService.canUseBiometricForLogin();
    setCanUseBiometric(available);

    if (!available) {
      Alert.alert(
        'Biometric Unavailable',
        'Biometric authentication is not available. Please use your phone number and OTP to login.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleBiometricAuth = async () => {
    setAuthenticating(true);
    try {
      const result = await BiometricService.authenticateWithBiometric(userId);

      if (result.success) {
        if (onSuccess) {
          onSuccess(result);
        } else {
          // Default success handling - navigate to main app
          // This would typically update auth state and navigate
          Alert.alert('Success', 'Biometric authentication successful!', [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to main app
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              },
            },
          ]);
        }
      } else {
        Alert.alert('Authentication Failed', result.error || 'Please try again');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleUsePhoneLogin = () => {
    navigation.goBack(); // Go back to regular login
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={authenticating}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Biometric Login</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Card style={styles.authCard}>
          {/* Biometric Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={authenticating ? "scan-outline" : "finger-print-outline"}
              size={80}
              color={authenticating ? colors.primary : colors.textSecondary}
            />
            {authenticating && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.iconOverlay}
              />
            )}
          </View>

          {/* Title and Description */}
          <Text style={styles.authTitle}>
            {authenticating ? 'Authenticating...' : 'Authenticate with Biometrics'}
          </Text>
          <Text style={styles.authDescription}>
            {authenticating
              ? 'Please wait while we verify your identity'
              : 'Use your fingerprint or face to quickly access your account'
            }
          </Text>

          {/* Authenticate Button */}
          {!authenticating && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleBiometricAuth}
              disabled={!canUseBiometric}
            >
              <Ionicons name="scan-outline" size={20} color={colors.surface} />
              <Text style={styles.primaryButtonText}>Authenticate</Text>
            </TouchableOpacity>
          )}

          {/* Alternative Login */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleUsePhoneLogin}
            disabled={authenticating}
          >
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Use Phone & OTP</Text>
          </TouchableOpacity>
        </Card>

        {/* Security Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
            <Text style={styles.infoTitle}>Secure & Private</Text>
          </View>
          <Text style={styles.infoText}>
            Your biometric data stays on your device and is never shared with ChainGive servers.
          </Text>
        </Card>

        {/* Troubleshooting */}
        {!canUseBiometric && (
          <Card style={styles.troubleshootCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="help-circle-outline" size={20} color={colors.warning} />
              <Text style={styles.infoTitle}>Having Trouble?</Text>
            </View>
            <Text style={styles.infoText}>
              Make sure biometric authentication is enabled in your device settings and try again.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={checkBiometricAvailability}
            >
              <Text style={styles.outlineButtonText}>Check Again</Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  authCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  authDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  troubleshootCard: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});