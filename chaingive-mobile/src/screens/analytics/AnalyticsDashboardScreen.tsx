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
import { fetchAnalyticsDashboard } from '../../store/slices/analyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

const AnalyticsDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { analyticsDashboard, loading } = useSelector((state: RootState) => state.analytics);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAnalyticsDashboard({ userId: user.id, period: selectedPeriod }));
    }
  }, [dispatch, user?.id, selectedPeriod]);

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

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const data = analyticsDashboard;

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
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <TouchableOpacity
            style={styles.advancedButton}
            onPress={() => navigation.navigate('AdvancedAnalyticsDashboard' as never)}
          >
            <Icon name="analytics" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPeriod(period);
              }}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextSelected,
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Icon name="favorite" size={24} color={colors.primary} />
            <Text style={styles.metricLabel}>Total Donated</Text>
            <AnimatedNumber
              value={data?.totalDonated || 0}
              style={styles.metricValue}
              formatter={formatCurrency}
            />
            <Text style={styles.metricChange}>
              {formatPercentage(data?.donationChange || 0)} from last {selectedPeriod}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Icon name="people" size={24} color={colors.secondary} />
            <Text style={styles.metricLabel}>Impact Score</Text>
            <AnimatedNumber
              value={data?.impactScore || 0}
              style={styles.metricValue}
              formatter={formatNumber}
            />
            <Text style={styles.metricChange}>
              {formatPercentage(data?.impactChange || 0)} from last {selectedPeriod}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Icon name="emoji-events" size={24} color={colors.tertiary} />
            <Text style={styles.metricLabel}>Achievements</Text>
            <AnimatedNumber
              value={data?.achievementsCount || 0}
              style={styles.metricValue}
              formatter={formatNumber}
            />
            <Text style={styles.metricChange}>
              {data?.newAchievements || 0} new this {selectedPeriod}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Icon name="trending-up" size={24} color={colors.success} />
            <Text style={styles.metricLabel}>Coins Earned</Text>
            <AnimatedNumber
              value={data?.coinsEarned || 0}
              style={styles.metricValue}
              formatter={formatNumber}
            />
            <Text style={styles.metricChange}>
              {formatPercentage(data?.coinsChange || 0)} from last {selectedPeriod}
            </Text>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>

          {/* Donation Trend */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Icon name="show-chart" size={20} color={colors.primary} />
              <Text style={styles.chartTitle}>Donation Trend</Text>
            </View>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>[Donation Chart]</Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Icon name="pie-chart" size={20} color={colors.secondary} />
              <Text style={styles.chartTitle}>Giving Categories</Text>
            </View>
            <View style={styles.categoryBreakdown}>
              {data?.categoryBreakdown?.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(category.amount)}
                    </Text>
                  </View>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryFill,
                        { width: `${category.percentage}%` }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {data?.recentActivity?.length > 0 ? (
            data.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon name="celebration" size={20} color={colors.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.description}</Text>
                  <Text style={styles.activityTime}>
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.activityAmount}>
                  {activity.amount ? formatCurrency(activity.amount) : ''}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights & Tips</Text>
          <View style={styles.insightsList}>
            {data?.insights?.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <Icon name="lightbulb" size={20} color={colors.warning} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TransactionHistory' as never)}
          >
            <Icon name="history" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>View Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PerformanceMetrics' as never)}
          >
            <Icon name="bar-chart" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Performance Metrics</Text>
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
  advancedButton: {
    padding: spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonSelected: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  periodButtonTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  metricCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    width: (screenWidth - spacing.md * 3) / 2,
    alignItems: 'center',
    ...shadows.card,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  metricChange: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
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
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  categoryBreakdown: {
    gap: spacing.md,
  },
  categoryItem: {
    marginBottom: spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.body,
    color: colors.text.primary,
  },
  categoryAmount: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  categoryBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
  },
  categoryFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activityAmount: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightsList: {
    gap: spacing.sm,
  },
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.card,
  },
  insightText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  actionsSection: {
    gap: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default AnalyticsDashboardScreen;