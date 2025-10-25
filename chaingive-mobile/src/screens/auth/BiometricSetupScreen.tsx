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
import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricService } from '../../services/biometricService';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';

export const BiometricSetupScreen = () => {
  const navigation = useNavigation();
  const [capabilities, setCapabilities] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    try {
      const caps = await BiometricService.checkBiometricCapabilities();
      setCapabilities(caps);
    } catch (error) {
      Alert.alert('Error', 'Failed to check device capabilities');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableBiometric = async () => {
    setEnabling(true);
    try {
      const success = await BiometricService.enableBiometric();

      if (success) {
        Alert.alert(
          'Success',
          'Biometric authentication has been enabled!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to enable biometric authentication');
    } finally {
      setEnabling(false);
    }
  };

  const getBiometricIcon = (types: LocalAuthentication.AuthenticationType[]) => {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'scan-outline'; // Face ID
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'finger-print-outline'; // Touch ID
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'eye-outline'; // Iris
    }
    return 'shield-checkmark-outline';
  };

  const getBiometricTypeText = (types: LocalAuthentication.AuthenticationType[]) => {
    const typeNames = BiometricService.getBiometricTypeNames(types);
    return typeNames.length > 0 ? typeNames.join(', ') : 'Biometric';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Checking device capabilities...</Text>
      </View>
    );
  }

  const hasBiometricSupport = capabilities?.hasHardware && capabilities?.isEnrolled;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Biometric Authentication</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!hasBiometricSupport ? (
          /* No Biometric Support */
          <Card style={styles.statusCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle-outline" size={64} color={colors.error} />
            </View>
            <Text style={styles.statusTitle}>Not Available</Text>
            <Text style={styles.statusText}>
              Biometric authentication is not available on this device. Make sure you have set up biometric authentication in your device settings.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={checkCapabilities}
            >
              <Text style={styles.secondaryButtonText}>Check Again</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          /* Biometric Available */
          <Card style={styles.statusCard}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={getBiometricIcon(capabilities.supportedTypes)}
                size={64}
                color={colors.primary}
              />
            </View>
            <Text style={styles.statusTitle}>Available</Text>
            <Text style={styles.statusText}>
              Enable {getBiometricTypeText(capabilities.supportedTypes)} authentication for quick and secure access to your ChainGive account.
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.featureText}>Faster login experience</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.featureText}>Enhanced security</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.featureText}>Secure sensitive actions</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, enabling && styles.disabledButton]}
              onPress={handleEnableBiometric}
              disabled={enabling}
            >
              {enabling ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.surface} />
                  <Text style={styles.primaryButtonText}>Enable Biometric Auth</Text>
                </>
              )}
            </TouchableOpacity>
          </Card>
        )}

        {/* Security Notice */}
        <Card style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.noticeTitle}>Security Notice</Text>
          </View>
          <Text style={styles.noticeText}>
            Your biometric data is stored securely and never shared with third parties. You can disable this feature at any time in your account settings.
          </Text>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
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
  statusCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    alignSelf: 'stretch',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  noticeCard: {
    padding: 16,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});