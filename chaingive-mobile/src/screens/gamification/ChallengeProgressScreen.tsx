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
}

interface ProgressEntry {
  id: string;
  date: string;
  value: number;
  description: string;
}

const ChallengeProgressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { challengeId } = route.params as RouteParams;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    loadChallengeProgress();
  }, [challengeId]);

  const loadChallengeProgress = async () => {
    try {
      // Mock data - replace with actual API call
      const mockChallenge: Challenge = {
        id: challengeId,
        name: 'Donation Champion',
        description: 'Make 5 donations this week to earn bonus coins',
        type: 'donate',
        targetValue: 5,
        rewardCoins: 500,
        startDate: new Date(Date.now() - 86400000).toISOString(),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      };

      const mockProgressEntries: ProgressEntry[] = [
        {
          id: 'entry_1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          value: 1,
          description: 'Donated to Local School Project',
        },
        {
          id: 'entry_2',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          value: 1,
          description: 'Contributed to Medical Aid',
        },
        {
          id: 'entry_3',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          value: 1,
          description: 'Supported Community Garden',
        },
      ];

      setChallenge(mockChallenge);
      setProgressEntries(mockProgressEntries);
      setCurrentProgress(mockProgressEntries.reduce((sum, entry) => sum + entry.value, 0));
    } catch (error) {
      Alert.alert('Error', 'Failed to load challenge progress');
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

  const getProgressPercentage = () => {
    if (!challenge) return 0;
    return Math.min((currentProgress / challenge.targetValue) * 100, 100);
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

  const getMotivationalMessage = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return '🎉 Amazing! Challenge completed!';
    if (percentage >= 75) return '🚀 You\'re almost there!';
    if (percentage >= 50) return '💪 Halfway there! Keep going!';
    if (percentage >= 25) return '👍 Great start! Stay consistent!';
    return '🌟 Every step counts! Get started!';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
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
  const isCompleted = progressPercentage >= 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Tracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Overview */}
        <LinearGradient
          colors={isCompleted ? ['#48BB78', '#38A169'] : [colors.primary, colors.primaryDark]}
          style={styles.overviewCard}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeIcon}>
              <Icon
                name={getChallengeIcon(challenge.type) as any}
                size={32}
                color="#FFF"
              />
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.challengeTime}>{getTimeRemaining()}</Text>
            </View>
          </View>

          <Text style={styles.motivationalMessage}>
            {getMotivationalMessage()}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {currentProgress} / {challenge.targetValue}
              </Text>
              <Text style={styles.percentageText}>{Math.round(progressPercentage)}%</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
              />
            </View>
          </View>

          <View style={styles.rewardPreview}>
            <Icon name="stars" size={20} color="#FFD700" />
            <Text style={styles.rewardText}>
              {isCompleted ? 'Earned' : 'Reward'}: {challenge.rewardCoins} coins
            </Text>
          </View>
        </LinearGradient>

        {/* Progress History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Progress History</Text>

          {progressEntries.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Icon name="timeline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyHistoryTitle}>No Progress Yet</Text>
              <Text style={styles.emptyHistoryText}>
                Start working on this challenge to see your progress here!
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {progressEntries.map((entry, index) => (
                <View key={entry.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Text style={styles.historyNumber}>{index + 1}</Text>
                  </View>

                  <View style={styles.historyContent}>
                    <Text style={styles.historyDescription}>
                      {entry.description}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(entry.date).toLocaleDateString()} • +{entry.value} point{entry.value !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  <View style={styles.historyValue}>
                    <Text style={styles.historyValueText}>+{entry.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Tips for Success</Text>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="lightbulb" size={20} color={colors.warning} />
              <Text style={styles.tipText}>
                Break down your goal into smaller daily tasks
              </Text>
            </View>

            <View style={styles.tipItem}>
              <Icon name="schedule" size={20} color={colors.info} />
              <Text style={styles.tipText}>
                Set reminders to stay on track
              </Text>
            </View>

            <View style={styles.tipItem}>
              <Icon name="group" size={20} color={colors.success} />
              <Text style={styles.tipText}>
                Join community challenges for motivation
              </Text>
            </View>

            <View style={styles.tipItem}>
              <Icon name="celebration" size={20} color={colors.tertiary} />
              <Text style={styles.tipText}>
                Celebrate small wins along the way
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Navigate to relevant screen based on challenge type
              switch (challenge.type) {
                case 'donate':
                  (navigation as any).navigate('GiveScreen');
                  break;
                case 'referrals':
                  (navigation as any).navigate('Referral');
                  break;
                default:
                  Alert.alert('Coming Soon', 'This feature is coming soon!');
              }
            }}
          >
            <Text style={styles.primaryActionText}>
              {challenge.type === 'donate' ? 'Make a Donation' :
               challenge.type === 'referrals' ? 'Invite Friends' :
               'Continue Challenge'}
            </Text>
            <Icon name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => (navigation as any).navigate('ChallengeDetail', { challengeId })}
          >
            <Text style={styles.secondaryActionText}>View Challenge Details</Text>
          </TouchableOpacity>
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
  overviewCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  challengeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  challengeTime: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 2,
  },
  motivationalMessage: {
    ...typography.h4,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodyBold,
    color: '#FFF',
  },
  percentageText: {
    ...typography.bodyBold,
    color: '#FFF',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 5,
  },
  rewardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.sm,
  },
  rewardText: {
    ...typography.bodyBold,
    color: '#FFF',
  },
  historySection: {
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
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyHistoryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyHistoryText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  historyNumber: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  historyContent: {
    flex: 1,
  },
  historyDescription: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  historyDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  historyValue: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  historyValueText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  tipsSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  tipsList: {
    gap: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  primaryActionText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  secondaryAction: {
    backgroundColor: colors.gray[200],
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    ...typography.button,
    color: colors.text.primary,
  },
});

export default ChallengeProgressScreen;