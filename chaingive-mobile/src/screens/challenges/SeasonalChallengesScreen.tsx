import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchSeasonalChallenges,
  joinChallenge,
  fetchBattlePass,
  purchaseBattlePass,
  claimBattlePassReward,
} from '../../store/slices/challengesSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

const SeasonalChallengesScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { seasonalChallenges, battlePass, userProgress, loading } = useSelector(
    (state: RootState) => state.challenges
  );
  const { balance } = useSelector((state: RootState) => state.coin);
  const { userSubscription } = useSelector((state: RootState) => state.subscription);

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [activeTab, setActiveTab] = useState<'challenges' | 'battlepass'>('challenges');

  useEffect(() => {
    dispatch(fetchSeasonalChallenges(selectedSeason));
    dispatch(fetchBattlePass(selectedSeason));
  }, [dispatch, selectedSeason]);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(joinChallenge({ challengeId, userId: 'current-user-id' })).unwrap();
      showToast('Successfully joined challenge!', 'success');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to join challenge', 'error');
    }
  };

  const handlePurchaseBattlePass = async () => {
    if (!battlePass) return;

    if (balance.current < battlePass.premiumPrice) {
      showToast('Insufficient coins for Battle Pass', 'error');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(purchaseBattlePass({
        battlePassId: battlePass.id,
        userId: 'current-user-id'
      })).unwrap();
      showToast('Battle Pass purchased successfully!', 'success');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to purchase Battle Pass', 'error');
    }
  };

  const handleClaimReward = async (tier: number, isPremium: boolean) => {
    if (!battlePass) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(claimBattlePassReward({
        battlePassId: battlePass.id,
        tier,
        userId: 'current-user-id',
        isPremium,
      })).unwrap();
      showToast('Reward claimed successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to claim reward', 'error');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
      case 'extreme': return colors.tertiary;
      default: return colors.text.secondary;
    }
  };

  const renderChallengeCard = ({ item: challenge }: { item: any }) => {
    const userChallengeProgress = userProgress.find(p => p.challengeId === challenge.id);
    const isJoined = !!userChallengeProgress;
    const progress = userChallengeProgress?.progress || 0;
    const progressPercent = (progress / challenge.target) * 100;

    return (
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => navigation.navigate('ChallengeDetail' as never, { challengeId: challenge.id })}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.challengeHeader}>
          <View style={styles.challengeType}>
            <Icon
              name={
                challenge.type === 'donation' ? 'favorite' :
                challenge.type === 'cycle' ? 'refresh' :
                challenge.type === 'referral' ? 'person-add' :
                challenge.type === 'streak' ? 'local-fire-department' :
                'emoji-events'
              }
              size={16}
              color={colors.white}
            />
            <Text style={styles.challengeTypeText}>
              {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
            </Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
            <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.challengeContent}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription} numberOfLines={2}>
            {challenge.description}
          </Text>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {progress.toLocaleString()} / {challenge.target.toLocaleString()}
              </Text>
              <Text style={styles.progressPercent}>{progressPercent.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]}
              />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.challengeStats}>
            <View style={styles.stat}>
              <Icon name="people" size={14} color={colors.text.secondary} />
              <Text style={styles.statText}>{challenge.participants}</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="trophy" size={14} color={colors.tertiary} />
              <Text style={styles.statText}>{challenge.prizePool.toLocaleString()}</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="schedule" size={14} color={colors.text.secondary} />
              <Text style={styles.statText}>
                {Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isJoined && styles.joinedButton,
            challenge.status !== 'active' && styles.disabledButton,
          ]}
          onPress={() => isJoined ? null : handleJoinChallenge(challenge.id)}
          disabled={isJoined || challenge.status !== 'active'}
        >
          <Text style={[
            styles.actionButtonText,
            isJoined && styles.joinedButtonText,
          ]}>
            {isJoined ? 'Joined ✓' :
             challenge.status === 'upcoming' ? 'Coming Soon' :
             challenge.status === 'completed' ? 'Completed' :
             `Join (${challenge.entryFee} coins)`}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderBattlePassTier = (tier: number, reward: any, isPremium: boolean) => {
    if (!battlePass) return null;

    const isUnlocked = battlePass.currentTier >= tier;
    const isClaimed = false; // This would come from user data
    const canClaim = isUnlocked && !isClaimed;

    return (
      <View key={`${isPremium ? 'premium' : 'free'}-${tier}`} style={styles.tierCard}>
        <View style={styles.tierHeader}>
          <Text style={styles.tierNumber}>Tier {tier}</Text>
          {isPremium && <View style={styles.premiumIndicator}><Text style={styles.premiumText}>PREMIUM</Text></View>}
        </View>

        <View style={styles.tierReward}>
          <Icon name="monetization-on" size={20} color={colors.tertiary} />
          <Text style={styles.rewardText}>+{reward.coins} coins</Text>
        </View>

        {canClaim && (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => handleClaimReward(tier, isPremium)}
          >
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>
        )}

        {!isUnlocked && (
          <View style={styles.lockedOverlay}>
            <Icon name="lock" size={24} color={colors.gray[400]} />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Seasonal Challenges</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Season Selector */}
      <View style={styles.seasonSelector}>
        {[1, 2, 3, 4].map((season) => (
          <TouchableOpacity
            key={season}
            style={[
              styles.seasonButton,
              selectedSeason === season && styles.seasonButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedSeason(season);
            }}
          >
            <Text style={[
              styles.seasonButtonText,
              selectedSeason === season && styles.seasonButtonTextSelected,
            ]}>
              Season {season}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {(['challenges', 'battlepass'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab);
            }}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === tab && styles.tabButtonTextSelected,
            ]}>
              {tab === 'challenges' ? 'Challenges' : 'Battle Pass'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'challenges' ? (
        /* Challenges List */
        <FlatList
          data={seasonalChallenges}
          renderItem={renderChallengeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.challengesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="emoji-events" size={64} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No Challenges Available</Text>
              <Text style={styles.emptyMessage}>
                Check back later for new seasonal challenges!
              </Text>
            </View>
          }
        />
      ) : (
        /* Battle Pass */
        <ScrollView
          style={styles.battlePassContainer}
          contentContainerStyle={styles.battlePassContent}
          showsVerticalScrollIndicator={false}
        >
          {battlePass && (
            <>
              {/* Battle Pass Header */}
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.battlePassHeader}
              >
                <Text style={styles.battlePassTitle}>{battlePass.title}</Text>
                <Text style={styles.battlePassDescription}>{battlePass.description}</Text>

                {/* XP Progress */}
                <View style={styles.xpProgress}>
                  <Text style={styles.xpText}>
                    XP: {battlePass.xpCurrent} / {battlePass.xpRequired}
                  </Text>
                  <View style={styles.xpBar}>
                    <View
                      style={[
                        styles.xpFill,
                        { width: `${(battlePass.xpCurrent / battlePass.xpRequired) * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.tierText}>
                    Tier {battlePass.currentTier} / {battlePass.totalTiers}
                  </Text>
                </View>

                {/* Purchase Button */}
                {!battlePass.isPremiumPurchased && (
                  <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={handlePurchaseBattlePass}
                  >
                    <Text style={styles.purchaseButtonText}>
                      Unlock Premium ({battlePass.premiumPrice} coins)
                    </Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>

              {/* Free Rewards */}
              <View style={styles.rewardsSection}>
                <Text style={styles.rewardsTitle}>Free Rewards</Text>
                <View style={styles.tiersGrid}>
                  {battlePass.freeRewards.map((reward, index) =>
                    renderBattlePassTier(index + 1, reward, false)
                  )}
                </View>
              </View>

              {/* Premium Rewards */}
              {battlePass.isPremiumPurchased && (
                <View style={styles.rewardsSection}>
                  <Text style={styles.rewardsTitle}>Premium Rewards</Text>
                  <View style={styles.tiersGrid}>
                    {battlePass.premiumRewards.map((reward, index) =>
                      renderBattlePassTier(index + 1, reward, true)
                    )}
                  </View>
                </View>
              )}

              {/* XP Sources */}
              <View style={styles.xpSourcesSection}>
                <Text style={styles.xpSourcesTitle}>Earn XP By:</Text>
                {battlePass.xpSources.map((source, index) => (
                  <View key={index} style={styles.xpSource}>
                    <Text style={styles.xpSourceText}>{source.description}</Text>
                    <Text style={styles.xpAmount}>+{source.xpAmount} XP</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
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
    ...typography.body,
    color: colors.text.secondary,
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
  placeholder: {
    width: 40,
  },
  seasonSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  seasonButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  seasonButtonSelected: {
    backgroundColor: colors.primary,
  },
  seasonButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  seasonButtonTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  tabButtonSelected: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  tabButtonTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  challengesList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  challengeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  challengeType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  challengeTypeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  challengeContent: {
    marginBottom: spacing.md,
  },
  challengeTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  progressPercent: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  joinedButton: {
    backgroundColor: colors.success,
  },
  joinedButtonText: {
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.gray[300],
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
  battlePassContainer: {
    flex: 1,
  },
  battlePassContent: {
    paddingBottom: spacing['4xl'],
  },
  battlePassHeader: {
    margin: spacing.md,
    borderRadius: 16,
    padding: spacing.lg,
  },
  battlePassTitle: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  battlePassDescription: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  xpProgress: {
    marginBottom: spacing.lg,
  },
  xpText: {
    ...typography.caption,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  tierText: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
  },
  purchaseButton: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: 'bold',
  },
  rewardsSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  rewardsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  tiersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tierCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    width: (screenWidth - spacing.md * 2 - spacing.sm) / 2,
    ...shadows.card,
    position: 'relative',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tierNumber: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  premiumIndicator: {
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
  },
  premiumText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tierReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardText: {
    ...typography.bodyBold,
    color: colors.tertiary,
  },
  claimButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  claimButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpSourcesSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  xpSourcesTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  xpSource: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  xpSourceText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  xpAmount: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default SeasonalChallengesScreen;