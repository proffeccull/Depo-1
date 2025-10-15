import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface MicroAnimationProps {
  type?: 'bounce' | 'pulse' | 'shake' | 'wiggle' | 'heartbeat' | 'rubber' | 'jello' | 'tada' | 'swing';
  trigger?: 'press' | 'hover' | 'auto' | 'manual';
  duration?: number;
  delay?: number;
  intensity?: 'subtle' | 'normal' | 'strong';
  haptic?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

const MicroAnimation: React.FC<MicroAnimationProps> = ({
  type = 'bounce',
  trigger = 'press',
  duration = 500,
  delay = 0,
  intensity = 'normal',
  haptic = false,
  style,
  children,
  onPress,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const getIntensityMultiplier = () => {
    switch (intensity) {
      case 'subtle':
        return 0.5;
      case 'normal':
        return 1;
      case 'strong':
        return 1.5;
      default:
        return 1;
    }
  };

  const multiplier = getIntensityMultiplier();

  const startAnimation = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    let animation;

    switch (type) {
      case 'bounce':
        animation = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2 * multiplier,
            duration: duration * 0.3,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 3,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'pulse':
        animation = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1 * multiplier,
            duration: duration * 0.5,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration * 0.5,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'shake':
        animation = Animated.sequence([
          Animated.timing(translateXAnim, {
            toValue: -10 * multiplier,
            duration: duration * 0.1,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: 10 * multiplier,
            duration: duration * 0.1,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: -10 * multiplier,
            duration: duration * 0.1,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: 10 * multiplier,
            duration: duration * 0.1,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: 0,
            duration: duration * 0.1,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'wiggle':
        animation = Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 5 * multiplier,
            duration: duration * 0.15,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -5 * multiplier,
            duration: duration * 0.15,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 5 * multiplier,
            duration: duration * 0.15,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -5 * multiplier,
            duration: duration * 0.15,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: duration * 0.15,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'heartbeat':
        animation = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3 * multiplier,
            duration: duration * 0.2,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration * 0.3,
            useNativeDriver: true,
          }),
          Animated.delay(duration * 0.2),
          Animated.timing(scaleAnim, {
            toValue: 1.3 * multiplier,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration * 0.3,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'rubber':
        animation = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.25 * multiplier,
            duration: duration * 0.3,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 0.95,
            tension: 200,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            tension: 200,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 200,
            friction: 5,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'jello':
        animation = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.25 * multiplier,
            duration: duration * 0.2,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 0.9,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.1,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'tada':
        animation = Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.3 * multiplier,
              duration: duration * 0.3,
              delay,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 5,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 10 * multiplier,
              duration: duration * 0.2,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -10 * multiplier,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
          ]),
        ]);
        break;

      case 'swing':
        animation = Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 15 * multiplier,
            duration: duration * 0.2,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -10 * multiplier,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 5 * multiplier,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -5 * multiplier,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: duration * 0.2,
            useNativeDriver: true,
          }),
        ]);
        break;

      default:
        animation = Animated.timing(scaleAnim, {
          toValue: 1.1 * multiplier,
          duration: duration * 0.5,
          delay,
          useNativeDriver: true,
        });
    }

    animation.start(() => {
      // Reset animations
      scaleAnim.setValue(1);
      rotateAnim.setValue(0);
      translateXAnim.setValue(0);
      translateYAnim.setValue(0);
      opacityAnim.setValue(1);
    });
  };

  const handlePress = () => {
    if (trigger === 'press' || trigger === 'manual') {
      startAnimation();
    }
    onPress?.();
  };

  useEffect(() => {
    if (trigger === 'auto') {
      const interval = setInterval(startAnimation, duration + delay + 1000);
      return () => clearInterval(interval);
    }
  }, [trigger, duration, delay]);

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { rotate: rotateAnim.interpolate({
        inputRange: [-360, 360],
        outputRange: ['-360deg', '360deg'],
      })},
      { translateX: translateXAnim },
      { translateY: translateYAnim },
    ],
    opacity: opacityAnim,
  };

  if (trigger === 'press' || trigger === 'manual') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[animatedStyle, style]}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

export default MicroAnimation;