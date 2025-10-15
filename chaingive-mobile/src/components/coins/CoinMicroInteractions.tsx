import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { coinSounds } from './CoinSoundEffects';

interface MicroInteractionProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success';
  soundEffect?: string;
  scaleEffect?: boolean;
  glowEffect?: boolean;
  coinTrail?: boolean;
  rippleEffect?: boolean;
}

export const CoinButton: React.FC<MicroInteractionProps> = ({
  children,
  style,
  onPress,
  disabled = false,
  hapticType = 'light',
  soundEffect,
  scaleEffect = true,
  glowEffect = false,
  coinTrail = false,
  rippleEffect = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    if (disabled) return;

    // Haptic feedback
    switch (hapticType) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }

    // Sound effect
    if (soundEffect) {
      coinSounds.play(soundEffect);
    }

    // Scale animation
    if (scaleEffect) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Glow effect
    if (glowEffect) {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Ripple effect
    if (rippleEffect) {
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Call onPress after animations start
    if (onPress) {
      setTimeout(onPress, 50);
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 0],
  });

  return (
    <TouchableOpacity
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
          shadowOpacity: glowOpacity,
          shadowRadius: 10,
          shadowColor: '#FFD700',
          elevation: 5,
        },
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {rippleEffect && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 8,
            backgroundColor: '#FFD700',
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          }}
        />
      )}
      {children}
    </TouchableOpacity>
  );
};

interface SwipeableCoinCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
  coinTrail?: boolean;
}

export const SwipeableCoinCard: React.FC<SwipeableCoinCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  style,
  coinTrail = true,
}) => {
  const panAnim = useRef(new Animated.ValueXY()).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    // PanResponder.create({
    //   onStartShouldSetPanResponder: () => true,
    //   onPanResponderMove: (evt, gestureState) => {
    //     panAnim.setValue({ x: gestureState.dx, y: 0 });
    //     rotateAnim.setValue(gestureState.dx / 10);
    //   },
    //   onPanResponderRelease: (evt, gestureState) => {
    //     if (gestureState.dx > 100) {
    //       // Swipe right
    //       Animated.spring(panAnim, {
    //         toValue: { x: 300, y: 0 },
    //         useNativeDriver: true,
    //       }).start(() => {
    //         onSwipeRight?.();
    //         panAnim.setValue({ x: 0, y: 0 });
    //       });
    //     } else if (gestureState.dx < -100) {
    //       // Swipe left
    //       Animated.spring(panAnim, {
    //         toValue: { x: -300, y: 0 },
    //         useNativeDriver: true,
    //       }).start(() => {
    //         onSwipeLeft?.();
    //         panAnim.setValue({ x: 0, y: 0 });
    //       });
    //     } else {
    //       // Return to center
    //       Animated.spring(panAnim, {
    //         toValue: { x: 0, y: 0 },
    //         useNativeDriver: true,
    //       }).start();
    //     }
    //     rotateAnim.setValue(0);
    //   },
    // })
  ).current;

  return (
    <Animated.View
      // {...panResponder.panHandlers}
      style={[
        style,
        {
          transform: [
            { translateX: panAnim.x },
            { rotate: rotateAnim.interpolate({
              inputRange: [-50, 0, 50],
              outputRange: ['-5deg', '0deg', '5deg'],
            })},
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface LiquidSwipeProps {
  children: React.ReactNode;
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  coinTrail?: boolean;
  style?: ViewStyle;
}

export const LiquidSwipe: React.FC<LiquidSwipeProps> = ({
  children,
  onSwipe,
  coinTrail = true,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Implementation would include gesture handling for liquid-like swipes
  // with coin particle trails following the finger movement

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Hook for coin-themed micro-interactions
export const useCoinInteraction = () => {
  const triggerCoinEffect = async (
    type: 'earn' | 'spend' | 'achievement' | 'milestone',
    amount?: number
  ) => {
    switch (type) {
      case 'earn':
        if (amount && amount > 100) {
          await coinSounds.playCoinRain();
        } else {
          await coinSounds.playCoinCollect();
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'spend':
        await coinSounds.playCoinDrop();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'achievement':
        await coinSounds.playAchievementUnlock();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'milestone':
        await coinSounds.playMilestoneReach();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  };

  return { triggerCoinEffect };
};