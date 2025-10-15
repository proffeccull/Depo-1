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
  challengeId: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'donate' | 'coins' | 'referrals' | 'streak' | 'perfect_days';
  targetValue: number;
  rewardCoins: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Reward {
  id: string;
  type: 'coins' | 'badge' | 'title' | 'bonus_multiplier';
  title: string;
  description: string;
  value: number | string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  claimed: boolean;
  claimedAt?: string;
}

const ChallengeRewardsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { challengeId } = route.params as RouteParams;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadChallengeRewards();
  }, [challengeId]);

  const loadChallengeRewards = async () => {
    try {
      // Mock data - replace with actual API call
      const mockChallenge: Challenge = {
        id: challengeId,
        name: 'Donation Champion',
        description: 'Make 5 donations this week to earn bonus coins',
        type: 'donate',
        targetValue: 5,
        rewardCoins: 500,
        startDate: new Date(Date.now() - 86400000).toISOString(),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      };

      const mockRewards: Reward[] = [
        {
          id: 'reward_1',
          type: 'coins',
          title: 'Challenge Completion Bonus',
          description: 'Coins earned for completing the challenge',
          value: 500,
          icon: 'monetization-on',
          rarity: 'rare',
          claimed: true,
          claimedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'reward_2',
          type: 'badge',
          title: 'Donation Champion',
          description: 'Earned the prestigious Donation Champion badge',
          value: 'champion',
          icon: 'emoji-events',
          rarity: 'epic',
          claimed: true,
          claimedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'reward_3',
          type: 'bonus_multiplier',
          title: 'Donation Multiplier',
          description: '2x coin multiplier for donations (24 hours)',
          value: '2x_24h',
          icon: 'flash',
          rarity: 'legendary',
          claimed: false,
        },
        {
          id: 'reward_4',
          type: 'title',
          title: 'Philanthropist',
          description: 'Unlocked the "Philanthropist" profile title',
          value: 'philanthropist',
          icon: 'local-activity',
          rarity: 'rare',
          claimed: false,
        },
      ];

      setChallenge(mockChallenge);
      setRewards(mockRewards);
    } catch (error) {
      Alert.alert('Error', 'Failed to load challenge rewards');
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

  const renderReward = ({ item: reward }: { item: Reward }) => (
    <LinearGradient
      colors={getRarityGradient(reward.rarity)}
      style={styles.rewardCard}
    >
      <View style={styles.rewardHeader}>
        <View style={styles.rewardIcon}>
          <Icon
            name={reward.icon as any}
            size={32}
            color="#FFF"
          />
        </View>

        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle}>{reward.title}</Text>
          <View style={styles.rarityBadge}>
            <Text style={styles.rarityText}>{reward.rarity.toUpperCase()}</Text>
          </View>
        </View>

        {reward.claimed && (
          <View style={styles.claimedIndicator}>
            <Icon name="check-circle" size={24} color={colors.success} />
          </View>
        )}
      </View>

      <Text style={styles.rewardDescription}>{reward.description}</Text>

      <View style={styles.rewardValue}>
        <Text style={styles.rewardValueText}>
          {reward.type === 'coins' && `+${reward.value} coins`}
          {reward.type === 'badge' && 'Badge Unlocked'}
          {reward.type === 'title' && 'Title Unlocked'}
          {reward.type === 'bonus_multiplier' && `${reward.value}`}
        </Text>
      </View>

      {reward.claimed ? (
        <View style={styles.claimedBadge}>
          <Icon name="celebration" size={16} color="#FFF" />
          <Text style={styles.claimedText}>
            Claimed {reward.claimedAt ? new Date(reward.claimedAt).toLocaleDateString() : 'Recently'}
          </Text>
        </View>
      ) : (
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
      )}
    </LinearGradient>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Challenge Not Found</Text>
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

  const claimedRewards = rewards.filter(r => r.claimed).length;
  const totalRewards = rewards.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Summary */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.summaryCard}
        >
          <Text style={styles.challengeName}>{challenge.name}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{claimedRewards}</Text>
              <Text style={styles.statLabel}>Claimed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalRewards - claimedRewards}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalRewards}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Rewards List */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Your Rewards</Text>

          <FlatList
            data={rewards}
            renderItem={renderReward}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.rewardsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyRewards}>
                <Icon name="gift" size={64} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No Rewards Yet</Text>
                <Text style={styles.emptyText}>
                  Complete challenges to unlock amazing rewards!
                </Text>
              </View>
            }
          />
        </View>

        {/* Reward Categories Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Reward Types</Text>

          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: colors.tertiary + '20' }]}>
                <Icon name="monetization-on" size={24} color={colors.tertiary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Coins</Text>
                <Text style={styles.infoText}>Bonus charity coins for your wallet</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: colors.warning + '20' }]}>
                <Icon name="emoji-events" size={24} color={colors.warning} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Badges</Text>
                <Text style={styles.infoText}>Achievement badges for your profile</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: colors.info + '20' }]}>
                <Icon name="flash" size={24} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Boosters</Text>
                <Text style={styles.infoText}>Temporary multipliers and bonuses</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: colors.success + '20' }]}>
                <Icon name="local-activity" size={24} color={colors.success} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Titles</Text>
                <Text style={styles.infoText}>Special titles for your profile</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rarity Guide */}
        <View style={styles.raritySection}>
          <Text style={styles.sectionTitle}>Rarity Guide</Text>

          <View style={styles.rarityGuide}>
            <View style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: colors.gray[500] }]} />
              <Text style={styles.rarityName}>Common</Text>
            </View>
            <View style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: colors.info }]} />
              <Text style={styles.rarityName}>Rare</Text>
            </View>
            <View style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: colors.tertiary }]} />
              <Text style={styles.rarityName}>Epic</Text>
            </View>
            <View style={styles.rarityItem}>
              <View style={[styles.rarityDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.rarityName}>Legendary</Text>
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
  summaryCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  challengeName: {
    ...typography.h2,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    ...typography.bodyRegular,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  progressStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
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
  rewardsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
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
  rewardIcon: {
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
  rarityBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  rarityText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  claimedIndicator: {
    marginLeft: spacing.sm,
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
  emptyRewards: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: spacing.lg,
  },
  infoCards: {
    gap: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  raritySection: {
    marginTop: spacing.lg,
  },
  rarityGuide: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  rarityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rarityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  rarityName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

export default ChallengeRewardsScreen;