import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchGroupChallenges, joinGroupChallenge } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const GroupChallengesScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { groupChallenges, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchGroupChallenges());
  }, [dispatch]);

  const filteredChallenges = groupChallenges.filter(challenge => {
    if (selectedCategory === 'all') return true;
    return challenge.category === selectedCategory;
  });

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(joinGroupChallenge({ challengeId, userId: user?.id || '' })).unwrap();
      showToast('Successfully joined the challenge!', 'success');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to join challenge', 'error');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'donation': return 'favorite';
      case 'social': return 'people';
      case 'achievement': return 'emoji-events';
      case 'learning': return 'school';
      default: return 'flag';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'donation': return colors.primary;
      case 'social': return colors.secondary;
      case 'achievement': return colors.tertiary;
      case 'learning': return colors.info;
      default: return colors.success;
    }
  };

  const categories = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'donation', label: 'Donation', icon: 'favorite' },
    { key: 'social', label: 'Social', icon: 'people' },
    { key: 'achievement', label: 'Achievement', icon: 'emoji-events' },
    { key: 'learning', label: 'Learning', icon: 'school' },
  ];

  const renderChallengeCard = ({ item: challenge }: { item: any }) => {
    const isJoined = challenge.participants.some((p: any) => p.userId === user?.id);
    const progress = (challenge.participants.length / challenge.maxParticipants) * 100;
    const timeLeft = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <View style={styles.challengeCard}>
        {/* Header */}
        <View style={styles.challengeHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(challenge.category) + '20' }]}>
            <Icon name={getCategoryIcon(challenge.category)} size={16} color={getCategoryColor(challenge.category)} />
            <Text style={[styles.categoryText, { color: getCategoryColor(challenge.category) }]}>
              {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
            </Text>
          </View>
          <View style={styles.challengeStatus}>
            <Text style={styles.timeLeft}>{timeLeft} days left</Text>
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
                {challenge.participants.length}/{challenge.maxParticipants} joined
              </Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.rewardsSection}>
            <Icon name="emoji-events" size={16} color={colors.tertiary} />
            <Text style={styles.rewardsText}>
              {challenge.rewards.coins} coins + {challenge.rewards.badge} badge
            </Text>
          </View>
        </View>

        {/* Action */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isJoined && styles.joinedButton,
          ]}
          onPress={() => {
            if (isJoined) {
              navigation.navigate('ChallengeDetail' as never, { challengeId: challenge.id });
            } else {
              handleJoinChallenge(challenge.id);
            }
          }}
        >
          <Text style={[
            styles.actionButtonText,
            isJoined && styles.joinedButtonText,
          ]}>
            {isJoined ? 'View Progress' : 'Join Challenge'}
          </Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Group Challenges</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateChallenge' as never)}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.key && styles.categoryButtonSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(item.key);
              }}
            >
              <Icon
                name={item.icon}
                size={16}
                color={selectedCategory === item.key ? colors.white : colors.text.secondary}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === item.key && styles.categoryButtonTextSelected,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Icon name="groups" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Join group challenges to collaborate with others, earn bonus rewards, and make a bigger impact together!
        </Text>
      </View>

      {/* Challenges List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      ) : filteredChallenges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="flag" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Challenges Found</Text>
          <Text style={styles.emptyMessage}>
            {selectedCategory === 'all'
              ? 'Be the first to create a group challenge!'
              : `No ${selectedCategory} challenges available right now.`
            }
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('CreateChallenge' as never)}
          >
            <Text style={styles.createFirstButtonText}>Create Challenge</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredChallenges}
          renderItem={renderChallengeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.challengesList}
          showsVerticalScrollIndicator={false}
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
  categoryFilter: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: colors.white,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
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
    marginBottom: spacing['2xl'],
    lineHeight: 20,
  },
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: 12,
  },
  createFirstButtonText: {
    ...typography.button,
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  challengeStatus: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  timeLeft: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: 'bold',
    fontSize: 10,
  },
  challengeContent: {
    marginBottom: spacing.lg,
  },
  challengeTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  challengeDescription: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 20,
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
    color: colors.text.secondary,
  },
  progressPercent: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  rewardsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardsText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  joinedButton: {
    backgroundColor: colors.success,
  },
  joinedButtonText: {
    color: colors.white,
  },
});

export default GroupChallengesScreen;