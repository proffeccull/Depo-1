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
import { Card } from '../../components/ui';
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
import { MotiView } from 'moti';

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
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 bg-white dark:bg-gray-800 shadow-md">
        <View>
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Platform Overview</Text>
        </View>
        <TouchableOpacity
          className="p-2"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Icon name="notifications" size={24} className="text-gray-800 dark:text-white" />
          <EnhancedBadge value={5} pulse position="top-right" />
        </TouchableOpacity>
      </View>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <ScrollView
          className="flex-1"
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
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Key Metrics</Text>
          {loading ? (
            <View className="flex-row flex-wrap gap-4">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} width={cardWidth} height={120} />
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-4">
              {metrics.map((metric, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
                  style={{ width: cardWidth }}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <View className={`w-14 h-14 rounded-lg justify-center items-center mb-2`} style={{ backgroundColor: `${metric.color}20` }}>
                    <Icon name={metric.icon} size={28} color={metric.color} />
                  </View>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">{metric.label}</Text>
                  <CountUpAnimation
                    value={typeof metric.value === 'number' ? metric.value : parseFloat(metric.value.toString())}
                    className="text-2xl font-bold text-gray-800 dark:text-white mb-1"
                    prefix={metric.label === 'Total Volume' ? '₦' : ''}
                    suffix={metric.label === 'Success Rate' ? '%' : ''}
                    decimals={metric.label === 'Success Rate' ? 1 : 0}
                  />
                  <View className="flex-row items-center gap-1">
                    <Icon
                      name={metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={metric.trend === 'up' ? colors.success : colors.error}
                    />
                    <Text
                      className={`text-xs font-bold ${
                        metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}
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
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Stats</Text>
          {loading ? (
            <View className="flex-row flex-wrap gap-4">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} width={cardWidth} height={80} />
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-4">
              {quickStats.map((stat, index) => (
                stat.urgent ? (
                  <PulseRing size={cardWidth} color={colors.error} key={index}>
                    <TouchableOpacity
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 items-center border-2 border-red-500"
                      style={{ width: cardWidth }}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        stat.action();
                      }}
                    >
                      <View className="flex-row items-center mb-2">
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
                        className="text-4xl font-bold text-red-500 mb-1"
                      />
                      <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">{stat.label}</Text>
                    </TouchableOpacity>
                  </PulseRing>
                ) : (
                  <TouchableOpacity
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 items-center shadow-md"
                    style={{ width: cardWidth }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      stat.action();
                    }}
                  >
                    <View className="flex-row items-center mb-2">
                      <Icon
                        name={stat.icon}
                        size={24}
                        className="text-gray-500"
                      />
                    </View>
                    <CountUpAnimation
                      value={stat.value}
                      className="text-4xl font-bold text-gray-800 dark:text-white mb-1"
                    />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">{stat.label}</Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</Text>
            <TouchableOpacity
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text className="text-sm font-bold text-primary-500">View All</Text>
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
                  className={`flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-4 mb-2 shadow-sm ${
                    activity.urgent ? 'border-l-4 border-red-500' : ''
                  }`}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View
                    className={`w-10 h-10 rounded-full justify-center items-center mr-4 ${
                      activity.urgent ? 'bg-red-100' : 'bg-primary-100'
                    }`}
                  >
                    <Icon
                      name={activity.icon}
                      size={20}
                      className={activity.urgent ? 'text-red-500' : 'text-primary-500'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-800 dark:text-white mb-1">{activity.message}</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</Text>
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
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-4">
            {[
              { icon: 'people', label: 'Manage Users', color: colors.primary },
              { icon: 'money', label: 'Transactions', color: colors.success },
              { icon: 'gavel', label: 'Disputes', color: colors.error },
              { icon: 'settings', label: 'Settings', color: colors.gray[600] },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 items-center shadow-md"
                style={{ width: cardWidth }}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <View className="w-16 h-16 rounded-lg justify-center items-center mb-2" style={{ backgroundColor: `${action.color}20` }}>
                  <Icon name={action.icon} size={32} color={action.color} />
                </View>
                <Text className="text-sm font-bold text-gray-800 dark:text-white text-center">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
        </ScrollView>
      </MotiView>

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
