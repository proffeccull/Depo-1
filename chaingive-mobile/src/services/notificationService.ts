import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { websocketService, WebSocketEventType } from './websocketService';
import { store } from '../store/store';

// Notification preferences interface
export interface NotificationPreferences {
  levelUps: boolean;
  nftUnlocks: boolean;
  trustReviews: boolean;
  leaderboardUpdates: boolean;
  xpGains: boolean;
  crewActivity: boolean;
  targetCompletions: boolean;
  challengeUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

// Default notification preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  levelUps: true,
  nftUnlocks: true,
  trustReviews: true,
  leaderboardUpdates: false,
  xpGains: false,
  crewActivity: true,
  targetCompletions: true,
  challengeUpdates: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

// Notification types
export enum NotificationType {
  LEVEL_UP = 'level_up',
  NFT_UNLOCK = 'nft_unlock',
  TRUST_REVIEW = 'trust_review',
  LEADERBOARD_UPDATE = 'leaderboard_update',
  XP_GAIN = 'xp_gain',
  CREW_ACTIVITY = 'crew_activity',
  TARGET_COMPLETION = 'target_completion',
  CHALLENGE_UPDATE = 'challenge_update',
  SYSTEM = 'system',
}

interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  vibrate?: boolean;
  priority?: 'default' | 'high' | 'low';
}

class NotificationService {
  private isInitialized = false;
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;

  constructor() {
    this.setupNotificationHandler();
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ Notification permissions not granted');
        return;
      }

      // Load user preferences
      await this.loadPreferences();

