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

const { width: screenWidth } = Dimensions.get('window');

interface CoinMilestoneWidgetProps {
  current: number;
  target: number;
  progress: number; // 0-1
  reward: {
    coins: number;
    badge?: string;
    nft?: boolean;
  };
  message: string;
  animation?: 'progress-bar-glow' | 'pulse' | 'bounce' | 'none';
  onPress?: () => void;
  showConfetti?: boolean;
}

const CoinMilestoneWidget: React.FC<CoinMilestoneWidgetProps> = ({
  current,
  target,
  progress,
  reward,
  message,
  animation = 'none',
  onPress,
  showConfetti = false,
}) => {
  const progressAnim = useRef(new Animated.Value(progress)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress changes
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (animation === 'progress-bar-glow') {
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

    if (animation === 'pulse') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
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

    if (animation === 'bounce') {
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      bounceAnimation.start();
      return () => bounceAnimation.stop();
    }
  }, [animation]);

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const isCompleted = progress >= 1;

  return (
    <Animated.View
      style={[
        styles.container,
        animation === 'pulse' && { transform: [{ scale: pulseAnim }] },
        animation === 'bounce' && { transform: [{ translateY: bounceAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.widget}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            isCompleted
              ? [colors.tertiary + '40', colors.tertiary + '20']
              : [colors.gray[100], colors.white]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.coinIcon}>
              <Icon
                name={isCompleted ? "check-circle" : "monetization-on"}
                size={24}
                color={isCompleted ? colors.success : colors.tertiary}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {isCompleted ? 'Milestone Achieved!' : 'Coin Milestone'}
              </Text>
              <Text style={styles.subtitle}>
                {current.toLocaleString()} / {target.toLocaleString()} coins
              </Text>
            </View>
          </View>

          <Text style={styles.message}>{message}</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                  backgroundColor: isCompleted ? colors.success : colors.tertiary,
                  shadowColor: isCompleted ? colors.success : colors.tertiary,
                  shadowOpacity: glowOpacity,
                  shadowRadius: 10,
                  elevation: 5,
                },
              ]}
            />
            <View style={styles.progressBackground} />
          </View>

          {/* Reward Display */}
          <View style={styles.rewardContainer}>
            <View style={styles.rewardItem}>
              <Icon name="monetization-on" size={16} color={colors.tertiary} />
              <Text style={styles.rewardText}>+{reward.coins.toLocaleString()} coins</Text>
            </View>

            {reward.badge && (
              <View style={styles.rewardItem}>
                <Icon name="emoji-events" size={16} color={colors.warning} />
                <Text style={styles.rewardText}>{reward.badge}</Text>
              </View>
            )}

            {reward.nft && (
              <View style={styles.rewardItem}>
                <Icon name="token" size={16} color={colors.secondary} />
                <Text style={styles.rewardText}>NFT Available</Text>
              </View>
            )}
          </View>

          {/* Completion Indicator */}
          {isCompleted && (
            <View style={styles.completionBadge}>
              <Icon name="celebration" size={20} color={colors.white} />
              <Text style={styles.completionText}>Completed!</Text>
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
  widget: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.tertiary + '30',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  coinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  message: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    zIndex: 1,
  },
  rewardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  rewardText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.xxs,
  },
  completionBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  completionText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
});

export default CoinMilestoneWidget;