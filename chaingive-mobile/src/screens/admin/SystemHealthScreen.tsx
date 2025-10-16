import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useAdmin } from '../../hooks/useAdmin';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ProgressChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface SystemService {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  uptime?: number;
  lastChecked: string;
  details?: {
    memory?: number;
    cpu?: number;
    connections?: number;
  };
}

interface SystemHealthData {
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: {
      status: string;
      responseTime: string;
      connectionPool?: {
        active: number;
        idle: number;
        total: number;
      };
    };
    redis: {
      status: string;
      memory?: string;
      connections?: number;
    };
    email: {
      status: string;
      provider?: string;
      dailyQuota?: {
        used: number;
        limit: number;
      };
    };
    sms: {
      status: string;
      provider?: string;
      dailyQuota?: {
        used: number;
        limit: number;
      };
    };
  };
  system: {
    memory: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
      usagePercent: number;
    };
    cpu: {
      cores: number;
      usage: string;
      model: string;
    };
    disk: {
      filesystem: string;
      size: string;
      used: string;
      available: string;
      usePercent: string;
      mountPoint: string;
    };
    loadAverage: number[];
  };
  application: {
    activeConnections: number;
    pendingJobs: number;
    errorRate: string;
  };
}

export default function SystemHealthScreen() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { getPerformanceMetrics, triggerMaintenance } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [systemHealthData, setSystemHealthData] = useState<SystemHealthData | null>(null);
  const [services, setServices] = useState<SystemService[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    overallHealth: 0,
    uptime: 0,
    responseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    totalRequests: 0,
  });

  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Auto-refresh every 30 seconds when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSystemHealth();

      const interval = setInterval(() => {
        if (realTimeUpdates) {
          loadSystemHealth();
        }
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }, [realTimeUpdates])
  );

  const loadSystemHealth = async () => {
    try {
      setLoading(true);

      // Fetch comprehensive system health data
      const healthResponse = await fetch('/admin/system/health/detailed', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers as needed
        },
      });

      if (healthResponse.ok) {
        const healthData: SystemHealthData = await healthResponse.json();
        setSystemHealthData(healthData);

        // Transform backend data to UI format
        const transformedServices: SystemService[] = [
          {
            name: 'Database',
            status: healthData.services.database.status as 'healthy' | 'degraded' | 'unhealthy',
            responseTime: parseFloat(healthData.services.database.responseTime.replace('ms', '')),
            uptime: 99.9, // Calculate from uptime data
            lastChecked: healthData.timestamp,
            details: {
              memory: healthData.services.database.connectionPool?.active || 0,
              cpu: 0, // Not directly available
              connections: healthData.services.database.connectionPool?.total || 0,
            },
          },
          {
            name: 'Redis Cache',
            status: healthData.services.redis.status as 'healthy' | 'degraded' | 'unhealthy',
            responseTime: 12, // Mock for now
            uptime: 99.8,
            lastChecked: healthData.timestamp,
            details: {
              memory: parseFloat(healthData.services.redis.memory?.replace('MB', '') || '0'),
              cpu: 0,
              connections: healthData.services.redis.connections || 0,
            },
          },
          {
            name: 'Email Service',
            status: healthData.services.email.status as 'healthy' | 'degraded' | 'unhealthy',
            responseTime: 150, // Mock for now
            uptime: 98.5,
            lastChecked: healthData.timestamp,
            details: {
              memory: 0,
              cpu: 0,
              connections: healthData.services.email.dailyQuota?.used || 0,
            },
          },
          {
            name: 'SMS Service',
            status: healthData.services.sms.status as 'healthy' | 'degraded' | 'unhealthy',
            responseTime: 180,
            uptime: 99.2,
            lastChecked: healthData.timestamp,
            details: {
              memory: 0,
              cpu: 0,
              connections: healthData.services.sms.dailyQuota?.used || 0,
            },
          },
          {
            name: 'WebSocket',
            status: 'healthy' as const,
            responseTime: 25,
            uptime: 99.9,
            lastChecked: healthData.timestamp,
            details: {
              memory: 0,
              cpu: 0,
              connections: healthData.application.activeConnections,
            },
          },
        ];

        setServices(transformedServices);

        // Update system metrics
        setSystemMetrics({
          overallHealth: healthData.status === 'healthy' ? 95 : healthData.status === 'degraded' ? 75 : 45,
          uptime: (healthData.uptime / (24 * 60 * 60)) * 100, // Convert to percentage
          responseTime: 85, // Mock for now
          errorRate: parseFloat(healthData.application.errorRate.replace('%', '')),
          activeUsers: healthData.application.activeConnections,
          totalRequests: 45000, // Mock for now
        });
      }

      // Load performance metrics
      const performanceData = await getPerformanceMetrics('1h');
      if (performanceData) {
        setSystemMetrics(prev => ({
          ...prev,
          responseTime: performanceData.metrics?.requests?.averageResponseTime ?
            parseFloat(performanceData.metrics.requests.averageResponseTime.replace('ms', '')) : prev.responseTime,
          errorRate: performanceData.metrics?.requests?.errorRate ?
            parseFloat(performanceData.metrics.requests.errorRate.replace('%', '')) : prev.errorRate,
        }));
      }
    } catch (error) {
      console.error('Failed to load system health:', error);
      Alert.alert('Error', 'Failed to load system health data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSystemHealth();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'check-circle';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'help';
    }
  };

  const handleRunMaintenance = async (action: string) => {
    const maintenanceActions = {
      cleanup: 'Database cleanup and optimization',
      cache: 'Cache clearing and refresh',
      backup: 'System backup creation',
      optimize: 'Database optimization',
    };

    const description = maintenanceActions[action as keyof typeof maintenanceActions] || `${action} maintenance`;

    Alert.alert(
      'Maintenance Action',
      `Are you sure you want to run ${description}? This may temporarily affect system performance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await triggerMaintenance(action, `Mobile admin initiated ${description}`);
              if (result.success) {
                Alert.alert('Success', `${description} completed successfully`);
                await loadSystemHealth();
              } else {
                Alert.alert('Error', result.message || `Failed to run ${description}`);
              }
            } catch (error) {
              Alert.alert('Error', `Failed to run ${description}. Please try again.`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getOverallStatus = () => {
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  };

  if (loading && !services.length) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overall System Status */}
      <Card style={styles.overallCard}>
        <View style={styles.overallHeader}>
          <Text style={styles.sectionTitle}>System Health Overview</Text>
          <Badge
            text={getOverallStatus()}
            color={getStatusColor(getOverallStatus())}
            size="large"
          />
        </View>

        <View style={styles.overallMetrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{systemMetrics.overallHealth}%</Text>
            <Text style={styles.metricLabel}>Health Score</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{systemMetrics.uptime}%</Text>
            <Text style={styles.metricLabel}>Uptime</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{systemMetrics.responseTime}ms</Text>
            <Text style={styles.metricLabel}>Avg Response</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{systemMetrics.errorRate}%</Text>
            <Text style={styles.metricLabel}>Error Rate</Text>
          </View>
        </View>

        {/* Health Score Chart */}
        <View style={styles.chartContainer}>
          <ProgressChart
            data={{
              labels: ['Health'],
              data: [systemMetrics.overallHealth / 100],
            }}
            width={Dimensions.get('window').width - 80}
            height={100}
            strokeWidth={12}
            radius={32}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            }}
            hideLegend
          />
        </View>
      </Card>

      {/* Service Status Cards */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Service Status</Text>
        {services.map((service) => (
          <Card key={service.name} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <Icon
                  name={getStatusIcon(service.status)}
                  size={24}
                  color={getStatusColor(service.status)}
                />
                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
              <Badge
                text={service.status}
                color={getStatusColor(service.status)}
              />
            </View>

            <View style={styles.serviceMetrics}>
              <View style={styles.serviceMetric}>
                <Text style={styles.serviceMetricLabel}>Response Time</Text>
                <Text style={styles.serviceMetricValue}>
                  {service.responseTime}ms
                </Text>
              </View>
              <View style={styles.serviceMetric}>
                <Text style={styles.serviceMetricLabel}>Uptime</Text>
                <Text style={styles.serviceMetricValue}>
                  {service.uptime}%
                </Text>
              </View>
              <View style={styles.serviceMetric}>
                <Text style={styles.serviceMetricLabel}>Last Checked</Text>
                <Text style={styles.serviceMetricValue}>
                  {new Date(service.lastChecked).toLocaleTimeString()}
                </Text>
              </View>
            </View>

            {service.details && (
              <View style={styles.serviceDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Memory:</Text>
                  <Text style={styles.detailValue}>{service.details.memory}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>CPU:</Text>
                  <Text style={styles.detailValue}>{service.details.cpu}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Connections:</Text>
                  <Text style={styles.detailValue}>{service.details.connections}</Text>
                </View>
              </View>
            )}
          </Card>
        ))}
      </View>

      {/* Maintenance Actions */}
      <Card style={styles.maintenanceCard}>
        <Text style={styles.sectionTitle}>Maintenance Actions</Text>

        <View style={styles.maintenanceGrid}>
          <TouchableOpacity
            style={styles.maintenanceButton}
            onPress={() => handleRunMaintenance('cleanup')}
          >
            <Icon name="cleaning-services" size={24} color={colors.primary} />
            <Text style={styles.maintenanceButtonText}>Database Cleanup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.maintenanceButton}
            onPress={() => handleRunMaintenance('cache')}
          >
            <Icon name="cached" size={24} color={colors.primary} />
            <Text style={styles.maintenanceButtonText}>Clear Cache</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.maintenanceButton}
            onPress={() => handleRunMaintenance('backup')}
          >
            <Icon name="backup" size={24} color={colors.primary} />
            <Text style={styles.maintenanceButtonText}>Create Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.maintenanceButton}
            onPress={() => handleRunMaintenance('optimize')}
          >
            <Icon name="speed" size={24} color={colors.primary} />
            <Text style={styles.maintenanceButtonText}>Optimize DB</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* System Resources */}
      <Card style={styles.resourcesCard}>
        <Text style={styles.sectionTitle}>System Resources</Text>

        <View style={styles.resourceGrid}>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceValue}>{systemMetrics.activeUsers}</Text>
            <Text style={styles.resourceLabel}>Active Connections</Text>
          </View>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceValue}>{systemHealthData?.application.pendingJobs || 0}</Text>
            <Text style={styles.resourceLabel}>Pending Jobs</Text>
          </View>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceValue}>
              {systemHealthData?.system.memory.heapUsed || 'N/A'}
            </Text>
            <Text style={styles.resourceLabel}>Memory Used</Text>
          </View>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceValue}>
              {systemHealthData?.system.cpu.cores || 'N/A'}
            </Text>
            <Text style={styles.resourceLabel}>CPU Cores</Text>
          </View>
        </View>

        {/* Real-time Status Indicator */}
        <View style={styles.realtimeIndicator}>
          <TouchableOpacity
            onPress={() => setRealTimeUpdates(!realTimeUpdates)}
            style={styles.realtimeToggle}
          >
            <View style={[styles.statusDot, { backgroundColor: realTimeUpdates ? colors.success : colors.text.secondary }]} />
            <Text style={styles.realtimeText}>
              {realTimeUpdates ? 'Live' : 'Paused'} • Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('TransactionMonitoring')}
          >
            <Icon name="analytics" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>View Metrics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AuditLogs')}
          >
            <Icon name="history" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Audit Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <Icon name="people" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>User Mgmt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Feature', 'Advanced monitoring dashboard coming soon!')}
          >
            <Icon name="dashboard" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Dashboard</Text>
          </TouchableOpacity>
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
  overallCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  overallHeader: {
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
  overallMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  servicesSection: {
    marginBottom: spacing.lg,
  },
  serviceCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceName: {
    ...typography.h3,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  serviceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  serviceMetric: {
    alignItems: 'center',
    flex: 1,
  },
  serviceMetricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  serviceMetricValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  serviceDetails: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  maintenanceCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  maintenanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  maintenanceButton: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  maintenanceButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  resourcesCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceItem: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  resourceValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  resourceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  realtimeText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  realtimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionsCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
});