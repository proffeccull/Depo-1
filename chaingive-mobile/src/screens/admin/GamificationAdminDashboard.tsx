import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import { gamificationApi } from '../../services/gamificationApi';
import { websocketService, WebSocketEventType } from '../../services/websocketService';
import { notificationService } from '../../services/notificationService';
import { performanceOptimizer } from '../../services/performanceOptimizer';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNFTs: number;
  totalReviews: number;
  totalXP: number;
  averageLevel: number;
  cacheHitRate: number;
  apiResponseTime: number;
  websocketConnections: number;
  notificationDeliveryRate: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const GamificationAdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalNFTs: 0,
    totalReviews: 0,
    totalXP: 0,
    averageLevel: 0,
    cacheHitRate: 0,
    apiResponseTime: 0,
    websocketConnections: 0,
    notificationDeliveryRate: 0,
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'nfts' | 'reviews' | 'system'>('overview');

  // Real-time updates via WebSocket
  useEffect(() => {
    const handleSystemUpdate = (payload: any) => {
      loadDashboardData();
    };

    websocketService.on(WebSocketEventType.LEVEL_UP, handleSystemUpdate);
    websocketService.on(WebSocketEventType.NFT_MINTED, handleSystemUpdate);
    websocketService.on(WebSocketEventType.TRUST_REVIEW_SUBMITTED, handleSystemUpdate);

    return () => {
      websocketService.off(WebSocketEventType.LEVEL_UP, handleSystemUpdate);
      websocketService.off(WebSocketEventType.NFT_MINTED, handleSystemUpdate);
      websocketService.off(WebSocketEventType.TRUST_REVIEW_SUBMITTED, handleSystemUpdate);
    };
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch system statistics
      const [userStats, nftStats, reviewStats, systemStats] = await Promise.all([
        gamificationApi.userLevels.getUserLevel('admin-stats'),
        gamificationApi.charitableNft.getCollections(),
        gamificationApi.trust.getReviews({ limit: 1 }),
        fetchSystemStats(),
      ]);

      // Update stats
      setStats({
        totalUsers: userStats?.data?.totalUsers || 0,
        activeUsers: userStats?.data?.activeUsers || 0,
        totalNFTs: nftStats?.data?.reduce((sum: number, collection: any) =>
          sum + collection.totalSupply, 0) || 0,
        totalReviews: reviewStats?.data?.pagination?.total || 0,
        totalXP: userStats?.data?.totalXP || 0,
        averageLevel: userStats?.data?.averageLevel || 0,
        cacheHitRate: systemStats.cacheHitRate,
        apiResponseTime: systemStats.apiResponseTime,
        websocketConnections: systemStats.websocketConnections,
        notificationDeliveryRate: systemStats.notificationDeliveryRate,
      });

      // Check for system alerts
      checkSystemAlerts(systemStats);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch system statistics
  const fetchSystemStats = async () => {
    const metrics = performanceOptimizer.getMetrics();
    const cacheStats = performanceOptimizer.api.getCacheStats();

    return {
      cacheHitRate: calculateCacheHitRate(metrics),
      apiResponseTime: calculateAverageResponseTime(metrics),
      websocketConnections: websocketService.isWebSocketConnected ? 1 : 0,
      notificationDeliveryRate: 95, // Mock - would come from analytics
    };
  };

  // Calculate cache hit rate
  const calculateCacheHitRate = (metrics: any) => {
    // Mock calculation - would use real cache metrics
    return Math.floor(Math.random() * 20) + 80; // 80-99%
  };

  // Calculate average API response time
  const calculateAverageResponseTime = (metrics: any) => {
    const apiMetrics = metrics.api;
    if (!apiMetrics) return 0;

    const totalTime = Object.values(apiMetrics).reduce(
      (sum: number, metric: any) => sum + metric.average,
      0
    );
    const count = Object.keys(apiMetrics).length;

    return count > 0 ? Math.round(totalTime / count) : 0;
  };

  // Check for system alerts
  const checkSystemAlerts = (systemStats: any) => {
    const newAlerts: SystemAlert[] = [];

    // API response time alert
    if (systemStats.apiResponseTime > 2000) {
      newAlerts.push({
        id: 'slow-api',
        type: 'warning',
        title: 'Slow API Response',
        message: `Average API response time is ${systemStats.apiResponseTime}ms`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // WebSocket connection alert
    if (!systemStats.websocketConnections) {
      newAlerts.push({
        id: 'websocket-disconnected',
        type: 'error',
        title: 'WebSocket Disconnected',
        message: 'Real-time updates are not available',
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // Cache hit rate alert
    if (systemStats.cacheHitRate < 70) {
      newAlerts.push({
        id: 'low-cache-hit-rate',
        type: 'warning',
        title: 'Low Cache Performance',
        message: `Cache hit rate is only ${systemStats.cacheHitRate}%`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    setAlerts(newAlerts);
  };

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Handle alert resolution
  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  // Send test notification
  const handleSendTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  // Clear system cache
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await performanceOptimizer.api.clearAllCache();
              Alert.alert('Success', 'Cache cleared successfully');
              loadDashboardData();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Render stat card
  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.statGradient}
      >
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  // Render alert
  const renderAlert = (alert: SystemAlert) => (
    <TouchableOpacity
      key={alert.id}
      style={[styles.alertCard, alert.resolved && styles.alertResolved]}
      onPress={() => !alert.resolved && handleResolveAlert(alert.id)}
    >
      <View style={styles.alertHeader}>
        <Icon
          name={
            alert.type === 'error' ? 'error' :
            alert.type === 'warning' ? 'warning' :
            'info'
          }
          size={20}
          color={
            alert.type === 'error' ? colors.error :
            alert.type === 'warning' ? colors.warning :
            colors.info
          }
        />
        <Text style={styles.alertTitle}>{alert.title}</Text>
        {alert.resolved && (
          <Icon name="check-circle" size={20} color={colors.success} />
        )}
      </View>
      <Text style={styles.alertMessage}>{alert.message}</Text>
      <Text style={styles.alertTimestamp}>
        {new Date(alert.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '10', colors.background.primary]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gamification Admin</Text>
          <Text style={styles.subtitle}>Monitor and manage the gamification system</Text>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            {[
              { key: 'overview', label: 'Overview', icon: 'dashboard' },
              { key: 'users', label: 'Users', icon: 'people' },
              { key: 'nfts', label: 'NFTs', icon: 'image' },
              { key: 'reviews', label: 'Reviews', icon: 'rate-review' },
              { key: 'system', label: 'System', icon: 'settings' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key as any);
                }}
              >
                <Icon name={tab.icon} size={18} color={activeTab === tab.key ? '#FFF' : colors.primary} />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              {/* Key Statistics */}
              <View style={styles.statsGrid}>
                {renderStatCard('Total Users', stats.totalUsers, 'people', colors.primary)}
                {renderStatCard('Active Users', stats.activeUsers, 'person', colors.success)}
                {renderStatCard('Total NFTs', stats.totalNFTs, 'image', colors.info)}
                {renderStatCard('Trust Reviews', stats.totalReviews, 'rate-review', colors.warning)}
                {renderStatCard('Total XP', stats.totalXP.toLocaleString(), 'stars', colors.secondary)}
                {renderStatCard('Avg Level', stats.averageLevel.toFixed(1), 'trending-up', colors.accent)}
              </View>

              {/* System Performance */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Performance</Text>
                <View style={styles.performanceGrid}>
                  {renderStatCard('Cache Hit Rate', `${stats.cacheHitRate}%`, 'cached', colors.success)}
                  {renderStatCard('API Response', `${stats.apiResponseTime}ms`, 'timer', colors.info)}
                  {renderStatCard('WebSocket', stats.websocketConnections ? 'Connected' : 'Disconnected', 'wifi', stats.websocketConnections ? colors.success : colors.error)}
                  {renderStatCard('Notifications', `${stats.notificationDeliveryRate}%`, 'notifications', colors.warning)}
                </View>
              </View>

              {/* System Alerts */}
              {alerts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>System Alerts</Text>
                  {alerts.map(renderAlert)}
                </View>
              )}

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSendTestNotification}
                  >
                    <Icon name="notifications" size={24} color={colors.primary} />
                    <Text style={styles.actionText}>Test Notification</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleClearCache}
                  >
                    <Icon name="cleaning-services" size={24} color={colors.warning} />
                    <Text style={styles.actionText}>Clear Cache</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={loadDashboardData}
                  >
                    <Icon name="refresh" size={24} color={colors.info} />
                    <Text style={styles.actionText}>Refresh Data</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <View style={styles.tabContent}>
              <Text style={styles.comingSoon}>User management interface coming soon...</Text>
            </View>
          )}

          {/* NFTs Tab */}
          {activeTab === 'nfts' && (
            <View style={styles.tabContent}>
              <Text style={styles.comingSoon}>NFT management interface coming soon...</Text>
            </View>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <View style={styles.tabContent}>
              <Text style={styles.comingSoon}>Review moderation interface coming soon...</Text>
            </View>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <View style={styles.tabContent}>
              <Text style={styles.comingSoon}>Advanced system monitoring coming soon...</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xxs,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  tabTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
  },
  statCard: {
    width: (screenWidth - spacing.lg * 2 - spacing.md) / 2,
    marginBottom: spacing.md,
    marginRight: spacing.md,
  },
  statGradient: {
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  alertCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertResolved: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertTitle: {
    ...typography.button,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  alertMessage: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  alertTimestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    width: (screenWidth - spacing.lg * 2 - spacing.md * 2) / 3,
    marginRight: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    ...typography.caption,
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  comingSoon: {
    ...typography.h2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});