import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

interface ReportData {
  totalRevenue: number;
  totalTransactions: number;
  activeUsers: number;
  conversionRate: number;
  topCategories: Array<{
    name: string;
    revenue: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  complianceMetrics: {
    kycCompletion: number;
    riskScore: number;
    auditLogs: number;
  };
}

const EnterpriseReportingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: ReportData = {
        totalRevenue: 1250000.50,
        totalTransactions: 15420,
        activeUsers: 8750,
        conversionRate: 24.8,
        topCategories: [
          { name: 'E-commerce', revenue: 450000, percentage: 36 },
          { name: 'Services', revenue: 320000, percentage: 25.6 },
          { name: 'Digital Goods', revenue: 280000, percentage: 22.4 },
          { name: 'Donations', revenue: 200000, percentage: 16 },
        ],
        monthlyTrends: [
          { month: 'Jul', revenue: 95000, transactions: 1200 },
          { month: 'Aug', revenue: 110000, transactions: 1350 },
          { month: 'Sep', revenue: 125000, transactions: 1450 },
          { month: 'Oct', revenue: 140000, transactions: 1600 },
          { month: 'Nov', revenue: 155000, transactions: 1800 },
          { month: 'Dec', revenue: 170000, transactions: 1950 },
        ],
        complianceMetrics: {
          kycCompletion: 94.2,
          riskScore: 2.1,
          auditLogs: 12580,
        },
      };
      setReportData(mockData);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = colors.primary
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    trend?: { value: number; isPositive: boolean };
    color?: string;
  }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon as any} size={20} color={color} />
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

  const handleExportReport = () => {
    // TODO: Implement report export functionality
    Alert.alert('Export Report', 'Report export functionality coming soon');
  };

  const handleScheduleReport = () => {
    // TODO: Implement scheduled reports
    Alert.alert('Schedule Report', 'Automated reporting setup coming soon');
  };

  if (loading || !reportData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading enterprise reports...</Text>
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
        <Text style={styles.headerTitle}>Enterprise Reports</Text>
        <TouchableOpacity onPress={handleExportReport}>
          <Icon name="download" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {renderTimeRangeButton('30d', '30 Days')}
        {renderTimeRangeButton('90d', '90 Days')}
        {renderTimeRangeButton('1y', '1 Year')}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Performance Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Total Revenue"
              value={`₦${reportData.totalRevenue.toLocaleString()}`}
              subtitle={`Last ${timeRange}`}
              icon="attach-money"
              trend={{ value: 15.2, isPositive: true }}
            />
            <MetricCard
              title="Total Transactions"
              value={reportData.totalTransactions.toLocaleString()}
              subtitle="Completed transactions"
              icon="receipt"
              trend={{ value: 8.7, isPositive: true }}
            />
            <MetricCard
              title="Active Users"
              value={reportData.activeUsers.toLocaleString()}
              subtitle="Monthly active users"
              icon="people"
              trend={{ value: 12.1, isPositive: true }}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${reportData.conversionRate}%`}
              subtitle="Visitor to customer"
              icon="trending-up"
              trend={{ value: 3.2, isPositive: false }}
            />
          </View>
        </View>

        {/* Revenue by Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue by Category</Text>
          {reportData.topCategories.map((category, index) => (
            <View key={category.name} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryRevenue}>₦{category.revenue.toLocaleString()}</Text>
              </View>
              <View style={styles.categoryProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${category.percentage}%` }]}
                  />
                </View>
                <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Monthly Trends Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Trends</Text>
          <View style={styles.chartPlaceholder}>
            <Icon name="show-chart" size={48} color={colors.gray[300]} />
            <Text style={styles.chartPlaceholderText}>Revenue and transaction trends chart</Text>
          </View>
        </View>

        {/* Compliance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance & Security</Text>
          <View style={styles.complianceGrid}>
            <MetricCard
              title="KYC Completion"
              value={`${reportData.complianceMetrics.kycCompletion}%`}
              subtitle="User verification rate"
              icon="verified-user"
              color={colors.success}
            />
            <MetricCard
              title="Risk Score"
              value={reportData.complianceMetrics.riskScore.toFixed(1)}
              subtitle="Out of 10 (lower is better)"
              icon="security"
              color={colors.warning}
            />
            <MetricCard
              title="Audit Logs"
              value={reportData.complianceMetrics.auditLogs.toLocaleString()}
              subtitle="Total audit entries"
              icon="history"
              color={colors.primary}
            />
          </View>
        </View>

        {/* Report Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleExportReport}>
              <Icon name="download" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Export PDF Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleScheduleReport}>
              <Icon name="schedule" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Schedule Reports</Text>
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
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  categoryRevenue: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  categoryPercentage: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
    minWidth: 35,
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
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  actionButtonText: {
    ...typography.bodyRegular,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
});

export default EnterpriseReportingScreen;