import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Dimensions,
  Text,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ElectionWinConfettiProps {
  visible: boolean;
  winnerName: string;
  position?: string;
  duration?: number;
  onComplete?: () => void;
  style?: ViewStyle;
}

const ElectionWinConfetti: React.FC<ElectionWinConfettiProps> = ({
  visible,
  winnerName,
  position = "Winner",
  duration = 5000,
  onComplete,
  style,
}) => {
  const crownAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Crown animation
      Animated.spring(crownAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }).start();

      // Text animation
      Animated.spring(textAnim, {
        toValue: 1,
        delay: 300,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }).start();

      // Particles animation
      Animated.timing(particlesAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start(() => {
        onComplete?.();
      });
    } else {
      crownAnim.setValue(0);
      textAnim.setValue(0);
      particlesAnim.setValue(0);
    }
  }, [visible, crownAnim, textAnim, particlesAnim, onComplete, duration]);

  const crownScale = crownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.2],
  });

  const crownRotate = crownAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-10deg', '10deg', '0deg'],
  });

  const textOpacity = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const textScale = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const delay = Math.random() * 1000;
      const duration = 2000 + Math.random() * 2000;
      const startX = Math.random() * SCREEN_WIDTH;
      const endX = startX + (Math.random() - 0.5) * 200;
      const startY = SCREEN_HEIGHT + 50;
      const endY = Math.random() * SCREEN_HEIGHT * 0.6;

      particles.push(
        <MotiView
          key={i}
          from={{
            translateX: startX,
            translateY: startY,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            translateX: endX,
            translateY: endY,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: 'timing',
            duration,
            delay,
            easing: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: [colors.gold, colors.primary, colors.secondary][Math.floor(Math.random() * 3)],
          }}
        />
      );
    }
    return particles;
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
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
        },
        style,
      ]}
    >
      {/* Background particles */}
      {renderParticles()}

      {/* Crown */}
      <Animated.View
        style={{
          transform: [
            { scale: crownScale },
            { rotate: crownRotate },
          ],
          marginBottom: 20,
        }}
      >
        <LinearGradient
          colors={[colors.gold, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.gold,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <Icon
            name="emoji-events"
            size={40}
            color="white"
          />
        </LinearGradient>
      </Animated.View>

      {/* Winner Text */}
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ scale: textScale }],
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.gold,
            textAlign: 'center',
            marginBottom: 8,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          🏆 {position.toUpperCase()} 🏆
        </Text>

        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 16,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {winnerName}
        </Text>

        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 25,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            }}
          >
            🎉 CONGRATULATIONS! 🎉
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Sparkle effects */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 1000,
          loop: true,
        }}
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
        }}
      >
        <Text style={{ fontSize: 30 }}>✨</Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 1000,
          delay: 500,
          loop: true,
        }}
        style={{
          position: 'absolute',
          top: '30%',
          right: '15%',
        }}
      >
        <Text style={{ fontSize: 25 }}>⭐</Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 1000,
          delay: 1000,
          loop: true,
        }}
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
        }}
      >
        <Text style={{ fontSize: 28 }}>🎊</Text>
      </MotiView>
    </View>
  );
};

export default ElectionWinConfetti;