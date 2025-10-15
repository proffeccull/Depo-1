import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchSubscriptionStatus,
  updateAutoRenew,
} from '../../store/slices/subscriptionSlice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EnhancedButton } from '../../components/common/EnhancedButton';
import { EnhancedBadge } from '../../components/common/EnhancedBadge';

const AutoRenewalSettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSubscription, loading, error } = useSelector((state: RootState) => state.subscription);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

  useEffect(() => {
    if (currentSubscription?.subscription) {
      setAutoRenewEnabled(currentSubscription.subscription.autoRenew);
    }
  }, [currentSubscription]);

  const handleToggleAutoRenew = async (value: boolean) => {
    try {
      await dispatch(updateAutoRenew(value)).unwrap();
      setAutoRenewEnabled(value);
      
      Alert.alert(
        'Settings Updated',
        `Auto-renewal has been ${value ? 'enabled' : 'disabled'}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update auto-renewal setting',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getNextPaymentInfo = () => {
    if (!currentSubscription?.subscription) return null;

    const { subscription, plan } = currentSubscription;
    
    if (!autoRenewEnabled) {
      return {
        status: 'disabled',
        message: 'Auto-renewal is disabled. Your subscription will expire on ' + 
                formatDate(subscription.currentPeriodEnd),
        color: colors.warning,
      };
    }

    const hasEnoughCoins = user && user.charityCoinsBalance >= (plan?.priceCoins || 0);
    
    if (!hasEnoughCoins) {
      return {
        status: 'insufficient',
        message: `Insufficient coins for next payment. You need ${(plan?.priceCoins || 0) - (user?.charityCoinsBalance || 0)} more coins.`,
        color: colors.error,
      };
    }

    return {
      status: 'ready',
      message: `Next payment of ${plan?.priceCoins.toLocaleString()} coins will be charged on ${formatDate(subscription.nextPaymentDue || subscription.currentPeriodEnd)}`,
      color: colors.success,
    };
  };

  if (loading.status) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading subscription settings...</Text>
      </View>
    );
  }

  if (!currentSubscription?.isActive) {
    return (
      <View style={styles.noSubscriptionContainer}>
        <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
        <Text style={styles.noSubscriptionText}>
          You need an active subscription to manage auto-renewal settings.
        </Text>
      </View>
    );
  }

  const { subscription, plan } = currentSubscription;
  const nextPaymentInfo = getNextPaymentInfo();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Auto-Renewal Settings</Text>
        <Text style={styles.subtitle}>Manage your subscription renewal preferences</Text>
      </View>

      {/* Current Plan Info */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan?.displayName}</Text>
          <EnhancedBadge text="Active" variant="success" size="small" />
        </View>
        
        <View style={styles.planDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Monthly Cost:</Text>
            <Text style={styles.detailValue}>{plan?.priceCoins.toLocaleString()} coins</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Period Ends:</Text>
            <Text style={styles.detailValue}>{formatDate(subscription?.currentPeriodEnd || '')}</Text>
          </View>
        </View>
      </View>

      {/* Auto-Renewal Toggle */}
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Auto-Renewal</Text>
            <Text style={styles.settingDescription}>
              Automatically renew your subscription each month
            </Text>
          </View>
          
          <Switch
            value={autoRenewEnabled}
            onValueChange={handleToggleAutoRenew}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={autoRenewEnabled ? colors.primary : colors.textSecondary}
            disabled={loading.autoRenew}
          />
        </View>
      </View>

      {/* Payment Status */}
      {nextPaymentInfo && (
        <View style={[styles.statusCard, { borderColor: nextPaymentInfo.color }]}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Payment Status</Text>
            <EnhancedBadge 
              text={nextPaymentInfo.status === 'ready' ? 'Ready' : 
                    nextPaymentInfo.status === 'insufficient' ? 'Insufficient Coins' : 'Disabled'}
              variant={nextPaymentInfo.status === 'ready' ? 'success' : 
                      nextPaymentInfo.status === 'insufficient' ? 'error' : 'warning'}
              size="small"
            />
          </View>
          
          <Text style={[styles.statusMessage, { color: nextPaymentInfo.color }]}>
            {nextPaymentInfo.message}
          </Text>
        </View>
      )}

      {/* Current Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Current Coin Balance</Text>
        <Text style={styles.balanceAmount}>{user?.charityCoinsBalance.toLocaleString() || 0} coins</Text>
        
        {user && plan && user.charityCoinsBalance < plan.priceCoins && (
          <View style={styles.balanceWarning}>
            <Text style={styles.balanceWarningText}>
              ⚠️ You need {(plan.priceCoins - user.charityCoinsBalance).toLocaleString()} more coins for the next payment
            </Text>
            <EnhancedButton
              title="Buy More Coins"
              onPress={() => {/* Navigate to buy coins */}}
              variant="secondary"
              size="small"
            />
          </View>
        )}
      </View>

      {/* Auto-Renewal Benefits */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Auto-Renewal Benefits</Text>
        
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>🔄</Text>
          <Text style={styles.benefitText}>Never lose access to premium features</Text>
        </View>
        
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>💰</Text>
          <Text style={styles.benefitText}>Continue earning {plan?.coinMultiplier}x coins</Text>
        </View>
        
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>⚡</Text>
          <Text style={styles.benefitText}>Maintain priority matching status</Text>
        </View>
        
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>🛡️</Text>
          <Text style={styles.benefitText}>Cancel anytime without penalty</Text>
        </View>
      </View>

      {/* Important Notes */}
      <View style={styles.notesCard}>
        <Text style={styles.notesTitle}>Important Notes</Text>
        
        <Text style={styles.noteText}>
          • Auto-renewal charges occur on your subscription renewal date
        </Text>
        
        <Text style={styles.noteText}>
          • Ensure you have sufficient coins in your balance before renewal
        </Text>
        
        <Text style={styles.noteText}>
          • You can disable auto-renewal anytime without losing current benefits
        </Text>
        
        <Text style={styles.noteText}>
          • If payment fails, you'll have a 7-day grace period to add coins
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  noSubscriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  noSubscriptionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  noSubscriptionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  planDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  statusMessage: {
    ...typography.body,
    lineHeight: 20,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  balanceTitle: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  balanceWarning: {
    backgroundColor: colors.error + '20',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  balanceWarningText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
  },
  benefitsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  benefitText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  notesCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
  },
  notesTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  noteText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});

export default AutoRenewalSettingsScreen;