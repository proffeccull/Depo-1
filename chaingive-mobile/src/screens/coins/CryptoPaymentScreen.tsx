import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteParams {
  purchaseId: string;
  gateway: string;
  amount: number;
  currency: string;
  estimatedCoins: number;
}

const CryptoPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { purchaseId, gateway, amount, currency, estimatedCoins } = route.params as RouteParams;

  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    generatePaymentData();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const generatePaymentData = async () => {
    try {
      // Mock payment data - replace with actual API call
      const mockPaymentData = {
        id: purchaseId,
        gateway: gateway,
        amount: amount,
        currency: currency,
        estimatedCoins: estimatedCoins,
        paymentAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Mock BTC address
        qrCode: 'mock-qr-code-url', // Replace with actual QR code URL
        exchangeRate: 45000, // Mock exchange rate
        networkFee: 0.0001,
        totalToSend: amount + 0.0001,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      setPaymentData(mockPaymentData);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeout = () => {
    Alert.alert(
      'Payment Timeout',
      'Your payment session has expired. Please start a new purchase.',
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setString(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const handlePaymentComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPaymentCompleted(true);
    (navigation as any).navigate('PaymentStatus', {
      transactionId: purchaseId,
      status: 'processing',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Generating payment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!paymentData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Payment Error</Text>
          <Text style={styles.errorMessage}>
            Failed to generate payment details. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Timer */}
        <View style={styles.timerCard}>
          <Icon name="schedule" size={24} color={timeLeft < 300 ? colors.error : colors.warning} />
          <Text style={[styles.timerText, timeLeft < 300 && styles.timerTextUrgent]}>
            Time remaining: {formatTime(timeLeft)}
          </Text>
        </View>

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Coins to receive:</Text>
            <Text style={styles.summaryValue}>{estimatedCoins.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount to send:</Text>
            <Text style={styles.summaryValue}>{paymentData.totalToSend.toFixed(8)} {currency}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Exchange rate:</Text>
            <Text style={styles.summaryValue}>₦{paymentData.exchangeRate.toLocaleString()}/coin</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Network fee:</Text>
            <Text style={styles.summaryValue}>{paymentData.networkFee} {currency}</Text>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Payment Instructions</Text>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Send exactly {paymentData.totalToSend.toFixed(8)} {currency} to the address below
            </Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Use only the {currency} network (not ERC-20 or other networks)
            </Text>
          </View>

          <View style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Payment must be received within {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        {/* Payment Address */}
        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>Payment Address ({currency})</Text>

          {/* QR Code Placeholder */}
          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <Icon name="qr-code" size={80} color={colors.gray[400]} />
              <Text style={styles.qrText}>QR Code</Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={2}>
              {paymentData.paymentAddress}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(paymentData.paymentAddress, 'Address')}
            >
              <Icon name="content-copy" size={20} color={colors.primary} />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Check */}
        <View style={styles.statusCard}>
          <Icon name="info" size={24} color={colors.info} />
          <Text style={styles.statusText}>
            After sending the payment, click "I've Sent the Payment" below.
            We'll verify the transaction and credit your coins.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                'Cancel Payment',
                'Are you sure you want to cancel this payment?',
                [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes', onPress: () => navigation.goBack() },
                ]
              );
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handlePaymentComplete}
          >
            <Text style={styles.confirmButtonText}>I've Sent the Payment</Text>
            <Icon name="check" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  timerText: {
    ...typography.bodyBold,
    color: colors.warning,
    marginLeft: spacing.sm,
  },
  timerTextUrgent: {
    color: colors.error,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  instructionsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  stepNumberText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  instructionText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  addressTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  qrPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
  },
  qrText: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing.sm,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  copyButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.info,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default CryptoPaymentScreen;