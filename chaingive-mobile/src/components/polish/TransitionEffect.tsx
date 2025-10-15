import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';

interface TransitionEffectProps {
  visible: boolean;
  type?: 'fade' | 'slide' | 'scale' | 'blur' | 'ripple' | 'shutter';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  children: React.ReactNode;
  onComplete?: () => void;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({
  visible,
  type = 'fade',
  direction = 'up',
  duration = 300,
  delay = 0,
  style,
  children,
  onComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0.8)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [];

    if (type === 'fade') {
      animations.push(
        Animated.timing(fadeAnim, {
          toValue: visible ? 1 : 0,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    if (type === 'slide') {
      const directionValue = visible ? 0 : getDirectionValue(direction);
      animations.push(
        Animated.spring(slideAnim, {
          toValue: directionValue,
          tension: 100,
          friction: 8,
          delay,
          useNativeDriver: true,
        })
      );
    }

    if (type === 'scale') {
      animations.push(
        Animated.spring(scaleAnim, {
          toValue: visible ? 1 : 0.8,
          tension: 100,
          friction: 8,
          delay,
          useNativeDriver: true,
        })
      );
    }

    if (type === 'ripple') {
      animations.push(
        Animated.timing(rippleAnim, {
          toValue: visible ? 1 : 0,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start(() => {
      onComplete?.();
    });

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [visible, type, direction, duration, delay, fadeAnim, slideAnim, scaleAnim, rippleAnim, onComplete]);

  const getDirectionValue = (dir: string) => {
    switch (dir) {
      case 'up':
        return -100;
      case 'down':
        return 100;
      case 'left':
        return -100;
      case 'right':
        return 100;
      default:
        return 0;
    }
  };

  const getSlideTransform = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return [{ translateY: slideAnim }];
      case 'left':
      case 'right':
        return [{ translateX: slideAnim }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  const getRippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const renderTransition = () => {
    const baseStyle: ViewStyle = {
      opacity: type === 'fade' ? fadeAnim : 1,
      transform: [
        ...(type === 'slide' ? getSlideTransform() : []),
        ...(type === 'scale' ? [{ scale: scaleAnim }] : []),
        ...(type === 'ripple' ? [{ scale: getRippleScale }] : []),
      ],
    };

    if (type === 'blur') {
      return (
        <MotiView
          from={{ opacity: visible ? 0 : 1 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{
            type: 'timing',
            duration,
            delay,
          }}
          style={style}
        >
          {children}
        </MotiView>
      );
    }

    if (type === 'shutter') {
      return (
        <View style={{ overflow: 'hidden' }}>
          <MotiView
            from={{
              height: visible ? 0 : 'auto',
              opacity: visible ? 0 : 1,
            }}
            animate={{
              height: visible ? 'auto' : 0,
              opacity: visible ? 1 : 0,
            }}
            transition={{
              type: 'timing',
              duration,
              delay,
            }}
            style={style}
          >
            {children}
          </MotiView>
        </View>
      );
    }

    return (
      <Animated.View style={[baseStyle, style]}>
        {children}
      </Animated.View>
    );
  };

  return renderTransition();
};

// Preset transition components
export const FadeIn: React.FC<Omit<TransitionEffectProps, 'type'>> = (props) => (
  <TransitionEffect {...props} type="fade" />
);

export const SlideIn: React.FC<Omit<TransitionEffectProps, 'type'>> = (props) => (
  <TransitionEffect {...props} type="slide" />
);

export const ScaleIn: React.FC<Omit<TransitionEffectProps, 'type'>> = (props) => (
  <TransitionEffect {...props} type="scale" />
);

export const RippleEffect: React.FC<Omit<TransitionEffectProps, 'type'>> = (props) => (
  <TransitionEffect {...props} type="ripple" />
);

export const ShutterEffect: React.FC<Omit<TransitionEffectProps, 'type'>> = (props) => (
  <TransitionEffect {...props} type="shutter" />
);

export default TransitionEffect;