import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import GradientCard from '../../components/common/GradientCard';
import EnhancedBadge from '../../components/common/EnhancedBadge';
import { AnimatedNumber } from '../../components/animated';
import { CardSkeleton, ListSkeleton } from '../../components/skeletons';
import { adminService } from '../../services';
import type { AdminMetric, AdminQuickStat, AdminActivity } from '../../services/adminService';
import {
  PageTransition,
  CountUpAnimation,
  PulseRing,
  ConfettiCelebration,
  LottieSuccess,
} from '../../components/animations';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - (spacing.md * 3)) / 2;

// Use types from adminService
type MetricCard = AdminMetric & { color: string };
type QuickStat = AdminQuickStat & { urgent?: boolean; action: () => void };
type ActivityItem = AdminActivity & { icon: string; urgent?: boolean };

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await adminService.getDashboard();
      
      // Map metrics with colors
      const metricsWithColors: MetricCard[] = dashboardData.metrics.map((metric, index) => {
        const colorMap = [colors.primary, colors.success, colors.info, colors.gold];
        return {
          ...metric,
          color: colorMap[index % colorMap.length],
        };
      });

      // Map quick stats with actions
      const quickStatsWithActions: QuickStat[] = dashboardData.quickStats.map((stat) => ({
        ...stat,
        label: stat.title,
        urgent: ['Pending KYC', 'Open Disputes', 'Failed Txns'].includes(stat.title),
        action: () => handleQuickStatPress(stat.title),
      }));

      // Map activity items with icons and urgency
      const activityWithMetadata: ActivityItem[] = dashboardData.recentActivity.map((activity) => {
        const iconMap: Record<string, string> = {
          user: 'person-add',
          donation: 'favorite',
          transaction: 'account-balance-wallet',
          verification: 'verified',
          marketplace: 'shopping-bag',
        };
        
        return {
          ...activity,
          icon: iconMap[activity.type] || 'info',
          urgent: activity.status === 'pending',
        };
      });

      setMetrics(metricsWithColors);
      setQuickStats(quickStatsWithActions);
      setRecentActivity(activityWithMetadata);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please try again.',
        [{ text: 'OK' }]
      );
      setLoading(false);
    }
  };

  const handleQuickStatPress = (title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate to relevant admin screen based on title
    switch (title) {
      case 'Pending KYC':
        navigation.navigate('UserManagement', { filter: 'pending_kyc' });
        break;
      case 'Open Disputes':
        navigation.navigate('DisputeManagement');
        break;
      case 'Failed Txns':
      case 'Failed Transactions':
        navigation.navigate('TransactionMonitoring', { filter: 'failed' });
        break;
      case 'Active Agents':
        navigation.navigate('AgentManagement');
        break;
      default:
        console.log('Quick stat pressed:', title);
    }
  };

  const handleQuickActionPress = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (action) {
      case 'Manage Users':
        navigation.navigate('UserManagement');
        break;
      case 'Transactions':
        navigation.navigate('TransactionMonitoring');
        break;
      case 'Disputes':
        navigation.navigate('DisputeManagement');
        break;
      case 'Settings':
        navigation.navigate('AdminSettings');
        break;
      default:
        console.log('Quick action pressed:', action);
    }
  };

  const handleActivityPress = (activity: ActivityItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (activity.type) {
      case 'user':
        navigation.navigate('UserDetail', { userId: activity.user });
        break;
      case 'transaction':
        navigation.navigate('TransactionDetail', { transactionId: activity.id });
        break;
      case 'verification':
        navigation.navigate('VerificationDetail', { requestId: activity.id });
        break;
      default:
        console.log('Activity pressed:', activity);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <PageTransition type="fadeIn">
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Platform Overview</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Icon name="notifications" size={24} color={colors.text.primary} />
          <EnhancedBadge value={5} pulse position="top-right" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          {loading ? (
            <View style={styles.metricsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} width={cardWidth} height={120} />
              ))}
            </View>
          ) : (
            <View style={styles.metricsGrid}>
              {metrics.map((metric, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.metricCard, { width: cardWidth }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
                    <Icon name={metric.icon} size={28} color={metric.color} />
                  </View>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <CountUpAnimation
                    value={typeof metric.value === 'number' ? metric.value : parseFloat(metric.value.toString())}
                    style={styles.metricValue}
                    prefix={metric.label === 'Total Volume' ? '₦' : ''}
                    suffix={metric.label === 'Success Rate' ? '%' : ''}
                    decimals={metric.label === 'Success Rate' ? 1 : 0}
                  />
                  <View style={styles.metricChange}>
                    <Icon
                      name={metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={metric.trend === 'up' ? colors.success : colors.error}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        { color: metric.trend === 'up' ? colors.success : colors.error },
                      ]}
                    >
                      {metric.change}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          {loading ? (
            <View style={styles.quickStatsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} width={cardWidth} height={80} />
              ))}
            </View>
          ) : (
            <View style={styles.quickStatsGrid}>
              {quickStats.map((stat, index) => (
                stat.urgent ? (
                  <PulseRing size={cardWidth} color={colors.error} key={index}>
                    <TouchableOpacity
                      style={[
                        styles.quickStatCard,
                        { width: cardWidth },
                        styles.urgentCard,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        stat.action();
                      }}
                    >
                      <View style={styles.quickStatHeader}>
                        <Icon
                          name={stat.icon}
                          size={24}
                          color={colors.error}
                        />
                        <EnhancedBadge
                          value="!"
                          color={colors.error}
                          size="small"
                          pulse
                        />
                      </View>
                      <CountUpAnimation
                        value={stat.value}
                        style={[styles.quickStatValue, { color: colors.error }]}
                      />
                      <Text style={styles.quickStatLabel}>{stat.label}</Text>
                    </TouchableOpacity>
                  </PulseRing>
                ) : (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickStatCard,
                      { width: cardWidth },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      stat.action();
                    }}
                  >
                    <View style={styles.quickStatHeader}>
                      <Icon
                        name={stat.icon}
                        size={24}
                        color={colors.text.secondary}
                      />
                    </View>
                    <CountUpAnimation
                      value={stat.value}
                      style={styles.quickStatValue}
                    />
                    <Text style={styles.quickStatLabel}>{stat.label}</Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ListSkeleton count={5}>
              <CardSkeleton height={70} />
            </ListSkeleton>
          ) : (
            <View>
              {recentActivity.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[styles.activityItem, activity.urgent && styles.urgentActivity]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: activity.urgent ? `${colors.error}20` : `${colors.primary}20` },
                    ]}
                  >
                    <Icon
                      name={activity.icon}
                      size={20}
                      color={activity.urgent ? colors.error : colors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityMessage}>{activity.message}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  {activity.urgent && (
                    <EnhancedBadge
                      value="Urgent"
                      color={colors.error}
                      size="small"
                      variant="solid"
                      position="inline"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {[
              { icon: 'people', label: 'Manage Users', color: colors.primary },
              { icon: 'money', label: 'Transactions', color: colors.success },
              { icon: 'gavel', label: 'Disputes', color: colors.error },
              { icon: 'settings', label: 'Settings', color: colors.gray[600] },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { width: cardWidth }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Icon name={action.icon} size={32} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Success Animation */}
      {showSuccess && (
        <LottieSuccess
          size={200}
          onComplete={() => setShowSuccess(false)}
        />
      )}

      {/* Celebration for major milestones */}
      {showCelebration && <ConfettiCelebration />}
    </SafeAreaView>
  </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  notificationButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.bodySmallBold,
    color: colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  metricIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  metricValue: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  changeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickStatCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  urgentCard: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  quickStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickStatValue: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  quickStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  urgentActivity: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    ...typography.bodySmallBold,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