      // Configure notification behavior
      await Notifications.setNotificationChannelAsync('gamification', {
        name: 'Gamification Events',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFD700',
        sound: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync('system', {
        name: 'System Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 100],
        lightColor: '#007AFF',
        sound: false,
        showBadge: false,
      });

      // Set up WebSocket event listeners
      this.setupWebSocketListeners();

      this.isInitialized = true;
      console.log('🔔 Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  }

  // Load user notification preferences
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('❌ Failed to load notification preferences:', error);
    }
  }

  // Save user notification preferences
  async savePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...preferences };
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('❌ Failed to save notification preferences:', error);
    }
  }

  // Get current preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Check if notifications are allowed during current time
  private isWithinQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = this.preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.preferences.quietHours.end.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      // Same day quiet hours
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Send notification
  private async sendNotification(data: NotificationData): Promise<void> {
    try {
      // Check quiet hours
      if (this.isWithinQuietHours() && data.type !== NotificationType.SYSTEM) {
        console.log('🔕 Notification suppressed due to quiet hours');
        return;
      }

      // Check user preferences
      if (!this.isNotificationEnabled(data.type)) {
        return;
      }

      const notificationContent: Notifications.NotificationContentInput = {
        title: data.title,
        body: data.body,
        data: data.data || {},
        sound: data.sound !== false && this.preferences.soundEnabled,
        priority: data.priority === 'high' ? Notifications.AndroidNotificationPriority.HIGH :
                 data.priority === 'low' ? Notifications.AndroidNotificationPriority.LOW :
                 Notifications.AndroidNotificationPriority.DEFAULT,
      };

      // Add vibration for supported platforms
      if (Platform.OS === 'android' && data.vibrate !== false && this.preferences.vibrationEnabled) {
        notificationContent.vibrationPattern = [0, 250, 250, 250];
      }

      // Determine channel
      const channelId = data.type === NotificationType.SYSTEM ? 'system' : 'gamification';

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Send immediately
        identifier: `${data.type}_${Date.now()}`,
      });

      console.log('🔔 Notification sent:', data.title);
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  }

  // Check if notification type is enabled
  private isNotificationEnabled(type: NotificationType): boolean {
    switch (type) {
      case NotificationType.LEVEL_UP:
        return this.preferences.levelUps;
      case NotificationType.NFT_UNLOCK:
        return this.preferences.nftUnlocks;
      case NotificationType.TRUST_REVIEW:
        return this.preferences.trustReviews;
      case NotificationType.LEADERBOARD_UPDATE:
        return this.preferences.leaderboardUpdates;
      case NotificationType.XP_GAIN:
        return this.preferences.xpGains;
      case NotificationType.CREW_ACTIVITY:
        return this.preferences.crewActivity;
      case NotificationType.TARGET_COMPLETION:
        return this.preferences.targetCompletions;
      case NotificationType.CHALLENGE_UPDATE:
        return this.preferences.challengeUpdates;
      case NotificationType.SYSTEM:
        return true; // System notifications always enabled
      default:
        return false;
    }
  }

  // Set up notification response handler
  private setupNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: this.preferences.soundEnabled,
        shouldSetBadge: true,
      }),
    });

    // Handle notification taps
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        // Handle deep linking to specific screens
        this.handleNotificationTap(data);
      }
    });
  }

  // Handle notification tap for deep linking
  private handleNotificationTap(data: any): void {
    // This will be handled by the navigation service
    // For now, just log the intent
    console.log('🔔 Notification tapped:', data);
  }

  // Set up WebSocket event listeners for real-time notifications
  private setupWebSocketListeners(): void {
    // Level up notifications
    websocketService.on(WebSocketEventType.LEVEL_UP, (payload) => {
      this.sendNotification({
        type: NotificationType.LEVEL_UP,
        title: '🎉 Level Up!',
        body: `Congratulations! You've reached Level ${payload.newLevel}!`,
        data: {
          screen: 'UserLevels',
          level: payload.newLevel,
        },
        priority: 'high',
      });
    });

    // XP awarded notifications (only for significant gains)
    websocketService.on(WebSocketEventType.XP_AWARDED, (payload) => {
      if (payload.amount >= 50) { // Only notify for significant XP gains
        this.sendNotification({
          type: NotificationType.XP_GAIN,
          title: '⭐ XP Earned!',
          body: `You gained ${payload.amount} XP for ${payload.reason}`,
          data: {
            screen: 'UserLevels',
            xpAmount: payload.amount,
          },
          priority: 'default',
        });
      }
    });

    // NFT minted notifications
    websocketService.on(WebSocketEventType.NFT_MINTED, (payload) => {
      this.sendNotification({
        type: NotificationType.NFT_UNLOCK,
        title: '🏆 NFT Unlocked!',
        body: `You've earned the "${payload.nft.name}" NFT!`,
        data: {
          screen: 'CharitableNFTGallery',
          nftId: payload.nft.id,
        },
        priority: 'high',
      });
    });

    // Trust review notifications
    websocketService.on(WebSocketEventType.TRUST_REVIEW_VERIFIED, (payload) => {
      this.sendNotification({
        type: NotificationType.TRUST_REVIEW,
        title: '✅ Review Verified!',
        body: 'Your video review has been verified and published.',
        data: {
          screen: 'TrustReviewHub',
          reviewId: payload.review.id,
        },
        priority: 'default',
      });
    });

    // Target completion notifications
    websocketService.on(WebSocketEventType.TARGET_COMPLETED, (payload) => {
      this.sendNotification({
        type: NotificationType.TARGET_COMPLETION,
        title: '🎯 Target Completed!',
        body: `You've completed your weekly target and earned ${payload.coinsEarned} coins!`,
        data: {
          screen: 'WeeklyTargets',
          targetId: payload.target.id,
        },
        priority: 'high',
      });
    });

    // Crew activity notifications
    websocketService.on(WebSocketEventType.CREW_PROGRESS_UPDATED, (payload) => {
      this.sendNotification({
        type: NotificationType.CREW_ACTIVITY,
        title: '👥 Crew Progress!',
        body: `${payload.crew.name} made progress on their charitable goals!`,
        data: {
          screen: 'CrewDashboard',
          crewId: payload.crew.id,
        },
        priority: 'default',
      });
    });

    // Challenge completion notifications
    websocketService.on(WebSocketEventType.CREW_CHALLENGE_COMPLETED, (payload) => {
      this.sendNotification({
        type: NotificationType.CHALLENGE_UPDATE,
        title: '🏅 Challenge Completed!',
        body: `Your crew completed "${payload.challenge.title}" and earned rewards!`,
        data: {
          screen: 'CrewDashboard',
          crewId: payload.crewId,
          challengeId: payload.challenge.id,
        },
        priority: 'high',
      });
    });
  }

  // Send custom notification (for testing or manual triggers)
  async sendCustomNotification(
    type: NotificationType,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    await this.sendNotification({
      type,
      title,
      body,
      data,
      priority: 'default',
    });
  }

  // Test notification (for development)
  async sendTestNotification(): Promise<void> {
    await this.sendNotification({
      type: NotificationType.SYSTEM,
      title: '🧪 Test Notification',
      body: 'This is a test notification from ChainGive',
      data: { test: true },
      priority: 'default',
    });
  }

  // Get notification history (for debugging)
  async getNotificationHistory(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Failed to get notification history:', error);
      return [];
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('❌ Failed to clear notifications:', error);
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings.status === 'granted';
    } catch (error) {
      console.error('❌ Failed to check notification permissions:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Failed to request notification permissions:', error);
      return false;
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// React hook for using notifications in components
import { useEffect, useState } from 'react';

export const useNotifications = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setPreferences(notificationService.getPreferences());
      setIsEnabled(await notificationService.areNotificationsEnabled());
    };
    loadData();
  }, []);

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    await notificationService.savePreferences(newPreferences);
    setPreferences(notificationService.getPreferences());
  };

  return {
    preferences,
    isEnabled,
    updatePreferences,
    requestPermissions: notificationService.requestPermissions.bind(notificationService),
    sendTestNotification: notificationService.sendTestNotification.bind(notificationService),
  };
};

// Initialize notifications when app starts
export const initializeNotifications = async (): Promise<void> => {
  await notificationService.initialize();
};

// Cleanup notifications when app closes
export const cleanupNotifications = (): void => {
  // Clean up any notification-related resources
  notificationService.clearAllNotifications();
};
