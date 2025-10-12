import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchUserGamification,
  fetchStreak,
  fetchAchievements,
  updateLoginStreak,
  hideLevelUpModal,
  hideAchievementModal,
} from '../../store/slices/gamificationSlice';
import {
  CountUpAnimation,
  StreakFlame,
  ProgressRing,
  PageTransition,
  AchievementUnlockAnimation,
  LevelUpAnimation,
} from '../../components/animations';
import { LevelBadge, AchievementBadge } from '../../components/gamification';
import { Card } from '../../components/ui';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    level,
    currentXP,
    xpToNextLevel,
    totalXP,
    rank,
    title,
    stats,
    streak,
    achievements,
    totalAchievementsUnlocked,
    totalAchievementsAvailable,
    achievementCompletionPercentage,
    recentlyUnlockedAchievements,
    loading,
    showLevelUpModal,
    levelUpData,
    showAchievementModal,
    newAchievement,
  } = useSelector((state: RootState) => state.gamification);

  // Fetch gamification data on mount
  useEffect(() => {
    dispatch(fetchUserGamification());
    dispatch(fetchStreak());
    dispatch(fetchAchievements());
    // Update login streak
    dispatch(updateLoginStreak());
  }, [dispatch]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completion = 0;
    if (user?.firstName) completion += 20;
    if (user?.lastName) completion += 20;
    if (user?.phoneNumber) completion += 20;
    if (user?.isVerified) completion += 40;
    return completion;
  };

  const profileCompletion = calculateProfileCompletion();

  const handleMenuItemPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(route);
  };

  const handleAchievementPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to achievements screen
    navigation.navigate('Achievements');
  };

  const getXPProgress = () => {
    if (xpToNextLevel === 0) return 0;
    return (currentXP / xpToNextLevel) * 100;
  };

  return (
    <PageTransition type="fadeIn">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => handleMenuItemPress('Settings')}
            style={styles.settingsButton}
          >
            <Icon name="settings" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header with Gradient */}
          <Card
            variant="elevated"
            gradientColors={[colors.primary, colors.secondary]}
            className="mb-4"
          >
            <View style={styles.profileHeader}>
              {/* Avatar with Level Badge */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Text>
                </View>
                <LevelBadge level={level} size={36} style={styles.levelBadge} />
              </View>

              {/* User Info */}
              <Text style={styles.name}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.rank}>🏅 {rank}</Text>

              {/* XP Progress */}
              <View style={styles.xpSection}>
                <View style={styles.xpInfo}>
                  <Text style={styles.xpLabel}>XP Progress</Text>
                  <View style={styles.xpValues}>
                    <CountUpAnimation
                      value={currentXP}
                      style={styles.xpCurrent}
                    />
                    <Text style={styles.xpDivider}>/</Text>
                    <Text style={styles.xpTotal}>{xpToNextLevel}</Text>
                  </View>
                </View>
                <ProgressRing
                  progress={getXPProgress()}
                  size={60}
                  strokeWidth={6}
                  color={colors.gold}
                  backgroundColor={colors.gray[200]}
                />
              </View>

              {/* Streak */}
              <View style={styles.streakContainer}>
                <StreakFlame
                  streakCount={streak.currentStreak}
                  size={32}
                  animated
                />
                <View style={styles.streakInfo}>
                  <CountUpAnimation
                    value={streak.currentStreak}
                    style={styles.streakCount}
                    suffix=" day streak"
                  />
                  <Text style={styles.streakSubtext}>
                    Longest: {streak.longestStreak} days
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, shadows.medium]}>
              <Icon name="favorite" size={24} color={colors.primary} />
              <CountUpAnimation
                value={stats.totalDonations}
                style={styles.statValue}
              />
              <Text style={styles.statLabel}>Donations</Text>
            </View>

            <View style={[styles.statCard, shadows.medium]}>
              <Icon name="shopping-bag" size={24} color={colors.secondary} />
              <CountUpAnimation
                value={stats.itemsRedeemed}
                style={styles.statValue}
              />
              <Text style={styles.statLabel}>Items</Text>
            </View>

            <View style={[styles.statCard, shadows.medium]}>
              <Icon name="people" size={24} color={colors.success} />
              <CountUpAnimation
                value={stats.referrals}
                style={styles.statValue}
              />
              <Text style={styles.statLabel}>Referrals</Text>
            </View>

            <View style={[styles.statCard, shadows.medium]}>
              <Icon name="star" size={24} color={colors.gold} />
              <Text style={styles.statValue}>{user?.tier || 'Silver'}</Text>
              <Text style={styles.statLabel}>Tier</Text>
            </View>
          </View>

          {/* Achievements Section */}
          <TouchableOpacity
            style={[styles.achievementsCard, shadows.medium]}
            onPress={handleAchievementPress}
            activeOpacity={0.7}
          >
            <View style={styles.achievementsHeader}>
              <View style={styles.achievementsTitle}>
                <Icon name="emoji-events" size={24} color={colors.gold} />
                <Text style={styles.achievementsText}>Achievements</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.text.tertiary} />
            </View>

            <View style={styles.achievementsProgress}>
              <ProgressRing
                progress={achievementCompletionPercentage}
                size={50}
                strokeWidth={5}
                color={colors.gold}
              />
              <View style={styles.achievementsStats}>
                <Text style={styles.achievementsCount}>
                  {totalAchievementsUnlocked}/{totalAchievementsAvailable}
                </Text>
                <Text style={styles.achievementsLabel}>Unlocked</Text>
              </View>
            </View>

            {/* Recent Achievements */}
            {recentlyUnlockedAchievements.length > 0 && (
              <View style={styles.recentAchievements}>
                {recentlyUnlockedAchievements.slice(0, 3).map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size={48}
                    style={styles.achievementBadge}
                  />
                ))}
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Completion */}
          <View style={[styles.completionCard, shadows.medium]}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={styles.completionPercentage}>{profileCompletion}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${profileCompletion}%` },
                ]}
              />
            </View>
            {profileCompletion < 100 && (
              <TouchableOpacity
                onPress={() => handleMenuItemPress('EditProfile')}
                style={styles.completeProfileButton}
              >
                <Text style={styles.completeProfileText}>Complete Profile</Text>
                <Icon name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Menu Items */}
          <View style={[styles.menu, shadows.medium]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('EditProfile')}
            >
              <Icon name="person" size={20} color={colors.text.primary} />
              <Text style={styles.menuText}>Edit Profile</Text>
              <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('KYCVerification')}
            >
              <Icon name="verified-user" size={20} color={colors.text.primary} />
              <Text style={styles.menuText}>Security & KYC</Text>
              {!user?.isVerified && (
                <View style={styles.unverifiedBadge}>
                  <Text style={styles.unverifiedText}>!</Text>
                </View>
              )}
              <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('Notifications')}
            >
              <Icon name="notifications" size={20} color={colors.text.primary} />
              <Text style={styles.menuText}>Notifications</Text>
              <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('Help')}
            >
              <Icon name="help" size={20} color={colors.text.primary} />
              <Text style={styles.menuText}>Help & Support</Text>
              <Icon name="chevron-right" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Level Up Modal */}
        {showLevelUpModal && levelUpData && (
          <LevelUpAnimation
            newLevel={levelUpData.newLevel}
            rewards={levelUpData.rewards}
            onComplete={() => dispatch(hideLevelUpModal())}
          />
        )}

        {/* Achievement Unlock Modal */}
        {showAchievementModal && newAchievement && (
          <AchievementUnlockAnimation
            achievement={newAchievement}
            onComplete={() => dispatch(hideAchievementModal())}
          />
        )}
      </SafeAreaView>
    </PageTransition>
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
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: layout.screenPadding,
  },
  profileHeader: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  avatarText: {
    ...typography.h1,
    color: colors.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  name: {
    ...typography.h2,
    color: colors.white,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.bodyRegular,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xxs,
  },
  rank: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xxs,
  },
  xpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  xpInfo: {
    flex: 1,
  },
  xpLabel: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.8,
  },
  xpValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xxs,
  },
  xpCurrent: {
    ...typography.h3,
    color: colors.white,
  },
  xpDivider: {
    ...typography.bodyRegular,
    color: colors.white,
    opacity: 0.6,
    marginHorizontal: spacing.xxs,
  },
  xpTotal: {
    ...typography.bodyRegular,
    color: colors.white,
    opacity: 0.6,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  streakInfo: {
    marginLeft: spacing.sm,
  },
  streakCount: {
    ...typography.bodyBold,
    color: colors.white,
  },
  streakSubtext: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.7,
    marginTop: spacing.xxs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (screenWidth - layout.screenPadding * 2 - spacing.md) / 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  achievementsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  achievementsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsText: {
    ...typography.h4,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  achievementsProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementsStats: {
    marginLeft: spacing.md,
  },
  achievementsCount: {
    ...typography.h3,
    color: colors.text.primary,
  },
  achievementsLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  recentAchievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  completionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  completionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  completionPercentage: {
    ...typography.h4,
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  completeProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeProfileText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginRight: spacing.xxs,
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuText: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  unverifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  unverifiedText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
