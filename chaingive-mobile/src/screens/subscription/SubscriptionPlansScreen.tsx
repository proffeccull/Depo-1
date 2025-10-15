import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchUserSubscription, purchaseSubscription } from '../../store/slices/subscriptionSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

const SubscriptionPlansScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { plans, userSubscription, loading } = useSelector((state: RootState) => state.subscription);
  const { balance } = useSelector((state: RootState) => state.coin);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserSubscription(user.id));
    }
  }, [dispatch, user?.id]);

  const handleSelectPlan = (planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(planId);
  };

  const handlePurchasePlan = async (planId: string) => {
    if (!user?.id) return;

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // Check if user has enough coins
    if (balance.current < plan.price) {
      showToast('Insufficient coins. Please buy more coins first.', 'error');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(purchaseSubscription({ userId: user.id, planId })).unwrap();

      showToast(`Successfully subscribed to ${plan.name}!`, 'success');
      navigation.goBack();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to purchase subscription', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const renderPlanCard = (plan: any) => {
    const isSelected = selectedPlan === plan.id;
    const hasActiveSubscription = userSubscription?.status === 'active';
    const isCurrentPlan = userSubscription?.planId === plan.id;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          plan.isPopular && styles.popularPlan,
        ]}
        onPress={() => handleSelectPlan(plan.id)}
        disabled={hasActiveSubscription && isCurrentPlan}
      >
        {plan.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}

        <LinearGradient
          colors={
            plan.name === 'Pro'
              ? [colors.tertiary, colors.primary]
              : [colors.primary, colors.secondary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.planHeader}
        >
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <AnimatedNumber
              value={plan.price}
              style={styles.planPrice}
              formatter={formatCurrency}
            />
            <Text style={styles.priceUnit}>coins/month</Text>
          </View>
        </LinearGradient>

        <View style={styles.planFeatures}>
          {plan.features.map((feature: string, index: number) => (
            <View key={index} style={styles.featureRow}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {plan.savings && (
          <View style={styles.savingsContainer}>
            <Icon name="savings" size={16} color={colors.success} />
            <Text style={styles.savingsText}>{plan.savings}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            isSelected && styles.purchaseButtonSelected,
            (hasActiveSubscription && isCurrentPlan) && styles.currentPlanButton,
          ]}
          onPress={() => handlePurchasePlan(plan.id)}
          disabled={hasActiveSubscription && isCurrentPlan}
        >
          <Text style={[
            styles.purchaseButtonText,
            isSelected && styles.purchaseButtonTextSelected,
            (hasActiveSubscription && isCurrentPlan) && styles.currentPlanButtonText,
          ]}>
            {hasActiveSubscription && isCurrentPlan
              ? 'Current Plan'
              : isSelected
                ? 'Purchase Now'
                : 'Select Plan'
            }
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Plans</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Coin Balance</Text>
          <AnimatedNumber
            value={balance.current}
            style={styles.balanceAmount}
            formatter={formatCurrency}
          />
          <Text style={styles.balanceSubtext}>coins available</Text>
        </View>

        {/* Current Subscription Status */}
        {userSubscription && (
          <View style={styles.currentSubscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Icon name="star" size={24} color={colors.tertiary} />
              <Text style={styles.subscriptionTitle}>
                {userSubscription.planName} Plan Active
              </Text>
            </View>
            <Text style={styles.subscriptionDetails}>
              Renews on {new Date(userSubscription.renewalDate).toLocaleDateString()}
            </Text>
            <Text style={styles.subscriptionDetails}>
              {userSubscription.autoRenew ? 'Auto-renewal enabled' : 'Auto-renewal disabled'}
            </Text>
          </View>
        )}

        {/* Plans */}
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>

        {/* Benefits Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Plan Comparison</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Coin Earning Multiplier</Text>
              <Text style={styles.comparisonValue}>2x</Text>
              <Text style={styles.comparisonValuePro}>3x</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Priority Matching</Text>
              <Icon name="check" size={20} color={colors.success} />
              <Icon name="check" size={20} color={colors.success} />
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Advanced Analytics</Text>
              <Icon name="close" size={20} color={colors.error} />
              <Icon name="check" size={20} color={colors.success} />
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Dedicated Support</Text>
              <Icon name="close" size={20} color={colors.error} />
              <Icon name="check" size={20} color={colors.success} />
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I change plans anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What happens if I run out of coins?</Text>
            <Text style={styles.faqAnswer}>
              Your subscription will be paused until you replenish your coin balance. You won't lose your subscription status.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time. You'll retain premium features until the end of your billing period.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  balanceLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.h1,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  balanceSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  currentSubscriptionCard: {
    backgroundColor: colors.tertiary + '10',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.tertiary + '30',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subscriptionTitle: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  subscriptionDetails: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  plansContainer: {
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border.light,
    ...shadows.card,
  },
  planCardSelected: {
    borderColor: colors.primary,
    ...shadows.elevated,
  },
  popularPlan: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: 12,
    zIndex: 10,
  },
  popularBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  planHeader: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  planName: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  priceContainer: {
    alignItems: 'center',
  },
  planPrice: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
  },
  priceUnit: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  planFeatures: {
    padding: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  savingsText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  purchaseButton: {
    backgroundColor: colors.gray[200],
    padding: spacing.md,
    alignItems: 'center',
    margin: spacing.lg,
    marginTop: 0,
    borderRadius: 8,
  },
  purchaseButtonSelected: {
    backgroundColor: colors.primary,
  },
  purchaseButtonText: {
    ...typography.button,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  purchaseButtonTextSelected: {
    color: colors.white,
  },
  currentPlanButton: {
    backgroundColor: colors.success,
  },
  currentPlanButtonText: {
    color: colors.white,
  },
  comparisonSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  comparisonTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  comparisonTable: {
    gap: spacing.md,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  comparisonFeature: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  comparisonValue: {
    ...typography.body,
    color: colors.text.secondary,
    width: 60,
    textAlign: 'center',
  },
  comparisonValuePro: {
    ...typography.body,
    color: colors.tertiary,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  faqSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  faqTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: spacing.lg,
  },
  faqQuestion: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default SubscriptionPlansScreen;