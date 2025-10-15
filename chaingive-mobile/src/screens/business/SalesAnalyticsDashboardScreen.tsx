import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByPeriod: Array<{
    period: string;
    sales: number;
  }>;
}

const SalesAnalyticsDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAnalytics: AnalyticsData = {
        totalRevenue: 15420.50,
        totalOrders: 234,
        averageOrderValue: 65.90,
        topProducts: [
          { name: 'Charity T-Shirt', sales: 45, revenue: 1169.55 },
          { name: 'Donation Mug', sales: 32, revenue: 415.68 },
          { name: 'Fundraising Calendar', sales: 28, revenue: 447.72 },
        ],
        salesByPeriod: [
          { period: 'Mon', sales: 1200 },
          { period: 'Tue', sales: 1500 },
          { period: 'Wed', sales: 1800 },
          { period: 'Thu', sales: 1400 },
          { period: 'Fri', sales: 2100 },
          { period: 'Sat', sales: 2800 },
          { period: 'Sun', sales: 1900 },
        ],
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    trend
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: colors.primary + '20' }]}>
          <Icon name={icon as any} size={20} color={colors.primary} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, trend.isPositive ? styles.trendPositive : styles.trendNegative]}>
            <Icon
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend.isPositive ? colors.success : colors.error}
            />
            <Text style={[styles.trendText, trend.isPositive ? styles.trendTextPositive : styles.trendTextNegative]}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderTimeRangeButton = (range: typeof timeRange, label: string) => (
    <TouchableOpacity
      style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
      onPress={() => setTimeRange(range)}
    >
      <Text style={[styles.timeRangeButtonText, timeRange === range && styles.timeRangeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading || !analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Analytics</Text>
        <TouchableOpacity>
          <Icon name="filter-list" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {renderTimeRangeButton('7d', '7 Days')}
        {renderTimeRangeButton('30d', '30 Days')}
        {renderTimeRangeButton('90d', '90 Days')}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Revenue"
            value={`₦${analytics.totalRevenue.toLocaleString()}`}
            subtitle="Last 30 days"
            icon="attach-money"
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="Total Orders"
            value={analytics.totalOrders.toString()}
            subtitle="Completed orders"
            icon="shopping-cart"
            trend={{ value: 8.2, isPositive: true }}
          />
          <MetricCard
            title="Average Order"
            value={`₦${analytics.averageOrderValue.toFixed(2)}`}
            subtitle="Per transaction"
            icon="trending-up"
            trend={{ value: 3.1, isPositive: true }}
          />
          <MetricCard
            title="Conversion Rate"
            value="24.8%"
            subtitle="Visitors to buyers"
            icon="people"
            trend={{ value: 5.7, isPositive: false }}
          />
        </View>

        {/* Sales Chart Placeholder */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Sales Trend</Text>
          <View style={styles.chartPlaceholder}>
            <Icon name="show-chart" size={48} color={colors.gray[300]} />
            <Text style={styles.chartPlaceholderText}>Sales chart will be displayed here</Text>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products</Text>
          {analytics.topProducts.map((product, index) => (
            <View key={product.name} style={styles.productRow}>
              <View style={styles.productRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productStats}>
                  {product.sales} sales • ₦{product.revenue.toFixed(2)}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.gray[400]} />
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Icon name="shopping-bag" size={16} color={colors.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New order received</Text>
              <Text style={styles.activitySubtitle}>Order #12345 • ₦250.00</Text>
            </View>
            <Text style={styles.activityTime}>2m ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Icon name="payment" size={16} color={colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Payment processed</Text>
              <Text style={styles.activitySubtitle}>Transaction completed successfully</Text>
            </View>
            <Text style={styles.activityTime}>15m ago</Text>
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
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  timeRangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  timeRangeButtonTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  metricCard: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trendPositive: {
    backgroundColor: colors.success + '20',
  },
  trendNegative: {
    backgroundColor: colors.error + '20',
  },
  trendText: {
    ...typography.caption,
    fontSize: 10,
    marginLeft: 2,
  },
  trendTextPositive: {
    color: colors.success,
  },
  trendTextNegative: {
    color: colors.error,
  },
  metricValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  metricTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  metricSubtitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
  },
  chartSection: {
    marginTop: spacing.lg,
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
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  chartPlaceholderText: {
    ...typography.bodyRegular,
    color: colors.gray[400],
    marginTop: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  productRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  productStats: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  activitySubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activityTime: {
    ...typography.caption,
    color: colors.gray[400],
  },
});

export default SalesAnalyticsDashboardScreen;