import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchLeaderboard, boostPosition } from '../../store/slices/leaderboardSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Import premium coin components
import {
  CoinBalanceWidget,
  CoinLeaderboard,
  CoinParticleSystem,
  coinSounds,
} from '../../components/coins';
import { FadeInView } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all';
type BoostType = 'visibility' | 'multiplier' | 'position';

const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { entries, loading, timeframe, userRank, userCoins } = useSelector((state: RootState) => state.leaderboard);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [showParticleEffect, setShowParticleEffect] = useState(false);
  const [boostType, setBoostType] = useState<BoostType>('multiplier');
  const [coinsToSpend, setCoinsToSpend] = useState('');

  useEffect(() => {
    dispatch(fetchLeaderboard(timeframe));
  }, [dispatch, timeframe]);

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await dispatch(fetchLeaderboard(timeframe));
    setRefreshing(false);
  };

  const handleBoost = async () => {
    if (!coinsToSpend || parseInt(coinsToSpend) <= 0) {
      // Show error
      return;
    }

    const coins = parseInt(coinsToSpend);
    if (coins > (user?.charityCoins || 0)) {
      // Show insufficient coins error
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(boostPosition({
        boostType,
        coinsToSpend: coins,
        duration: 7, // 7 days
      }));

      await coinSounds.playMilestoneReach();
      setShowParticleEffect(true);

      // Reset form
      setCoinsToSpend('');
    } catch (error) {
      // Handle error
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return colors.tertiary; // Gold
    if (rank === 2) return colors.coin.silver;
    if (rank === 3) return colors.coin.bronze;
    return colors.text.secondary;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return 'emoji-events';
    if (rank === 2) return 'military-tech';
    if (rank === 3) return 'workspace-premium';
    return 'person';
  };

  const renderEntry = ({ item, index }: { item: any; index: number }) => {
    const isCurrentUser = item.userId === user?.id;
    const rank = index + 1;

    return (
      <FadeInView duration={400} delay={index * 50}>
        <View style={[styles.entryCard, isCurrentUser && styles.currentUserCard]}>
          <View style={styles.rankSection}>
            <View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) + '20' }]}>
              <Icon name={getRankIcon(rank)} size={20} color={getRankColor(rank)} />
              <Text style={[styles.rankText, { color: getRankColor(rank) }]}>#{rank}</Text>
            </View>
          </View>

          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user?.firstName?.[0] || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, isCurrentUser && styles.currentUserText]}>
                {item.user?.firstName} {item.user?.lastName}
                {isCurrentUser && ' (You)'}
              </Text>
              <Text style={styles.userLocation}>
                📍 {item.user?.locationCity || 'Unknown'}
              </Text>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.entryStat}>🔄 {item.cyclesCompleted} cycles</Text>
            <Text style={styles.entryStat}>🪙 {item.charityCoinsBalance} coins</Text>
            <Text style={styles.entryStat}>📈 {item.trend || '+5'} this week</Text>
          </View>

          <View style={styles.prizeSection}>
            {rank <= 3 && (
              <View style={styles.prizeBadge}>
                <Icon name="stars" size={16} color={colors.tertiary} />
                <Text style={styles.prizeText}>
                  {rank === 1 ? '10,000' : rank === 2 ? '5,000' : '2,500'} coins
                </Text>
              </View>
            )}
          </View>
        </View>
      </FadeInView>
    );
  };

  const timeframes: { key: Timeframe; label: string; icon: string }[] = [
    { key: 'daily', label: 'Today', icon: 'today' },
    { key: 'weekly', label: 'This Week', icon: 'date-range' },
    { key: 'monthly', label: 'This Month', icon: 'calendar-month' },
    { key: 'all', label: 'All Time', icon: 'all-inclusive' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Coin Balance Widget - Always Visible */}
      <CoinBalanceWidget
        balance={user?.charityCoins || 0}
        trend="up"
        change24h={150}
        animation="glow"
        size="medium"
        showQuickActions={true}
        onQuickAction={(action) => {
          switch (action) {
            case 'buy':
              navigation.navigate('BuyCoinsScreen');
              break;
            case 'earn':
              navigation.navigate('GiveScreen');
              break;
            case 'spend':
              navigation.navigate('MarketplaceScreen');
              break;
            case 'history':
              navigation.navigate('TransactionHistory');
              break;
          }
        }}
      />

      {/* Particle Effects */}
      {showParticleEffect && (
        <CoinParticleSystem
          trigger={showParticleEffect}
          type="explosion"
          intensity="high"
          duration={2500}
          onComplete={() => setShowParticleEffect(false)}
        />
      )}

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Coin Leaderboard</Text>
          <TouchableOpacity
            style={styles.boostButton}
            onPress={() => {
              // Show boost modal
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Icon name="flash" size={20} color={colors.tertiary} />
            <Text style={styles.boostButtonText}>Boost</Text>
          </TouchableOpacity>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf.key}
              style={[
                styles.timeframeButton,
                timeframe === tf.key && styles.timeframeButtonActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                dispatch(fetchLeaderboard(tf.key));
              }}
            >
              <Icon
                name={tf.icon}
                size={18}
                color={timeframe === tf.key ? colors.white : colors.text.secondary}
              />
              <Text
                style={[
                  styles.timeframeText,
                  timeframe === tf.key && styles.timeframeTextActive,
                ]}
              >
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Rank Card */}
        {userRank && (
          <FadeInView duration={300}>
            <LinearGradient
              colors={[colors.primary + '20', colors.secondary + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userRankCard}
            >
              <View style={styles.userRankHeader}>
                <Text style={styles.userRankTitle}>Your Rank</Text>
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(userRank.rank) + '20' }]}>
                  <Icon name={getRankIcon(userRank.rank)} size={24} color={getRankColor(userRank.rank)} />
                  <Text style={[styles.rankText, { color: getRankColor(userRank.rank) }]}>#{userRank.rank}</Text>
                </View>
              </View>
              <View style={styles.userRankStats}>
                <Text style={styles.userRankStat}>🪙 {userRank.coins} coins</Text>
                <Text style={styles.userRankStat}>🔄 {userRank.cycles} cycles</Text>
                <Text style={styles.userRankStat}>📈 {userRank.change > 0 ? '+' : ''}{userRank.change} from last {timeframe}</Text>
              </View>
            </LinearGradient>
          </FadeInView>
        )}

        {/* Leaderboard List */}
        <FadeInView duration={500} delay={200}>
          <CoinLeaderboard
            entries={entries}
            currentUserId={user?.id}
            timeframe={timeframe}
            onEntryPress={(entry) => {
              // Handle entry press - maybe show user profile
              console.log('Entry pressed:', entry);
            }}
            onBoostPress={() => {
              // Show boost modal
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            prizePool={50000}
            seasonEndDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
          />
        </FadeInView>

        {/* Boost Section */}
        <FadeInView duration={600} delay={300}>
          <View style={styles.boostSection}>
            <Text style={styles.boostTitle}>Boost Your Rank</Text>
            <Text style={styles.boostSubtitle}>Spend coins to climb the leaderboard faster</Text>

            <View style={styles.boostOptions}>
              {[
                { type: 'visibility' as const, label: 'Extra Visibility', cost: 500, description: 'Get highlighted for 7 days' },
                { type: 'multiplier' as const, label: 'Score Multiplier', cost: 1000, description: '2x coin earnings for 7 days' },
                { type: 'position' as const, label: 'Position Boost', cost: 2000, description: 'Jump 5 ranks instantly' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.boostOption,
                    boostType === option.type && styles.boostOptionSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setBoostType(option.type);
                  }}
                >
                  <View style={styles.boostOptionHeader}>
                    <Text style={styles.boostOptionLabel}>{option.label}</Text>
                    <View style={styles.boostCost}>
                      <Icon name="monetization-on" size={16} color={colors.tertiary} />
                      <Text style={styles.boostCostText}>{option.cost}</Text>
                    </View>
                  </View>
                  <Text style={styles.boostOptionDesc}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.boostActionButton}
              onPress={handleBoost}
              disabled={!coinsToSpend || parseInt(coinsToSpend) <= 0}
            >
              <Icon name="flash" size={20} color={colors.white} />
              <Text style={styles.boostActionText}>Activate Boost</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>
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
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  boostButtonText: {
    ...typography.button,
    color: colors.tertiary,
    fontWeight: '600',
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  timeframeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: colors.white,
  },
  userRankCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  userRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userRankTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  userRankStats: {
    gap: spacing.xs,
  },
  userRankStat: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  rankSection: {
    marginRight: spacing.md,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  rankText: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
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
  },
  userLocation: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statsSection: {
    marginRight: spacing.md,
  },
  entryStat: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  prizeSection: {
    alignItems: 'flex-end',
  },
  prizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  prizeText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  boostSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  boostTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  boostSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  boostOptions: {
    marginBottom: spacing.lg,
  },
  boostOption: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  boostOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  boostOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  boostOptionLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  boostCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  boostCostText: {
    ...typography.bodyBold,
    color: colors.tertiary,
  },
  boostOptionDesc: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  boostActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  boostActionText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default LeaderboardScreen;
