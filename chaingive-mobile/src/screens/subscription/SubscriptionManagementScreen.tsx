import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchSubscriptionStatus,
  cancelSubscription,
  updateAutoRenew,
  fetchSubscriptionHistory,
} from '../../store/slices/subscriptionSlice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EnhancedButton } from '../../components/common/EnhancedButton';
import { EnhancedBadge } from '../../components/common/EnhancedBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

const SubscriptionManagementScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSubscription, history, loading, error } = useSelector((state: RootState) => state.subscription);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
    dispatch(fetchSubscriptionHistory());
  }, [dispatch]);

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    try {
      await dispatch(cancelSubscription(cancelReason || undefined)).unwrap();
      setShowCancelModal(false);
      setCancelReason('');
      Alert.alert(
        'Subscription Cancelled',
        'Your subscription has been cancelled. You will continue to have access until the end of your current billing period.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Cancellation Failed',
        error instanceof Error ? error.message : 'Failed to cancel subscription',
        [{ text: 'OK' }]
      );
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!currentSubscription?.subscription) return;

    const newAutoRenew = !currentSubscription.subscription.autoRenew;
    
    try {
      await dispatch(updateAutoRenew(newAutoRenew)).unwrap();
      Alert.alert(
        'Settings Updated',
        `Auto-renewal has been ${newAutoRenew ? 'enabled' : 'disabled'}.`,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <EnhancedBadge text="Active" variant="success" size="small" />;
      case 'cancelled':
        return <EnhancedBadge text="Cancelled" variant="warning" size="small" />;
      case 'expired':
        return <EnhancedBadge text="Expired" variant="error" size="small" />;
      case 'grace_period':
        return <EnhancedBadge text="Grace Period" variant="warning" size="small" />;
      default:
        return <EnhancedBadge text={status} variant="neutral" size="small" />;
    }
  };

  if (loading.status) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading subscription details...</Text>
      </View>
    );
  }

  if (!currentSubscription?.isActive) {
    return (
      <View style={styles.noSubscriptionContainer}>
        <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
        <Text style={styles.noSubscriptionText}>
          You don't have an active subscription. Upgrade to premium to unlock exclusive features!
        </Text>
        <EnhancedButton
          title="View Plans"
          onPress={() => {/* Navigate to plans */}}
          variant="primary"
        />
      </View>
    );
  }

  const { subscription, plan, daysRemaining } = currentSubscription;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription Management</Text>
      </View>

      {/* Current Plan Card */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan?.displayName}</Text>
          {getStatusBadge(subscription?.status || 'unknown')}
        </View>

        <Text style={styles.planDescription}>{plan?.description}</Text>

        <View style={styles.planDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Monthly Cost:</Text>
            <Text style={styles.detailValue}>{plan?.priceCoins.toLocaleString()} coins</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Coin Multiplier:</Text>
            <Text style={styles.detailValue}>{plan?.coinMultiplier}x</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Period:</Text>
            <Text style={styles.detailValue}>
              {formatDate(subscription?.currentPeriodStart || '')} - {formatDate(subscription?.currentPeriodEnd || '')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Days Remaining:</Text>
            <Text style={styles.detailValue}>{daysRemaining} days</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Auto-Renewal:</Text>
            <Text style={[styles.detailValue, subscription?.autoRenew ? styles.activeText : styles.inactiveText]}>
              {subscription?.autoRenew ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          {subscription?.nextPaymentDue && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Payment:</Text>
              <Text style={styles.detailValue}>{formatDate(subscription.nextPaymentDue)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <EnhancedButton
          title={subscription?.autoRenew ? 'Disable Auto-Renewal' : 'Enable Auto-Renewal'}
          onPress={handleToggleAutoRenew}
          variant="secondary"
          loading={loading.autoRenew}
        />

        <EnhancedButton
          title="Cancel Subscription"
          onPress={handleCancelSubscription}
          variant="error"
          loading={loading.cancel}
        />
      </View>

      {/* Features List */}
      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>Your Premium Features</Text>
        
        <View style={styles.feature}>
          <Text style={styles.featureText}>🪙 {plan?.coinMultiplier}x Coin Earnings</Text>
        </View>
        
        {plan?.features.priorityMatching && (
          <View style={styles.feature}>
            <Text style={styles.featureText}>⚡ Priority Matching</Text>
          </View>
        )}
        
        {plan?.features.exclusiveMarketplace && (
          <View style={styles.feature}>
            <Text style={styles.featureText}>🛍️ Exclusive Marketplace Access</Text>
          </View>
        )}
        
        {plan?.features.zeroTransactionFees && (
          <View style={styles.feature}>
            <Text style={styles.featureText}>💸 Zero Transaction Fees</Text>
          </View>
        )}
        
        {plan?.features.earlyAccess && (
          <View style={styles.feature}>
            <Text style={styles.featureText}>🚀 Early Access to New Features</Text>
          </View>
        )}
        
        {plan?.features.dedicatedSupport && (
          <View style={styles.feature}>
            <Text style={styles.featureText}>🎧 Dedicated Customer Support</Text>
          </View>
        )}
        
        {plan?.features.advancedAnalytics && (
          <View style={styles.feature}>
            <Text style={styles.featureText}>📊 Advanced Analytics Dashboard</Text>
          </View>
        )}
      </View>

      {/* Recent History */}
      {history.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Recent Activity</Text>
          {history.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyAction}>{item.action}</Text>
                <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
              </View>
              {item.coinsCharged && (
                <Text style={styles.historyCoins}>{item.coinsCharged.toLocaleString()} coins</Text>
              )}
              {item.reason && (
                <Text style={styles.historyReason}>{item.reason}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period."
        confirmText="Cancel Subscription"
        cancelText="Keep Subscription"
        onConfirm={confirmCancellation}
        onCancel={() => setShowCancelModal(false)}
        loading={loading.cancel}
      />
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
    marginBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  planCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.success,
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
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.warning,
  },
  actionsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  featuresCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
  },
  featuresTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  historyCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
  },
  historyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyAction: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyCoins: {
    ...typography.body,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  historyReason: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default SubscriptionManagementScreen;