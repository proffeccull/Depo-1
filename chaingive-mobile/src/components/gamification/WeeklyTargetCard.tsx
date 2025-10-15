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
import { updateTargetProgress } from '../../store/slices/weeklyTargetsSlice';
import { WeeklyTarget, TargetItem } from '../../store/slices/weeklyTargetsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface WeeklyTargetCardProps {
  target: WeeklyTarget;
  compact?: boolean;
  onPress?: () => void;
  onUpdateProgress?: (categoryId: string, amount: number) => void;
  onCustomize?: () => void;
  showAIInsights?: boolean;
}

export const WeeklyTargetCard: React.FC<WeeklyTargetCardProps> = ({
  target,
  compact = false,
  onPress,
  onUpdateProgress,
  onCustomize,
  showAIInsights = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [animatingProgress, setAnimatingProgress] = useState<string | null>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    // Initialize progress animations
    target.targets.forEach(item => {
      if (!progressAnims[item.id]) {
        progressAnims[item.id] = new Animated.Value(0);
      }
      // Animate to current progress
      Animated.timing(progressAnims[item.id], {
        toValue: (item.currentAmount / item.targetAmount) * 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [target.targets]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleCategoryPress = (categoryId: string) => {
    Haptics.selectionAsync();
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleQuickUpdate = async (categoryId: string, amount: number) => {
    if (!user) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAnimatingProgress(categoryId);

      await dispatch(updateTargetProgress({
        targetId: target.id,
        categoryId,
        amount,
        userId: user.id,
      })).unwrap();

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset animation state after delay
      setTimeout(() => setAnimatingProgress(null), 1000);

    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAnimatingProgress(null);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return colors.success;
    if (progress >= 75) return colors.warning;
    return colors.primary;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
      default: return colors.primary;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getDaysRemaining = () => {
    const endDate = new Date(target.weekEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getOverallProgress = () => {
    return (target.currentAmount / target.totalTargetAmount) * 100;
  };

  const isCompleted = getOverallProgress() >= 100;
  const isNearDeadline = getDaysRemaining() <= 2 && !isCompleted;
  const daysRemaining = getDaysRemaining();

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
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
            <View style={styles.titleSection}>
              <Text style={styles.title}>Weekly Targets</Text>
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Icon name="calendar-today" size={14} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.metaText}>
                    {daysRemaining} days left
                  </Text>
                </View>
                {target.generatedByAI && (
                  <View style={styles.metaItem}>
                    <Icon name="psychology" size={14} color="#FFD700" />
                    <Text style={styles.aiText}>AI Powered</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.rewardSection}>
              <View style={styles.rewardItem}>
                <Icon name="stars" size={16} color="#FFD700" />
                <Text style={styles.rewardText}>
                  {target.rewardCoins} coins
                </Text>
              </View>
              {target.bonusReward > 0 && (
                <View style={styles.rewardItem}>
                  <Icon name="local-fire-department" size={16} color="#FFD700" />
                  <Text style={styles.rewardText}>
                    +{target.bonusReward} bonus
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Overall Progress */}
          <View style={styles.overallProgress}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressPercent}>
                {getOverallProgress().toFixed(1)}%
              </Text>
            </View>

            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: Animated.interpolate(progressAnims[target.targets[0]?.id] || new Animated.Value(0), {
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: getProgressColor(getOverallProgress()),
                  },
                ]}
              />
            </View>

            <View style={styles.progressStats}>
              <Text style={styles.currentAmount}>
                {formatCurrency(target.currentAmount)}
              </Text>
              <Text style={styles.targetAmount}>
                of {formatCurrency(target.totalTargetAmount)}
              </Text>
            </View>
          </View>

          {/* Target Categories */}
          {!compact && (
            <View style={styles.categoriesSection}>
              <Text style={styles.categoriesTitle}>Category Targets</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {target.targets.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(item.id)}
                  >
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName} numberOfLines={1}>
                        {item.categoryName}
                      </Text>
                      <View style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(item.difficulty) }
                      ]}>
                        <Text style={styles.difficultyText}>
                          {item.difficulty.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.categoryProgress}>
                      <View style={styles.categoryProgressBar}>
                        <Animated.View
                          style={[
                            styles.categoryProgressFill,
                            {
                              width: progressAnims[item.id]?.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                              }) || '0%',
                              backgroundColor: getProgressColor((item.currentAmount / item.targetAmount) * 100),
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.categoryProgressText}>
                        {((item.currentAmount / item.targetAmount) * 100).toFixed(0)}%
                      </Text>
                    </View>

                    <View style={styles.categoryAmounts}>
                      <Text style={styles.categoryCurrent}>
                        {formatCurrency(item.currentAmount)}
                      </Text>
                      <Text style={styles.categoryTarget}>
                        / {formatCurrency(item.targetAmount)}
                      </Text>
                    </View>

                    {/* Quick Actions */}
                    {expandedCategory === item.id && (
                      <View style={styles.quickActions}>
                        <TouchableOpacity
                          style={styles.quickActionButton}
                          onPress={() => handleQuickUpdate(item.id, 1000)}
                          disabled={animatingProgress === item.id}
                        >
                          <Text style={styles.quickActionText}>+₦1K</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.quickActionButton}
                          onPress={() => handleQuickUpdate(item.id, 5000)}
                          disabled={animatingProgress === item.id}
                        >
                          <Text style={styles.quickActionText}>+₦5K</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.quickActionButton}
                          onPress={() => onUpdateProgress?.(item.id, 0)}
                        >
                          <Icon name="edit" size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* AI Insights */}
          {showAIInsights && target.aiInsights && !compact && (
            <View style={styles.aiInsights}>
              <View style={styles.aiHeader}>
                <Icon name="lightbulb" size={16} color="#FFD700" />
                <Text style={styles.aiTitle}>AI Insights</Text>
              </View>
              <Text style={styles.aiText}>
                {target.aiInsights.recommendations.suggestedAmount > target.totalTargetAmount
                  ? "Consider increasing your targets for better rewards!"
                  : "Your targets are well-balanced for your donation history."
                }
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onCustomize}
            >
              <Icon name="tune" size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Customize</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePress}
            >
              <Text style={styles.primaryButtonText}>View Details</Text>
              <Icon name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* FOMO Elements */}
          {isNearDeadline && (
            <View style={styles.fomoBadge}>
              <Icon name="schedule" size={14} color="#FFF" />
              <Text style={styles.fomoText}>Only {daysRemaining} days left!</Text>
            </View>
          )}

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Icon name="celebration" size={14} color="#FFF" />
              <Text style={styles.completedText}>Targets Completed! 🎉</Text>
            </View>
          )}

          {/* Completion Celebration */}
          {isCompleted && (
            <View style={styles.celebrationOverlay}>
              <Text style={styles.celebrationText}>🎯 Weekly Targets Achieved!</Text>
              <Text style={styles.celebrationSubtext}>
                {target.rewardCoins + (target.isBonusAchieved ? target.bonusReward : 0)} coins earned
              </Text>
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
    marginBottom: spacing.lg,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiText: {
    ...typography.caption,
    color: '#FFD700',
    fontWeight: '600',
  },
  rewardSection: {
    alignItems: 'flex-end',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  rewardText: {
    ...typography.caption,
    color: '#FFD700',
    fontWeight: '600',
  },
  overallProgress: {
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
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
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
  categoriesSection: {
    marginBottom: spacing.lg,
  },
  categoriesTitle: {
    ...typography.button,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  categoriesScroll: {
    gap: spacing.md,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    width: screenWidth * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    ...typography.button,
    color: '#FFF',
    fontWeight: '600',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 10,
  },
  difficultyText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryProgressText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
    minWidth: 35,
    textAlign: 'right',
  },
  categoryAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  categoryCurrent: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
  },
  categoryTarget: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  quickActionText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: '600',
  },
  aiInsights: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiTitle: {
    ...typography.button,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  aiText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.button,
    color: '#FFF',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: 'bold',
  },
  fomoBadge: {
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
  fomoText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  completedBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  completedText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  celebrationText: {
    ...typography.h2,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  celebrationSubtext: {
    ...typography.button,
    color: '#FFF',
    textAlign: 'center',
  },
});