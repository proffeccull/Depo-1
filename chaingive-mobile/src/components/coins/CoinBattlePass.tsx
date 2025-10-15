import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

interface BattlePassTier {
  id: number;
  name: string;
  description: string;
  coinReward: number;
  bonusReward?: number;
  unlocked: boolean;
  claimed: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

interface CoinBattlePassProps {
  tiers: BattlePassTier[];
  currentProgress: number;
  totalProgress: number;
  userCoins: number;
  premiumUnlocked: boolean;
  onClaimReward?: (tierId: number) => void;
  onPurchasePremium?: () => void;
  seasonName?: string;
  seasonEndDate?: Date;
}

const CoinBattlePass: React.FC<CoinBattlePassProps> = ({
  tiers,
  currentProgress,
  totalProgress,
  userCoins,
  premiumUnlocked,
  onClaimReward,
  onPurchasePremium,
  seasonName = "Coin Master Season",
  seasonEndDate,
}) => {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const progressAnim = useRef(new Animated.Value(currentProgress)).current;
  const tierAnim = useRef(new Animated.Value(0)).current;
  const premiumGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress changes
    Animated.timing(progressAnim, {
      toValue: currentProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [currentProgress]);

  useEffect(() => {
    if (!premiumUnlocked) {
      // Premium glow animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(premiumGlowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(premiumGlowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      glowAnimation.start();
    }
  }, [premiumUnlocked]);

  const getRarityConfig = (rarity: string) => {
    const configs = {
      common: { color: colors.gray[400], bgColor: colors.gray[100] },
      rare: { color: colors.info, bgColor: colors.info + '20' },
      epic: { color: colors.secondary, bgColor: colors.secondary + '20' },
      legendary: { color: '#FFD700', bgColor: '#FFD70020' },
    };
    return configs[rarity as keyof typeof configs] || configs.common;
  };

  const handleClaimReward = async (tier: BattlePassTier) => {
    if (!tier.unlocked || tier.claimed) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
    await coinSounds.playMilestoneReach();

    // Animate tier claim
    Animated.sequence([
      Animated.timing(tierAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(tierAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    onClaimReward?.(tier.id);
  };

  const handlePurchasePremium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPurchasePremium?.();
  };

  const progressPercentage = (currentProgress / totalProgress) * 100;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, totalProgress],
    outputRange: ['0%', '100%'],
  });

  const premiumGlowOpacity = premiumGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const renderTier = (tier: BattlePassTier, index: number) => {
    const rarityConfig = getRarityConfig(tier.rarity);
    const isPremium = index >= 10 && !premiumUnlocked; // First 10 are free

    return (
      <Animated.View
        key={tier.id}
        style={[
          styles.tierContainer,
          tier.claimed && styles.tierClaimed,
          selectedTier === tier.id && styles.tierSelected,
          { transform: [{ scale: selectedTier === tier.id ? tierAnim : 1 }] },
        ]}
      >
        <TouchableOpacity
          style={styles.tierTouchable}
          onPress={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
          disabled={isPremium && !premiumUnlocked}
          activeOpacity={0.8}
        >
          {/* Tier Header */}
          <View style={styles.tierHeader}>
            <View style={styles.tierNumber}>
              <Text style={styles.tierNumberText}>{tier.id}</Text>
            </View>
            <View style={[styles.rarityBadge, { backgroundColor: rarityConfig.bgColor }]}>
              <Text style={[styles.rarityText, { color: rarityConfig.color }]}>
                {tier.rarity.toUpperCase()}
              </Text>
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Icon name="lock" size={12} color={colors.white} />
              </View>
            )}
          </View>

          {/* Tier Content */}
          <View style={styles.tierContent}>
            <View style={[styles.tierIcon, { backgroundColor: rarityConfig.bgColor }]}>
              <Icon name={tier.icon} size={24} color={rarityConfig.color} />
            </View>
            <View style={styles.tierInfo}>
              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={styles.tierDescription} numberOfLines={2}>
                {tier.description}
              </Text>
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.tierRewards}>
            <View style={styles.coinReward}>
              <Icon name="monetization-on" size={16} color={colors.tertiary} />
              <Text style={styles.coinAmount}>+{tier.coinReward}</Text>
            </View>
            {tier.bonusReward && premiumUnlocked && (
              <View style={styles.bonusReward}>
                <Icon name="add" size={14} color={colors.success} />
                <Text style={styles.bonusAmount}>+{tier.bonusReward}</Text>
              </View>
            )}
          </View>

          {/* Claim Button */}
          {tier.unlocked && !tier.claimed && (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => handleClaimReward(tier)}
            >
              <Text style={styles.claimButtonText}>Claim Reward</Text>
              <Icon name="check-circle" size={16} color={colors.white} />
            </TouchableOpacity>
          )}

          {tier.claimed && (
            <View style={styles.claimedBadge}>
              <Icon name="check-circle" size={16} color={colors.success} />
              <Text style={styles.claimedText}>Claimed</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const timeLeft = seasonEndDate ? Math.max(0, seasonEndDate.getTime() - Date.now()) : 0;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="military-tech" size={24} color={colors.primary} />
          <View>
            <Text style={styles.headerTitle}>{seasonName}</Text>
            {seasonEndDate && (
              <Text style={styles.seasonTime}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Season ended'}
              </Text>
            )}
          </View>
        </View>

        {!premiumUnlocked && (
          <Animated.View
            style={[
              styles.premiumButton,
              {
                shadowOpacity: premiumGlowOpacity,
                shadowRadius: 10,
                elevation: 10,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.premiumTouchable}
              onPress={handlePurchasePremium}
            >
              <Icon name="star" size={16} color={colors.white} />
              <Text style={styles.premiumText}>Get Premium</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Season Progress</Text>
          <Text style={styles.progressText}>
            {currentProgress} / {totalProgress}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                backgroundColor: premiumUnlocked ? colors.secondary : colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressPercent}>
          {Math.round(progressPercentage)}% Complete
        </Text>
      </View>

      {/* Premium Benefits */}
      {!premiumUnlocked && (
        <View style={styles.premiumBenefits}>
          <Text style={styles.benefitsTitle}>Premium Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon name="double-arrow" size={16} color={colors.secondary} />
              <Text style={styles.benefitText}>2x Coin Rewards</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="style" size={16} color={colors.secondary} />
              <Text style={styles.benefitText}>Exclusive Skins</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="local-fire-department" size={16} color={colors.secondary} />
              <Text style={styles.benefitText}>Bonus Challenges</Text>
            </View>
          </View>
        </View>
      )}

      {/* Tiers List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tiersContainer}
      >
        {tiers.map((tier, index) => renderTier(tier, index))}
      </ScrollView>
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
  seasonTime: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  premiumButton: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
  },
  premiumTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  premiumText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  progressContainer: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  progressText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  premiumBenefits: {
    padding: spacing.lg,
    backgroundColor: colors.secondary + '10',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  benefitsTitle: {
    ...typography.h4,
    color: colors.secondary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  tiersContainer: {
    padding: spacing.lg,
  },
  tierContainer: {
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  tierSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  tierClaimed: {
    opacity: 0.7,
  },
  tierTouchable: {
    padding: spacing.md,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tierNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tierNumberText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  rarityText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: 'bold',
  },
  premiumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tierIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  tierDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  tierRewards: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  coinReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  coinAmount: {
    ...typography.bodyBold,
    color: colors.tertiary,
    marginLeft: spacing.xxs,
  },
  bonusReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 16,
  },
  bonusAmount: {
    ...typography.bodyBold,
    color: colors.success,
    marginLeft: spacing.xxs,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  claimButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[200],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  claimedText: {
    ...typography.button,
    color: colors.text.secondary,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
});

export default CoinBattlePass;