import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import {
  fetchCurrentWeeklyTarget,
  generateWeeklyTarget,
  updateTargetProgress,
  completeWeeklyTarget,
  fetchWeeklyTargetStats,
  customizeWeeklyTarget,
  skipWeeklyTarget,
  getAISuggestions,
} from '../../store/slices/weeklyTargetsSlice';
import { WeeklyTargetCard } from '../../components/gamification/WeeklyTargetCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const WeeklyTargetsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    currentTarget,
    pastTargets,
    targetStats,
    aiSuggestions,
    loading,
    error,
  } = useSelector((state: RootState) => state.weeklyTargets);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchCurrentWeeklyTarget(currentUser.id));
      dispatch(fetchWeeklyTargetStats(currentUser.id));
    }
  }, [currentUser]);

  const handleGenerateTarget = () => {
    if (!currentUser?.id) return;

    Alert.alert(
      'Generate Weekly Target',
      'Let AI create personalized charitable goals based on your activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            dispatch(generateWeeklyTarget({
              userId: currentUser.id,
              preferences: { includeAI: true },
            }));
          },
        },
      ]
    );
  };

  const handleCustomizeTarget = () => {
    if (!currentTarget) return;
    setCustomizing(true);
    // This would open a customization modal
    Alert.alert('Customize Target', 'Target customization form would open here');
    setCustomizing(false);
  };

  const handleSkipTarget = () => {
    if (!currentTarget || !currentUser?.id) return;

    Alert.alert(
      'Skip This Week',
      'Are you sure you want to skip this week\'s target? You won\'t earn rewards but can generate a new one.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            dispatch(skipWeeklyTarget({
              targetId: currentTarget.id,
              userId: currentUser.id,
              reason: 'User requested skip',
            }));
          },
        },
      ]
    );
  };

  const handleGetAISuggestions = () => {
    if (!currentUser?.id) return;

    dispatch(getAISuggestions({
      userId: currentUser.id,
      context: {
        currentMood: 'motivated',
        availableTime: 10,
        budget: 50000,
      },
    }));
    setShowAISuggestions(true);
  };

  const renderCurrentTarget = () => {
    if (!currentTarget) {
      return (
        <View style={styles.noTargetContainer}>
          <Icon name="target" size={64} color={colors.text.secondary} />
          <Text style={styles.noTargetTitle}>No Active Target</Text>
          <Text style={styles.noTargetSubtitle}>
            Generate AI-powered weekly goals to maximize your charitable impact and earn rewards
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateTarget}
          >
            <Icon name="smart-toy" size={20} color="#FFF" />
            <Text style={styles.generateButtonText}>Generate with AI</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.currentTargetContainer}>
        <WeeklyTargetCard
          target={currentTarget}
          onCustomize={handleCustomizeTarget}
          onSkip={handleSkipTarget}
          compact={false}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleGetAISuggestions}
          >
            <Icon name="lightbulb" size={20} color={colors.primary} />
            <Text style={styles.quickActionText}>AI Tips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Progress', 'Detailed progress view would open')}
          >
            <Icon name="analytics" size={20} color={colors.secondary} />
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Share', 'Share target with friends')}
          >
            <Icon name="share" size={20} color={colors.info} />
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStats = () => {
    if (!targetStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{targetStats.totalWeeks}</Text>
            <Text style={styles.statLabel}>Weeks Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{targetStats.completedWeeks}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(targetStats.averageProgress)}%</Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{targetStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>

        {targetStats.bestWeek.amount > 0 && (
          <View style={styles.bestWeekCard}>
            <Icon name="emoji-events" size={24} color={colors.tertiary} />
            <View style={styles.bestWeekInfo}>
              <Text style={styles.bestWeekTitle}>Best Week</Text>
              <Text style={styles.bestWeekAmount}>
                ₦{targetStats.bestWeek.amount.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderAISuggestions = () => {
    if (!showAISuggestions || !aiSuggestions.length) return null;

    return (
      <View style={styles.aiSuggestionsContainer}>
        <View style={styles.aiHeader}>
          <Icon name="smart-toy" size={24} color={colors.primary} />
          <Text style={styles.aiTitle}>AI Suggestions</Text>
          <TouchableOpacity onPress={() => setShowAISuggestions(false)}>
            <Icon name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {aiSuggestions.map((suggestion, index) => (
          <View key={index} style={styles.aiSuggestion}>
            <Text style={styles.aiSuggestionText}>{suggestion.description}</Text>
            <Text style={styles.aiSuggestionAmount}>
              ₦{suggestion.targetAmount.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPastTargets = () => {
    if (!pastTargets.length) return null;

    return (
      <View style={styles.pastTargetsContainer}>
        <Text style={styles.sectionTitle}>Past Targets</Text>
        {pastTargets.slice(0, 3).map((target) => (
          <WeeklyTargetCard
            key={target.id}
            target={target}
            compact={true}
          />
        ))}

        {pastTargets.length > 3 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Past Targets</Text>
            <Icon name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your targets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Targets</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (currentUser?.id) {
                dispatch(fetchCurrentWeeklyTarget(currentUser.id));
              }
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.tertiary + '10', colors.background.primary]}
        style={styles.gradientBackground}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Weekly Targets</Text>
            <Text style={styles.subtitle}>
              AI-powered charitable goals that adapt to your giving patterns and maximize impact
            </Text>
          </View>

          {/* Current Target */}
          {renderCurrentTarget()}

          {/* AI Suggestions */}
          {renderAISuggestions()}

          {/* Stats */}
          {renderStats()}

          {/* Past Targets */}
          {renderPastTargets()}
        </ScrollView>

        {/* Floating Action Button */}
        {!currentTarget && (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleGenerateTarget}
          >
            <Icon name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  currentTargetContainer: {
    paddingHorizontal: spacing.lg,
  },
  noTargetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  noTargetTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noTargetSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  generateButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickAction: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  statsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  bestWeekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bestWeekInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  bestWeekTitle: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  bestWeekAmount: {
    ...typography.body,
    color: colors.tertiary,
  },
  aiSuggestionsContainer: {
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  aiTitle: {
    ...typography.h2,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  aiSuggestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  aiSuggestionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.md,
  },
  aiSuggestionAmount: {
    ...typography.button,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  pastTargetsContainer: {
    padding: spacing.lg,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  viewAllText: {
    ...typography.button,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorTitle: {
    ...typography.h1,
    color: colors.error,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    ...typography.button,
    color: colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});