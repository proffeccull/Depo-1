import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { AnimatedNumber } from '../animated';

const { width: screenWidth } = Dimensions.get('window');

interface CoinBalanceWidgetProps {
  balance: number;
  trend: 'up' | 'down' | 'stable';
  change24h: number;
  animation: 'pulse' | 'glow' | 'none';
  size?: 'small' | 'medium' | 'large';
  showQuickActions?: boolean;
  onQuickAction?: (action: 'buy' | 'earn' | 'spend' | 'history') => void;
}

const CoinBalanceWidget: React.FC<CoinBalanceWidgetProps> = ({
  balance,
  trend,
  change24h,
  animation = 'none',
  size = 'medium',
  showQuickActions = false,
  onQuickAction,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animation === 'pulse') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }

    if (animation === 'glow') {
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
      return () => glowAnimation.stop();
    }
  }, [animation]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-flat';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const getSizeStyles = () => {
    const baseSize = size === 'small' ? 0.8 : size === 'large' ? 1.2 : 1;
    return {
      container: {
        paddingHorizontal: spacing.md * baseSize,
        paddingVertical: spacing.sm * baseSize,
        borderRadius: 20 * baseSize,
      },
      balanceText: {
        fontSize: (typography.h2.fontSize || 24) * baseSize,
      },
      changeText: {
        fontSize: (typography.caption.fontSize || 12) * baseSize,
      },
    };
  };

  const sizeStyles = getSizeStyles();

  const quickActions = [
    { key: 'buy' as const, icon: 'add-circle', label: 'Buy', color: colors.success },
    { key: 'earn' as const, icon: 'stars', label: 'Earn', color: colors.primary },
    { key: 'spend' as const, icon: 'shopping-bag', label: 'Spend', color: colors.secondary },
    { key: 'history' as const, icon: 'history', label: 'History', color: colors.info },
  ];

  return (
    <Animated.View
      style={[
        styles.container,
        sizeStyles.container,
        animation === 'pulse' && { transform: [{ scale: pulseAnim }] },
        animation === 'glow' && {
          shadowColor: colors.tertiary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowAnim,
          shadowRadius: 10,
          elevation: 10,
        },
      ]}
    >
      <LinearGradient
        colors={[colors.tertiary + '20', colors.tertiary + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.balanceContainer}>
          <View style={styles.coinIcon}>
            <Icon name="monetization-on" size={20} color={colors.tertiary} />
          </View>
          <View style={styles.balanceInfo}>
            <AnimatedNumber
              value={balance}
              duration={800}
              style={[styles.balanceText, sizeStyles.balanceText]}
              formatter={(val) => Math.round(val).toLocaleString()}
            />
            <View style={styles.trendContainer}>
              <Icon
                name={getTrendIcon()}
                size={14}
                color={getTrendColor()}
              />
              <Text style={[styles.changeText, sizeStyles.changeText, { color: getTrendColor() }]}>
                {change24h > 0 ? '+' : ''}{change24h} (24h)
              </Text>
            </View>
          </View>
        </View>

        {showQuickActions && (
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={[styles.quickAction, { borderColor: action.color + '40' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onQuickAction?.(action.key);
                }}
              >
                <Icon name={action.icon} size={16} color={action.color} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50 + spacing.sm,
    right: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.tertiary + '30',
    ...shadows.card,
    zIndex: 1000,
  },
  gradientBackground: {
    borderRadius: 18,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  coinIcon: {
    marginRight: spacing.xs,
  },
  balanceInfo: {
    alignItems: 'center',
  },
  balanceText: {
    ...typography.h3,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  changeText: {
    ...typography.caption,
    marginLeft: spacing.xxs,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  quickAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: colors.white,
  },
});

export default CoinBalanceWidget;