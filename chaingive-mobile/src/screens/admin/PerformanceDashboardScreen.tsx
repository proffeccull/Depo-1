import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface PerformanceMetrics {
  timestamp: string;
  period: string;
  system: {
    cpu: { usage_percent: number; cores: number };
    memory: { used_mb: number; total_mb: number; usage_percent: number };
    disk: { used_gb: number; total_gb: number; usage_percent: number };
    load_average: [number, number, number];
  };
  application: {
    active_users: number;
    websocket_connections: number;
    pending_jobs: number;
    response_time_ms: number;
    error_rate_percent: number;
  };
  database: {
    connections_active: number;
    connections_idle: number;
    query_count: number;
    slow_queries: number;
    avg_query_time_ms: number;
  };
  business: {
    donations_today: number;
    transactions_today: number;
    revenue_today: number;
    matches_created: number;
  };
}

export default function PerformanceDashboardScreen() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1h');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    loadPerformanceMetrics();
    if (realTimeUpdates) {
      setupRealTimeUpdates();
    }

    return () => {
      cleanupRealTimeUpdates();
    };
  }, [selectedPeriod, realTimeUpdates]);

  const loadPerformanceMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/v1/admin/system/metrics?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMetrics(data.data);
        }
      } else {
        throw new Error('Failed to fetch performance metrics');
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
      Alert.alert('Error', 'Failed to load performance metrics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Set up polling for real-time updates
    const pollInterval = setInterval(async () => {
      if (realTimeUpdates) {
        try {
          await loadPerformanceMetrics();
        } catch (error) {
          console.error('Real-time update failed:', error);
        }
      }
    }, 30000); // Update every 30 seconds

    (global as any).performancePollInterval = pollInterval;
  };

  const cleanupRealTimeUpdates = () => {
    if ((global as any).performancePollInterval) {
      clearInterval((global as any).performancePollInterval);
      (global as any).performancePollInterval = null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPerformanceMetrics();
    setRefreshing(false);
  };

  const toggleRealTimeUpdates = () => {
    setRealTimeUpdates(!realTimeUpdates);
  };

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return colors.success;
    if (value <= thresholds.warning) return colors.warning;
    return colors.error;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} MB`;
    return `${(bytes / 1024).toFixed(1)} GB`;
  };

  if (loading && !metrics) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Performance Dashboard</Text>
        <TouchableOpacity
          style={[styles.realtimeToggle, realTimeUpdates && styles.realtimeActive]}
          onPress={toggleRealTimeUpdates}
        >
          <Icon name="sync" size={16} color={realTimeUpdates ? colors.white : colors.text.secondary} />
          <Text style={[styles.realtimeText, realTimeUpdates && styles.realtimeTextActive]}>
            {realTimeUpdates ? 'LIVE' : 'PAUSED'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <Card style={styles.periodCard}>
        <Text style={styles.sectionTitle}>Time Period</Text>
        <View style={styles.periodButtons}>
          {[
            { key: '1h', label: '1 Hour' },
            { key: '24h', label: '24 Hours' },
            { key: '7d', label: '7 Days' },
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[styles.periodButton, selectedPeriod === period.key && styles.periodActive]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[styles.periodText, selectedPeriod === period.key && styles.periodTextActive]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {metrics && (
        <>
          {/* System Metrics */}
          <Card style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>System Resources</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Icon name="memory" size={24} color={colors.primary} />
                <Text style={styles.metricLabel}>CPU Usage</Text>
                <Text style={[styles.metricValue, { color: getHealthColor(metrics.system.cpu.usage_percent, { good: 70, warning: 85 }) }]}>
                  {metrics.system.cpu.usage_percent.toFixed(1)}%
                </Text>
                <Text style={styles.metricSubtext}>{metrics.system.cpu.cores} cores</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="storage" size={24} color={colors.primary} />
                <Text style={styles.metricLabel}>Memory</Text>
                <Text style={[styles.metricValue, { color: getHealthColor(metrics.system.memory.usage_percent, { good: 75, warning: 90 }) }]}>
                  {metrics.system.memory.usage_percent.toFixed(1)}%
                </Text>
                <Text style={styles.metricSubtext}>
                  {formatBytes(metrics.system.memory.used_mb)} / {formatBytes(metrics.system.memory.total_mb)}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="sd-storage" size={24} color={colors.primary} />
                <Text style={styles.metricLabel}>Disk Usage</Text>
                <Text style={[styles.metricValue, { color: getHealthColor(metrics.system.disk.usage_percent, { good: 80, warning: 95 }) }]}>
                  {metrics.system.disk.usage_percent.toFixed(1)}%
                </Text>
                <Text style={styles.metricSubtext}>
                  {metrics.system.disk.used_gb.toFixed(1)}GB / {metrics.system.disk.total_gb.toFixed(1)}GB
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="speed" size={24} color={colors.primary} />
                <Text style={styles.metricLabel}>Load Average</Text>
                <Text style={styles.metricValue}>{metrics.system.load_average[0].toFixed(2)}</Text>
                <Text style={styles.metricSubtext}>
                  1m: {metrics.system.load_average[0].toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Application Metrics */}
          <Card style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Application Performance</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Icon name="people" size={24} color={colors.success} />
                <Text style={styles.metricLabel}>Active Users</Text>
                <Text style={styles.metricValue}>{metrics.application.active_users.toLocaleString()}</Text>
                <Text style={styles.metricSubtext}>Currently online</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="wifi" size={24} color={colors.success} />
                <Text style={styles.metricLabel}>WebSocket</Text>
                <Text style={styles.metricValue}>{metrics.application.websocket_connections}</Text>
                <Text style={styles.metricSubtext}>Active connections</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="schedule" size={24} color={colors.warning} />
                <Text style={styles.metricLabel}>Response Time</Text>
                <Text style={[styles.metricValue, { color: getHealthColor(metrics.application.response_time_ms, { good: 500, warning: 1000 }) }]}>
                  {metrics.application.response_time_ms}ms
                </Text>
                <Text style={styles.metricSubtext}>Average</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="error" size={24} color={colors.error} />
                <Text style={styles.metricLabel}>Error Rate</Text>
                <Text style={[styles.metricValue, { color: getHealthColor(metrics.application.error_rate_percent, { good: 1, warning: 5 }) }]}>
                  {metrics.application.error_rate_percent.toFixed(2)}%
                </Text>
                <Text style={styles.metricSubtext}>Last hour</Text>
              </View>
            </View>
          </Card>

          {/* Database Metrics */}
          <Card style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Database Performance</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Icon name="dns" size={24} color={colors.info} />
                <Text style={styles.metricLabel}>Connections</Text>
                <Text style={styles.metricValue}>
                  {metrics.database.connections_active + metrics.database.connections_idle}
                </Text>
                <Text style={styles.metricSubtext}>
                  {metrics.database.connections_active} active, {metrics.database.connections_idle} idle
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="query-stats" size={24} color={colors.info} />
                <Text style={styles.metricLabel}>Query Count</Text>
                <Text style={styles.metricValue}>{metrics.database.query_count.toLocaleString()}</Text>
                <Text style={styles.metricSubtext}>Total queries</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="timer" size={24} color={colors.warning} />
                <Text style={styles.metricLabel}>Query Time</Text>
                <Text style={[styles.metricValue, { color: getHealthColor(metrics.database.avg_query_time_ms, { good: 50, warning: 200 }) }]}>
                  {metrics.database.avg_query_time_ms}ms
                </Text>
                <Text style={styles.metricSubtext}>Average</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="warning" size={24} color={colors.error} />
                <Text style={styles.metricLabel}>Slow Queries</Text>
                <Text style={[styles.metricValue, { color: getHealthColor(metrics.database.slow_queries, { good: 10, warning: 50 }) }]}>
                  {metrics.database.slow_queries}
                </Text>
                <Text style={styles.metricSubtext}>{'>1 second'}</Text>
              </View>
            </View>
          </Card>

          {/* Business Metrics */}
          <Card style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Business Metrics</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Icon name="volunteer-activism" size={24} color={colors.primary} />
                <Text style={styles.metricLabel}>Donations</Text>
                <Text style={styles.metricValue}>{metrics.business.donations_today}</Text>
                <Text style={styles.metricSubtext}>Today</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="swap-horiz" size={24} color={colors.primary} />
                <Text style={styles.metricLabel}>Transactions</Text>
                <Text style={styles.metricValue}>{metrics.business.transactions_today}</Text>
                <Text style={styles.metricSubtext}>Today</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="attach-money" size={24} color={colors.success} />
                <Text style={styles.metricLabel}>Revenue</Text>
                <Text style={styles.metricValue}>₦{metrics.business.revenue_today.toLocaleString()}</Text>
                <Text style={styles.metricSubtext}>Today</Text>
              </View>

              <View style={styles.metricItem}>
                <Icon name="link" size={24} color={colors.info} />
                <Text style={styles.metricLabel}>Matches</Text>
                <Text style={styles.metricValue}>{metrics.business.matches_created}</Text>
                <Text style={styles.metricSubtext}>Created</Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Button
                title="View Health"
                onPress={() => navigation.navigate('SystemHealth')}
                size="small"
                variant="outline"
                icon="health-and-safety"
              />
              <Button
                title="Audit Logs"
                onPress={() => navigation.navigate('AuditLogs')}
                size="small"
                variant="outline"
                icon="list-alt"
              />
              <Button
                title="User Mgmt"
                onPress={() => navigation.navigate('UserManagement')}
                size="small"
                variant="outline"
                icon="people"
              />
              <Button
                title="Transactions"
                onPress={() => navigation.navigate('TransactionMonitoring')}
                size="small"
                variant="outline"
                icon="receipt"
              />
            </View>
          </Card>

          {/* Last Updated */}
          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedText}>
              Last updated: {new Date(metrics.timestamp).toLocaleString()}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  realtimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  realtimeActive: {
    backgroundColor: colors.success,
  },
  realtimeText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  realtimeTextActive: {
    color: colors.white,
  },
  periodCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  periodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  periodButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  periodActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  periodTextActive: {
    color: colors.white,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  metricValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  metricSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  actionsCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lastUpdated: {
    alignItems: 'center',
    padding: spacing.md,
  },
  lastUpdatedText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});