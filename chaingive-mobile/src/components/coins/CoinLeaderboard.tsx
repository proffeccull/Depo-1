import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { coinSounds } from './CoinSoundEffects';

const { width: screenWidth } = Dimensions.get('window');

interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  coins: number;
  rank: number;
  previousRank?: number;
  trend: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
  badge?: string;
  streak?: number;
}

interface CoinLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'allTime';
  onTimeframeChange?: (timeframe: string) => void;
  onEntryPress?: (entry: LeaderboardEntry) => void;
  onBoostPress?: () => void;
  prizePool?: number;
  userRank?: number;
  showPrizePool?: boolean;
}

const CoinLeaderboard: React.FC<CoinLeaderboardProps> = ({
  entries,
  currentUserId,
  timeframe,
  onTimeframeChange,
  onEntryPress,
  onBoostPress,
  prizePool,
  userRank,
  showPrizePool = true,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const rankAnim = useRef(new Animated.Value(0)).current;
  const crownAnim = useRef(new Animated.Value(1)).current;

  const timeframes = [
    { key: 'daily', label: 'Today', icon: 'today' },
    { key: 'weekly', label: 'This Week', icon: 'date-range' },
    { key: 'monthly', label: 'This Month', icon: 'calendar-month' },
    { key: 'allTime', label: 'All Time', icon: 'timeline' },
  ];

  useEffect(() => {
    // Animate rank changes
    if (userRank && userRank <= 10) {
      Animated.spring(rankAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }

    // Crown animation for top 3
    const topThree = entries.slice(0, 3);
    if (topThree.some(entry => entry.isCurrentUser)) {
      const crownAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(crownAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(crownAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      crownAnimation.start();
    }
  }, [entries, userRank]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return 'crown';
      case 2:
        return 'workspace-premium';
      case 3:
        return 'military-tech';
      default:
        return 'tag';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return colors.text.secondary;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-flat';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTimeframe(newTimeframe as any);
    onTimeframeChange?.(newTimeframe);
  };

  const handleEntryPress = (entry: LeaderboardEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEntryPress?.(entry);
  };

  const renderTimeframeTab = (item: typeof timeframes[0]) => (
    <TouchableOpacity
      key={item.key}
      style={[
        styles.timeframeTab,
        selectedTimeframe === item.key && styles.timeframeTabSelected,
      ]}
      onPress={() => handleTimeframeChange(item.key)}
    >
      <Icon
        name={item.icon}
        size={16}
        color={selectedTimeframe === item.key ? colors.white : colors.text.secondary}
      />
      <Text
        style={[
          styles.timeframeText,
          selectedTimeframe === item.key && styles.timeframeTextSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isTopThree = item.rank <= 3;
    const isCurrentUser = item.isCurrentUser;

    return (
      <Animated.View
        style={[
          styles.entryContainer,
          isCurrentUser && styles.currentUserEntry,
          isTopThree && { transform: [{ scale: crownAnim }] },
        ]}
      >
        <TouchableOpacity
          style={styles.entryTouchable}
          onPress={() => handleEntryPress(item)}
          activeOpacity={0.7}
        >
          {/* Rank */}
          <View style={styles.rankContainer}>
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: getRankColor(item.rank) + '20' },
              ]}
            >
              <Text style={[styles.rankNumber, { color: getRankColor(item.rank) }]}>
                #{item.rank}
              </Text>
            </View>
            {isTopThree && (
              <Icon
                name={getRankIcon(item.rank)}
                size={20}
                color={getRankColor(item.rank)}
                style={styles.crownIcon}
              />
            )}
          </View>

          {/* Avatar/Initials */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, isCurrentUser && styles.currentUserAvatar]}>
              <Text style={[styles.avatarText, isCurrentUser && styles.currentUserAvatarText]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            {item.trend !== 'same' && (
              <View style={[styles.trendIndicator, { backgroundColor: getTrendColor(item.trend) }]}>
                <Icon
                  name={getTrendIcon(item.trend)}
                  size={10}
                  color={colors.white}
                />
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text
              style={[styles.userName, isCurrentUser && styles.currentUserName]}
              numberOfLines={1}
            >
              {item.name}
              {isCurrentUser && ' (You)'}
            </Text>
            <View style={styles.userStats}>
              <Icon name="monetization-on" size={14} color={colors.tertiary} />
              <Text style={styles.coinAmount}>
                {item.coins.toLocaleString()}
              </Text>
              {item.streak && item.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Icon name="local-fire-department" size={12} color={colors.warning} />
                  <Text style={styles.streakText}>{item.streak}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Badge */}
          {item.badge && (
            <View style={styles.entryBadge}>
              <Text style={styles.entryBadgeText}>{item.badge}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const topThree = entries.slice(0, 3);
  const restOfEntries = entries.slice(3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="leaderboard" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Coin Leaderboard</Text>
          {showPrizePool && prizePool && (
            <View style={styles.prizePool}>
              <Icon name="emoji-events" size={16} color={colors.warning} />
              <Text style={styles.prizeText}>
                ₦{prizePool.toLocaleString()} Prize Pool
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.boostButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onBoostPress?.();
          }}
        >
          <Icon name="trending-up" size={16} color={colors.white} />
          <Text style={styles.boostText}>Boost Rank</Text>
        </TouchableOpacity>
      </View>

      {/* Timeframe Tabs */}
      <View style={styles.timeframeTabs}>
        {timeframes.map(renderTimeframeTab)}
      </View>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <View style={styles.podiumContainer}>
          {/* 2nd Place */}
          <View style={styles.podiumPosition}>
            <View style={[styles.podiumAvatar, styles.podiumSilver]}>
              <Text style={styles.podiumAvatarText}>
                {topThree[1]?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.podiumBase, styles.podiumBaseSilver]}>
              <Text style={styles.podiumRank}>2</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {topThree[1]?.name}
            </Text>
            <Text style={styles.podiumCoins}>
              {topThree[1]?.coins.toLocaleString()}
            </Text>
          </View>

          {/* 1st Place */}
          <View style={styles.podiumPosition}>
            <Animated.View style={[styles.podiumAvatar, styles.podiumGold, { transform: [{ scale: crownAnim }] }]}>
              <Icon name="crown" size={24} color="#FFD700" />
              <Text style={styles.podiumAvatarText}>
                {topThree[0]?.name.charAt(0).toUpperCase()}
              </Text>
            </Animated.View>
            <View style={[styles.podiumBase, styles.podiumBaseGold]}>
              <Text style={styles.podiumRank}>1</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {topThree[0]?.name}
            </Text>
            <Text style={styles.podiumCoins}>
              {topThree[0]?.coins.toLocaleString()}
            </Text>
          </View>

          {/* 3rd Place */}
          <View style={styles.podiumPosition}>
            <View style={[styles.podiumAvatar, styles.podiumBronze]}>
              <Text style={styles.podiumAvatarText}>
                {topThree[2]?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.podiumBase, styles.podiumBaseBronze]}>
              <Text style={styles.podiumRank}>3</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {topThree[2]?.name}
            </Text>
            <Text style={styles.podiumCoins}>
              {topThree[2]?.coins.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Rest of Leaderboard */}
      <FlatList
        data={restOfEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {entries.length === 0 && (
        <View style={styles.emptyContainer}>
          <Icon name="leaderboard" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Rankings Yet</Text>
          <Text style={styles.emptyMessage}>
            Start earning coins to appear on the leaderboard!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  prizePool: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  prizeText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  boostText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  timeframeTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  timeframeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
  },
  timeframeTabSelected: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xxs,
  },
  timeframeTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  podiumPosition: {
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  podiumGold: {
    backgroundColor: '#FFD700',
  },
  podiumSilver: {
    backgroundColor: '#C0C0C0',
  },
  podiumBronze: {
    backgroundColor: '#CD7F32',
  },
  podiumAvatarText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  podiumBase: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  podiumBaseGold: {
    backgroundColor: '#FFD700',
  },
  podiumBaseSilver: {
    backgroundColor: '#C0C0C0',
  },
  podiumBaseBronze: {
    backgroundColor: '#CD7F32',
  },
  podiumRank: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  podiumName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    textAlign: 'center',
    maxWidth: 80,
  },
  podiumCoins: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  entryContainer: {
    marginVertical: spacing.xs,
  },
  currentUserEntry: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  entryTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  rankNumber: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 12,
  },
  crownIcon: {
    position: 'absolute',
    top: -5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserAvatar: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarText: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  currentUserAvatarText: {
    color: colors.white,
  },
  trendIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  currentUserName: {
    color: colors.primary,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinAmount: {
    ...typography.body,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  streakText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  entryBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  entryBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default CoinLeaderboard;