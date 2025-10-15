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
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchUserAnalytics } from '../../store/slices/analyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

const PersonalImpactDashboard: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { userAnalytics, loading } = useSelector((state: RootState) => state.analytics);

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserAnalytics(user.id));
    }
  }, [dispatch, user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const impactMetrics = userAnalytics ? [
    {
      title: 'Lives Impacted',
      value: userAnalytics.donationMetrics?.totalDonations * 5 || 0, // Estimate based on donations
      icon: 'people',
      color: colors.primary,
      description: 'People helped through your donations',
    },
    {
      title: 'Total Donated',
      value: userAnalytics.donationMetrics?.totalAmount || 0,
      icon: 'favorite',
      color: colors.success,
      description: 'Amount contributed to causes',
      formatter: formatCurrency,
    },
    {
      title: 'Cycles Completed',
      value: userAnalytics.donationMetrics?.totalDonations || 0,
      icon: 'refresh',
      color: colors.secondary,
      description: 'Donation cycles participated in',
    },
    {
      title: 'Coins Earned',
      value: userAnalytics.coinMetrics?.totalEarned || 0,
      icon: 'monetization-on',
      color: colors.tertiary,
      description: 'Charity coins accumulated',
      formatter: formatNumber,
    },
  ] : [];

  const coinMetrics = userAnalytics?.coinMetrics ? [
    {
      title: 'Current Balance',
      value: userAnalytics.coinMetrics.currentBalance,
      icon: 'account-balance-wallet',
      trend: userAnalytics.coinMetrics.spendingRate > 0 ? 'spending' : 'saving',
    },
    {
      title: 'Daily Average',
      value: userAnalytics.coinMetrics.averageDailyEarnings,
      icon: 'trending-up',
      trend: 'positive',
    },
    {
      title: 'Total Spent',
      value: userAnalytics.coinMetrics.totalSpent,
      icon: 'shopping-cart',
      trend: 'neutral',
    },
    {
      title: 'Spending Rate',
      value: userAnalytics.coinMetrics.spendingRate,
      icon: 'analytics',
      trend: userAnalytics.coinMetrics.spendingRate > 50 ? 'high' : 'normal',
      suffix: '%',
    },
  ] : [];

  const renderMetricCard = (metric: any, index: number) => (
    <View key={index} style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
        <Icon name={metric.icon} size={24} color={metric.color} />
      </View>
      <View style={styles.metricContent}>
        <AnimatedNumber
          value={metric.value}
          style={styles.metricValue}
          formatter={metric.formatter || formatNumber}
        />
        <Text style={styles.metricTitle}>{metric.title}</Text>
        <Text style={styles.metricDescription}>{metric.description}</Text>
      </View>
    </View>
  );

  const renderCoinMetric = (metric: any, index: number) => (
    <View key={index} style={styles.coinMetricCard}>
      <View style={styles.coinMetricHeader}>
        <Icon name={metric.icon} size={20} color={colors.tertiary} />
        <Text style={styles.coinMetricTitle}>{metric.title}</Text>
      </View>
      <AnimatedNumber
        value={metric.value}
        style={styles.coinMetricValue}
        formatter={metric.suffix ? (val) => `${formatNumber(val)}${metric.suffix}` : formatNumber}
      />
      <View style={[styles.coinMetricTrend, {
        backgroundColor: metric.trend === 'positive' ? colors.success + '20' :
                        metric.trend === 'high' ? colors.warning + '20' :
                        colors.gray[200]
      }]}>
        <Text style={[styles.coinMetricTrendText, {
          color: metric.trend === 'positive' ? colors.success :
                 metric.trend === 'high' ? colors.warning :
                 colors.text.secondary
        }]}>
          {metric.trend === 'positive' ? '↗ Growing' :
           metric.trend === 'high' ? '⚠ High' :
           metric.trend === 'spending' ? '💰 Active' : '➡️ Stable'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your impact...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Your Impact</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AdvancedAnalytics' as never)}
            style={styles.upgradeButton}
          >
            <Text style={styles.upgradeButtonText}>Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeframeSelector}>
          {(['week', 'month', 'year'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTimeframe(timeframe);
              }}
            >
              <Text style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.timeframeButtonTextSelected,
              ]}>
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Impact Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Summary</Text>
          <View style={styles.metricsGrid}>
            {impactMetrics.map(renderMetricCard)}
          </View>
        </View>

        {/* Coin Analytics */}
        {userAnalytics?.coinMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coin Activity</Text>
            <View style={styles.coinMetricsGrid}>
              {coinMetrics.map(renderCoinMetric)}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {/* Mock activity items - replace with real data */}
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.success + '20' }]}>
                <Icon name="favorite" size={20} color={colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Donation to Education Fund</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <Text style={styles.activityAmount}>+₦5,000</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.tertiary + '20' }]}>
                <Icon name="monetization-on" size={20} color={colors.tertiary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Coins earned from referral</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
              <Text style={styles.activityAmount}>+250 coins</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="emoji-events" size={20} color={colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Achievement unlocked: Generous Heart</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
              <Text style={styles.activityAmount}>+1,000 coins</Text>
            </View>
          </View>
        </View>

        {/* Upgrade Prompt */}
        <View style={styles.upgradePrompt}>
          <Icon name="analytics" size={48} color={colors.primary} />
          <Text style={styles.upgradePromptTitle}>Unlock Advanced Analytics</Text>
          <Text style={styles.upgradePromptText}>
            Get predictive insights, ROI analysis, and personalized recommendations with ChainGive Pro.
          </Text>
          <TouchableOpacity
            style={styles.upgradePromptButton}
            onPress={() => navigation.navigate('SubscriptionPlans' as never)}
          >
            <Text style={styles.upgradePromptButtonText}>Upgrade to Pro</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
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
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  upgradeButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeframeButtonSelected: {
    backgroundColor: colors.primary,
  },
  timeframeButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  timeframeButtonTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  metricTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  metricDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  coinMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  coinMetricCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    width: (screenWidth - spacing.md * 3) / 2,
    ...shadows.card,
  },
  coinMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  coinMetricTitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  coinMetricValue: {
    ...typography.h3,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  coinMetricTrend: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  coinMetricTrendText: {
    ...typography.caption,
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm,
    ...shadows.card,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activityAmount: {
    ...typography.label,
    color: colors.success,
    fontWeight: '600',
  },
  upgradePrompt: {
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
    padding: spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  upgradePromptTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  upgradePromptText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  upgradePromptButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  upgradePromptButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default PersonalImpactDashboard;