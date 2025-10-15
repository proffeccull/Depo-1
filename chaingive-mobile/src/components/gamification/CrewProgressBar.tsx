import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Crew } from '../../store/slices/crewSlice';

const { width: screenWidth } = Dimensions.get('window');

interface CrewProgressBarProps {
  crew: Crew;
  showDetails?: boolean;
  compact?: boolean;
  onPress?: () => void;
  onJoinCrew?: () => void;
  onViewMembers?: () => void;
  animated?: boolean;
}

export const CrewProgressBar: React.FC<CrewProgressBarProps> = ({
  crew,
  showDetails = true,
  compact = false,
  onPress,
  onJoinCrew,
  onViewMembers,
  animated = true,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: (crew.currentAmount / crew.targetAmount) * 100,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Pulse animation for active crews
      if (crew.status === 'active') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      progressAnim.setValue((crew.currentAmount / crew.targetAmount) * 100);
    }
  }, [crew.currentAmount, crew.targetAmount, crew.status, animated]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const handleJoinCrew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onJoinCrew?.();
  };

  const handleViewMembers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewMembers?.();
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getProgressColor = () => {
    const progress = (crew.currentAmount / crew.targetAmount) * 100;
    if (progress >= 100) return colors.success;
    if (progress >= 75) return colors.warning;
    return colors.primary;
  };

  const getStatusColor = () => {
    switch (crew.status) {
      case 'active': return colors.success;
      case 'completed': return colors.primary;
      case 'expired': return colors.error;
      case 'forming': return colors.warning;
      default: return colors.gray[400];
    }
  };

  const getStatusText = () => {
    switch (crew.status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'expired': return 'Expired';
      case 'forming': return 'Forming';
      default: return 'Unknown';
    }
  };

  const progressPercentage = (crew.currentAmount / crew.targetAmount) * 100;
  const isCompleted = progressPercentage >= 100;
  const isNearCompletion = progressPercentage >= 90 && !isCompleted;

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[styles.container, compact && styles.containerCompact]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.crewInfo}>
              <Text style={styles.crewName} numberOfLines={1}>
                {crew.name}
              </Text>
              {!compact && (
                <Text style={styles.crewLeader}>
                  Led by {crew.leaderName}
                </Text>
              )}
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Crew Progress</Text>
              <Text style={styles.progressPercent}>
                {progressPercentage.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: getProgressColor(),
                    },
                  ]}
                />
              </View>

              {/* Completion Indicator */}
              {isNearCompletion && !isCompleted && (
                <View style={styles.nearCompletionIndicator}>
                  <Icon name="local-fire-department" size={16} color="#FFF" />
                  <Text style={styles.nearCompletionText}>Almost there!</Text>
                </View>
              )}

              {/* Completion Badge */}
              {isCompleted && (
                <View style={styles.completionBadge}>
                  <Icon name="celebration" size={16} color="#FFF" />
                  <Text style={styles.completionText}>Completed!</Text>
                </View>
              )}
            </View>

            <View style={styles.progressStats}>
              <Text style={styles.currentAmount}>
                {formatCurrency(crew.currentAmount)}
              </Text>
              <Text style={styles.targetAmount}>
                of {formatCurrency(crew.targetAmount)}
              </Text>
            </View>
          </View>

          {/* Crew Stats */}
          {!compact && (
            <View style={styles.crewStats}>
              <View style={styles.statItem}>
                <Icon name="group" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.statText}>
                  {crew.memberCount}/{crew.maxMembers} members
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="schedule" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.statText}>
                  {Math.ceil((new Date(crew.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                </Text>
              </View>
            </View>
          )}

          {/* Reward Preview */}
          <View style={styles.rewardSection}>
            <View style={styles.rewardItem}>
              <Icon name="stars" size={16} color="#FFD700" />
              <Text style={styles.rewardText}>
                {formatCurrency(crew.rewardPool)} reward pool
              </Text>
            </View>
            <View style={styles.rewardItem}>
              <Icon name="emoji-events" size={16} color="#FFD700" />
              <Text style={styles.rewardText}>
                Massive bonuses
              </Text>
            </View>
          </View>

          {/* Actions */}
          {showDetails && !compact && (
            <View style={styles.actions}>
              {crew.status === 'forming' || crew.status === 'active' ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleJoinCrew}
                >
                  <Icon name="group-add" size={18} color="#FFF" />
                  <Text style={styles.primaryButtonText}>Join Crew</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleViewMembers}
                >
                  <Icon name="visibility" size={18} color={colors.primary} />
                  <Text style={styles.secondaryButtonText}>View Members</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* FOMO Elements */}
          {crew.status === 'active' && progressPercentage < 90 && (
            <View style={styles.fomoIndicator}>
              <Icon name="trending-up" size={16} color="#FFF" />
              <Text style={styles.fomoText}>Crew is growing!</Text>
            </View>
          )}

          {/* Completion Celebration */}
          {isCompleted && (
            <View style={styles.celebrationOverlay}>
              <Icon name="celebration" size={24} color="#FFF" />
              <Text style={styles.celebrationText}>🎉 Crew Completed!</Text>
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
  containerCompact: {
    marginBottom: spacing.sm,
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  crewLeader: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: '600',
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
  progressBarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  nearCompletionIndicator: {
    position: 'absolute',
    right: -spacing.sm,
    top: -spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  nearCompletionText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  completionBadge: {
    position: 'absolute',
    right: -spacing.sm,
    top: -spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  completionText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentAmount: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  targetAmount: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  crewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rewardSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardText: {
    ...typography.caption,
    color: '#FFD700',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
  fomoIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  fomoText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  celebrationText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
});