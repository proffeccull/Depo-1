import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteParams {
  transactionId: string;
  status?: 'processing' | 'completed' | 'failed';
}

const PaymentStatusScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { transactionId, status: initialStatus } = route.params as RouteParams;

  const [currentStatus, setCurrentStatus] = useState<'processing' | 'completed' | 'failed'>(
    initialStatus || 'processing'
  );
  const [transactionData, setTransactionData] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (currentStatus === 'processing') {
      loadTransactionData();
      // Simulate status checking
      const interval = setInterval(checkPaymentStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [currentStatus]);

  const loadTransactionData = async () => {
    try {
      // Mock transaction data - replace with actual API call
      const mockTransaction = {
        id: transactionId,
        amount: 0.001,
        currency: 'BTC',
        estimatedCoins: 1250,
        status: currentStatus,
        createdAt: new Date().toISOString(),
        gateway: 'binance',
        paymentAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      };
      setTransactionData(mockTransaction);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transaction details');
    }
  };

  const checkPaymentStatus = async () => {
    if (checkingStatus) return;

    setCheckingStatus(true);
    try {
      // Mock status check - replace with actual API call
      // Simulate random completion after some time
      if (Math.random() > 0.7) {
        setCurrentStatus('completed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleStatusChange = (newStatus: 'processing' | 'completed' | 'failed') => {
    setCurrentStatus(newStatus);
  };

  const handleGoHome = () => {
    // Reset navigation stack to home
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleViewTransaction = () => {
    (navigation as any).navigate('CryptoTransactionHistory');
  };

  const getStatusConfig = () => {
    switch (currentStatus) {
      case 'processing':
        return {
          icon: 'hourglass-empty',
          iconColor: colors.warning,
          title: 'Processing Payment',
          message: 'We\'re verifying your crypto payment. This usually takes 2-5 minutes.',
          animation: null,
          primaryButton: null,
          secondaryButton: {
            text: 'Check Status',
            onPress: checkPaymentStatus,
            disabled: checkingStatus,
          },
        };
      case 'completed':
        return {
          icon: 'check-circle',
          iconColor: colors.success,
          title: 'Payment Successful!',
          message: `You've received ${transactionData?.estimatedCoins?.toLocaleString() || '0'} Charity Coins in your wallet.`,
          animation: 'success',
          primaryButton: {
            text: 'Go to Wallet',
            onPress: handleGoHome,
          },
          secondaryButton: {
            text: 'View Transaction',
            onPress: handleViewTransaction,
          },
        };
      case 'failed':
        return {
          icon: 'error',
          iconColor: colors.error,
          title: 'Payment Failed',
          message: 'We couldn\'t verify your payment. Please check your transaction and try again.',
          animation: null,
          primaryButton: {
            text: 'Try Again',
            onPress: () => navigation.goBack(),
          },
          secondaryButton: {
            text: 'Contact Support',
            onPress: () => Alert.alert('Support', 'Please contact our support team for assistance.'),
          },
        };
      default:
        return {
          icon: 'info',
          iconColor: colors.info,
          title: 'Unknown Status',
          message: 'We\'re having trouble determining the payment status.',
          animation: null,
          primaryButton: null,
          secondaryButton: null,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Status</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Status Animation/Icon */}
        <View style={styles.statusContainer}>
          {statusConfig.animation === 'success' ? (
            <LottieView
              source={require('../../assets/animations/success.json')}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: statusConfig.iconColor + '20' }]}>
              <Icon
                name={statusConfig.icon as any}
                size={64}
                color={statusConfig.iconColor}
              />
            </View>
          )}
        </View>

        {/* Status Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{statusConfig.title}</Text>
          <Text style={styles.message}>{statusConfig.message}</Text>
        </View>

        {/* Transaction Details */}
        {transactionData && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Transaction Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID:</Text>
              <Text style={styles.detailValue}>{transactionData.id.slice(-8)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Sent:</Text>
              <Text style={styles.detailValue}>
                {transactionData.amount} {transactionData.currency}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coins Received:</Text>
              <Text style={styles.detailValue}>
                {transactionData.estimatedCoins.toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gateway:</Text>
              <Text style={styles.detailValue}>{transactionData.gateway}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>
                {new Date(transactionData.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Processing Indicator */}
        {currentStatus === 'processing' && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.processingText}>
              {checkingStatus ? 'Checking status...' : 'Waiting for confirmation...'}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {statusConfig.secondaryButton && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                statusConfig.secondaryButton.disabled && styles.buttonDisabled,
              ]}
              onPress={statusConfig.secondaryButton.onPress}
              disabled={statusConfig.secondaryButton.disabled}
            >
              <Text style={styles.secondaryButtonText}>
                {statusConfig.secondaryButton.text}
              </Text>
            </TouchableOpacity>
          )}

          {statusConfig.primaryButton && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={statusConfig.primaryButton.onPress}
            >
              <Text style={styles.primaryButtonText}>
                {statusConfig.primaryButton.text}
              </Text>
              <Icon name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Debug Buttons (only in development) */}
        {__DEV__ && currentStatus === 'processing' && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Options</Text>
            <View style={styles.debugButtons}>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => handleStatusChange('completed')}
              >
                <Text style={styles.debugButtonText}>Set Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => handleStatusChange('failed')}
              >
                <Text style={styles.debugButtonText}>Set Failed</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
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
    paddingTop: spacing.xl,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning + '10',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  processingText: {
    ...typography.bodyRegular,
    color: colors.warning,
    marginLeft: spacing.sm,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.gray[200],
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  debugContainer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  debugTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  debugButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  debugButton: {
    flex: 1,
    backgroundColor: colors.warning,
    padding: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  debugButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default PaymentStatusScreen;