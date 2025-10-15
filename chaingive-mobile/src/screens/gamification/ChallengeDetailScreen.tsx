import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteParams {
  challengeId: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'donate' | 'coins' | 'referrals' | 'streak' | 'perfect_days';
  targetValue: number;
  rewardCoins: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  participants: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UserProgress {
  id: string;
  challengeId: string;
  userId: string;
  currentValue: number;
  completed: boolean;
  completedAt?: string;
  claimedReward: boolean;
}

const ChallengeDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { challengeId } = route.params as RouteParams;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadChallengeData();
  }, [challengeId]);

  const loadChallengeData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockChallenge: Challenge = {
        id: challengeId,
        name: 'Donation Champion',
        description: 'Make 5 donations this week to earn bonus coins',
        type: 'donate',
        targetValue: 5,
        rewardCoins: 500,
        startDate: new Date(Date.now() - 86400000).toISOString(), // Started yesterday
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 6 days
        isActive: true,
        participants: 1247,
        difficulty: 'medium',
      };

      const mockProgress: UserProgress = {
        id: 'progress_001',
        challengeId: challengeId,
        userId: user?.id || '',
        currentValue: 3,
        completed: false,
        claimedReward: false,
      };

      setChallenge(mockChallenge);
      setUserProgress(mockProgress);
    } catch (error) {
      Alert.alert('Error', 'Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!challenge) return '';

    const now = new Date();
    const end = new Date(challenge.endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'donate':
        return 'volunteer-activism';
      case 'coins':
        return 'monetization-on';
      case 'referrals':
        return 'group-add';
      case 'streak':
        return 'local-fire-department';
      case 'perfect_days':
        return 'star';
      default:
        return 'emoji-events';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const handleClaimReward = async () => {
    if (!userProgress?.completed || userProgress.claimedReward) return;

    setClaimingReward(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Mock reward claim - replace with actual API call
      Alert.alert(
        'Reward Claimed!',
        `Congratulations! You've earned ${challenge?.rewardCoins} bonus coins.`,
        [{ text: 'Awesome!', style: 'default' }]
      );

      setUserProgress(prev => prev ? { ...prev, claimedReward: true } : null);
    } catch (error) {
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    } finally {
      setClaimingReward(false);
    }
  };

  const getProgressPercentage = () => {
    if (!userProgress || !challenge) return 0;
    return Math.min((userProgress.currentValue / challenge.targetValue) * 100, 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading challenge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge || !userProgress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Challenge Not Found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = getProgressPercentage();
  const isCompleted = userProgress.completed;
  const canClaimReward = isCompleted && !userProgress.claimedReward;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Header */}
        <LinearGradient
          colors={isCompleted ? ['#48BB78', '#38A169'] : [colors.primary, colors.primaryDark]}
          style={styles.challengeHeader}
        >
          <View style={styles.challengeIcon}>
            <Icon
              name={getChallengeIcon(challenge.type) as any}
              size={48}
              color="#FFF"
            />
          </View>

          <Text style={styles.challengeName}>{challenge.name}</Text>
          <Text style={styles.challengeTime}>{getTimeRemaining()}</Text>

          <View style={styles.difficultyBadge}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(challenge.difficulty) }]}>
              {challenge.difficulty.toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressText}>
              {userProgress.currentValue} / {challenge.targetValue}
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
            />
          </View>

          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}% Complete</Text>
        </View>

        {/* Challenge Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Challenge Details</Text>

          <Text style={styles.description}>{challenge.description}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{challenge.type.replace('_', ' ').toUpperCase()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Participants:</Text>
            <Text style={styles.detailValue}>{challenge.participants.toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Started:</Text>
            <Text style={styles.detailValue}>
              {new Date(challenge.startDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ends:</Text>
            <Text style={styles.detailValue}>
              {new Date(challenge.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Reward Section */}
        <View style={styles.rewardSection}>
          <Text style={styles.sectionTitle}>Reward</Text>

          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Icon name="stars" size={24} color={colors.tertiary} />
              <Text style={styles.rewardAmount}>{challenge.rewardCoins} Coins</Text>
            </View>

            <Text style={styles.rewardDescription}>
              Complete this challenge to earn bonus Charity Coins!
            </Text>

            {canClaimReward && (
              <TouchableOpacity
                style={styles.claimButton}
                onPress={handleClaimReward}
                disabled={claimingReward}
              >
                {claimingReward ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.claimButtonText}>Claim Reward</Text>
                    <Icon name="celebration" size={20} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>
            )}

            {userProgress.claimedReward && (
              <View style={styles.claimedBadge}>
                <Icon name="check" size={16} color={colors.white} />
                <Text style={styles.claimedText}>Reward Claimed</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Tips to Complete</Text>

          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Stay consistent with your daily activities
            </Text>
            <Text style={styles.tipItem}>
              • Track your progress regularly
            </Text>
            <Text style={styles.tipItem}>
              • Join community challenges for motivation
            </Text>
            <Text style={styles.tipItem}>
              • Don't forget to claim your rewards!
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.button,
    color: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  challengeHeader: {
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  challengeIcon: {
    marginBottom: spacing.md,
  },
  challengeName: {
    ...typography.h2,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  challengeTime: {
    ...typography.bodyRegular,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: spacing.md,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  difficultyText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  progressSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  progressText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  detailsSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  rewardSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  rewardCard: {
    backgroundColor: colors.tertiary + '10',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rewardAmount: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  rewardDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  claimButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.sm,
  },
  claimButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  claimedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  tipsSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  tipsList: {
    marginTop: spacing.sm,
  },
  tipItem: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
});

export default ChallengeDetailScreen;