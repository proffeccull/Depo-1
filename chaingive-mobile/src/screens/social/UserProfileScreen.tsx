import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchUserProfile, followUser, unfollowUser } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { userProfile, loading } = useSelector((state: RootState) => state.social);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const { userId } = route.params as { userId: string };
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (userProfile && currentUser) {
      setIsFollowing(userProfile.followers?.some(follower => follower.id === currentUser.id) || false);
    }
  }, [userProfile, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser?.id || !userProfile) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (isFollowing) {
        await dispatch(unfollowUser({ followerId: currentUser.id, followingId: userId })).unwrap();
        setIsFollowing(false);
        showToast('Unfollowed user', 'success');
      } else {
        await dispatch(followUser({ followerId: currentUser.id, followingId: userId })).unwrap();
        setIsFollowing(true);
        showToast('Following user!', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update follow status', 'error');
    }
  };

  const handleMessage = () => {
    navigation.navigate('Messaging' as never, { recipientId: userId, recipientName: userProfile?.displayName });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

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
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Icon name="more-vert" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            {userProfile.avatar ? (
              <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {userProfile.displayName?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {userProfile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={16} color={colors.white} />
              </View>
            )}
          </View>

          <Text style={styles.displayName}>{userProfile.displayName}</Text>
          <Text style={styles.username}>@{userProfile.username}</Text>

          {userProfile.bio && (
            <Text style={styles.bio}>{userProfile.bio}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{formatNumber(userProfile.stats?.totalDonated || 0)}</Text>
              <Text style={styles.statLabel}>Total Donated</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{formatNumber(userProfile.stats?.causesSupported || 0)}</Text>
              <Text style={styles.statLabel}>Causes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{formatNumber(userProfile.stats?.challengesCompleted || 0)}</Text>
              <Text style={styles.statLabel}>Challenges</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.messageButton]}
                onPress={handleMessage}
              >
                <Icon name="message" size={20} color={colors.primary} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, isFollowing ? styles.unfollowButton : styles.followButton]}
                onPress={handleFollowToggle}
              >
                <Text style={isFollowing ? styles.unfollowButtonText : styles.followButtonText}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        {/* Content Sections */}
        <View style={styles.contentSections}>
          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {userProfile.recentActivity?.length > 0 ? (
              userProfile.recentActivity.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Icon name="celebration" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{activity.description}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent activity</Text>
            )}
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {userProfile.achievements?.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {userProfile.achievements.map((achievement, index) => (
                  <View key={index} style={styles.achievementCard}>
                    <Icon name="emoji-events" size={24} color={colors.tertiary} />
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDate}>
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>No achievements yet</Text>
            )}
          </View>

          {/* Giving Circles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giving Circles</Text>
            {userProfile.givingCircles?.length > 0 ? (
              userProfile.givingCircles.map((circle, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.circleItem}
                  onPress={() => navigation.navigate('CircleDetail' as never, { circleId: circle.id })}
                >
                  <View style={styles.circleAvatar}>
                    <Text style={styles.circleInitial}>{circle.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.circleInfo}>
                    <Text style={styles.circleName}>{circle.name}</Text>
                    <Text style={styles.circleRole}>{circle.role}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Not a member of any circles</Text>
            )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  moreButton: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarInitial: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  displayName: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  username: {
    ...typography.body,
    color: colors.white + 'CC',
    marginBottom: spacing.md,
  },
  bio: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.white + 'CC',
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  messageButton: {
    backgroundColor: colors.white,
  },
  messageButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: colors.white,
  },
  followButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: 'bold',
  },
  unfollowButton: {
    backgroundColor: colors.white + '20',
    borderWidth: 1,
    borderColor: colors.white,
  },
  unfollowButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  contentSections: {
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  achievementCard: {
    backgroundColor: colors.tertiary + '20',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 120,
  },
  achievementTitle: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  achievementDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  circleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  circleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  circleInitial: {
    ...typography.bodyBold,
    color: colors.white,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  circleRole: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default UserProfileScreen;