import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ProgressBarAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchBattlePass,
  purchaseBattlePass,
  claimBattlePassReward,
} from '../../store/slices/battlePassSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const CoinBattlePassScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { battlePass, loading } = useSelector((state: RootState) => state.battlePass);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedTier, setSelectedTier] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchBattlePass(user.id));
    }
  }, [dispatch, user?.id]);

  const handlePurchasePremium = async () => {
    if (!user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(purchaseBattlePass({
        userId: user.id,
        tier: 'premium',
      })).unwrap();

      showToast('Premium Battle Pass purchased!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to purchase Battle Pass', 'error');
    }
  };

  const handleClaimReward = async (tierIndex: number) => {
    if (!user?.id || !battlePass) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(claimBattlePassReward({
        userId: user.id,
        tierIndex,
      })).unwrap();

      showToast('Reward claimed!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to claim reward', 'error');
    }
  };

  const getTierIcon = (tier: any) => {
    if (tier.claimed) return 'check-circle';
    if (tier.unlocked) return 'lock-open';
    return 'lock';
  };

  const getTierColor = (tier: any) => {
    if (tier.claimed) return colors.success;
    if (tier.unlocked) return colors.primary;
    return colors.gray[400];
  };

  const renderTierCard = (tier: any, index: number) => {
    const isPremium = index >= 50; // First 50 tiers free, rest premium
    const canClaim = tier.unlocked && !tier.claimed;
    const isLocked = !tier.unlocked;

    return (
      <View key={index} style={styles.tierCard}>
        <View style={styles.tierHeader}>
          <View style={styles.tierNumber}>
            <Text style={styles.tierNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.tierInfo}>
            <Text style={styles.tierTitle}>{tier.title}</Text>
            <Text style={styles.tierDescription}>{tier.description}</Text>
          </View>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          )}
        </View>

        <View style={styles.tierReward}>
          <View style={styles.rewardIcon}>
            <Icon name="stars" size={20} color={colors.tertiary} />
          </View>
          <Text style={styles.rewardText}>
            +{tier.rewardCoins} coins
          </Text>
        </View>

        <View style={styles.tierAction}>
          {canClaim ? (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => handleClaimReward(index)}
            >
              <Icon name="card-giftcard" size={20} color={colors.white} />
              <Text style={styles.claimButtonText}>Claim Reward</Text>
            </TouchableOpacity>
          ) : isLocked ? (
            <View style={styles.lockedButton}>
              <Icon name="lock" size={20} color={colors.gray[400]} />
              <Text style={styles.lockedButtonText}>
                {isPremium ? 'Premium Required' : 'Locked'}
              </Text>
            </View>
          ) : (
            <View style={styles.claimedButton}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.claimedButtonText}>Claimed</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!battlePass) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Battle Pass...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = battlePass.currentProgress / battlePass.totalProgress;
  const freeTiers = battlePass.tiers.slice(0, 50);
  const premiumTiers = battlePass.tiers.slice(50);

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
        <Text style={styles.headerTitle}>Coin Battle Pass</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CoinAnalytics' as never)}
          style={styles.analyticsButton}
        >
          <Icon name="analytics" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressCard}
          >
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Season Progress</Text>
              <Text style={styles.progressSubtitle}>
                {battlePass.currentProgress} / {battlePass.totalProgress} XP
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>

            <View style={styles.progressStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{battlePass.currentTier}</Text>
                <Text style={styles.statLabel}>Current Tier</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{battlePass.totalTiers}</Text>
                <Text style={styles.statLabel}>Total Tiers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {Math.round(progress * 100)}%
                </Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Premium Upgrade */}
        {!battlePass.hasPremium && (
          <View style={styles.premiumSection}>
            <LinearGradient
              colors={[colors.tertiary, colors.tertiaryDark || colors.warning]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCard}
            >
              <View style={styles.premiumHeader}>
                <Icon name="workspace-premium" size={32} color={colors.white} />
                <View style={styles.premiumInfo}>
                  <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumDescription}>
                    Unlock all 100 tiers and exclusive rewards
                  </Text>
                </View>
              </View>

              <View style={styles.premiumBenefits}>
                <View style={styles.benefit}>
                  <Icon name="check" size={16} color={colors.white} />
                  <Text style={styles.benefitText}>50 additional tiers</Text>
                </View>
                <View style={styles.benefit}>
                  <Icon name="check" size={16} color={colors.white} />
                  <Text style={styles.benefitText}>Bonus coin multipliers</Text>
                </View>
                <View style={styles.benefit}>
                  <Icon name="check" size={16} color={colors.white} />
                  <Text style={styles.benefitText}>Exclusive achievements</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.premiumButton}
                onPress={handlePurchasePremium}
              >
                <Text style={styles.premiumButtonText}>
                  Upgrade for {battlePass.premiumCost} coins
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Tier Selection */}
        <View style={styles.tierSelection}>
          <View style={styles.tierTabs}>
            <TouchableOpacity
              style={[
                styles.tierTab,
                selectedTier === 'free' && styles.tierTabSelected,
              ]}
              onPress={() => setSelectedTier('free')}
            >
              <Text style={[
                styles.tierTabText,
                selectedTier === 'free' && styles.tierTabTextSelected,
              ]}>
                Free Tiers (1-50)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tierTab,
                selectedTier === 'premium' && styles.tierTabSelected,
              ]}
              onPress={() => setSelectedTier('premium')}
            >
              <Text style={[
                styles.tierTabText,
                selectedTier === 'premium' && styles.tierTabTextSelected,
              ]}>
                Premium Tiers (51-100)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tiers List */}
        <View style={styles.tiersSection}>
          <Text style={styles.sectionTitle}>
            {selectedTier === 'free' ? 'Free Tiers' : 'Premium Tiers'}
          </Text>

          {(selectedTier === 'free' ? freeTiers : premiumTiers).map((tier, index) =>
            renderTierCard(tier, selectedTier === 'free' ? index : index + 50)
          )}
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
  analyticsButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  progressHeader: {
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  progressSubtitle: {
    ...typography.body,
    color: colors.white + 'CC',
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.white + '33',
    borderRadius: 4,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.white + 'AA',
    marginTop: spacing.xxs,
  },
  premiumSection: {
    marginBottom: spacing.lg,
  },
  premiumCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  premiumInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  premiumTitle: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  premiumDescription: {
    ...typography.body,
    color: colors.white + 'CC',
    marginTop: spacing.xs,
  },
  premiumBenefits: {
    marginBottom: spacing.lg,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  benefitText: {
    ...typography.body,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  premiumButton: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    ...typography.button,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  tierSelection: {
    marginBottom: spacing.lg,
  },
  tierTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xs,
    ...shadows.card,
  },
  tierTab: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  tierTabSelected: {
    backgroundColor: colors.primary,
  },
  tierTabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  tierTabTextSelected: {
    color: colors.white,
  },
  tiersSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  tierCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tierNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tierNumberText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  tierDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  premiumBadge: {
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  premiumBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tierReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  rewardIcon: {
    marginRight: spacing.sm,
  },
  rewardText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  tierAction: {
    alignItems: 'flex-end',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  claimButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  lockedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  lockedButtonText: {
    ...typography.button,
    color: colors.gray[600],
  },
  claimedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  claimedButtonText: {
    ...typography.button,
    color: colors.success,
    fontWeight: 'bold',
  },
});

export default CoinBattlePassScreen;