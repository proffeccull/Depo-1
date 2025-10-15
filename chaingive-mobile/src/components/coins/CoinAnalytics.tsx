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
import { AppDispatch, RootState } from '../../store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: screenWidth } = Dimensions.get('window');

interface CoinAnalyticsProps {
  userId?: string;
  timeframe?: 'day' | 'week' | 'month' | 'year';
  showDetailedMetrics?: boolean;
  onMetricPress?: (metric: string) => void;
}

interface AnalyticsData {
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  netCoinFlow: number;
  averageDailyEarnings: number;
  topEarningSource: string;
  topSpendingCategory: string;
  coinRetentionRate: number;
  engagementScore: number;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    averageStreak: number;
  };
  milestoneData: {
    totalMilestones: number;
    recentMilestones: number;
    nextMilestone: string;
    progressToNext: number;
  };
  socialData: {
    friendsHelped: number;
    referralsMade: number;
    leaderboardRank: number;
    socialEngagement: number;
  };
  marketplaceData: {
    itemsPurchased: number;
    totalSpent: number;
    favoriteCategory: string;
    redemptionRate: number;
  };
  gamificationData: {
    achievementsUnlocked: number;
    battlePassProgress: number;
    challengesCompleted: number;
    badgesEarned: number;
  };
}

const CoinAnalytics: React.FC<CoinAnalyticsProps> = ({
  userId,
  timeframe = 'month',
  showDetailedMetrics = true,
  onMetricPress,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe, userId]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock analytics data - replace with actual API call
      const mockData: AnalyticsData = {
        totalCoinsEarned: 15420,
        totalCoinsSpent: 8750,
        netCoinFlow: 6670,
        averageDailyEarnings: 185,
        topEarningSource: 'Donations',
        topSpendingCategory: 'Airtime',
        coinRetentionRate: 87.5,
        engagementScore: 92,
        streakData: {
          currentStreak: 23,
          longestStreak: 47,
          averageStreak: 31,
        },
        milestoneData: {
          totalMilestones: 12,
          recentMilestones: 3,
          nextMilestone: 'Coin Master (20,000 coins)',
          progressToNext: 68,
        },
        socialData: {
          friendsHelped: 45,
          referralsMade: 8,
          leaderboardRank: 156,
          socialEngagement: 78,
        },
        marketplaceData: {
          itemsPurchased: 23,
          totalSpent: 3400,
          favoriteCategory: 'Data',
          redemptionRate: 94,
        },
        gamificationData: {
          achievementsUnlocked: 18,
          battlePassProgress: 75,
          challengesCompleted: 45,
          badgesEarned: 12,
        },
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (newTimeframe: typeof timeframe) => {
    Haptics.selectionAsync();
    setSelectedTimeframe(newTimeframe);
  };

  const handleMetricPress = (metric: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMetricPress?.(metric);
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
    subtitle?: string,
    trend?: 'up' | 'down' | 'stable',
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.metricCard}
      onPress={onPress}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.metricGradient}
      >
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: color + '30' }]}>
            <Icon name={icon} size={20} color={color} />
          </View>
          {trend && (
            <View style={styles.trendIndicator}>
              <Icon
                name={
                  trend === 'up' ? 'trending-up' :
                  trend === 'down' ? 'trending-down' : 'trending-flat'
                }
                size={16}
                color={
                  trend === 'up' ? colors.success :
                  trend === 'down' ? colors.error : colors.text.secondary
                }
              />
            </View>
          )}
        </View>

        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
        {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderProgressBar = (progress: number, label: string) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{progress}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%` },
            progress > 80 && styles.progressFillHigh,
            progress > 60 && progress <= 80 && styles.progressFillMedium,
          ]}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Failed to load analytics</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalyticsData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {[
          { key: 'day', label: 'Today' },
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
          { key: 'year', label: 'Year' },
        ].map((tf) => (
          <TouchableOpacity
            key={tf.key}
            style={[
              styles.timeframeButton,
              selectedTimeframe === tf.key && styles.timeframeButtonActive,
            ]}
            onPress={() => handleTimeframeChange(tf.key as typeof timeframe)}
          >
            <Text
              style={[
                styles.timeframeText,
                selectedTimeframe === tf.key && styles.timeframeTextActive,
              ]}
            >
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Cards */}
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Coins Earned',
            analyticsData.totalCoinsEarned.toLocaleString(),
            `Avg: ${analyticsData.averageDailyEarnings}/day`,
            'add-circle',
            colors.success,
            'up',
            () => handleMetricPress('coins-earned')
          )}

          {renderMetricCard(
            'Coins Spent',
            analyticsData.totalCoinsSpent.toLocaleString(),
            `Top: ${analyticsData.topSpendingCategory}`,
            'remove-circle',
            colors.error,
            'down',
            () => handleMetricPress('coins-spent')
          )}

          {renderMetricCard(
            'Net Flow',
            analyticsData.netCoinFlow.toLocaleString(),
            'Coins gained this period',
            'account-balance',
            colors.primary,
            analyticsData.netCoinFlow > 0 ? 'up' : 'down',
            () => handleMetricPress('net-flow')
          )}

          {renderMetricCard(
            'Engagement',
            `${analyticsData.engagementScore}%`,
            'Activity score',
            'trending-up',
            colors.tertiary,
            'up',
            () => handleMetricPress('engagement')
          )}
        </View>

        {/* Streak Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giving Streaks</Text>
          <View style={styles.streakGrid}>
            {renderMetricCard(
              'Current Streak',
              analyticsData.streakData.currentStreak,
              'days in a row',
              'local-fire-department',
              colors.warning,
              'up'
            )}
            {renderMetricCard(
              'Longest Streak',
              analyticsData.streakData.longestStreak,
              'personal best',
              'emoji-events',
              colors.tertiary,
              'stable'
            )}
            {renderMetricCard(
              'Average Streak',
              analyticsData.streakData.averageStreak,
              'days',
              'show-chart',
              colors.info,
              'up'
            )}
          </View>
        </View>

        {/* Milestone Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestone Progress</Text>
          <View style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneTitle}>Next: {analyticsData.milestoneData.nextMilestone}</Text>
              <Text style={styles.milestoneProgress}>
                {analyticsData.milestoneData.progressToNext}% complete
              </Text>
            </View>
            {renderProgressBar(analyticsData.milestoneData.progressToNext, 'Progress to next milestone')}
          </View>
        </View>

        {/* Social Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Impact</Text>
          <View style={styles.socialGrid}>
            {renderMetricCard(
              'Friends Helped',
              analyticsData.socialData.friendsHelped,
              'through referrals',
              'people',
              colors.primary,
              'up'
            )}
            {renderMetricCard(
              'Leaderboard Rank',
              `#${analyticsData.socialData.leaderboardRank}`,
              'current position',
              'leaderboard',
              colors.secondary,
              'up'
            )}
            {renderMetricCard(
              'Referrals Made',
              analyticsData.socialData.referralsMade,
              'successful invites',
              'person-add',
              colors.success,
              'up'
            )}
          </View>
        </View>

        {/* Marketplace Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketplace Activity</Text>
          <View style={styles.marketplaceGrid}>
            {renderMetricCard(
              'Items Purchased',
              analyticsData.marketplaceData.itemsPurchased,
              `Favorite: ${analyticsData.marketplaceData.favoriteCategory}`,
              'shopping-bag',
              colors.primary,
              'up'
            )}
            {renderMetricCard(
              'Coins Spent',
              analyticsData.marketplaceData.totalSpent.toLocaleString(),
              'on marketplace',
              'payments',
              colors.tertiary,
              'down'
            )}
            {renderMetricCard(
              'Redemption Rate',
              `${analyticsData.marketplaceData.redemptionRate}%`,
              'successful redemptions',
              'redeem',
              colors.success,
              'up'
            )}
          </View>
        </View>

        {/* Gamification Stats */}
        {showDetailedMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gamification Stats</Text>
            <View style={styles.gamificationGrid}>
              {renderMetricCard(
                'Achievements',
                analyticsData.gamificationData.achievementsUnlocked,
                'unlocked',
                'emoji-events',
                colors.tertiary,
                'up'
              )}
              {renderMetricCard(
                'Battle Pass',
                `${analyticsData.gamificationData.battlePassProgress}%`,
                'season progress',
                'military-tech',
                colors.secondary,
                'up'
              )}
              {renderMetricCard(
                'Challenges',
                analyticsData.gamificationData.challengesCompleted,
                'completed',
                'assignment-turned-in',
                colors.success,
                'up'
              )}
              {renderMetricCard(
                'Badges',
                analyticsData.gamificationData.badgesEarned,
                'earned',
                'badge',
                colors.warning,
                'up'
              )}
            </View>
          </View>
        )}

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights & Tips</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <Icon name="lightbulb" size={24} color={colors.primary} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Top Earning Source</Text>
                <Text style={styles.insightText}>
                  {analyticsData.topEarningSource} generates the most coins for you.
                  Consider focusing more on this activity!
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <Icon name="trending-up" size={24} color={colors.success} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Retention Rate</Text>
                <Text style={styles.insightText}>
                  Your coin retention rate is {analyticsData.coinRetentionRate}%.
                  You're doing great at holding onto your earnings!
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <Icon name="schedule" size={24} color={colors.warning} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Streak Maintenance</Text>
                <Text style={styles.insightText}>
                  Your current streak of {analyticsData.streakData.currentStreak} days
                  is building towards your personal best!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: colors.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: (screenWidth - layout.screenPadding * 2 - spacing.md) / 2,
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.card,
  },
  metricGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendIndicator: {
    marginLeft: spacing.sm,
  },
  metricValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  metricTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  metricSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  milestoneTitle: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  milestoneProgress: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  progressValue: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressFillMedium: {
    backgroundColor: colors.warning,
  },
  progressFillHigh: {
    backgroundColor: colors.success,
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marketplaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gamificationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightsContainer: {
    gap: spacing.md,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'flex-start',
    ...shadows.card,
  },
  insightContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  insightTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  insightText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryText: {
    ...typography.button,
    color: colors.white,
  },
});

export default CoinAnalytics;