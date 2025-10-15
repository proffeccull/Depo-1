import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../store/store';
import { unlockLevelPerk, fetchUserLevel } from '../../store/slices/userLevelsSlice';
import { UserLevel, LevelPerk } from '../../store/slices/userLevelsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface UserLevelCardProps {
  userLevel: UserLevel | null;
  compact?: boolean;
  onPress?: () => void;
  onUnlockPerk?: (perkId: string) => void;
  showPerks?: boolean;
  showProgress?: boolean;
}

export const UserLevelCard: React.FC<UserLevelCardProps> = ({
  userLevel,
  compact = false,
  onPress,
  onUnlockPerk,
  showPerks = true,
  showProgress = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [celebrating, setCelebrating] = useState(false);
  const [unlockingPerk, setUnlockingPerk] = useState<string | null>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animate progress bar
    if (userLevel) {
      Animated.timing(progressAnim, {
        toValue: userLevel.progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [userLevel]);

  useEffect(() => {
    if (celebrating) {
      // Celebration animation sequence
      Animated.sequence([
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setCelebrating(false));
    }
  }, [celebrating]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress?.();
  };

  const handleUnlockPerk = async (perk: LevelPerk) => {
    if (!user || perk.isActive) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setUnlockingPerk(perk.id);

      await dispatch(unlockLevelPerk({
        userId: user.id,
        perkId: perk.id,
      })).unwrap();

      // Success celebration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCelebrating(true);

      onUnlockPerk?.(perk.id);

    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUnlockingPerk(null);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    return colors[level % colors.length];
  };

  const getPerkIcon = (perkType: string) => {
    switch (perkType) {
      case 'coin_multiplier': return 'stars';
      case 'faster_earning': return 'trending-up';
      case 'exclusive_access': return 'lock-open';
      case 'priority_support': return 'support';
      case 'customization': return 'palette';
      case 'social_badge': return 'badge';
      default: return 'star';
    }
  };

  const getMotivationalText = () => {
    if (!userLevel) return "Start your journey!";

    const progressPercent = userLevel.progress;
    if (progressPercent >= 90) {
      return "Almost there! Keep pushing!";
    } else if (progressPercent >= 75) {
      return "You're on fire! Level up soon!";
    } else if (progressPercent >= 50) {
      return "Halfway to glory! Stay strong!";
    } else if (progressPercent >= 25) {
      return "Great progress! Keep going!";
    } else {
      return "Every step counts! You've got this!";
    }
  };

  if (!userLevel) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Icon name="account-circle" size={48} color={colors.gray[400]} />
        <Text style={styles.loadingText}>Loading your level...</Text>
      </View>
    );
  }

  const nextLevelXP = userLevel.xp + userLevel.xpToNext;
  const progressPercent = userLevel.progress;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.touchable, compact && styles.touchableCompact]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[getLevelColor(userLevel.level), getLevelColor(userLevel.level + 1)]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.levelInfo}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{userLevel.level}</Text>
              </View>
              <View style={styles.levelDetails}>
                <Text style={styles.levelName}>{userLevel.levelName}</Text>
                <Text style={styles.motivationalText}>{getMotivationalText()}</Text>
              </View>
            </View>

            <View style={styles.xpInfo}>
              <Text style={styles.xpLabel}>XP</Text>
              <Text style={styles.xpValue}>{userLevel.xp.toLocaleString()}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          {showProgress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress to Level {userLevel.level + 1}</Text>
                <Text style={styles.progressPercent}>{progressPercent.toFixed(1)}%</Text>
              </View>

              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>

              <View style={styles.progressStats}>
                <Text style={styles.currentXP}>{userLevel.xp.toLocaleString()} XP</Text>
                <Text style={styles.neededXP}>{nextLevelXP.toLocaleString()} XP needed</Text>
              </View>
            </View>
          )}

          {/* Active Perks */}
          {showPerks && userLevel.perks && userLevel.perks.length > 0 && (
            <View style={styles.perksSection}>
              <Text style={styles.perksTitle}>Active Perks</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.perksScroll}
              >
                {userLevel.perks
                  .filter(perk => perk.isActive)
                  .map((perk) => (
                    <View key={perk.id} style={styles.perkBadge}>
                      <Icon name={getPerkIcon(perk.perkType)} size={16} color="#FFD700" />
                      <Text style={styles.perkText}>{perk.name}</Text>
                      {perk.value && perk.value > 1 && (
                        <Text style={styles.perkValue}>{perk.value}x</Text>
                      )}
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Available Perks to Unlock */}
          {showPerks && userLevel.perks && userLevel.perks.some(p => !p.isActive) && (
            <View style={styles.unlockSection}>
              <Text style={styles.unlockTitle}>Unlock at Next Level</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.unlockScroll}
              >
                {userLevel.perks
                  .filter(perk => !perk.isActive)
                  .slice(0, 3) // Show next 3 perks
                  .map((perk) => (
                    <TouchableOpacity
                      key={perk.id}
                      style={[
                        styles.unlockPerk,
                        unlockingPerk === perk.id && styles.unlockPerkLoading,
                      ]}
                      onPress={() => handleUnlockPerk(perk)}
                      disabled={unlockingPerk === perk.id}
                    >
                      <Icon name={getPerkIcon(perk.perkType)} size={20} color="#FFF" />
                      <Text style={styles.unlockPerkText}>{perk.name}</Text>
                      {perk.value && perk.value > 1 && (
                        <Text style={styles.unlockPerkValue}>{perk.value}x</Text>
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{userLevel.totalXP.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{userLevel.perks?.filter(p => p.isActive).length || 0}</Text>
              <Text style={styles.statLabel}>Perks</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{userLevel.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          {/* Level Up Celebration Overlay */}
          <Animated.View
            style={[
              styles.celebrationOverlay,
              {
                opacity: celebrationAnim,
                transform: [{
                  scale: celebrationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                }],
              },
            ]}
          >
            <View style={styles.celebrationContent}>
              <Icon name="celebration" size={32} color="#FFD700" />
              <Text style={styles.celebrationText}>LEVEL UP!</Text>
              <Text style={styles.celebrationSubtext}>New perks unlocked!</Text>
            </View>
          </Animated.View>

          {/* FOMO Elements */}
          {progressPercent >= 90 && (
            <View style={styles.nearLevelUpBadge}>
              <Icon name="local-fire-department" size={14} color="#FFF" />
              <Text style={styles.nearLevelUpText}>Almost level {userLevel.level + 1}!</Text>
            </View>
          )}

          {/* Achievement Indicator */}
          {userLevel.level >= 10 && (
            <View style={styles.achievementBadge}>
              <Icon name="military-tech" size={14} color="#FFD700" />
              <Text style={styles.achievementText}>Elite Donor</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  touchable: {
    borderRadius: 16,
  },
  touchableCompact: {
    // Compact styles can be added here
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 16,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  levelNumber: {
    ...typography.h1,
    color: '#FFF',
    fontWeight: 'bold',
  },
  levelDetails: {
    flex: 1,
  },
  levelName: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  motivationalText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  xpInfo: {
    alignItems: 'center',
  },
  xpLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xxs,
  },
  xpValue: {
    ...typography.h2,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.button,
    color: '#FFF',
    fontWeight: '600',
  },
  progressPercent: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentXP: {
    ...typography.button,
    color: '#FFF',
    fontWeight: '600',
  },
  neededXP: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  perksSection: {
    marginBottom: spacing.lg,
  },
  perksTitle: {
    ...typography.button,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  perksScroll: {
    gap: spacing.sm,
  },
  perkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  perkText: {
    ...typography.caption,
    color: '#FFD700',
    fontWeight: '600',
  },
  perkValue: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  unlockSection: {
    marginBottom: spacing.lg,
  },
  unlockTitle: {
    ...typography.button,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  unlockScroll: {
    gap: spacing.sm,
  },
  unlockPerk: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  unlockPerkLoading: {
    opacity: 0.6,
  },
  unlockPerkText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  unlockPerkValue: {
    ...typography.caption,
    color: '#FFD700',
    fontWeight: 'bold',
    marginTop: spacing.xxs,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xxs,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(34, 197, 94, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  celebrationContent: {
    alignItems: 'center',
  },
  celebrationText: {
    ...typography.h1,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  celebrationSubtext: {
    ...typography.button,
    color: '#FFF',
  },
  nearLevelUpBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  nearLevelUpText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  achievementBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  achievementText: {
    ...typography.caption,
    color: '#000',
    fontWeight: 'bold',
  },
});