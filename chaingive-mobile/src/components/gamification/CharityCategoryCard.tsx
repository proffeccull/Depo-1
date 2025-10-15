import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { CharityCategory } from '../../store/slices/charityCategoriesSlice';

const { width: screenWidth } = Dimensions.get('window');

interface CharityCategoryCardProps {
  category: CharityCategory;
  userProgress?: {
    totalDonated: number;
    donationCount: number;
    level: number;
    xp: number;
  };
  showActions?: boolean;
  compact?: boolean;
  onPress?: () => void;
  onDonate?: (amount: number) => void;
  onViewDetails?: () => void;
}

export const CharityCategoryCard: React.FC<CharityCategoryCardProps> = ({
  category,
  userProgress,
  showActions = true,
  compact = false,
  onPress,
  onDonate,
  onViewDetails,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar on mount
    Animated.timing(progressAnim, {
      toValue: (category.currentAmount / category.targetAmount) * 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [category.currentAmount, category.targetAmount]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
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

  const handleDonate = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDonate?.(amount);
  };

  const getCategoryColors = () => {
    const colorMap: { [key: string]: [string, string] } = {
      Education: ['#667eea', '#764ba2'],
      Healthcare: ['#f093fb', '#f5576c'],
      Environment: ['#4facfe', '#00f2fe'],
      Poverty: ['#43e97b', '#38f9d7'],
      Children: ['#fa709a', '#fee140'],
      Animals: ['#a8edea', '#fed6e3'],
      Disaster: ['#ff9a9e', '#fecfef'],
      Technology: ['#ffecd2', '#fcb69f'],
    };
    return colorMap[category.name] || ['#667eea', '#764ba2'];
  };

  const getDifficultyColor = () => {
    switch (category.difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
      default: return colors.primary;
    }
  };

  const getProgressColor = () => {
    const progress = (category.currentAmount / category.targetAmount) * 100;
    if (progress >= 100) return colors.success;
    if (progress >= 75) return colors.warning;
    return colors.primary;
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const cardWidth = compact ? (screenWidth - spacing.lg * 3) / 2 : screenWidth - spacing.lg * 2;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.container, { width: cardWidth }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getCategoryColors()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.categoryIcon}>
              <Icon name={category.icon} size={24} color="#FFF" />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.badges}>
                {category.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Icon name="star" size={12} color="#FFD700" />
                    <Text style={styles.premiumText}>PREMIUM</Text>
                  </View>
                )}
                {category.featured && (
                  <View style={styles.featuredBadge}>
                    <Icon name="local-fire-department" size={12} color="#FFF" />
                    <Text style={styles.featuredText}>HOT</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={[styles.difficultyIndicator, { backgroundColor: getDifficultyColor() }]}>
              <Text style={styles.difficultyText}>
                {category.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Description */}
          {!compact && (
            <Text style={styles.description} numberOfLines={2}>
              {category.description}
            </Text>
          )}

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>
                {((category.currentAmount / category.targetAmount) * 100).toFixed(1)}%
              </Text>
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
                    backgroundColor: getProgressColor(),
                  },
                ]}
              />
            </View>

            <View style={styles.progressStats}>
              <Text style={styles.currentAmount}>
                {formatCurrency(category.currentAmount)}
              </Text>
              <Text style={styles.targetAmount}>
                of {formatCurrency(category.targetAmount)}
              </Text>
            </View>
          </View>

          {/* User Progress (if available) */}
          {userProgress && (
            <View style={styles.userProgress}>
              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>Your Donations</Text>
                <Text style={styles.userStatValue}>
                  {formatCurrency(userProgress.totalDonated)}
                </Text>
              </View>
              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>Level</Text>
                <Text style={styles.userStatValue}>{userProgress.level}</Text>
              </View>
              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>XP</Text>
                <Text style={styles.userStatValue}>{userProgress.xp}</Text>
              </View>
            </View>
          )}

          {/* Reward Info */}
          <View style={styles.rewardSection}>
            <View style={styles.rewardItem}>
              <Icon name="stars" size={16} color="#FFD700" />
              <Text style={styles.rewardText}>
                {category.rewardMultiplier}x coins
              </Text>
            </View>
            <View style={styles.rewardItem}>
              <Icon name="people" size={16} color="#FFF" />
              <Text style={styles.rewardText}>
                {category.popularity} donors
              </Text>
            </View>
          </View>

          {/* Actions */}
          {showActions && !compact && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDonate(1000)}
              >
                <Text style={styles.actionButtonText}>Donate ₦1K</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onViewDetails}
              >
                <Text style={styles.secondaryButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FOMO Indicator */}
          {category.featured && (
            <View style={styles.fomoIndicator}>
              <Icon name="trending-up" size={16} color="#FFF" />
              <Text style={styles.fomoText}>Trending Now!</Text>
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
  gradient: {
    padding: spacing.lg,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  categoryName: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xxs,
  },
  premiumText: {
    ...typography.caption,
    color: '#000',
    fontWeight: 'bold',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xxs,
  },
  featuredText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  difficultyIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  difficultyText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  description: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: spacing.lg,
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
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  userProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  userStat: {
    alignItems: 'center',
    flex: 1,
  },
  userStatLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xxs,
  },
  userStatValue: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
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
    color: '#FFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  secondaryButtonText: {
    ...typography.button,
    color: '#FFF',
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
});