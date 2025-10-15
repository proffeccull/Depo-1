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
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchGivingPredictions,
  fetchTrendAnalysis,
} from '../../store/slices/predictiveAnalyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const GivingPredictionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    givingPredictions,
    trendAnalysis,
    loading,
    insightsEnabled
  } = useSelector((state: RootState) => state.predictiveAnalytics);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user?.id && insightsEnabled) {
      dispatch(fetchGivingPredictions(user.id));
      dispatch(fetchTrendAnalysis({ userId: user.id, period: selectedPeriod }));
    }
  }, [dispatch, user?.id, selectedPeriod, insightsEnabled]);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await Promise.all([
        dispatch(fetchGivingPredictions(user.id)),
        dispatch(fetchTrendAnalysis({ userId: user.id, period: selectedPeriod })),
      ]);
      setRefreshing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'trending-up';
      case 'decreasing': return 'trending-down';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return colors.success;
      case 'decreasing': return colors.error;
      default: return colors.warning;
    }
  };

  const renderPredictionFactors = () => {
    if (!givingPredictions?.factors) return null;

    return (
      <View style={styles.factorsSection}>
        <Text style={styles.sectionTitle}>Prediction Factors</Text>
        {givingPredictions.factors.map((factor, index) => (
          <View key={index} style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorName}>{factor.factor}</Text>
              <View style={styles.factorImpact}>
                <Text style={[
                  styles.factorImpactText,
                  {
                    color: factor.impact > 0 ? colors.success : colors.error
                  }
                ]}>
                  {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(1)}%
                </Text>
                <Text style={styles.factorWeight}>
                  Weight: {(factor.weight * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            <Text style={styles.factorDescription}>{factor.description}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTrendAnalysis = () => {
    if (!trendAnalysis || trendAnalysis.length === 0) return null;

    return (
      <View style={styles.trendsSection}>
        <Text style={styles.sectionTitle}>Giving Trends</Text>
        {trendAnalysis.map((trend, index) => (
          <View key={index} style={styles.trendItem}>
            <View style={styles.trendHeader}>
              <View style={styles.trendIcon}>
                <Icon
                  name={getTrendIcon(trend.trend)}
                  size={24}
                  color={getTrendColor(trend.trend)}
                />
              </View>
              <View style={styles.trendInfo}>
                <Text style={styles.trendCategory}>
                  {trend.category.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.trendPeriod}>
                  Last {trend.period}
                </Text>
              </View>
              <View style={styles.trendChange}>
                <Text style={[
                  styles.trendChangeText,
                  { color: getTrendColor(trend.trend) }
                ]}>
                  {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
            <Text style={styles.trendPrediction}>{trend.prediction}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (!insightsEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Icon name="timeline" size={64} color={colors.gray[300]} />
          <Text style={styles.disabledTitle}>Giving Predictions</Text>
          <Text style={styles.disabledMessage}>
            Predictive analytics features are currently disabled.
            Enable them to see personalized giving predictions.
          </Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giving Predictions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PredictiveInsights' as never)}
            style={styles.insightsButton}
          >
            <Icon name="lightbulb" size={24} color={colors.primary} />
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

        {/* Main Prediction */}
        {givingPredictions && (
          <View style={styles.predictionSection}>
            <Text style={styles.sectionTitle}>Your Next Donation Prediction</Text>

            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.predictionCard}
            >
              <View style={styles.predictionHeader}>
                <Icon name="psychology" size={32} color={colors.white} />
                <View style={styles.predictionMeta}>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                  <Text style={styles.confidenceValue}>
                    {Math.round(givingPredictions.confidence * 100)}%
                  </Text>
                </View>
              </View>

              <View style={styles.predictionAmount}>
                <Text style={styles.predictionLabel}>Predicted Amount</Text>
                <Text style={styles.predictionValue}>
                  ₦{givingPredictions.predictedAmount.toLocaleString()}
                </Text>
                <Text style={styles.predictionTimeframe}>
                  Within {givingPredictions.timeFrame}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.predictionAction}
                onPress={() => navigation.navigate('DonationScreen' as never)}
              >
                <Text style={styles.predictionActionText}>Make a Donation</Text>
                <Icon name="arrow-forward" size={20} color={colors.white} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Prediction Factors */}
        {renderPredictionFactors()}

        {/* Trend Analysis */}
        {renderTrendAnalysis()}

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI Insights</Text>

          <View style={styles.insightCard}>
            <Icon name="info" size={24} color={colors.info} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Personalized Predictions</Text>
              <Text style={styles.insightText}>
                Our AI analyzes your giving patterns, social connections, and market trends
                to provide accurate predictions about your future donation behavior.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Icon name="trending-up" size={24} color={colors.success} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Continuous Learning</Text>
              <Text style={styles.insightText}>
                Predictions improve over time as the AI learns from your actual giving behavior
                and adjusts its algorithms accordingly.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Icon name="security" size={24} color={colors.warning} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Privacy First</Text>
              <Text style={styles.insightText}>
                All predictions are generated locally on your device using anonymized patterns.
                Your personal data never leaves your device.
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Icon name="warning" size={20} color={colors.warning} />
          <Text style={styles.disclaimerText}>
            These predictions are for informational purposes only and should not be considered
            financial or investment advice. Actual results may vary based on personal circumstances.
          </Text>
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
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  disabledTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  disabledMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
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
  insightsButton: {
    padding: spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
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
  predictionSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  predictionCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  predictionMeta: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    ...typography.caption,
    color: colors.white + 'CC',
  },
  confidenceValue: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  predictionAmount: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  predictionLabel: {
    ...typography.body,
    color: colors.white + 'CC',
    marginBottom: spacing.xs,
  },
  predictionValue: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  predictionTimeframe: {
    ...typography.caption,
    color: colors.white + 'AA',
  },
  predictionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.white + '20',
    borderRadius: 12,
    gap: spacing.sm,
  },
  predictionActionText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  factorsSection: {
    marginBottom: spacing.lg,
  },
  factorItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  factorName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    flex: 1,
  },
  factorImpact: {
    alignItems: 'flex-end',
  },
  factorImpactText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  factorWeight: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  factorDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  trendsSection: {
    marginBottom: spacing.lg,
  },
  trendItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trendIcon: {
    marginRight: spacing.md,
  },
  trendInfo: {
    flex: 1,
  },
  trendCategory: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  trendPeriod: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  trendChange: {
    alignItems: 'flex-end',
  },
  trendChangeText: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  trendPrediction: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
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
  disclaimerSection: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '10',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.warning,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 16,
  },
});

export default GivingPredictionsScreen;