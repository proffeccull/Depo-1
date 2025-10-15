import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { subscribe } from '../../store/slices/subscriptionSlice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { EnhancedButton } from '../../components/common/EnhancedButton';
import { EnhancedBadge } from '../../components/common/EnhancedBadge';
import { ProgressRing } from '../../components/common/ProgressRing';

interface CoinPaymentScreenProps {
  route: {
    params: {
      plan: any;
      autoRenew: boolean;
    };
  };
  navigation: any;
}

const CoinPaymentScreen: React.FC<CoinPaymentScreenProps> = ({ route, navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.subscription);
  
  const { plan, autoRenew } = route.params;
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user || user.charityCoinsBalance < plan.priceCoins) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${plan.priceCoins} coins but only have ${user?.charityCoinsBalance || 0} coins.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setProcessing(true);

    try {
      await dispatch(subscribe({ planId: plan.id, autoRenew })).unwrap();
      
      // Navigate to success screen
      navigation.replace('SubscriptionSuccess', { plan });
    } catch (error) {
      setProcessing(false);
      Alert.alert(
        'Payment Failed',
        error instanceof Error ? error.message : 'Failed to process payment',
        [{ text: 'OK' }]
      );
    }
  };

  const canAfford = user && user.charityCoinsBalance >= plan.priceCoins;
  const remainingBalance = user ? user.charityCoinsBalance - plan.priceCoins : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Payment</Text>
        <Text style={styles.subtitle}>Review your subscription details</Text>
      </View>

      {/* Plan Summary */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.displayName}</Text>
          {plan.name === 'pro' && (
            <EnhancedBadge text="Most Popular" variant="primary" size="small" />
          )}
        </View>
        
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceCoins}>{plan.priceCoins.toLocaleString()}</Text>
          <Text style={styles.priceLabel}>coins/month</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you get:</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureText}>🪙 {plan.coinMultiplier}x Coin Earnings</Text>
          </View>
          
          {plan.features.priorityMatching && (
            <View style={styles.feature}>
              <Text style={styles.featureText}>⚡ Priority Matching</Text>
            </View>
          )}
          
          {plan.features.exclusiveMarketplace && (
            <View style={styles.feature}>
              <Text style={styles.featureText}>🛍️ Exclusive Marketplace</Text>
            </View>
          )}
          
          {plan.features.zeroTransactionFees && (
            <View style={styles.feature}>
              <Text style={styles.featureText}>💸 Zero Transaction Fees</Text>
            </View>
          )}
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Payment Summary</Text>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Current Balance:</Text>
          <Text style={styles.paymentValue}>{user?.charityCoinsBalance.toLocaleString() || 0} coins</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Subscription Cost:</Text>
          <Text style={styles.paymentValue}>-{plan.priceCoins.toLocaleString()} coins</Text>
        </View>
        
        <View style={[styles.paymentRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Remaining Balance:</Text>
          <Text style={[styles.totalValue, canAfford ? styles.positiveBalance : styles.negativeBalance]}>
            {remainingBalance.toLocaleString()} coins
          </Text>
        </View>

        <View style={styles.autoRenewInfo}>
          <Text style={styles.autoRenewLabel}>Auto-Renewal:</Text>
          <Text style={styles.autoRenewValue}>
            {autoRenew ? 'Enabled (monthly)' : 'Disabled'}
          </Text>
        </View>
      </View>

      {/* Balance Visualization */}
      {user && (
        <View style={styles.balanceVisualization}>
          <Text style={styles.visualizationTitle}>Balance After Payment</Text>
          <View style={styles.progressContainer}>
            <ProgressRing
              progress={canAfford ? (remainingBalance / user.charityCoinsBalance) * 100 : 0}
              size={120}
              strokeWidth={8}
              color={canAfford ? colors.success : colors.error}
            />
            <View style={styles.progressCenter}>
              <Text style={styles.progressValue}>
                {remainingBalance.toLocaleString()}
              </Text>
              <Text style={styles.progressLabel}>coins left</Text>
            </View>
          </View>
        </View>
      )}

      {/* Warning for insufficient funds */}
      {!canAfford && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Insufficient Coins</Text>
          <Text style={styles.warningText}>
            You need {plan.priceCoins - (user?.charityCoinsBalance || 0)} more coins to complete this subscription.
          </Text>
          <EnhancedButton
            title="Buy More Coins"
            onPress={() => navigation.navigate('BuyCoins')}
            variant="secondary"
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <EnhancedButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="secondary"
          disabled={processing}
        />
        
        <EnhancedButton
          title={processing ? 'Processing...' : `Pay ${plan.priceCoins.toLocaleString()} Coins`}
          onPress={handlePayment}
          variant="primary"
          loading={processing || loading.subscribe}
          disabled={!canAfford || processing}
        />
      </View>

      {/* Terms */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          {autoRenew && ' Your subscription will automatically renew monthly unless cancelled.'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  planDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.lg,
  },
  priceCoins: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  featuresContainer: {
    marginBottom: spacing.md,
  },
  featuresTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
  },
  paymentTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  paymentLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paymentValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.h3,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: colors.success,
  },
  negativeBalance: {
    color: colors.error,
  },
  autoRenewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  autoRenewLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  autoRenewValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  balanceVisualization: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  visualizationTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  warningCard: {
    backgroundColor: colors.error + '20',
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  warningTitle: {
    ...typography.h3,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  termsContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CoinPaymentScreen;