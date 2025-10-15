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
import { fetchPerformanceMetrics } from '../../store/slices/analyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

const PerformanceMetricsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { performanceMetrics, loading } = useSelector((state: RootState) => state.analytics);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPerformanceMetrics({ userId: user.id, period: selectedPeriod }));
    }
  }, [dispatch, user?.id, selectedPeriod]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading performance metrics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const data = performanceMetrics;

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
          <Text style={styles.headerTitle}>Performance Metrics</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['month', 'quarter', 'year'] as const).map((period) => (
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

        {/* Key Performance Indicators */}
        <View style={styles.kpiSection}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Icon name="trending-up" size={24} color={colors.success} />
              <Text style={styles.kpiLabel}>Efficiency Score</Text>
              <AnimatedNumber
                value={data?.efficiencyScore || 0}
                style={styles.kpiValue}
                formatter={formatNumber}
              />
              <Text style={styles.kpiChange}>
                {formatPercentage(data?.efficiencyChange || 0)} vs last {selectedPeriod}
              </Text>
            </View>

            <View style={styles.kpiCard}>
              <Icon name="target" size={24} color={colors.primary} />
              <Text style={styles.kpiLabel}>Goal Achievement</Text>
              <AnimatedNumber
                value={data?.goalAchievement || 0}
                style={styles.kpiValue}
                formatter={(val) => `${val}%`}
              />
              <Text style={styles.kpiChange}>
                {data?.goalsCompleted || 0} goals completed
              </Text>
            </View>

            <View style={styles.kpiCard}>
              <Icon name="schedule" size={24} color={colors.warning} />
              <Text style={styles.kpiLabel}>Response Time</Text>
              <AnimatedNumber
                value={data?.averageResponseTime || 0}
                style={styles.kpiValue}
                formatter={(val) => `${val}h`}
              />
              <Text style={styles.kpiChange}>
                {formatPercentage(data?.responseTimeChange || 0)} improvement
              </Text>
            </View>

            <View style={styles.kpiCard}>
              <Icon name="group" size={24} color={colors.secondary} />
              <Text style={styles.kpiLabel}>Engagement Rate</Text>
              <AnimatedNumber
                value={data?.engagementRate || 0}
                style={styles.kpiValue}
                formatter={(val) => `${val}%`}
              />
              <Text style={styles.kpiChange}>
                {formatPercentage(data?.engagementChange || 0)} vs last {selectedPeriod}
              </Text>
            </View>
          </View>
        </View>

        {/* Impact Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Metrics</Text>

          <View style={styles.impactGrid}>
            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Icon name="people" size={20} color={colors.primary} />
                <Text style={styles.impactTitle}>People Helped</Text>
              </View>
              <AnimatedNumber
                value={data?.peopleHelped || 0}
                style={styles.impactValue}
                formatter={formatNumber}
              />
            </View>

            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Icon name="location-on" size={20} color={colors.secondary} />
                <Text style={styles.impactTitle}>Communities Reached</Text>
              </View>
              <AnimatedNumber
                value={data?.communitiesReached || 0}
                style={styles.impactValue}
                formatter={formatNumber}
              />
            </View>

            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Icon name="attach-money" size={20} color={colors.success} />
                <Text style={styles.impactTitle}>Funds Distributed</Text>
              </View>
              <AnimatedNumber
                value={data?.fundsDistributed || 0}
                style={styles.impactValue}
                formatter={formatCurrency}
              />
            </View>

            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Icon name="eco" size={20} color={colors.tertiary} />
                <Text style={styles.impactTitle}>Sustainability Score</Text>
              </View>
              <AnimatedNumber
                value={data?.sustainabilityScore || 0}
                style={styles.impactValue}
                formatter={formatNumber}
              />
            </View>
          </View>
        </View>

        {/* Benchmarking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benchmarking</Text>

          <View style={styles.benchmarkCard}>
            <Text style={styles.benchmarkTitle}>Your Performance vs Peers</Text>

            <View style={styles.benchmarkGrid}>
              <View style={styles.benchmarkItem}>
                <Text style={styles.benchmarkLabel}>Donation Frequency</Text>
                <View style={styles.benchmarkComparison}>
                  <Text style={styles.benchmarkValue}>
                    Top {data?.donationPercentile || 0}%
                  </Text>
                  <View style={styles.benchmarkBar}>
                    <View
                      style={[
                        styles.benchmarkFill,
                        { width: `${data?.donationPercentile || 0}%` }
                      ]}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.benchmarkItem}>
                <Text style={styles.benchmarkLabel}>Impact per Dollar</Text>
                <View style={styles.benchmarkComparison}>
                  <Text style={styles.benchmarkValue}>
                    Top {data?.impactPercentile || 0}%
                  </Text>
                  <View style={styles.benchmarkBar}>
                    <View
                      style={[
                        styles.benchmarkFill,
                        { width: `${data?.impactPercentile || 0}%` }
                      ]}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.benchmarkItem}>
                <Text style={styles.benchmarkLabel}>Community Engagement</Text>
                <View style={styles.benchmarkComparison}>
                  <Text style={styles.benchmarkValue}>
                    Top {data?.engagementPercentile || 0}%
                  </Text>
                  <View style={styles.benchmarkBar}>
                    <View
                      style={[
                        styles.benchmarkFill,
                        { width: `${data?.engagementPercentile || 0}%` }
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Recommendations</Text>

          <View style={styles.recommendationsList}>
            {data?.recommendations?.map((recommendation, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Icon name="lightbulb" size={20} color={colors.warning} />
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                  <Text style={styles.recommendationDescription}>
                    {recommendation.description}
                  </Text>
                  <Text style={styles.recommendationImpact}>
                    Potential Impact: {recommendation.potentialImpact}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('DataVisualization' as never)}
          >
            <Icon name="bar-chart" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>View Charts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PredictiveAnalytics' as never)}
          >
            <Icon name="timeline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Future Insights</Text>
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
  headerRight: {
    width: 40, // Balance header
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
  kpiSection: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  kpiCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    width: (screenWidth - spacing.md * 3) / 2,
    alignItems: 'center',
    ...shadows.card,
  },
  kpiLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  kpiValue: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  kpiChange: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  impactCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    width: (screenWidth - spacing.md * 3) / 2,
    ...shadows.card,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  impactTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  impactValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  benchmarkCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  benchmarkTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  benchmarkGrid: {
    gap: spacing.lg,
  },
  benchmarkItem: {
    marginBottom: spacing.md,
  },
  benchmarkLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  benchmarkComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benchmarkValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
    minWidth: 60,
  },
  benchmarkBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
  },
  benchmarkFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
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
  recommendationContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  recommendationTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recommendationDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  recommendationImpact: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
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

export default PerformanceMetricsScreen;