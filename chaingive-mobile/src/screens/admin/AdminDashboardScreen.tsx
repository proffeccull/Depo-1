import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useAdmin } from '../../hooks/useAdmin';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminDashboardScreen() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { dashboardStats, systemHealth, refreshData, loading } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await refreshData();
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToSection = (screen: keyof AdminStackParamList) => {
    navigation.navigate(screen);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return colors.success;
      case 'degraded':
        return colors.warning;
      case 'unhealthy':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  if (loading && !dashboardStats) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* System Health Status */}
      <Card style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <Badge
            text={systemHealth?.status || 'Unknown'}
            color={getHealthStatusColor(systemHealth?.status || 'unknown')}
          />
        </View>

        <View style={styles.healthMetrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Database</Text>
            <Text style={[styles.metricValue, {
              color: getHealthStatusColor(systemHealth?.services?.database?.status || 'unknown')
            }]}>
              {systemHealth?.services?.database?.status || 'Unknown'}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Response Time</Text>
            <Text style={styles.metricValue}>
              {systemHealth?.services?.database?.responseTime || 'N/A'}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Memory Usage</Text>
            <Text style={styles.metricValue}>
              {systemHealth?.system?.memory?.usagePercent || 0}%
            </Text>
          </View>
        </View>
      </Card>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricNumber}>
            {dashboardStats?.overview?.totalUsers || 0}
          </Text>
          <Text style={styles.metricLabel}>Total Users</Text>
          <Text style={styles.metricChange}>
            +{dashboardStats?.today?.newUsers || 0} today
          </Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricNumber}>
            ₦{dashboardStats?.overview?.totalVolume?.toLocaleString() || 0}
          </Text>
          <Text style={styles.metricLabel}>Total Volume</Text>
          <Text style={styles.metricChange}>
            +₦{dashboardStats?.today?.volume?.toLocaleString() || 0} today
          </Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricNumber}>
            {dashboardStats?.overview?.totalAgents || 0}
          </Text>
          <Text style={styles.metricLabel}>Active Agents</Text>
          <Text style={styles.metricChange}>Verified</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricNumber}>
            {dashboardStats?.overview?.totalCoinsInCirculation || 0}
          </Text>
          <Text style={styles.metricLabel}>Coins in Circulation</Text>
          <Text style={styles.metricChange}>Active</Text>
        </Card>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Analytics Overview</Text>

        {/* User Growth Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>User Growth (Last 7 Days)</Text>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                data: [20, 45, 28, 80, 99, 43, 50],
              }],
            }}
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
          <Text style={styles.chartTitle}>Transaction Volume by Day</Text>
          <BarChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                data: [20000, 45000, 28000, 80000, 99000, 43000, 50000],
              }],
            }}
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
            data={[
              {
                name: 'Tier 1',
                population: 215,
                color: colors.primary,
                legendFontColor: colors.text.primary,
                legendFontSize: 15,
              },
              {
                name: 'Tier 2',
                population: 280,
                color: colors.success,
                legendFontColor: colors.text.primary,
                legendFontSize: 15,
              },
              {
                name: 'Tier 3',
                population: 52,
                color: colors.warning,
                legendFontColor: colors.text.primary,
                legendFontSize: 15,
              },
            ]}
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
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToSection('UserManagement')}
          >
            <Icon name="people" size={24} color={colors.primary} />
            <Text style={styles.actionText}>User Management</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToSection('TransactionMonitoring')}
          >
            <Icon name="account-balance-wallet" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToSection('CoinManagement')}
          >
            <Icon name="monetization-on" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Coin System</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToSection('FeatureFlags')}
          >
            <Icon name="flag" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Feature Flags</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToSection('AuditLogs')}
          >
            <Icon name="history" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Audit Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToSection('SystemHealth')}
          >
            <Icon name="health-and-safety" size={24} color={colors.primary} />
            <Text style={styles.actionText}>System Health</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Items */}
      <View style={styles.pendingSection}>
        <Text style={styles.sectionTitle}>Pending Actions</Text>

        <Card style={styles.pendingCard}>
          <View style={styles.pendingItem}>
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingTitle}>KYC Verifications</Text>
              <Text style={styles.pendingCount}>
                {dashboardStats?.pending?.kycVerifications || 0} pending
              </Text>
            </View>
            <Button
              title="Review"
              size="small"
              onPress={() => navigateToSection('KYCApprovals')}
            />
          </View>

          <View style={styles.pendingItem}>
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingTitle}>Coin Purchases</Text>
              <Text style={styles.pendingCount}>
                {dashboardStats?.pending?.purchaseRequests || 0} pending
              </Text>
            </View>
            <Button
              title="Review"
              size="small"
              onPress={() => navigateToSection('CoinPurchaseApprovals')}
            />
          </View>

          <View style={styles.pendingItem}>
            <View style={styles.pendingInfo}>
              <Text style={styles.pendingTitle}>Disputes</Text>
              <Text style={styles.pendingCount}>
                {dashboardStats?.pending?.disputes || 0} active
              </Text>
            </View>
            <Button
              title="Review"
              size="small"
              onPress={() => navigateToSection('DisputeManagement')}
            />
          </View>
        </Card>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          <Text style={styles.noActivityText}>Recent admin actions will appear here</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  healthCard: {
    marginBottom: spacing.lg,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.body,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metricNumber: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  metricChange: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xs,
  },
  chartsSection: {
    marginBottom: spacing.lg,
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
  actionsSection: {
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...colors.shadow,
  },
  actionText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  pendingSection: {
    marginBottom: spacing.lg,
  },
  pendingCard: {
    padding: spacing.md,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  pendingCount: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  activitySection: {
    marginBottom: spacing.lg,
  },
  activityCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noActivityText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
