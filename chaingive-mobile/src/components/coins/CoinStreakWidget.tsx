import React, { useEffect, useRef, useState } from 'react';
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
import { coinSounds } from './CoinSoundEffects';

const { width: screenWidth } = Dimensions.get('window');

interface CoinStreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  freezeCount: number;
  nextReward: {
    day: number;
    coins: number;
    bonus?: string;
  };
  onFreeze?: () => void;
  onViewHistory?: () => void;
}

const CoinStreakWidget: React.FC<CoinStreakWidgetProps> = ({
  currentStreak,
  longestStreak,
  lastActiveDate,
  freezeCount,
  nextReward,
  onFreeze,
  onViewHistory,
}) => {
  const [isTodayActive, setIsTodayActive] = useState(false);
  const [daysUntilBreak, setDaysUntilBreak] = useState(0);

  const flameAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkStreakStatus();
    startAnimations();
  }, [currentStreak, lastActiveDate]);

  const checkStreakStatus = () => {
    const today = new Date();
    const lastActive = new Date(lastActiveDate);
    const diffTime = today.getTime() - lastActive.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    setIsTodayActive(diffDays === 0);
    setDaysUntilBreak(Math.max(0, 1 - diffDays)); // Break if not active today
  };

  const startAnimations = () => {
    // Flame animation for active streaks
    if (currentStreak > 0 && isTodayActive) {
      const flameAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      flameAnimation.start();

      // Glow effect for high streaks
      if (currentStreak >= 7) {
        const glowAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        );
        glowAnimation.start();
      }
    }

    // Progress animation
    const progress = Math.min(currentStreak / nextReward.day, 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handleFreeze = async () => {
    if (freezeCount > 0 && onFreeze) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await coinSounds.playStreakBonus();
      onFreeze();
    }
  };

  const getStreakColor = () => {
    if (currentStreak >= 30) return ['#FF1493', '#FF69B4']; // Hot pink for epic streaks
    if (currentStreak >= 14) return ['#FFD700', '#FFA500']; // Gold for great streaks
    if (currentStreak >= 7) return ['#FF6B35', '#FF8B35']; // Orange for good streaks
    return ['#28A745', '#20B545']; // Green for starting streaks
  };

  const getStreakIntensity = () => {
    if (currentStreak >= 30) return 'legendary';
    if (currentStreak >= 14) return 'epic';
    if (currentStreak >= 7) return 'rare';
    return 'common';
  };

  const flameOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getStreakColor()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.widget}
      >
        <View style={styles.header}>
          <View style={styles.streakInfo}>
            <Animated.View
              style={[
                styles.flameContainer,
                {
                  transform: [{ scale: flameAnim }],
                  opacity: flameOpacity,
                },
              ]}
            >
              <Icon name="local-fire-department" size={24} color={colors.white} />
            </Animated.View>
            <View>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onViewHistory?.();
            }}
          >
            <Icon name="history" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Streak Status */}
        <View style={styles.statusContainer}>
          {isTodayActive ? (
            <View style={styles.activeStatus}>
              <Icon name="check-circle" size={16} color={colors.white} />
              <Text style={styles.statusText}>Active Today!</Text>
            </View>
          ) : (
            <View style={styles.warningStatus}>
              <Icon name="warning" size={16} color={colors.white} />
              <Text style={styles.statusText}>
                {daysUntilBreak === 0 ? 'Streak at risk!' : `${daysUntilBreak} day${daysUntilBreak > 1 ? 's' : ''} left`}
              </Text>
            </View>
          )}
        </View>

        {/* Next Reward Progress */}
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardTitle}>Next Reward</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardText}>
              Day {nextReward.day}: +{nextReward.coins.toLocaleString()} coins
            </Text>
            {nextReward.bonus && (
              <Text style={styles.bonusText}>{nextReward.bonus}</Text>
            )}
          </View>

          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                  backgroundColor: colors.white,
                },
              ]}
            />
            <View style={styles.progressBackground} />
          </View>

          <Text style={styles.progressText}>
            {currentStreak}/{nextReward.day} days
          </Text>
        </View>

        {/* Freeze Power-ups */}
        {freezeCount > 0 && !isTodayActive && (
          <View style={styles.freezeContainer}>
            <Text style={styles.freezeTitle}>Protect Your Streak</Text>
            <TouchableOpacity
              style={styles.freezeButton}
              onPress={handleFreeze}
            >
              <Icon name="ac-unit" size={16} color={colors.white} />
              <Text style={styles.freezeText}>
                Use Freeze ({freezeCount} left)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Longest Streak */}
        <View style={styles.longestStreak}>
          <Icon name="emoji-events" size={16} color={colors.white} />
          <Text style={styles.longestText}>
            Longest: {longestStreak} days
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.sm,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  widget: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  streakNumber: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
  },
  streakLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  historyButton: {
    padding: spacing.xs,
  },
  statusContainer: {
    marginBottom: spacing.md,
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  warningStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  rewardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rewardTitle: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  rewardInfo: {
    marginBottom: spacing.sm,
  },
  rewardText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  bonusText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xxs,
  },
  progressContainer: {
    marginBottom: spacing.xs,
    position: 'relative',
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    zIndex: 1,
  },
  progressText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  freezeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  freezeTitle: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  freezeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  freezeText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  longestStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  longestText: {
    ...typography.caption,
    color: colors.white,
    marginLeft: spacing.xs,
  },
});

export default CoinStreakWidget;