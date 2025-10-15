import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  ActivityIndicator,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  gradient?: boolean;
  gradientColors?: string[];
  text?: string;
  textStyle?: TextStyle;
  overlay?: boolean;
  backdropOpacity?: number;
  style?: ViewStyle;
  animated?: boolean;
  animationType?: 'spin' | 'pulse' | 'bounce';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = colors.primary,
  gradient = false,
  gradientColors = [colors.primary, colors.secondary],
  text,
  textStyle,
  overlay = false,
  backdropOpacity = 0.5,
  style,
  animated = true,
  animationType = 'spin',
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animations = [];

    if (animationType === 'spin' || animationType === 'bounce') {
      animations.push(
        Animated.loop(
          Animated.timing(spinAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        )
      );
    }

    if (animationType === 'pulse') {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        )
      );
    }

    if (animationType === 'bounce') {
      animations.push(
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        )
      );
    }

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [animated, animationType, spinAnim, pulseAnim, bounceAnim]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 36;
      case 'large':
        return 50;
      default:
        return 36;
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerStyle: ViewStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...style,
  };

  if (overlay) {
    containerStyle.position = 'absolute';
    containerStyle.top = 0;
    containerStyle.left = 0;
    containerStyle.right = 0;
    containerStyle.bottom = 0;
    containerStyle.backgroundColor = `rgba(0, 0, 0, ${backdropOpacity})`;
    containerStyle.zIndex = 9999;
  }

  const renderSpinner = () => {
    const spinnerSize = getSize();

    if (gradient) {
      return (
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: spinnerSize / 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator
              size="small"
              color="white"
            />
          </LinearGradient>
        </MotiView>
      );
    }

    return (
      <Animated.View
        style={{
          transform: [
            { rotate: animated && animationType === 'spin' ? spin : '0deg' },
            { scale: animated && animationType === 'pulse' ? pulseAnim : 1 },
            { translateY: animated && animationType === 'bounce' ? bounceAnim : 0 },
          ],
        }}
      >
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'large'}
          color={color}
        />
      </Animated.View>
    );
  };

  return (
    <View style={containerStyle}>
      {renderSpinner()}
      {text && (
        <Text
          style={[
            {
              marginTop: 12,
              fontSize: 14,
              color: colors.text.secondary,
              textAlign: 'center',
            },
            textStyle,
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;