import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchCoinAnalytics,
  exportCoinData,
} from '../../store/slices/analyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';
import CoinFlowChart from '../../components/analytics/CoinFlowChart';

const { width: screenWidth } = Dimensions.get('window');

const CoinAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { coinAnalytics, loading } = useSelector((state: RootState) => state.analytics);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCoinAnalytics({ userId: user.id, period: selectedPeriod }));
    }
  }, [dispatch, user?.id, selectedPeriod]);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await dispatch(fetchCoinAnalytics({ userId: user.id, period: selectedPeriod }));
      setRefreshing(false);
    }
  };

  const handleExportData = async () => {
    if (!user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(exportCoinData({ userId: user.id, period: selectedPeriod })).unwrap();
      showToast('Data exported successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to export data', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!coinAnalytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading coin analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coin Analytics</Text>
        <TouchableOpacity
          onPress={handleExportData}
          style={styles.exportButton}
        >
          <Icon name="download" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['7d', '30d', '90d'] as const).map((period) => (
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
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <View style={styles.cardIcon}>
                <Icon name="account-balance-wallet" size={24} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardValue}>
                  {coinAnalytics.totalCoins.toLocaleString()}
                </Text>
                <Text style={styles.cardLabel}>Total Coins</Text>
              </View>
            </View>

            <View style={styles.overviewCard}>
              <View style={styles.cardIcon}>
                <Icon name="trending-up" size={24} color={colors.success} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardValue}>
                  +{coinAnalytics.coinsEarned.toLocaleString()}
                </Text>
                <Text style={styles.cardLabel}>Coins Earned</Text>
              </View>
            </View>

            <View style={styles.overviewCard}>
              <View style={styles.cardIcon}>
                <Icon name="trending-down" size={24} color={colors.error} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardValue}>
                  -{coinAnalytics.coinsSpent.toLocaleString()}
                </Text>
                <Text style={styles.cardLabel}>Coins Spent</Text>
              </View>
            </View>

            <View style={styles.overviewCard}>
              <View style={styles.cardIcon}>
                <Icon name="savings" size={24} color={colors.tertiary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardValue}>
                  ₦{coinAnalytics.coinValue.toLocaleString()}
                </Text>
                <Text style={styles.cardLabel}>Coin Value</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Coin Flow Chart */}
        <View style={styles.chartSection}>
          <CoinFlowChart
            data={[
              { date: '2024-01-01', earned: 150, spent: 50, net: 100 },
              { date: '2024-01-02', earned: 200, spent: 75, net: 125 },
              { date: '2024-01-03', earned: 100, spent: 100, net: 0 },
              { date: '2024-01-04', earned: 300, spent: 150, net: 150 },
              { date: '2024-01-05', earned: 250, spent: 200, net: 50 },
              { date: '2024-01-06', earned: 175, spent: 125, net: 50 },
              { date: '2024-01-07', earned: 225, spent: 175, net: 50 },
            ]}
            timeframe={selectedPeriod}
            onTimeframeChange={setSelectedPeriod}
          />
        </View>

        {/* Top Earning Sources */}
        <View style={styles.sourcesSection}>
          <Text style={styles.sectionTitle}>Top Earning Sources</Text>
          {coinAnalytics.topSources.map((source, index) => (
            <View key={index} style={styles.sourceItem}>
              <View style={styles.sourceRank}>
                <Text style={styles.sourceRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceName}>{source.name}</Text>
                <Text style={styles.sourceAmount}>
                  +{source.amount.toLocaleString()} coins
                </Text>
              </View>
              <View style={styles.sourcePercentage}>
                <Text style={styles.sourcePercentageText}>
                  {source.percentage}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Spending Breakdown */}
        <View style={styles.spendingSection}>
          <Text style={styles.sectionTitle}>Spending Breakdown</Text>
          {coinAnalytics.spendingBreakdown.map((category, index) => (
            <View key={index} style={styles.spendingItem}>
              <View style={styles.spendingIcon}>
                <Icon name={category.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.spendingInfo}>
                <Text style={styles.spendingCategory}>{category.name}</Text>
                <Text style={styles.spendingAmount}>
                  -{category.amount.toLocaleString()} coins
                </Text>
              </View>
              <View style={styles.spendingProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${category.percentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{category.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Coin Milestones */}
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>Coin Milestones</Text>
          {coinAnalytics.milestones.map((milestone, index) => (
            <View key={index} style={styles.milestoneItem}>
              <View style={[
                styles.milestoneStatus,
                milestone.achieved && styles.milestoneAchieved,
              ]}>
                <Icon
                  name={milestone.achieved ? "check-circle" : "radio-button-unchecked"}
                  size={20}
                  color={milestone.achieved ? colors.success : colors.gray[400]}
                />
              </View>
              <View style={styles.milestoneInfo}>
                <Text style={[
                  styles.milestoneTitle,
                  milestone.achieved && styles.milestoneTitleAchieved,
                ]}>
                  {milestone.title}
                </Text>
                <Text style={styles.milestoneDescription}>
                  {milestone.description}
                </Text>
              </View>
              <View style={styles.milestoneProgress}>
                <Text style={styles.milestoneProgressText}>
                  {milestone.current}/{milestone.target}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI Insights</Text>

          <View style={styles.insightCard}>
            <Icon name="lightbulb" size={24} color={colors.warning} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Spending Pattern</Text>
              <Text style={styles.insightText}>
                You spend most coins on marketplace items. Consider saving for premium subscriptions to maximize value.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Icon name="trending-up" size={24} color={colors.success} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Earning Trend</Text>
              <Text style={styles.insightText}>
                Your coin earnings have increased 45% this month. Keep up the great work with donations!
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Icon name="savings" size={24} color={colors.info} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Optimization Opportunity</Text>
              <Text style={styles.insightText}>
                You're 500 coins away from the next milestone. Complete 2 more donations to unlock bonus rewards.
              </Text>
            </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  exportButton: {
    padding: spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  periodButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  periodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  periodButtonTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  overviewSection: {
    marginBottom: spacing.lg,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  cardIcon: {
    marginBottom: spacing.sm,
  },
  cardInfo: {
    alignItems: 'center',
  },
  cardValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  cardLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  chartPlaceholderText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  sourcesSection: {
    marginBottom: spacing.lg,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  sourceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sourceRankText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  sourceAmount: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xxs,
  },
  sourcePercentage: {
    alignItems: 'flex-end',
  },
  sourcePercentageText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  spendingSection: {
    marginBottom: spacing.lg,
  },
  spendingItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  spendingIcon: {
    marginBottom: spacing.sm,
  },
  spendingInfo: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  spendingCategory: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  spendingAmount: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xxs,
  },
  spendingProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
    minWidth: 35,
    textAlign: 'right',
  },
  milestonesSection: {
    marginBottom: spacing.lg,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  milestoneStatus: {
    marginRight: spacing.md,
  },
  milestoneAchieved: {
    backgroundColor: colors.success + '20',
    borderRadius: 20,
    padding: spacing.xs,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  milestoneTitleAchieved: {
    color: colors.success,
  },
  milestoneDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  milestoneProgress: {
    alignItems: 'flex-end',
  },
  milestoneProgressText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  insightsSection: {
    marginBottom: spacing.lg,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  insightContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  insightTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  insightText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

export default CoinAnalyticsScreen;