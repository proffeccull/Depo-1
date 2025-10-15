import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ProgressBarAndroid,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchSocialChallenges,
  joinSocialChallenge,
  contributeToChallenge,
} from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const SocialChallengesScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { socialChallenges, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  useEffect(() => {
    dispatch(fetchSocialChallenges({ status: selectedTab }));
  }, [dispatch, selectedTab]);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(joinSocialChallenge({
        challengeId,
        userId: user.id,
      })).unwrap();

      showToast('Joined challenge successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to join challenge', 'error');
    }
  };

  const handleContribute = (challengeId: string) => {
    // Navigate to donation screen with challenge context
    navigation.navigate('DonationScreen' as never, {
      challengeId,
      fromChallenge: true,
    });
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'group_donation': return 'groups';
      case 'member_challenge': return 'person';
      case 'circle_competition': return 'emoji-events';
      default: return 'flag';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'group_donation': return colors.primary;
      case 'member_challenge': return colors.secondary;
      case 'circle_competition': return colors.tertiary;
      default: return colors.info;
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  const renderChallengeCard = ({ item: challenge }: { item: any }) => {
    const progress = challenge.targetAmount > 0 ? challenge.currentAmount / challenge.targetAmount : 0;
    const isJoined = challenge.participants.some((p: any) => p.userId === user?.id);
    const userContribution = challenge.participants.find((p: any) => p.userId === user?.id)?.contributedAmount || 0;
    const typeIcon = getChallengeTypeIcon(challenge.type);
    const typeColor = getChallengeTypeColor(challenge.type);

    return (
      <View style={styles.challengeCard}>
        {/* Header */}
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeTypeBadge, { backgroundColor: typeColor + '20' }]}>
            <Icon name={typeIcon} size={16} color={typeColor} />
            <Text style={[styles.challengeTypeText, { color: typeColor }]}>
              {challenge.type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={[
            styles.challengeStatus,
            challenge.status === 'active' && styles.statusActive,
            challenge.status === 'upcoming' && styles.statusUpcoming,
            challenge.status === 'completed' && styles.statusCompleted,
          ]}>
            <Text style={styles.challengeStatusText}>
              {challenge.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.challengeContent}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                ₦{challenge.currentAmount.toLocaleString()} / ₦{challenge.targetAmount.toLocaleString()}
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` },
                  { backgroundColor: typeColor },
                ]}
              />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.challengeStats}>
            <View style={styles.stat}>
              <Icon name="people" size={16} color={colors.text.secondary} />
              <Text style={styles.statText}>
                {challenge.participantCount} participants
              </Text>
            </View>
            <View style={styles.stat}>
              <Icon name="schedule" size={16} color={colors.text.secondary} />
              <Text style={styles.statText}>
                {getTimeRemaining(challenge.endDate)}
              </Text>
            </View>
            <View style={styles.stat}>
              <Icon name="stars" size={16} color={colors.tertiary} />
              <Text style={[styles.statText, { color: colors.tertiary }]}>
                {challenge.rewardCoins} coins
              </Text>
            </View>
          </View>

          {/* User Contribution */}
          {isJoined && (
            <View style={styles.userContribution}>
              <Text style={styles.contributionLabel}>Your Contribution:</Text>
              <Text style={styles.contributionAmount}>
                ₦{userContribution.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.challengeActions}>
          {challenge.status === 'active' && (
            <>
              {!isJoined ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.joinButton]}
                  onPress={() => handleJoinChallenge(challenge.id)}
                >
                  <Icon name="person-add" size={20} color={colors.white} />
                  <Text style={styles.joinButtonText}>Join Challenge</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.contributeButton]}
                  onPress={() => handleContribute(challenge.id)}
                >
                  <Icon name="add" size={20} color={colors.white} />
                  <Text style={styles.contributeButtonText}>Contribute</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {challenge.status === 'upcoming' && (
            <View style={styles.upcomingNotice}>
              <Text style={styles.upcomingText}>
                Starts {new Date(challenge.startDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {challenge.status === 'completed' && (
            <View style={styles.completedNotice}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.completedText}>Challenge Completed!</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Challenges</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateChallenge' as never)}
          style={styles.createButton}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {(['active', 'upcoming', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.tabButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTab(tab);
            }}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab && styles.tabButtonTextSelected,
            ]}>
              {tab === 'active' ? 'Active' :
               tab === 'upcoming' ? 'Upcoming' :
               'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Challenges List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      ) : (
        <FlatList
          data={socialChallenges}
          renderItem={renderChallengeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.challengesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="flag" size={64} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No Challenges</Text>
              <Text style={styles.emptyMessage}>
                {selectedTab === 'active' ? 'No active challenges right now.' :
                 selectedTab === 'upcoming' ? 'No upcoming challenges scheduled.' :
                 'No completed challenges yet.'}
              </Text>
              {selectedTab === 'active' && (
                <TouchableOpacity
                  style={styles.createChallengeButton}
                  onPress={() => navigation.navigate('CreateChallenge' as never)}
                >
                  <Text style={styles.createChallengeButtonText}>Create Challenge</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
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
    ...typography.body,
    color: colors.text.secondary,
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  createButton: {
    padding: spacing.xs,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  tabButtonSelected: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  tabButtonTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  challengesList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  challengeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  challengeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  challengeTypeText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  challengeStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusUpcoming: {
    backgroundColor: colors.warning + '20',
  },
  statusCompleted: {
    backgroundColor: colors.info + '20',
  },
  challengeStatusText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  challengeContent: {
    marginBottom: spacing.md,
  },
  challengeTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  progressPercent: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  userContribution: {
    backgroundColor: colors.primary + '10',
    padding: spacing.sm,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contributionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  contributionAmount: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  challengeActions: {
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  joinButton: {
    backgroundColor: colors.primary,
  },
  joinButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  contributeButton: {
    backgroundColor: colors.success,
  },
  contributeButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  upcomingNotice: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
  },
  upcomingText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: 'bold',
  },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    gap: spacing.sm,
  },
  completedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  createChallengeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  createChallengeButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default SocialChallengesScreen;