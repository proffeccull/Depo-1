import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  total?: number;
  current?: number;
  height?: number;
  animated?: boolean;
  showPercentage?: boolean;
  showValue?: boolean;
  gradient?: boolean;
  striped?: boolean;
  animatedStripes?: boolean;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onComplete?: () => void;
  hapticOnComplete?: boolean;
  duration?: number;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  total,
  current,
  height = 8,
  animated = true,
  showPercentage = false,
  showValue = false,
  gradient = false,
  striped = false,
  animatedStripes = false,
  color = colors.primary,
  backgroundColor = colors.gray[200],
  borderRadius = height / 2,
  style,
  textStyle,
  onComplete,
  hapticOnComplete = false,
  duration = 1000,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stripeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: Math.max(0, Math.min(1, progress)),
        duration,
        useNativeDriver: false,
      }).start(() => {
        if (progress >= 1 && onComplete) {
          onComplete();
          if (hapticOnComplete) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      });
    } else {
      progressAnim.setValue(Math.max(0, Math.min(1, progress)));
    }
  }, [progress, animated, duration, onComplete, hapticOnComplete]);

  useEffect(() => {
    if (animatedStripes && striped) {
      const animateStripes = () => {
        Animated.loop(
          Animated.timing(stripeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();
      };
      animateStripes();
    }
  }, [animatedStripes, striped]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const translateX = stripeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  const displayValue = current !== undefined && total !== undefined
    ? `${current}/${total}`
    : showPercentage
    ? `${Math.round(progress * 100)}%`
    : '';

  return (
    <View style={[{ position: 'relative' }, style]}>
      {(showPercentage || showValue) && displayValue && (
        <View style={{
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <Text style={[
            {
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.primary,
            },
            textStyle,
          ]}>
            {displayValue}
          </Text>
        </View>
      )}

      <View
        style={{
          height,
          backgroundColor,
          borderRadius,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Progress Fill */}
        <Animated.View
          style={{
            height: '100%',
            width,
            borderRadius,
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          {gradient ? (
            <LinearGradient
              colors={[color, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, borderRadius }}
            >
              {striped && (
                <MotiView
                  from={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: 'timing',
                    duration: 500,
                    loop: animatedStripes,
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: animatedStripes ? [{ translateX }] : undefined,
                  }}
                >
                  <View style={{
                    flex: 1,
                    flexDirection: 'row',
                  }}>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <View
                        key={index}
                        style={{
                          flex: 1,
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          marginRight: 2,
                        }}
                      />
                    ))}
                  </View>
                </MotiView>
              )}
            </LinearGradient>
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: color,
                borderRadius,
              }}
            >
              {striped && (
                <MotiView
                  from={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: 'timing',
                    duration: 500,
                    loop: animatedStripes,
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: animatedStripes ? [{ translateX }] : undefined,
                  }}
                >
                  <View style={{
                    flex: 1,
                    flexDirection: 'row',
                  }}>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <View
                        key={index}
                        style={{
                          flex: 1,
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          marginRight: 2,
                        }}
                      />
                    ))}
                  </View>
                </MotiView>
              )}
            </View>
          )}
        </Animated.View>

        {/* Shimmer Effect for Loading State */}
        {progress < 1 && animated && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 800,
              loop: true,
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '30%',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius,
            }}
          />
        )}
      </View>
    </View>
  );
};

export default AnimatedProgressBar;