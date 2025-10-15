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
import { fetchAdvancedAnalytics, exportAnalyticsReport } from '../../store/slices/analyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { AnimatedNumber } from '../../components/animated';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const AdvancedAnalyticsDashboard: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { advancedAnalytics, loading } = useSelector((state: RootState) => state.analytics);
  const { userSubscription } = useSelector((state: RootState) => state.subscription);

  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user?.id && userSubscription?.status === 'active') {
      dispatch(fetchAdvancedAnalytics({ userId: user.id, timeframe: selectedTimeframe }));
    }
  }, [dispatch, user?.id, selectedTimeframe, userSubscription?.status]);

  // Check if user has access to advanced analytics
  const hasAdvancedAccess = userSubscription?.status === 'active' &&
    (userSubscription.planName === 'Pro' || userSubscription.planName === 'Plus');

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

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!user?.id) return;

    setExporting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(exportAnalyticsReport({
        userId: user.id,
        format,
        timeframe: selectedTimeframe,
      })).unwrap();

      showToast(`${format.toUpperCase()} report exported successfully!`, 'success');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to export report', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (!hasAdvancedAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.upgradeContainer}>
          <Icon name="analytics" size={64} color={colors.primary} />
          <Text style={styles.upgradeTitle}>Advanced Analytics</Text>
          <Text style={styles.upgradeSubtitle}>
            Unlock predictive insights, ROI analysis, and personalized recommendations
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('SubscriptionPlans' as never)}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const insights = advancedAnalytics?.predictiveInsights;
  const roi = advancedAnalytics?.roiAnalysis;
  const trends = advancedAnalytics?.trendAnalysis;

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
          <Text style={styles.headerTitle}>Advanced Analytics</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('pdf')}
              disabled={exporting}
            >
              <Icon name="picture-as-pdf" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('csv')}
              disabled={exporting}
            >
              <Icon name="table-chart" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeframeSelector}>
          {(['month', 'quarter', 'year'] as const).map((timeframe) => (
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

        {/* Predictive Insights */}
        {insights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Predictive Insights</Text>

            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Icon name="lightbulb" size={24} color={colors.primary} />
                <Text style={styles.insightTitle}>Optimal Donation Times</Text>
              </View>
              <View style={styles.insightContent}>
                {insights.optimalDonationTimes.map((time, index) => (
                  <View key={index} style={styles.timeSlot}>
                    <Text style={styles.timeSlotText}>{time}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Icon name="trending-up" size={24} color={colors.success} />
                <Text style={styles.insightTitle}>Expected Monthly Earnings</Text>
              </View>
              <AnimatedNumber
                value={insights.expectedEarnings}
                style={styles.expectedEarnings}
                formatter={formatNumber}
              />
              <Text style={styles.earningsLabel}>coins</Text>
            </View>

            {insights.riskFactors.length > 0 && (
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Icon name="warning" size={24} color={colors.warning} />
                  <Text style={styles.insightTitle}>Risk Factors</Text>
                </View>
                <View style={styles.riskFactors}>
                  {insights.riskFactors.map((factor, index) => (
                    <Text key={index} style={styles.riskFactor}>• {factor}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ROI Analysis */}
        {roi && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ROI Analysis</Text>

            <View style={styles.roiGrid}>
              <View style={styles.roiCard}>
                <Text style={styles.roiLabel}>Total Invested</Text>
                <AnimatedNumber
                  value={roi.totalInvested}
                  style={styles.roiValue}
                  formatter={formatCurrency}
                />
              </View>

              <View style={styles.roiCard}>
                <Text style={styles.roiLabel}>Total Impact</Text>
                <AnimatedNumber
                  value={roi.totalImpact}
                  style={styles.roiValue}
                  formatter={formatCurrency}
                />
              </View>

              <View style={styles.roiCard}>
                <Text style={styles.roiLabel}>ROI Percentage</Text>
                <AnimatedNumber
                  value={roi.roiPercentage}
                  style={styles.roiValue}
                  formatter={formatPercentage}
                />
              </View>

              <View style={styles.roiCard}>
                <Text style={styles.roiLabel}>Projected Value</Text>
                <AnimatedNumber
                  value={roi.projectedValue}
                  style={styles.roiValue}
                  formatter={formatCurrency}
                />
              </View>
            </View>
          </View>
        )}

        {/* Trend Analysis */}
        {trends && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trend Analysis</Text>

            <View style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Icon name="show-chart" size={24} color={colors.secondary} />
                <Text style={styles.trendTitle}>Monthly Growth</Text>
              </View>
              <AnimatedNumber
                value={trends.monthlyGrowth}
                style={styles.trendValue}
                formatter={formatPercentage}
              />
            </View>

            <View style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Icon name="people" size={24} color={colors.primary} />
                <Text style={styles.trendTitle}>Peer Comparison</Text>
              </View>
              <Text style={styles.peerRank}>
                Top {trends.peerComparison.percentile}% of users
              </Text>
              <Text style={styles.peerDescription}>
                {trends.peerComparison.topPerformers} users performing better
              </Text>
            </View>
          </View>
        )}

        {/* Personalized Recommendations */}
        {advancedAnalytics?.personalizedRecommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>

            <View style={styles.recommendationsList}>
              {advancedAnalytics.personalizedRecommendations.suggestedActions.map((action, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <Icon name="thumb-up" size={20} color={colors.success} />
                  <Text style={styles.recommendationText}>{action}</Text>
                </View>
              ))}

              {advancedAnalytics.personalizedRecommendations.optimizationTips.map((tip, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <Icon name="lightbulb" size={20} color={colors.warning} />
                  <Text style={styles.recommendationText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Export Section */}
        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>Export Your Data</Text>
          <Text style={styles.exportSubtitle}>
            Download detailed reports for tax purposes or personal records (100 coins per export)
          </Text>

          <View style={styles.exportButtons}>
            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExport('pdf')}
              disabled={exporting}
            >
              <Icon name="picture-as-pdf" size={24} color={colors.primary} />
              <Text style={styles.exportOptionText}>PDF Report</Text>
              <Text style={styles.exportCost}>100 coins</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExport('csv')}
              disabled={exporting}
            >
              <Icon name="table-chart" size={24} color={colors.primary} />
              <Text style={styles.exportOptionText}>CSV Data</Text>
              <Text style={styles.exportCost}>100 coins</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  upgradeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  upgradeTitle: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  upgradeSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: 12,
  },
  upgradeButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exportButton: {
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 8,
    ...shadows.small,
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
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  insightTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  insightContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  timeSlotText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  expectedEarnings: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  earningsLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  riskFactors: {
    gap: spacing.xs,
  },
  riskFactor: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  roiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  roiCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    width: (screenWidth - spacing.md * 3) / 2,
    ...shadows.card,
  },
  roiLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  roiValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  trendCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  trendTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  trendValue: {
    ...typography.h2,
    color: colors.success,
    fontWeight: 'bold',
  },
  peerRank: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  peerDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  recommendationsList: {
    gap: spacing.sm,
  },
  recommendationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.card,
  },
  recommendationText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  exportSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing['2xl'],
    ...shadows.card,
  },
  exportTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  exportSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  exportButtons: {
    gap: spacing.md,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  exportOptionText: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  exportCost: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
});

export default AdvancedAnalyticsDashboard;