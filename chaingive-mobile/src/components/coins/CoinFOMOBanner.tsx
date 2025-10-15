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

const { width: screenWidth } = Dimensions.get('window');

interface CoinFOMOBannerProps {
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timer?: number; // seconds remaining
  action: string;
  reward: number; // coins
  onPress?: () => void;
  autoHide?: boolean;
  hideDelay?: number;
}

const CoinFOMOBanner: React.FC<CoinFOMOBannerProps> = ({
  message,
  urgency = 'medium',
  timer,
  action,
  reward,
  onPress,
  autoHide = false,
  hideDelay = 10000,
}) => {
  const [timeLeft, setTimeLeft] = useState(timer || 0);
  const [isVisible, setIsVisible] = useState(true);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Timer countdown
    if (timer && timer > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (autoHide) {
              handleHide();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }

    // Auto hide after delay
    if (autoHide) {
      const hideTimer = setTimeout(handleHide, hideDelay);
      return () => clearTimeout(hideTimer);
    }
  }, [timer, autoHide, hideDelay]);

  useEffect(() => {
    // Critical urgency animations
    if (urgency === 'critical' && timeLeft > 0 && timeLeft <= 60) {
      // Pulsing animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Shake animation for last 10 seconds
      if (timeLeft <= 10) {
        const shakeAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: 5,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -5,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ])
        );
        shakeAnimation.start();

        return () => {
          pulseAnimation.stop();
          shakeAnimation.stop();
        };
      }

      return () => pulseAnimation.stop();
    }
  }, [urgency, timeLeft]);

  const handleHide = () => {
    Animated.spring(slideAnim, {
      toValue: -100,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onPress();
    }
  };

  const getUrgencyConfig = () => {
    const configs = {
      low: {
        colors: [colors.info + '40', colors.info + '20'],
        borderColor: colors.info,
        textColor: colors.info,
        icon: 'info',
      },
      medium: {
        colors: [colors.warning + '40', colors.warning + '20'],
        borderColor: colors.warning,
        textColor: colors.warning,
        icon: 'warning',
      },
      high: {
        colors: [colors.error + '40', colors.error + '20'],
        borderColor: colors.error,
        textColor: colors.error,
        icon: 'error',
      },
      critical: {
        colors: ['#FF1493', '#FF69B4'],
        borderColor: '#FF1493',
        textColor: colors.white,
        icon: 'flash',
      },
    };
    return configs[urgency];
  };

  const urgencyConfig = getUrgencyConfig();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={urgencyConfig.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Icon
              name={urgencyConfig.icon}
              size={24}
              color={urgencyConfig.textColor}
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={[styles.message, { color: urgencyConfig.textColor }]}>
                {message}
              </Text>
              <View style={styles.rewardContainer}>
                <Icon name="monetization-on" size={16} color={colors.tertiary} />
                <Text style={styles.rewardText}>+{reward} coins</Text>
              </View>
            </View>
          </View>

          <View style={styles.rightSection}>
            {timeLeft > 0 && (
              <View style={styles.timerContainer}>
                <Icon name="timer" size={16} color={urgencyConfig.textColor} />
                <Text style={[styles.timerText, { color: urgencyConfig.textColor }]}>
                  {formatTime(timeLeft)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: urgencyConfig.borderColor }]}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionText, { color: urgencyConfig.textColor }]}>
                {action}
              </Text>
              <Icon
                name="arrow-forward"
                size={16}
                color={urgencyConfig.textColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar for timer */}
        {timeLeft > 0 && timer && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(timeLeft / timer) * 100}%`,
                  backgroundColor: urgencyConfig.borderColor,
                },
              ]}
            />
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: spacing.md,
    right: spacing.md,
    zIndex: 999,
  },
  banner: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  timerText: {
    ...typography.caption,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
    fontVariant: ['tabular-nums'],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    ...typography.button,
    fontWeight: 'bold',
    marginRight: spacing.xxs,
  },
  progressContainer: {
    marginTop: spacing.sm,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
});

export default CoinFOMOBanner;