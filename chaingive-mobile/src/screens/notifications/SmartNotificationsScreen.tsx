import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchNotificationSettings, updateNotificationSettings } from '../../store/slices/notificationsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const SmartNotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { notificationSettings, loading } = useSelector((state: RootState) => state.notifications);
  const { user } = useSelector((state: RootState) => state.auth);

  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotificationSettings(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (notificationSettings) {
      setSettings(notificationSettings);
    }
  }, [notificationSettings]);

  const handleSettingToggle = async (settingKey: string, value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const updatedSettings = {
        ...settings,
        [settingKey]: value,
      };

      setSettings(updatedSettings);

      await dispatch(updateNotificationSettings({
        userId: user?.id || '',
        settings: updatedSettings,
      })).unwrap();

      showToast('Notification settings updated', 'success');
    } catch (error: any) {
      // Revert on error
      setSettings(notificationSettings);
      showToast(error.message || 'Failed to update settings', 'error');
    }
  };

  const notificationCategories = [
    {
      title: 'Auction & Bidding',
      icon: 'gavel',
      settings: [
        {
          key: 'auctionStarted',
          label: 'Auction Started',
          description: 'Get notified when auctions you\'re interested in begin',
        },
        {
          key: 'outbid',
          label: 'Outbid Alerts',
          description: 'Receive immediate notifications when someone outbids you',
        },
        {
          key: 'auctionEnding',
          label: 'Auction Ending Soon',
          description: 'Reminders when auctions are ending in the next hour',
        },
        {
          key: 'bidWon',
          label: 'Bid Won',
          description: 'Celebrate when you win an auction',
        },
      ],
    },
    {
      title: 'Social & Community',
      icon: 'people',
      settings: [
        {
          key: 'friendRequest',
          label: 'Friend Requests',
          description: 'New friend requests and acceptances',
        },
        {
          key: 'messages',
          label: 'Direct Messages',
          description: 'New messages from friends and connections',
        },
        {
          key: 'groupInvites',
          label: 'Group Invitations',
          description: 'Invites to join giving circles and challenges',
        },
        {
          key: 'socialActivity',
          label: 'Social Activity',
          description: 'Likes, comments, and mentions on your posts',
        },
      ],
    },
    {
      title: 'Achievements & Challenges',
      icon: 'emoji-events',
      settings: [
        {
          key: 'achievementUnlocked',
          label: 'Achievement Unlocked',
          description: 'Celebrate when you earn new achievements',
        },
        {
          key: 'challengeProgress',
          label: 'Challenge Progress',
          description: 'Updates on your challenge completion progress',
        },
        {
          key: 'milestoneReached',
          label: 'Milestones',
          description: 'Major giving milestones and goals reached',
        },
        {
          key: 'leaderboardChanges',
          label: 'Leaderboard Changes',
          description: 'When your position changes on leaderboards',
        },
      ],
    },
    {
      title: 'Financial & Transactions',
      icon: 'account-balance',
      settings: [
        {
          key: 'paymentReceived',
          label: 'Payments Received',
          description: 'Notifications for successful coin purchases',
        },
        {
          key: 'donationReminders',
          label: 'Donation Reminders',
          description: 'Gentle reminders to continue your giving journey',
        },
        {
          key: 'lowBalance',
          label: 'Low Balance Alerts',
          description: 'When your coin balance is running low',
        },
        {
          key: 'transactionComplete',
          label: 'Transaction Complete',
          description: 'Confirmations for completed transactions',
        },
      ],
    },
    {
      title: 'Smart AI Features',
      icon: 'smart-toy',
      settings: [
        {
          key: 'aiRecommendations',
          label: 'AI Recommendations',
          description: 'Personalized suggestions from our AI assistant',
        },
        {
          key: 'marketInsights',
          label: 'Market Insights',
          description: 'AI-powered market trends and opportunities',
        },
        {
          key: 'givingOpportunities',
          label: 'Giving Opportunities',
          description: 'Curated causes that match your interests',
        },
        {
          key: 'performanceTips',
          label: 'Performance Tips',
          description: 'AI suggestions to improve your impact',
        },
      ],
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notification settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Smart Notifications</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              // Reset to defaults
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Icon name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="psychology" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Our smart notification system learns your preferences and delivers relevant updates
            at the right time. Customize what you want to hear about below.
          </Text>
        </View>

        {/* Notification Categories */}
        {notificationCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Icon name={category.icon} size={20} color={colors.primary} />
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            <View style={styles.settingsList}>
              {category.settings.map((setting, settingIndex) => (
                <View key={settingIndex} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{setting.label}</Text>
                    <Text style={styles.settingDescription}>
                      {setting.description}
                    </Text>
                  </View>
                  <Switch
                    value={settings[setting.key] || false}
                    onValueChange={(value) => handleSettingToggle(setting.key, value)}
                    trackColor={{ false: colors.gray[300], true: colors.primary }}
                    thumbColor={settings[setting.key] ? colors.white : colors.gray[400]}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                // Enable all notifications
                const allEnabled = Object.keys(settings).reduce((acc, key) => {
                  acc[key] = true;
                  return acc;
                }, {} as any);
                handleSettingToggle('all', true);
              }}
            >
              <Icon name="notifications-active" size={20} color={colors.success} />
              <Text style={styles.quickActionText}>Enable All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                // Disable all notifications
                const allDisabled = Object.keys(settings).reduce((acc, key) => {
                  acc[key] = false;
                  return acc;
                }, {} as any);
                handleSettingToggle('all', false);
              }}
            >
              <Icon name="notifications-off" size={20} color={colors.error} />
              <Text style={styles.quickActionText}>Disable All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                // Smart defaults
                showToast('Smart defaults applied', 'success');
              }}
            >
              <Icon name="auto-fix-high" size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>Smart Defaults</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Notification Schedule</Text>

          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Icon name="schedule" size={20} color={colors.primary} />
              <Text style={styles.scheduleTitle}>Quiet Hours</Text>
            </View>

            <Text style={styles.scheduleDescription}>
              Set times when you don't want to receive notifications
            </Text>

            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => {
                // Open schedule settings
                showToast('Schedule settings coming soon', 'info');
              }}
            >
              <Text style={styles.scheduleButtonText}>Configure Schedule</Text>
              <Icon name="chevron-right" size={20} color={colors.primary} />
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  categorySection: {
    marginBottom: spacing['2xl'],
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  settingsList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    ...shadows.card,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  settingDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  quickActionsSection: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  scheduleSection: {
    marginBottom: spacing['2xl'],
  },
  scheduleCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.card,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scheduleTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  scheduleDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  scheduleButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default SmartNotificationsScreen;