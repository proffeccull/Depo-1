import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import CoinParticleSystem from './CoinParticleSystem';
import { coinSounds } from './CoinSoundEffects';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CoinCelebrationModalProps {
  visible: boolean;
  type: 'milestone' | 'achievement' | 'level_up' | 'streak' | 'purchase';
  title: string;
  message: string;
  coinReward?: number;
  badge?: string;
  nft?: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const CoinCelebrationModal: React.FC<CoinCelebrationModalProps> = ({
  visible,
  type,
  title,
  message,
  coinReward,
  badge,
  nft,
  onClose,
  autoClose = true,
  autoCloseDelay = 4000,
}) => {
  const [showParticles, setShowParticles] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const modalAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const rewardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      startCelebration();
    } else {
      resetAnimations();
    }
  }, [visible]);

  const startCelebration = async () => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Sound effects based on type
    switch (type) {
      case 'milestone':
        await coinSounds.playMilestoneReach();
        break;
      case 'achievement':
        await coinSounds.playAchievementUnlock();
        break;
      case 'level_up':
        await coinSounds.playLevelUp();
        break;
      case 'streak':
        await coinSounds.playStreakBonus();
        break;
      case 'purchase':
        await coinSounds.playCoinPurchase();
        break;
    }

    // Modal entrance animation
    Animated.parallel([
      Animated.spring(modalAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start celebration sequence
      celebrationSequence();
    });
  };

  const celebrationSequence = () => {
    const steps = [
      // Step 1: Show confetti
      () => {
        setShowParticles(true);
        Animated.spring(confettiAnim, {
          toValue: 1,
          friction: 5,
          tension: 200,
          useNativeDriver: true,
        }).start();
        setTimeout(() => setCurrentStep(1), 800);
      },
      // Step 2: Show rewards
      () => {
        Animated.spring(rewardAnim, {
          toValue: 1,
          friction: 6,
          tension: 150,
          useNativeDriver: true,
        }).start();
        setTimeout(() => setCurrentStep(2), 1000);
      },
      // Step 3: Final celebration
      () => {
        setTimeout(() => {
          if (autoClose) {
            handleClose();
          }
        }, autoCloseDelay);
      },
    ];

    steps.forEach((step, index) => {
      setTimeout(step, index * 1000);
    });
  };

  const resetAnimations = () => {
    modalAnim.setValue(0);
    contentAnim.setValue(0);
    confettiAnim.setValue(0);
    rewardAnim.setValue(0);
    setCurrentStep(0);
    setShowParticles(false);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      resetAnimations();
    });
  };

  const getCelebrationConfig = () => {
    const configs = {
      milestone: {
        colors: ['#FFD700', '#FFA500'],
        icon: 'flag',
        particleType: 'burst' as const,
        particleIntensity: 'heavy' as const,
      },
      achievement: {
        colors: ['#9932CC', '#8A2BE2'],
        icon: 'emoji-events',
        particleType: 'explosion' as const,
        particleIntensity: 'heavy' as const,
      },
      level_up: {
        colors: ['#28A745', '#20B545'],
        icon: 'trending-up',
        particleType: 'fountain' as const,
        particleIntensity: 'medium' as const,
      },
      streak: {
        colors: ['#FF6B35', '#FF8B35'],
        icon: 'local-fire-department',
        particleType: 'rain' as const,
        particleIntensity: 'medium' as const,
      },
      purchase: {
        colors: ['#17A2B8', '#20B8CC'],
        icon: 'shopping-cart',
        particleType: 'shower' as const,
        particleIntensity: 'light' as const,
      },
    };
    return configs[type];
  };

  const config = getCelebrationConfig();

  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const confettiScale = confettiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rewardScale = rewardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Particle System */}
        {showParticles && (
          <CoinParticleSystem
            trigger={showParticles}
            type={config.particleType}
            intensity={config.particleIntensity}
            duration={3000}
          />
        )}

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: modalScale }],
              opacity: modalOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={config.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  transform: [{ translateY: contentTranslateY }],
                },
              ]}
            >
              {/* Celebration Icon */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: confettiScale }],
                  },
                ]}
              >
                <View style={styles.iconCircle}>
                  <Icon name={config.icon} size={48} color={colors.white} />
                </View>
              </Animated.View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Rewards */}
              {(coinReward || badge || nft) && (
                <Animated.View
                  style={[
                    styles.rewardsContainer,
                    {
                      transform: [{ scale: rewardScale }],
                    },
                  ]}
                >
                  {coinReward && (
                    <View style={styles.rewardItem}>
                      <Icon name="monetization-on" size={24} color={colors.tertiary} />
                      <Text style={styles.rewardText}>
                        +{coinReward.toLocaleString()} coins
                      </Text>
                    </View>
                  )}

                  {badge && (
                    <View style={styles.rewardItem}>
                      <Icon name="emoji-events" size={24} color={colors.warning} />
                      <Text style={styles.rewardText}>{badge}</Text>
                    </View>
                  )}

                  {nft && (
                    <View style={styles.rewardItem}>
                      <Icon name="token" size={24} color={colors.secondary} />
                      <Text style={styles.rewardText}>NFT Unlocked</Text>
                    </View>
                  )}
                </Animated.View>
              )}

              {/* Close Button */}
              {!autoClose && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <Text style={styles.closeButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  modalGradient: {
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  message: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  rewardsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  rewardText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default CoinCelebrationModal;