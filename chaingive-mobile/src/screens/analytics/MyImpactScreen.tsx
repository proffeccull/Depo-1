import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import {
  getUserImpactAnalytics,
  UserImpactAnalytics,
  ImpactMetrics,
} from '../../api/analytics';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

export const MyImpactScreen = () => {
  const navigation = useNavigation();
  const [analytics, setAnalytics] = useState<UserImpactAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getUserImpactAnalytics(selectedTimeframe);
      setAnalytics(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load impact analytics');
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 139, 87, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const renderImpactMetrics = () => {
    if (!analytics) return null;

    const metrics: ImpactMetrics = analytics.metrics;

    return (
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="heart" size={24} color={colors.primary} />
          </View>
          <Text style={styles.metricValue}>{metrics.totalDonated.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Total Donated</Text>
          <Text style={styles.metricSubtext}>₦{metrics.totalDonated.toLocaleString()}</Text>
        </Card>

        <Card style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="people" size={24} color={colors.success} />
          </View>
          <Text style={styles.metricValue}>{metrics.peopleHelped}</Text>
          <Text style={styles.metricLabel}>People Helped</Text>
          <Text style={styles.metricSubtext}>Direct impact</Text>
        </Card>

        <Card style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="trophy" size={24} color={colors.warning} />
          </View>
          <Text style={styles.metricValue}>{metrics.rankingsPosition}</Text>
          <Text style={styles.metricLabel}>Community Rank</Text>
          <Text style={styles.metricSubtext}>Top {metrics.rankingsPosition}%</Text>
        </Card>

        <Card style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="cash" size={24} color={colors.info} />
          </View>
          <Text style={styles.metricValue}>{metrics.coinsEarned.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Coins Earned</Text>
          <Text style={styles.metricSubtext}>Charity Coins</Text>
        </Card>
      </View>
    );
  };

  const renderDonationChart = () => {
    if (!analytics?.charts.donationTrend) return null;

    const data: ChartData = {
      labels: analytics.charts.donationTrend.labels,
      datasets: [{
        data: analytics.charts.donationTrend.data,
        color: (opacity = 1) => `rgba(46, 139, 87, ${opacity})`,
        strokeWidth: 2,
      }],
    };

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Donation Trend</Text>
        <LineChart
          data={data}
          width={width - 64}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!analytics?.charts.categoryBreakdown) return null;

    const data = analytics.charts.categoryBreakdown.map((item, index) => ({
      name: item.category,
      amount: item.amount,
      color: [
        colors.primary,
        colors.success,
        colors.warning,
        colors.error,
        colors.info,
      ][index % 5],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Giving by Category</Text>
        <PieChart
          data={data}
          width={width - 64}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </Card>
    );
  };

  const renderProgressChart = () => {
    if (!analytics?.charts.monthlyGoal) return null;

    const progress = analytics.charts.monthlyGoal.current / analytics.charts.monthlyGoal.target;

    const data = {
      labels: ['Progress'],
      data: [progress],
    };

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Monthly Goal Progress</Text>
        <ProgressChart
          data={data}
          width={width - 64}
          height={220}
          strokeWidth={16}
          radius={80}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(46, 139, 87, ${opacity})`,
          }}
          style={styles.chart}
        />
        <View style={styles.progressText}>
          <Text style={styles.progressValue}>
            ₦{analytics.charts.monthlyGoal.current.toLocaleString()} / ₦{analytics.charts.monthlyGoal.target.toLocaleString()}
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}% Complete</Text>
        </View>
      </Card>
    );
  };

  const renderImpactStories = () => {
    if (!analytics?.impactStories || analytics.impactStories.length === 0) return null;

    return (
      <Card style={styles.storiesCard}>
        <Text style={styles.sectionTitle}>Impact Stories</Text>
        {analytics.impactStories.slice(0, 3).map((story, index) => (
          <View key={index} style={styles.storyItem}>
            <View style={styles.storyAvatar}>
              <Text style={styles.storyInitial}>{story.recipientName.charAt(0)}</Text>
            </View>
            <View style={styles.storyContent}>
              <Text style={styles.storyText} numberOfLines={2}>
                "{story.message}"
              </Text>
              <Text style={styles.storyMeta}>
                Helped {story.recipientName} • {story.category} • {story.timeAgo}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your impact...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Impact</Text>
        <View style={styles.timeframeSelector}>
          {(['week', 'month', 'year'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.activeTimeframeButton,
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  selectedTimeframe === timeframe && styles.activeTimeframeText,
                ]}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Impact Metrics */}
      {renderImpactMetrics()}

      {/* Charts */}
      {renderDonationChart()}
      {renderCategoryBreakdown()}
      {renderProgressChart()}

      {/* Impact Stories */}
      {renderImpactStories()}

      {/* Export Button */}
      <TouchableOpacity style={styles.exportButton}>
        <Ionicons name="download-outline" size={20} color={colors.primary} />
        <Text style={styles.exportText}>Export Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTimeframeButton: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTimeframeText: {
    color: colors.surface,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    alignItems: 'center',
    padding: 16,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metricSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  progressText: {
    alignItems: 'center',
    marginTop: 16,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressPercent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  storiesCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  storyItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  storyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storyInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
  },
  storyContent: {
    flex: 1,
  },
  storyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  storyMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  exportText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});