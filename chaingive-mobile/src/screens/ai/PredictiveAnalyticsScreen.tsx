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
import { fetchPredictiveAnalytics } from '../../store/slices/aiSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

const PredictiveAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { predictiveAnalytics, loading } = useSelector((state: RootState) => state.ai);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPredictiveAnalytics({ userId: user.id, timeframe: selectedTimeframe }));
    }
  }, [dispatch, user?.id, selectedTimeframe]);

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
          <Text style={styles.loadingText}>Analyzing future trends...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const data = predictiveAnalytics;

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
          <Text style={styles.headerTitle}>Predictive Analytics</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('AISettings' as never)}
          >
            <Icon name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Timeframe Selector */}
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

        {/* Future Projections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Future Projections</Text>

          <View style={styles.projectionGrid}>
            <View style={styles.projectionCard}>
              <LinearGradient
                colors={[colors.primary, colors.primary + '80']}
                style={styles.projectionGradient}
              >
                <Icon name="trending-up" size={24} color={colors.white} />
                <Text style={styles.projectionLabel}>Projected Donations</Text>
                <AnimatedNumber
                  value={data?.projectedDonations || 0}
                  style={styles.projectionValue}
                  formatter={formatCurrency}
                />
                <Text style={styles.projectionSubtext}>
                  Next {selectedTimeframe}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.projectionCard}>
              <LinearGradient
                colors={[colors.secondary, colors.secondary + '80']}
                style={styles.projectionGradient}
              >
                <Icon name="emoji-events" size={24} color={colors.white} />
                <Text style={styles.projectionLabel}>Predicted Achievements</Text>
                <AnimatedNumber
                  value={data?.predictedAchievements || 0}
                  style={styles.projectionValue}
                  formatter={formatNumber}
                />
                <Text style={styles.projectionSubtext}>
                  New unlocks
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.projectionCard}>
              <LinearGradient
                colors={[colors.tertiary, colors.tertiary + '80']}
                style={styles.projectionGradient}
              >
                <Icon name="people" size={24} color={colors.white} />
                <Text style={styles.projectionLabel}>Impact Growth</Text>
                <AnimatedNumber
                  value={data?.impactGrowth || 0}
                  style={styles.projectionValue}
                  formatter={(val) => `${val}%`}
                />
                <Text style={styles.projectionSubtext}>
                  Expected increase
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.projectionCard}>
              <LinearGradient
                colors={[colors.success, colors.success + '80']}
                style={styles.projectionGradient}
              >
                <Icon name="account-balance" size={24} color={colors.white} />
                <Text style={styles.projectionLabel}>Portfolio Value</Text>
                <AnimatedNumber
                  value={data?.portfolioValue || 0}
                  style={styles.projectionValue}
                  formatter={formatCurrency}
                />
                <Text style={styles.projectionSubtext}>
                  Projected value
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Trend Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trend Analysis</Text>

          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Icon name="show-chart" size={20} color={colors.primary} />
              <Text style={styles.trendTitle}>Giving Patterns</Text>
            </View>
            <Text style={styles.trendDescription}>
              Based on your historical data, our AI predicts continued growth in your charitable activities.
            </Text>

            <View style={styles.trendMetrics}>
              <View style={styles.trendMetric}>
                <Text style={styles.trendMetricLabel}>Growth Rate</Text>
                <Text style={styles.trendMetricValue}>
                  {formatPercentage(data?.growthRate || 0)}
                </Text>
              </View>
              <View style={styles.trendMetric}>
                <Text style={styles.trendMetricLabel}>Confidence</Text>
                <Text style={styles.trendMetricValue}>
                  {data?.confidence || 0}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>

          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <Icon name="warning" size={20} color={colors.warning} />
              <Text style={styles.riskTitle}>Potential Challenges</Text>
            </View>

            <View style={styles.riskFactors}>
              {data?.riskFactors?.map((risk, index) => (
                <View key={index} style={styles.riskItem}>
                  <View style={styles.riskIndicator}>
                    <Text style={styles.riskLevel}>{risk.level}</Text>
                  </View>
                  <View style={styles.riskContent}>
                    <Text style={styles.riskTitle}>{risk.title}</Text>
                    <Text style={styles.riskDescription}>{risk.description}</Text>
                  </View>
                  <Text style={styles.riskProbability}>{risk.probability}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Opportunities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth Opportunities</Text>

          <View style={styles.opportunitiesList}>
            {data?.opportunities?.map((opportunity, index) => (
              <View key={index} style={styles.opportunityCard}>
                <View style={styles.opportunityHeader}>
                  <Icon name="lightbulb" size={20} color={colors.warning} />
                  <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                </View>
                <Text style={styles.opportunityDescription}>
                  {opportunity.description}
                </Text>
                <View style={styles.opportunityMetrics}>
                  <Text style={styles.opportunityPotential}>
                    Potential: {opportunity.potential}
                  </Text>
                  <Text style={styles.opportunityTimeline}>
                    Timeline: {opportunity.timeline}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>

          <View style={styles.recommendationsList}>
            {data?.recommendations?.map((recommendation, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recommendationCard}
                onPress={() => {
                  // Handle recommendation action
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.recommendationHeader}>
                  <Icon name="thumb-up" size={20} color={colors.success} />
                  <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                </View>
                <Text style={styles.recommendationDescription}>
                  {recommendation.description}
                </Text>
                <View style={styles.recommendationFooter}>
                  <Text style={styles.recommendationImpact}>
                    Expected Impact: {recommendation.expectedImpact}
                  </Text>
                  <TouchableOpacity style={styles.recommendationAction}>
                    <Text style={styles.recommendationActionText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Model Accuracy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Model Accuracy</Text>

          <View style={styles.accuracyCard}>
            <View style={styles.accuracyHeader}>
              <Icon name="verified" size={20} color={colors.success} />
              <Text style={styles.accuracyTitle}>Prediction Confidence</Text>
            </View>

            <View style={styles.accuracyMetrics}>
              <View style={styles.accuracyMetric}>
                <Text style={styles.accuracyLabel}>Overall Accuracy</Text>
                <Text style={styles.accuracyValue}>
                  {data?.accuracy?.overall || 0}%
                </Text>
              </View>
              <View style={styles.accuracyMetric}>
                <Text style={styles.accuracyLabel}>Donation Predictions</Text>
                <Text style={styles.accuracyValue}>
                  {data?.accuracy?.donations || 0}%
                </Text>
              </View>
              <View style={styles.accuracyMetric}>
                <Text style={styles.accuracyLabel}>Trend Analysis</Text>
                <Text style={styles.accuracyValue}>
                  {data?.accuracy?.trends || 0}%
                </Text>
              </View>
            </View>

            <Text style={styles.accuracyNote}>
              * Accuracy based on historical data and current market conditions
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
  settingsButton: {
    padding: spacing.xs,
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
  projectionGrid: {
    gap: spacing.md,
  },
  projectionCard: {
    borderRadius: 12,
    ...shadows.card,
  },
  projectionGradient: {
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  projectionLabel: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  projectionValue: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  projectionSubtext: {
    ...typography.caption,
    color: colors.white + 'CC',
    marginTop: spacing.xs,
  },
  trendCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trendTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  trendDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  trendMetrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  trendMetric: {
    flex: 1,
    alignItems: 'center',
  },
  trendMetricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  trendMetricValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  riskCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  riskTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  riskFactors: {
    gap: spacing.md,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  riskIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  riskLevel: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: 'bold',
  },
  riskContent: {
    flex: 1,
  },
  riskItemTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  riskDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  riskProbability: {
    ...typography.caption,
    color: colors.error,
    fontWeight: 'bold',
  },
  opportunitiesList: {
    gap: spacing.sm,
  },
  opportunityCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  opportunityTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  opportunityDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  opportunityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  opportunityPotential: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  opportunityTimeline: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  recommendationsList: {
    gap: spacing.sm,
  },
  recommendationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recommendationTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  recommendationDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationImpact: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  recommendationAction: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  recommendationActionText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  accuracyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  accuracyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  accuracyMetrics: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  accuracyMetric: {
    flex: 1,
    alignItems: 'center',
  },
  accuracyLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  accuracyValue: {
    ...typography.h4,
    color: colors.success,
    fontWeight: 'bold',
  },
  accuracyNote: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default PredictiveAnalyticsScreen;