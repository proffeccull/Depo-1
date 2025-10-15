import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const NotificationHubScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications(user.id));
    }
  }, [dispatch, user?.id]);

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'unread') return !notification.isRead;
    return true;
  });

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await dispatch(fetchNotifications(user.id));
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error: any) {
      showToast(error.message || 'Failed to mark as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(markAllNotificationsAsRead(user?.id || '')).unwrap();
      showToast('All notifications marked as read', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to mark all as read', 'error');
    }
  };

  const handleNotificationPress = async (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'friend_request':
        navigation.navigate('FriendsList' as never);
        break;
      case 'message':
        navigation.navigate('Messaging' as never, {
          recipientId: notification.senderId,
          recipientName: notification.senderName
        });
        break;
      case 'challenge_invite':
        navigation.navigate('ChallengeDetail' as never, { challengeId: notification.data?.challengeId });
        break;
      case 'achievement':
        navigation.navigate('ShareableAchievements' as never);
        break;
      case 'donation_reminder':
        navigation.navigate('DonationScreen' as never);
        break;
      case 'circle_invite':
        navigation.navigate('GivingCircles' as never);
        break;
      default:
        // Stay on current screen
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return 'person-add';
      case 'message': return 'chat';
      case 'challenge_invite': return 'emoji-events';
      case 'achievement': return 'celebration';
      case 'donation_reminder': return 'favorite';
      case 'circle_invite': return 'groups';
      case 'system': return 'info';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request': return colors.secondary;
      case 'message': return colors.primary;
      case 'challenge_invite': return colors.tertiary;
      case 'achievement': return colors.success;
      case 'donation_reminder': return colors.error;
      case 'circle_invite': return colors.info;
      case 'system': return colors.warning;
      default: return colors.gray[500];
    }
  };

  const renderNotification = ({ item: notification }: { item: any }) => {
    const iconName = getNotificationIcon(notification.type);
    const iconColor = getNotificationColor(notification.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.9}
      >
        {/* Icon */}
        <View style={[styles.notificationIcon, { backgroundColor: iconColor + '20' }]}>
          <Icon name={iconName} size={20} color={iconColor} />
        </View>

        {/* Content */}
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
            {new Date(notification.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {/* Unread Indicator */}
        {!notification.isRead && (
          <View style={styles.unreadDot} />
        )}

        {/* Action Button */}
        {!notification.isRead && (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={() => handleMarkAsRead(notification.id)}
          >
            <Icon name="done" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'unread'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedFilter(filter);
            }}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter && styles.filterTabTextSelected,
            ]}>
              {filter === 'all' ? 'All' : 'Unread'}
              {filter === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-none" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>
            {selectedFilter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
          </Text>
          <Text style={styles.emptyMessage}>
            {selectedFilter === 'unread'
              ? 'You\'re all caught up!'
              : 'Your notifications will appear here.'
            }
          </Text>
          {selectedFilter === 'all' && (
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('SocialFeed' as never)}
            >
              <Text style={styles.exploreButtonText}>Explore Social Feed</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: spacing.sm,
  },
  markAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  filterTabSelected: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  filterTabText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  filterTabTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  exploreButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  notificationsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  unreadNotification: {
    backgroundColor: colors.primary + '05',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  markReadButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});

export default NotificationHubScreen;