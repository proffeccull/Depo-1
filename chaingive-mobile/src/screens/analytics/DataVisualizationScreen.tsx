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
import { fetchDataVisualization } from '../../store/slices/analyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: screenWidth } = Dimensions.get('window');

const DataVisualizationScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { dataVisualization, loading } = useSelector((state: RootState) => state.analytics);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedChart, setSelectedChart] = useState<string>('donation-trends');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDataVisualization({ userId: user.id, period: selectedPeriod }));
    }
  }, [dispatch, user?.id, selectedPeriod]);

  const chartOptions = [
    { key: 'donation-trends', label: 'Donation Trends', icon: 'trending-up' },
    { key: 'category-breakdown', label: 'Category Breakdown', icon: 'pie-chart' },
    { key: 'impact-over-time', label: 'Impact Over Time', icon: 'timeline' },
    { key: 'geographic-distribution', label: 'Geographic Distribution', icon: 'location-on' },
    { key: 'engagement-metrics', label: 'Engagement Metrics', icon: 'people' },
    { key: 'roi-analysis', label: 'ROI Analysis', icon: 'account-balance' },
  ];

  const renderChartPlaceholder = (chartType: string) => (
    <View style={styles.chartPlaceholder}>
      <Icon name="bar-chart" size={48} color={colors.gray[400]} />
      <Text style={styles.chartPlaceholderText}>
        {chartType} Chart
      </Text>
      <Text style={styles.chartPlaceholderSubtext}>
        Interactive visualization will be displayed here
      </Text>
    </View>
  );

  const renderChartContent = () => {
    switch (selectedChart) {
      case 'donation-trends':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Donation Trends</Text>
            <Text style={styles.chartDescription}>
              Track your giving patterns over time to identify trends and optimize your impact.
            </Text>
            {renderChartPlaceholder('Line')}
          </View>
        );

      case 'category-breakdown':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Giving Categories</Text>
            <Text style={styles.chartDescription}>
              See how your donations are distributed across different causes and categories.
            </Text>
            {renderChartPlaceholder('Pie')}

            {/* Category Legend */}
            <View style={styles.categoryLegend}>
              {dataVisualization?.categoryBreakdown?.map((category, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: category.color }]} />
                  <Text style={styles.legendText}>{category.name}</Text>
                  <Text style={styles.legendValue}>{category.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'impact-over-time':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Impact Over Time</Text>
            <Text style={styles.chartDescription}>
              Visualize the cumulative impact of your giving journey.
            </Text>
            {renderChartPlaceholder('Area')}
          </View>
        );

      case 'geographic-distribution':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Geographic Distribution</Text>
            <Text style={styles.chartDescription}>
              See where your donations are making an impact around the world.
            </Text>
            {renderChartPlaceholder('Map')}

            {/* Top Locations */}
            <View style={styles.locationList}>
              {dataVisualization?.topLocations?.map((location, index) => (
                <View key={index} style={styles.locationItem}>
                  <Text style={styles.locationRank}>#{index + 1}</Text>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationImpact}>{location.impact} people helped</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'engagement-metrics':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Engagement Metrics</Text>
            <Text style={styles.chartDescription}>
              Track your social engagement and community participation.
            </Text>
            {renderChartPlaceholder('Bar')}

            {/* Engagement Stats */}
            <View style={styles.engagementStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Social Interactions</Text>
                <Text style={styles.statValue}>
                  {dataVisualization?.engagementStats?.interactions || 0}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Challenges Joined</Text>
                <Text style={styles.statValue}>
                  {dataVisualization?.engagementStats?.challengesJoined || 0}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Forum Posts</Text>
                <Text style={styles.statValue}>
                  {dataVisualization?.engagementStats?.forumPosts || 0}
                </Text>
              </View>
            </View>
          </View>
        );

      case 'roi-analysis':
        return (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Return on Impact (ROI)</Text>
            <Text style={styles.chartDescription}>
              Measure the social and environmental return on your charitable investments.
            </Text>
            {renderChartPlaceholder('Scatter')}

            {/* ROI Metrics */}
            <View style={styles.roiMetrics}>
              <View style={styles.roiCard}>
                <Text style={styles.roiLabel}>Social ROI</Text>
                <Text style={styles.roiValue}>
                  {dataVisualization?.roiMetrics?.socialROI || 0}%
                </Text>
              </View>
              <View style={styles.roiCard}>
                <Text style={styles.roiLabel}>Environmental ROI</Text>
                <Text style={styles.roiValue}>
                  {dataVisualization?.roiMetrics?.environmentalROI || 0}%
                </Text>
              </View>
              <View style={styles.roiCard}>
                <Text style={styles.roiLabel}>Economic ROI</Text>
                <Text style={styles.roiValue}>
                  {dataVisualization?.roiMetrics?.economicROI || 0}%
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading visualizations...</Text>
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
          <Text style={styles.headerTitle}>Data Visualization</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => {
              // Export functionality
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Icon name="download" size={24} color={colors.primary} />
          </TouchableOpacity>
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

        {/* Chart Type Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartSelector}
          contentContainerStyle={styles.chartSelectorContent}
        >
          {chartOptions.map((chart) => (
            <TouchableOpacity
              key={chart.key}
              style={[
                styles.chartOption,
                selectedChart === chart.key && styles.chartOptionSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedChart(chart.key);
              }}
            >
              <Icon
                name={chart.icon}
                size={20}
                color={selectedChart === chart.key ? colors.white : colors.text.secondary}
              />
              <Text style={[
                styles.chartOptionText,
                selectedChart === chart.key && styles.chartOptionTextSelected,
              ]}>
                {chart.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart Content */}
        <View style={styles.chartContainer}>
          {renderChartContent()}
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={styles.insightsList}>
            {dataVisualization?.insights?.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <Icon name="lightbulb" size={20} color={colors.warning} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.exportSection}>
          <Text style={styles.sectionTitle}>Export Options</Text>
          <View style={styles.exportOptions}>
            <TouchableOpacity style={styles.exportOption}>
              <Icon name="image" size={24} color={colors.primary} />
              <Text style={styles.exportOptionText}>Export as Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportOption}>
              <Icon name="table-chart" size={24} color={colors.primary} />
              <Text style={styles.exportOptionText}>Export Data (CSV)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportOption}>
              <Icon name="picture-as-pdf" size={24} color={colors.primary} />
              <Text style={styles.exportOptionText}>Generate Report (PDF)</Text>
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
  exportButton: {
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
  chartSelector: {
    marginBottom: spacing.lg,
  },
  chartSelectorContent: {
    paddingHorizontal: spacing.md,
  },
  chartOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginRight: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
  chartOptionSelected: {
    backgroundColor: colors.primary,
  },
  chartOptionText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  chartOptionTextSelected: {
    color: colors.white,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    ...shadows.card,
  },
  chartSection: {
    alignItems: 'center',
  },
  chartTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  chartDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  chartPlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  chartPlaceholderText: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  chartPlaceholderSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  categoryLegend: {
    width: '100%',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  legendValue: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  locationList: {
    width: '100%',
    gap: spacing.sm,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  locationRank: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
    width: 30,
  },
  locationName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  locationImpact: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  engagementStats: {
    width: '100%',
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  statLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  roiMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  roiCard: {
    flex: 1,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  roiLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  roiValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  insightsSection: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
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
  exportSection: {
    marginBottom: spacing['2xl'],
  },
  exportOptions: {
    gap: spacing.md,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
    ...shadows.card,
  },
  exportOptionText: {
    ...typography.bodyBold,
    color: colors.text.primary,
    flex: 1,
  },
});

export default DataVisualizationScreen;