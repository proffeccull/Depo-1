import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteParams {
  seasonId: string;
}

interface BattlePassSeason {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalTiers: number;
  currentTier: number;
  progressToNextTier: number;
}

interface BattlePassReward {
  id: string;
  tier: number;
  type: 'free' | 'premium';
  rewardType: 'coins' | 'badge' | 'title' | 'skin' | 'booster' | 'nft';
  title: string;
  description: string;
  value: number | string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  claimed: boolean;
  claimedAt?: string;
  unlocked: boolean;
}

const BattlePassRewardsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { seasonId } = route.params as RouteParams;

  const [season, setSeason] = useState<BattlePassSeason | null>(null);
  const [rewards, setRewards] = useState<BattlePassReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(1);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadBattlePassData();
  }, [seasonId]);

  const loadBattlePassData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSeason: BattlePassSeason = {
        id: seasonId,
        name: 'Season of Giving',
        description: 'Earn rewards by completing charitable activities',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        totalTiers: 50,
        currentTier: 12,
        progressToNextTier: 75,
      };

      const mockRewards: BattlePassReward[] = [
        // Free rewards
        {
          id: 'free_1',
          tier: 1,
          type: 'free',
          rewardType: 'coins',
          title: 'Welcome Bonus',
          description: '100 coins to start your journey',
          value: 100,
          icon: 'monetization-on',
          rarity: 'common',
          claimed: true,
          claimedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          unlocked: true,
        },
        {
          id: 'free_5',
          tier: 5,
          type: 'free',
          rewardType: 'badge',
          title: 'First Steps',
          description: 'Earned your first achievement badge',
          value: 'first_steps',
          icon: 'emoji-events',
          rarity: 'common',
          claimed: true,
          unlocked: true,
        },
        {
          id: 'free_10',
          tier: 10,
          type: 'free',
          rewardType: 'booster',
          title: 'Donation Multiplier',
          description: '1.5x coins for donations (1 hour)',
          value: '1.5x_1h',
          icon: 'flash',
          rarity: 'rare',
          claimed: false,
          unlocked: true,
        },
        {
          id: 'free_15',
          tier: 15,
          type: 'free',
          rewardType: 'title',
          title: 'Helper',
          description: 'Unlocked the "Helper" profile title',
          value: 'helper',
          icon: 'local-activity',
          rarity: 'common',
          claimed: false,
          unlocked: false,
        },

        // Premium rewards
        {
          id: 'premium_1',
          tier: 1,
          type: 'premium',
          rewardType: 'coins',
          title: 'Premium Welcome',
          description: '500 coins for premium members',
          value: 500,
          icon: 'stars',
          rarity: 'rare',
          claimed: false,
          unlocked: true,
        },
        {
          id: 'premium_10',
          tier: 10,
          type: 'premium',
          rewardType: 'skin',
          title: 'Golden Profile',
          description: 'Exclusive golden profile theme',
          value: 'golden_theme',
          icon: 'palette',
          rarity: 'epic',
          claimed: false,
          unlocked: true,
        },
        {
          id: 'premium_25',
          tier: 25,
          type: 'premium',
          rewardType: 'nft',
          title: 'Charity Champion NFT',
          description: 'Limited edition champion NFT',
          value: 'champion_nft',
          icon: 'image',
          rarity: 'legendary',
          claimed: false,
          unlocked: false,
        },
      ];

      setSeason(mockSeason);
      setRewards(mockRewards);
      setSelectedTier(mockSeason.currentTier);
    } catch (error) {
      Alert.alert('Error', 'Failed to load battle pass data');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return colors.gray[500];
      case 'rare':
        return colors.info;
      case 'epic':
        return colors.tertiary;
      case 'legendary':
        return colors.warning;
      default:
        return colors.gray[500];
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return ['#9CA3AF', '#6B7280'];
      case 'rare':
        return ['#3B82F6', '#1D4ED8'];
      case 'epic':
        return ['#8B5CF6', '#7C3AED'];
      case 'legendary':
        return ['#F59E0B', '#D97706'];
      default:
        return [colors.gray[500], colors.gray[600]];
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Mock reward claim - replace with actual API call
      Alert.alert(
        'Reward Claimed!',
        'Congratulations! Your reward has been added to your account.',
        [{ text: 'Awesome!', style: 'default' }]
      );

      setRewards(prev => prev.map(reward =>
        reward.id === rewardId
          ? { ...reward, claimed: true, claimedAt: new Date().toISOString() }
          : reward
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    } finally {
      setClaimingReward(null);
    }
  };

  const getRewardsForTier = (tier: number) => {
    return rewards.filter(reward => reward.tier === tier);
  };

  const renderTierCard = ({ item: tier }: { item: number }) => {
    const tierRewards = getRewardsForTier(tier);
    const isCurrentTier = tier === season?.currentTier;
    const isUnlocked = tier <= (season?.currentTier || 0);
    const isCompleted = tier < (season?.currentTier || 0);

    return (
      <TouchableOpacity
        style={[
          styles.tierCard,
          isCurrentTier && styles.tierCardCurrent,
          isCompleted && styles.tierCardCompleted,
        ]}
        onPress={() => setSelectedTier(tier)}
        activeOpacity={0.9}
      >
        <View style={styles.tierHeader}>
          <View style={styles.tierNumber}>
            <Text style={styles.tierNumberText}>{tier}</Text>
          </View>

          <View style={styles.tierStatus}>
            {isCompleted && (
              <Icon name="check-circle" size={20} color={colors.success} />
            )}
            {isCurrentTier && !isCompleted && (
              <View style={styles.currentIndicator}>
                <Text style={styles.currentText}>CURRENT</Text>
              </View>
            )}
            {!isUnlocked && (
              <Icon name="lock" size={20} color={colors.gray[400]} />
            )}
          </View>
        </View>

        <View style={styles.tierRewards}>
          {tierRewards.map((reward) => (
            <View key={reward.id} style={styles.tierReward}>
              <View style={[
                styles.rewardIcon,
                { backgroundColor: getRarityColor(reward.rarity) + '20' }
              ]}>
                <Icon
                  name={reward.icon as any}
                  size={16}
                  color={getRarityColor(reward.rarity)}
                />
              </View>
              <Text style={styles.rewardName} numberOfLines={1}>
                {reward.title}
              </Text>
              {reward.claimed && (
                <Icon name="check" size={14} color={colors.success} />
              )}
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRewardDetail = ({ item: reward }: { item: BattlePassReward }) => (
    <LinearGradient
      colors={getRarityGradient(reward.rarity)}
      style={styles.rewardCard}
    >
      <View style={styles.rewardHeader}>
        <View style={styles.rewardIconLarge}>
          <Icon
            name={reward.icon as any}
            size={32}
            color="#FFF"
          />
        </View>

        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle}>{reward.title}</Text>
          <View style={styles.rewardMeta}>
            <Text style={styles.rewardTier}>Tier {reward.tier}</Text>
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityText}>{reward.rarity.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.rewardType}>
          <Text style={styles.rewardTypeText}>
            {reward.type === 'premium' ? 'PREMIUM' : 'FREE'}
          </Text>
        </View>
      </View>

      <Text style={styles.rewardDescription}>{reward.description}</Text>

      <View style={styles.rewardValue}>
        <Text style={styles.rewardValueText}>
          {reward.rewardType === 'coins' && `+${reward.value} coins`}
          {reward.rewardType === 'badge' && 'Badge Unlocked'}
          {reward.rewardType === 'title' && 'Title Unlocked'}
          {reward.rewardType === 'skin' && 'Theme Unlocked'}
          {reward.rewardType === 'booster' && `${reward.value}`}
          {reward.rewardType === 'nft' && 'NFT Unlocked'}
        </Text>
      </View>

      {reward.claimed ? (
        <View style={styles.claimedBadge}>
          <Icon name="celebration" size={16} color="#FFF" />
          <Text style={styles.claimedText}>
            Claimed {reward.claimedAt ? new Date(reward.claimedAt).toLocaleDateString() : 'Recently'}
          </Text>
        </View>
      ) : reward.unlocked ? (
        <TouchableOpacity
          style={styles.claimButton}
          onPress={() => handleClaimReward(reward.id)}
          disabled={claimingReward === reward.id}
        >
          {claimingReward === reward.id ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.claimButtonText}>Claim Reward</Text>
              <Icon name="gift" size={16} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.lockedBadge}>
          <Icon name="lock" size={16} color="#FFF" />
          <Text style={styles.lockedText}>Locked</Text>
        </View>
      )}
    </LinearGradient>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading battle pass...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!season) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Battle Pass Not Found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedTierRewards = getRewardsForTier(selectedTier);
  const claimedRewards = rewards.filter(r => r.claimed).length;
  const totalRewards = rewards.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Pass Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Season Overview */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.seasonCard}
        >
          <Text style={styles.seasonName}>{season.name}</Text>
          <Text style={styles.seasonDescription}>{season.description}</Text>

          <View style={styles.seasonStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{season.currentTier}</Text>
              <Text style={styles.statLabel}>Current Tier</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{claimedRewards}</Text>
              <Text style={styles.statLabel}>Rewards Claimed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(season.progressToNextTier)}%</Text>
              <Text style={styles.statLabel}>To Next Tier</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBarFill, { width: `${season.progressToNextTier}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {season.currentTier} / {season.totalTiers} tiers completed
            </Text>
          </View>
        </LinearGradient>

        {/* Tier Selection */}
        <View style={styles.tiersSection}>
          <Text style={styles.sectionTitle}>Select Tier</Text>
          <FlatList
            data={Array.from({ length: season.totalTiers }, (_, i) => i + 1)}
            renderItem={renderTierCard}
            keyExtractor={(item) => item.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tiersList}
            initialScrollIndex={Math.max(0, season.currentTier - 3)}
            getItemLayout={(data, index) => ({
              length: 100,
              offset: 100 * index,
              index,
            })}
          />
        </View>

        {/* Selected Tier Rewards */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Tier {selectedTier} Rewards</Text>

          <FlatList
            data={selectedTierRewards}
            renderItem={renderRewardDetail}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.rewardsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyRewards}>
                <Icon name="gift" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No Rewards</Text>
                <Text style={styles.emptyText}>
                  This tier doesn't have any rewards yet.
                </Text>
              </View>
            }
          />
        </View>

        {/* Reward Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Reward Types</Text>

          <View style={styles.categoriesGrid}>
            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.tertiary + '20' }]}>
                <Icon name="monetization-on" size={24} color={colors.tertiary} />
              </View>
              <Text style={styles.categoryName}>Coins</Text>
            </View>

            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.warning + '20' }]}>
                <Icon name="emoji-events" size={24} color={colors.warning} />
              </View>
              <Text style={styles.categoryName}>Badges</Text>
            </View>

            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.info + '20' }]}>
                <Icon name="flash" size={24} color={colors.info} />
              </View>
              <Text style={styles.categoryName}>Boosters</Text>
            </View>

            <View style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.success + '20' }]}>
                <Icon name="image" size={24} color={colors.success} />
              </View>
              <Text style={styles.categoryName}>NFTs</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.button,
    color: colors.white,
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
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  seasonCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  seasonName: {
    ...typography.h2,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  seasonDescription: {
    ...typography.bodyRegular,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  seasonStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: '#FFF',
    textAlign: 'center',
  },
  tiersSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  tiersList: {
    paddingVertical: spacing.sm,
  },
  tierCard: {
    width: 90,
    height: 90,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm,
    marginRight: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  tierCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  tierCardCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tierNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  tierNumberText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  tierStatus: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  currentIndicator: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tierRewards: {
    gap: spacing.xs,
  },
  tierReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardName: {
    ...typography.caption,
    color: colors.text.primary,
    flex: 1,
    fontSize: 10,
  },
  rewardsSection: {
    marginTop: spacing.lg,
  },
  rewardsList: {
    paddingBottom: spacing.md,
  },
  rewardCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rewardIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    ...typography.h4,
    color: '#FFF',
    fontWeight: 'bold',
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  rewardTier: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.9,
  },
  rarityBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  rarityText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  rewardType: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  rewardTypeText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  rewardDescription: {
    ...typography.bodyRegular,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: spacing.md,
  },
  rewardValue: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rewardValueText: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  claimedText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  claimButtonText: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  lockedText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyRewards: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  categoriesSection: {
    marginTop: spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default BattlePassRewardsScreen;