import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

interface CelebrationConfettiProps {
  visible: boolean;
  duration?: number;
  pieceCount?: number;
  colors?: string[];
  style?: ViewStyle;
  onComplete?: () => void;
}

const CelebrationConfetti: React.FC<CelebrationConfettiProps> = ({
  visible,
  duration = 3000,
  pieceCount = 50,
  colors: confettiColors = [
    colors.primary,
    colors.secondary,
    colors.tertiary,
    colors.gold,
    colors.success,
    colors.warning,
    colors.error,
  ],
  style,
  onComplete,
}) => {
  const animations = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (visible) {
      startConfetti();
    } else {
      stopConfetti();
    }

    return () => {
      stopConfetti();
    };
  }, [visible]);

  const startConfetti = () => {
    // Create confetti pieces
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < pieceCount; i++) {
      pieces.push({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: -20,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 500,
      });
    }

    // Start animations
    const timeout = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timeout);
  };

  const stopConfetti = () => {
    animations.current.forEach(anim => anim.stop());
    animations.current = [];
  };

  const renderConfettiPiece = (piece: ConfettiPiece) => {
    const fallAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const swayAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (visible) {
        const startAnimation = () => {
          const fallAnimation = Animated.timing(fallAnim, {
            toValue: 1,
            duration: duration * 0.8,
            delay: piece.delay,
            useNativeDriver: true,
          });

          const rotateAnimation = Animated.timing(rotateAnim, {
            toValue: 1,
            duration: duration,
            delay: piece.delay,
            useNativeDriver: true,
          });

          const swayAnimation = Animated.timing(swayAnim, {
            toValue: 1,
            duration: duration * 0.6,
            delay: piece.delay,
            useNativeDriver: true,
          });

          animations.current.push(fallAnimation, rotateAnimation, swayAnimation);

          Animated.parallel([fallAnimation, rotateAnimation, swayAnimation]).start();
        };

        startAnimation();
      }
    }, [visible, piece.delay]);

    const translateY = fallAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, SCREEN_HEIGHT + 100],
    });

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [`${piece.rotation}deg`, `${piece.rotation + 720}deg`],
    });

    const translateX = swayAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, Math.sin(piece.id) * 50, Math.sin(piece.id) * 100],
    });

    return (
      <MotiView
        key={piece.id}
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: piece.scale }}
        transition={{
          type: 'timing',
          duration: 300,
          delay: piece.delay,
        }}
        style={{
          position: 'absolute',
          left: piece.x,
          top: piece.y,
        }}
      >
        <Animated.View
          style={{
            transform: [
              { translateY },
              { rotate },
              { translateX },
              { scale: piece.scale },
            ],
          }}
        >
          <View
            style={{
              width: 8,
              height: 16,
              backgroundColor: piece.color,
              borderRadius: 2,
              shadowColor: piece.color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          />
        </Animated.View>
      </MotiView>
    );
  };

  if (!visible) return null;

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999,
        },
        style,
      ]}
    >
      {Array.from({ length: pieceCount }).map((_, index) => {
        const piece: ConfettiPiece = {
          id: index,
          x: Math.random() * SCREEN_WIDTH,
          y: -20,
          rotation: Math.random() * 360,
          scale: Math.random() * 0.5 + 0.5,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          delay: Math.random() * 500,
        };
        return renderConfettiPiece(piece);
      })}
    </View>
  );
};

export default CelebrationConfetti;