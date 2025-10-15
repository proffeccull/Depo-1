import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
}

interface CoinEarningAnimationProps {
  amount: number;
  source: 'donation' | 'referral' | 'achievement' | 'mission' | 'purchase';
  destination: 'balance' | 'custom';
  duration?: number;
  particles?: boolean;
  sound?: boolean;
  haptic?: boolean;
  onComplete?: () => void;
  customDestination?: { x: number; y: number };
}

const CoinEarningAnimation: React.FC<CoinEarningAnimationProps> = ({
  amount,
  source,
  destination,
  duration = 1500,
  particles = true,
  sound = true,
  haptic = true,
  onComplete,
  customDestination,
}) => {
  const mainCoinAnim = useRef(new Animated.Value(0)).current;
  const mainCoinScale = useRef(new Animated.Value(0.5)).current;
  const mainCoinOpacity = useRef(new Animated.Value(0)).current;

  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    // Initialize particles
    if (particles) {
      particlesRef.current = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
        rotation: new Animated.Value(0),
      }));
    }

    // Haptic feedback
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
    }

    // Main coin animation sequence
    Animated.sequence([
      // Initial burst
      Animated.parallel([
        Animated.spring(mainCoinScale, {
          toValue: 1.5,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(mainCoinOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Scale down and move
      Animated.parallel([
        Animated.spring(mainCoinScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(mainCoinAnim, {
          toValue: 1,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
      ]),
      // Final scale up at destination
      Animated.spring(mainCoinScale, {
        toValue: 1.2,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade out after completion
      Animated.timing(mainCoinOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (onComplete) onComplete();
      });
    });

    // Particle animations
    if (particles) {
      particlesRef.current.forEach((particle, index) => {
        const delay = index * 50;

        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.spring(particle.scale, {
              toValue: 1,
              friction: 3,
              tension: 200,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0.8,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: (Math.random() - 0.5) * 200,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: (Math.random() - 0.5) * 200,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(particle.rotation, {
              toValue: Math.random() * 360,
              duration: duration,
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        // Fade out particles
        setTimeout(() => {
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, duration - 500);
      });
    }
  }, [amount, source, destination, duration, particles, haptic]);

  const getSourcePosition = () => {
    // Default positions based on source type
    const positions = {
      donation: { x: screenWidth / 2, y: screenHeight * 0.6 },
      referral: { x: screenWidth / 2, y: screenHeight * 0.5 },
      achievement: { x: screenWidth / 2, y: screenHeight * 0.4 },
      mission: { x: screenWidth / 2, y: screenHeight * 0.45 },
      purchase: { x: screenWidth / 2, y: screenHeight * 0.55 },
    };
    return positions[source] || { x: screenWidth / 2, y: screenHeight / 2 };
  };

  const getDestinationPosition = () => {
    if (destination === 'custom' && customDestination) {
      return customDestination;
    }
    // Default to top-right balance widget position
    return { x: screenWidth - 80, y: 80 };
  };

  const sourcePos = getSourcePosition();
  const destPos = getDestinationPosition();

  const translateX = mainCoinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, destPos.x - sourcePos.x],
  });

  const translateY = mainCoinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, destPos.y - sourcePos.y],
  });

  const renderParticles = () => {
    if (!particles) return null;

    return particlesRef.current.map((particle) => (
      <Animated.View
        key={particle.id}
        style={[
          styles.particle,
          {
            left: sourcePos.x,
            top: sourcePos.y,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
              { rotate: particle.rotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })},
            ],
            opacity: particle.opacity,
          },
        ]}
      >
        <Icon name="monetization-on" size={12} color={colors.tertiary} />
      </Animated.View>
    ));
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Main coin */}
      <Animated.View
        style={[
          styles.mainCoin,
          {
            left: sourcePos.x - 20,
            top: sourcePos.y - 20,
            transform: [
              { translateX },
              { translateY },
              { scale: mainCoinScale },
            ],
            opacity: mainCoinOpacity,
          },
        ]}
      >
        <View style={styles.coinCircle}>
          <Icon name="monetization-on" size={24} color={colors.white} />
        </View>
        <View style={styles.amountBadge}>
          <Animated.Text style={styles.amountText}>
            +{amount}
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Particles */}
      {renderParticles()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  mainCoin: {
    position: 'absolute',
    alignItems: 'center',
  },
  coinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.tertiary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  amountBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  amountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.tertiary,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CoinEarningAnimation;