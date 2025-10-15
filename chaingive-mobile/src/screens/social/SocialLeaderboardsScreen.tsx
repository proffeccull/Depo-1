import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchSocialLeaderboards } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: screenWidth } = Dimensions.get('window');

const SocialLeaderboardsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { leaderboards, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState<string>('overall');

  useEffect(() => {
    dispatch(fetchSocialLeaderboards());
  }, [dispatch]);

  const getCurrentLeaderboard = () => {
    return leaderboards[selectedCategory] || [];
  };

  const getUserRank = () => {
    const currentLeaderboard = getCurrentLeaderboard();
    const userIndex = currentLeaderboard.findIndex(entry => entry.userId === user?.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return colors.tertiary;
      case 2: return colors.gray[400];
      case 3: return '#CD7F32';
      default: return colors.text.secondary;
    }
  };

  const categories = [
    { key: 'overall', label: 'Overall', icon: 'leaderboard' },
    { key: 'donations', label: 'Donations', icon: 'favorite' },
    { key: 'challenges', label: 'Challenges', icon: 'emoji-events' },
    { key: 'social', label: 'Social', icon: 'people' },
    { key: 'monthly', label: 'This Month', icon: 'calendar-today' },
  ];

  const renderLeaderboardEntry = ({ item: entry, index }: { item: any; index: number }) => {
    const rank = index + 1;
    const isCurrentUser = entry.userId === user?.id;

    return (
      <TouchableOpacity
        style={[
          styles.leaderboardEntry,
          isCurrentUser && styles.currentUserEntry,
        ]}
        onPress={() => navigation.navigate('UserProfile' as never, { userId: entry.userId })}
        activeOpacity={0.9}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
            {getRankIcon(rank)}
          </Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {entry.displayName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          {entry.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={12} color={colors.white} />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserText]}>
            {entry.displayName}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.userStats}>
            {selectedCategory === 'donations' && `₦${entry.totalDonated?.toLocaleString() || 0}`}
            {selectedCategory === 'challenges' && `${entry.challengesCompleted || 0} completed`}
            {selectedCategory === 'social' && `${entry.friendsCount || 0} friends`}
            {selectedCategory === 'monthly' && `${entry.monthlyScore || 0} points`}
            {selectedCategory === 'overall' && `${entry.overallScore || 0} points`}
          </Text>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, isCurrentUser && styles.currentUserText]}>
            {entry.score || 0}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTopThree = () => {
    const currentLeaderboard = getCurrentLeaderboard();
    const topThree = currentLeaderboard.slice(0, 3);

    return (
      <View style={styles.topThreeContainer}>
        {topThree.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = entry.userId === user?.id;

          return (
            <TouchableOpacity
              key={entry.userId}
              style={styles.topThreeEntry}
              onPress={() => navigation.navigate('UserProfile' as never, { userId: entry.userId })}
            >
              <LinearGradient
                colors={
                  rank === 1 ? [colors.tertiary, colors.tertiary + '80'] :
                  rank === 2 ? [colors.gray[400], colors.gray[300]] :
                  ['#CD7F32', '#CD7F32' + '80']
                }
                style={styles.topThreeGradient}
              >
                <Text style={styles.topThreeRank}>{getRankIcon(rank)}</Text>

                <View style={styles.topThreeAvatar}>
                  <Text style={styles.topThreeInitial}>
                    {entry.displayName?.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.topThreeName} numberOfLines={1}>
                  {entry.displayName}
                  {isCurrentUser && ' (You)'}
                </Text>

                <Text style={styles.topThreeScore}>
                  {entry.score || 0}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const currentLeaderboard = getCurrentLeaderboard();
  const userRank = getUserRank();

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
        <Text style={styles.headerTitle}>Leaderboards</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              selectedCategory === category.key && styles.categoryTabSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(category.key);
            }}
          >
            <Icon
              name={category.icon}
              size={16}
              color={selectedCategory === category.key ? colors.white : colors.text.secondary}
            />
            <Text style={[
              styles.categoryTabText,
              selectedCategory === category.key && styles.categoryTabTextSelected,
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top Three Podium */}
      {currentLeaderboard.length >= 3 && (
        <View style={styles.podiumSection}>
          {renderTopThree()}
        </View>
      )}

      {/* User's Rank Card */}
      {userRank && userRank > 3 && (
        <View style={styles.userRankCard}>
          <Text style={styles.userRankTitle}>Your Rank</Text>
          <View style={styles.userRankContent}>
            <Text style={styles.userRankNumber}>#{userRank}</Text>
            <Text style={styles.userRankLabel}>
              {selectedCategory === 'overall' && 'Overall'}
              {selectedCategory === 'donations' && 'Donations'}
              {selectedCategory === 'challenges' && 'Challenges'}
              {selectedCategory === 'social' && 'Social'}
              {selectedCategory === 'monthly' && 'Monthly'}
            </Text>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : currentLeaderboard.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="leaderboard" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Rankings Yet</Text>
          <Text style={styles.emptyMessage}>
            Start participating to appear on the leaderboard!
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentLeaderboard.slice(3)} // Skip top 3 as they're shown in podium
          renderItem={renderLeaderboardEntry}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.leaderboardList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            currentLeaderboard.length > 3 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>Other Rankings</Text>
              </View>
            ) : null
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
  headerRight: {
    width: 40, // Balance the header
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.gray[100],
  },
  categoryTabSelected: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryTabTextSelected: {
    color: colors.white,
  },
  podiumSection: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  topThreeEntry: {
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  topThreeGradient: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    minHeight: 140,
    width: (screenWidth - spacing.md * 4) / 3,
  },
  topThreeRank: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  topThreeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white + '80',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  topThreeInitial: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  topThreeName: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  topThreeScore: {
    ...typography.bodyBold,
    color: colors.white,
    fontWeight: 'bold',
  },
  userRankCard: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRankTitle: {
    ...typography.bodyBold,
    color: colors.white,
  },
  userRankContent: {
    alignItems: 'center',
  },
  userRankNumber: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
  },
  userRankLabel: {
    ...typography.caption,
    color: colors.white + 'CC',
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
  },
  leaderboardList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  listHeader: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  listHeaderText: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  currentUserEntry: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    ...typography.bodyBold,
    color: colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.tertiary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  currentUserText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  userStats: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
});

export default SocialLeaderboardsScreen;