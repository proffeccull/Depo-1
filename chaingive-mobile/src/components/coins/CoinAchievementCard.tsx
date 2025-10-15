import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { shadows } from '../../theme/shadows';

const { width: screenWidth } = Dimensions.get('window');

interface CoinAchievementCardProps {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  coinReward: number;
  serialNumber: number;
  totalSupply: number;
  unlockedAt: Date;
  canMintNFT: boolean;
  mintCost: number;
  isTradeable: boolean;
  marketValue: number;
  glowColor: string;
  animationType: string;
  unlocked: boolean;
  onPress?: () => void;
  onMintNFT?: () => void;
  onTrade?: () => void;
}

const CoinAchievementCard: React.FC<CoinAchievementCardProps> = ({
  name,
  description,
  rarity,
  coinReward,
  serialNumber,
  totalSupply,
  unlockedAt,
  canMintNFT,
  mintCost,
  isTradeable,
  marketValue,
  glowColor,
  animationType,
  unlocked,
  onPress,
  onMintNFT,
  onTrade,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unlocked && rarity === 'mythic') {
      // Rainbow shimmer for mythic cards
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerAnimation.start();

      // Pulsing glow
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      glowAnimation.start();

      return () => {
        shimmerAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [unlocked, rarity]);

  const getRarityConfig = () => {
    const configs = {
      common: {
        colors: ['#CD7F32', '#8B4513'],
        glowColor: '#CD7F32',
        borderColor: '#CD7F32',
        textColor: colors.white,
      },
      rare: {
        colors: ['#C0C0C0', '#808080'],
        glowColor: '#C0C0C0',
        borderColor: '#C0C0C0',
        textColor: colors.white,
      },
      epic: {
        colors: ['#9932CC', '#8A2BE2'],
        glowColor: '#9932CC',
        borderColor: '#9932CC',
        textColor: colors.white,
      },
      legendary: {
        colors: ['#FFD700', '#FFA500'],
        glowColor: '#FFD700',
        borderColor: '#FFD700',
        textColor: colors.black,
      },
      mythic: {
        colors: ['#FF1493', '#00CED1', '#FFD700', '#FF69B4'],
        glowColor: '#FF1493',
        borderColor: '#FF1493',
        textColor: colors.white,
      },
    };
    return configs[rarity];
  };

  const rarityConfig = getRarityConfig();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onPress();
    }
  };

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          shadowColor: rarityConfig.glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowAnim,
          shadowRadius: 20,
          elevation: 20,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={rarityConfig.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Shimmer overlay for mythic cards */}
          {rarity === 'mythic' && unlocked && (
            <Animated.View
              style={[
                styles.shimmerOverlay,
                { opacity: shimmerOpacity },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.rarityBadge}>
              <Text style={[styles.rarityText, { color: rarityConfig.textColor }]}>
                {rarity.toUpperCase()}
              </Text>
            </View>
            <View style={styles.serialNumber}>
              <Text style={[styles.serialText, { color: rarityConfig.textColor }]}>
                #{serialNumber.toString().padStart(5, '0')}
              </Text>
            </View>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon
              name="emoji-events"
              size={48}
              color={rarityConfig.textColor}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.name, { color: rarityConfig.textColor }]}>
              {name}
            </Text>
            <Text style={[styles.description, { color: rarityConfig.textColor + 'CC' }]}>
              {description}
            </Text>
          </View>

          {/* Coin Reward */}
          <View style={styles.rewardContainer}>
            <View style={styles.coinReward}>
              <Icon name="monetization-on" size={20} color={colors.tertiary} />
              <Text style={styles.coinAmount}>+{coinReward.toLocaleString()}</Text>
            </View>
            <Text style={[styles.coinLabel, { color: rarityConfig.textColor + 'AA' }]}>
              coins earned
            </Text>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {canMintNFT && (
              <TouchableOpacity
                style={[styles.actionButton, styles.mintButton]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onMintNFT?.();
                }}
              >
                <Icon name="token" size={16} color={colors.white} />
                <Text style={styles.actionText}>Mint NFT ({mintCost} coins)</Text>
              </TouchableOpacity>
            )}

            {isTradeable && (
              <TouchableOpacity
                style={[styles.actionButton, styles.tradeButton]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onTrade?.();
                }}
              >
                <Icon name="swap-horiz" size={16} color={colors.white} />
                <Text style={styles.actionText}>Trade (Worth {marketValue} coins)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Unlocked timestamp */}
          {unlocked && (
            <View style={styles.timestamp}>
              <Text style={[styles.timestampText, { color: rarityConfig.textColor + '99' }]}>
                Unlocked {new Date(unlockedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.sm,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardTouchable: {
    borderRadius: 16,
  },
  card: {
    padding: spacing.lg,
    minHeight: 280,
    justifyContent: 'space-between',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  shimmerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rarityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  rarityText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  serialNumber: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
  },
  serialText: {
    ...typography.caption,
    fontSize: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    textAlign: 'center',
    lineHeight: 16,
  },
  rewardContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  coinReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.xs,
  },
  coinAmount: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  coinLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  footer: {
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  mintButton: {
    backgroundColor: colors.secondary,
  },
  tradeButton: {
    backgroundColor: colors.primary,
  },
  actionText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  timestamp: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  timestampText: {
    ...typography.caption,
    fontSize: 10,
  },
});

export default CoinAchievementCard;