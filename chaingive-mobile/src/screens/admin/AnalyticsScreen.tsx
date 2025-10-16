import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { Card, Button, LoadingSpinner } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export default function AnalyticsScreen() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
    },
    transactionVolume: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{ data: [20000, 45000, 28000, 80000] }],
    },
    userDistribution: [
      { name: 'Tier 1', population: 215, color: colors.primary, legendFontColor: colors.text.primary },
      { name: 'Tier 2', population: 280, color: colors.success, legendFontColor: colors.text.primary },
      { name: 'Tier 3', population: 52, color: colors.warning, legendFontColor: colors.text.primary },
    ],
    coinCirculation: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{ data: [10000, 25000, 35000, 45000, 55000, 65000] }],
    },
    topCities: [
      { city: 'Lagos', users: 1250, percentage: 35 },
      { city: 'Abuja', users: 890, percentage: 25 },
      { city: 'Port Harcourt', users: 650, percentage: 18 },
      { city: 'Kano', users: 420, percentage: 12 },
      { city: 'Ibadan', users: 380, percentage: 10 },
    ],
    performanceMetrics: {
      avgResponseTime: 245,
      uptime: 99.8,
      errorRate: 0.2,
      throughput: 1250,
    },
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data loading - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Data is already set in state
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const timeRangeOptions = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Time Range Selector */}
      <Card style={styles.timeRangeCard}>
        <Text style={styles.sectionTitle}>Time Range</Text>
        <View style={styles.timeRangeButtons}>
          {timeRangeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeRangeButton,
                timeRange === option.value && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(option.value)}
            >
              <Text
                style={[
                  styles.timeRangeButtonText,
                  timeRange === option.value && styles.timeRangeButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* User Growth Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>User Growth Trend</Text>
        <LineChart
          data={analyticsData.userGrowth}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </Card>

      {/* Transaction Volume Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Transaction Volume</Text>
        <BarChart
          data={analyticsData.transactionVolume}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </Card>

      {/* User Distribution Pie Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>User Distribution by Tier</Text>
        <PieChart
          data={analyticsData.userDistribution}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </Card>

      {/* Coin Circulation Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Coin Circulation Growth</Text>
        <LineChart
          data={analyticsData.coinCirculation}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.warning,
            },
          }}
          bezier
          style={styles.chart}
        />
      </Card>

      {/* Top Cities */}
      <Card style={styles.citiesCard}>
        <Text style={styles.sectionTitle}>Top Cities by User Count</Text>
        {analyticsData.topCities.map((city, index) => (
          <View key={city.city} style={styles.cityItem}>
            <View style={styles.cityInfo}>
              <Text style={styles.cityRank}>#{index + 1}</Text>
              <Text style={styles.cityName}>{city.city}</Text>
            </View>
            <View style={styles.cityStats}>
              <Text style={styles.cityUsers}>{city.users.toLocaleString()} users</Text>
              <Text style={styles.cityPercentage}>{city.percentage}%</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Performance Metrics */}
      <Card style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{analyticsData.performanceMetrics.avgResponseTime}ms</Text>
            <Text style={styles.metricLabel}>Avg Response Time</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{analyticsData.performanceMetrics.uptime}%</Text>
            <Text style={styles.metricLabel}>Uptime</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{analyticsData.performanceMetrics.errorRate}%</Text>
            <Text style={styles.metricLabel}>Error Rate</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{analyticsData.performanceMetrics.throughput}</Text>
            <Text style={styles.metricLabel}>Requests/min</Text>
          </View>
        </View>
      </Card>

      {/* Revenue Analytics */}
      <Card style={styles.revenueCard}>
        <Text style={styles.sectionTitle}>Revenue Analytics</Text>
        <View style={styles.revenueGrid}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueValue}>₦2,450,000</Text>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueChange}>+15.3% from last month</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueValue}>₦185,000</Text>
            <Text style={styles.revenueLabel}>Monthly Recurring</Text>
            <Text style={styles.revenueChange}>+8.7% from last month</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  timeRangeCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeButtonText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  timeRangeButtonTextActive: {
    color: colors.white,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  citiesCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityRank: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.primary,
    width: 30,
  },
  cityName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  cityStats: {
    alignItems: 'flex-end',
  },
  cityUsers: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  cityPercentage: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  metricsCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  metricValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  revenueCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  revenueGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revenueItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  revenueValue: {
    ...typography.h1,
    color: colors.success,
    fontWeight: 'bold',
  },
  revenueLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  revenueChange: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});