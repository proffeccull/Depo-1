import React, { useEffect, useRef, useState } from 'react';
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
  velocityX: number;
  velocityY: number;
  life: number;
}

interface CoinParticleSystemProps {
  trigger: boolean;
  type: 'rain' | 'explosion' | 'fountain' | 'shower' | 'burst';
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
  coinColor?: string;
  onComplete?: () => void;
}

const CoinParticleSystem: React.FC<CoinParticleSystemProps> = ({
  trigger,
  type = 'rain',
  intensity = 'medium',
  duration = 2000,
  coinColor = colors.tertiary,
  onComplete,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (trigger) {
      startParticleSystem();
    }
  }, [trigger]);

  const getParticleCount = () => {
    const counts = {
      light: 15,
      medium: 30,
      heavy: 50,
    };
    return counts[intensity];
  };

  const createParticle = (id: number, startX: number, startY: number): Particle => {
    const particle: Particle = {
      id,
      x: new Animated.Value(startX),
      y: new Animated.Value(startY),
      scale: new Animated.Value(0.5),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(0),
      velocityX: (Math.random() - 0.5) * 8,
      velocityY: type === 'fountain' ? -(Math.random() * 6 + 4) : Math.random() * 4 + 2,
      life: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
    };

    return particle;
  };

  const getStartPosition = () => {
    switch (type) {
      case 'rain':
        return { x: Math.random() * screenWidth, y: -20 };
      case 'explosion':
        return { x: screenWidth / 2, y: screenHeight / 2 };
      case 'fountain':
        return { x: screenWidth / 2, y: screenHeight - 100 };
      case 'shower':
        return { x: Math.random() * screenWidth, y: -20 };
      case 'burst':
        return { x: screenWidth / 2, y: screenHeight / 3 };
      default:
        return { x: screenWidth / 2, y: screenHeight / 2 };
    }
  };

  const startParticleSystem = () => {
    const particleCount = getParticleCount();
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const startPos = getStartPosition();
      const particle = createParticle(i, startPos.x, startPos.y);
      newParticles.push(particle);
    }

    setParticles(newParticles);

    // Start animations
    newParticles.forEach((particle, index) => {
      const delay = index * 50; // Stagger particle starts

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Scale up
          Animated.spring(particle.scale, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
          // Movement
          Animated.timing(particle.x, {
            toValue: particle.x._value + particle.velocityX * duration * 0.001 * particle.life,
            duration: duration * particle.life,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: particle.y._value + particle.velocityY * duration * 0.001 * particle.life,
            duration: duration * particle.life,
            useNativeDriver: true,
          }),
          // Rotation
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 720, // Multiple rotations
            duration: duration * particle.life,
            useNativeDriver: true,
          }),
        ]),
        // Fade out
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Haptic feedback based on intensity
    if (intensity === 'heavy') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (intensity === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Cleanup after animation
    setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, duration + 500);
  };

  const renderParticle = (particle: Particle) => (
    <Animated.View
      key={particle.id}
      style={[
        styles.particle,
        {
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
      <Icon name="monetization-on" size={16} color={coinColor} />
    </Animated.View>
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(renderParticle)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CoinParticleSystem;