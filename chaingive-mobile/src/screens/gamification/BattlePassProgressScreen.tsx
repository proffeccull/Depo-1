import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
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
  seasonId: string;
}

interface BattlePassSeason {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalTiers: number;
  currentTier: number;
  progressToNextTier: number;
  totalXP: number;
  xpToNextTier: number;
}

interface BattlePassTier {
  tier: number;
  xpRequired: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  rewards: {
    free: string[];
    premium: string[];
  };
}

interface ActivityEntry {
  id: string;
  type: 'donation' | 'referral' | 'challenge' | 'streak' | 'milestone';
  description: string;
  xpEarned: number;
  timestamp: string;
  multiplier?: number;
}

const BattlePassProgressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { seasonId } = route.params as RouteParams;

  const [season, setSeason] = useState<BattlePassSeason | null>(null);
  const [tiers, setTiers] = useState<BattlePassTier[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<number>(1);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadBattlePassProgress();
  }, [seasonId]);

  const loadBattlePassProgress = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSeason: BattlePassSeason = {
        id: seasonId,
        name: 'Season of Giving',
        description: 'Earn rewards by completing charitable activities',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        totalTiers: 50,
        currentTier: 12,
        progressToNextTier: 75,
        totalXP: 2450,
        xpToNextTier: 550,
      };

      const mockTiers: BattlePassTier[] = Array.from({ length: mockSeason.totalTiers }, (_, i) => ({
        tier: i + 1,
        xpRequired: (i + 1) * 100,
        isUnlocked: i + 1 <= mockSeason.currentTier,
        isCompleted: i + 1 < mockSeason.currentTier,
        rewards: {
          free: i % 3 === 0 ? ['coins'] : i % 5 === 0 ? ['badge'] : ['xp'],
          premium: i % 2 === 0 ? ['coins', 'booster'] : ['skin'],
        },
      }));

      const mockActivities: ActivityEntry[] = [
        {
          id: 'activity_1',
          type: 'donation',
          description: 'Made a donation to Local School Project',
          xpEarned: 50,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          multiplier: 1.5,
        },
        {
          id: 'activity_2',
          type: 'challenge',
          description: 'Completed "Donation Champion" challenge',
          xpEarned: 100,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'activity_3',
          type: 'referral',
          description: 'Referred a new user to the platform',
          xpEarned: 75,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'activity_4',
          type: 'streak',
          description: 'Maintained 7-day donation streak',
          xpEarned: 25,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'activity_5',
          type: 'milestone',
          description: 'Reached 1000 total coins donated',
          xpEarned: 200,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          multiplier: 2.0,
        },
      ];

      setSeason(mockSeason);
      setTiers(mockTiers);
      setActivities(mockActivities);
      setSelectedTier(mockSeason.currentTier);
    } catch (error) {
      Alert.alert('Error', 'Failed to load battle pass progress');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return 'volunteer-activism';
      case 'referral':
        return 'group-add';
      case 'challenge':
        return 'emoji-events';
      case 'streak':
        return 'local-fire-department';
      case 'milestone':
        return 'celebration';
      default:
        return 'star';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'donation':
        return colors.success;
      case 'referral':
        return colors.info;
      case 'challenge':
        return colors.warning;
      case 'streak':
        return colors.error;
      case 'milestone':
        return colors.tertiary;
      default:
        return colors.primary;
    }
  };

  const renderTierCard = ({ item: tier }: { item: BattlePassTier }) => (
    <TouchableOpacity
      style={[
        styles.tierCard,
        tier.isCompleted && styles.tierCardCompleted,
        tier.tier === season?.currentTier && styles.tierCardCurrent,
        !tier.isUnlocked && styles.tierCardLocked,
      ]}
      onPress={() => setSelectedTier(tier.tier)}
      activeOpacity={tier.isUnlocked ? 0.9 : 1}
    >
      <View style={styles.tierHeader}>
        <Text style={[
          styles.tierNumber,
          !tier.isUnlocked && styles.tierNumberLocked,
        ]}>
          {tier.tier}
        </Text>
        {!tier.isUnlocked && (
          <Icon name="lock" size={16} color={colors.gray[400]} />
        )}
        {tier.isCompleted && (
          <Icon name="check-circle" size={16} color={colors.success} />
        )}
      </View>

      <Text style={styles.tierXP}>{tier.xpRequired} XP</Text>

      <View style={styles.tierRewards}>
        <View style={styles.rewardIndicators}>
          {tier.rewards.free.map((reward, index) => (
            <View key={`free-${index}`} style={styles.rewardDotFree} />
          ))}
          {tier.rewards.premium.map((reward, index) => (
            <View key={`premium-${index}`} style={styles.rewardDotPremium} />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivity = ({ item: activity }: { item: ActivityEntry }) => (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={[
          styles.activityIcon,
          { backgroundColor: getActivityColor(activity.type) + '20' }
        ]}>
          <Icon
            name={getActivityIcon(activity.type) as any}
            size={20}
            color={getActivityColor(activity.type)}
          />
        </View>

        <View style={styles.activityInfo}>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text style={styles.activityTime}>
            {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.activityXP}>
          <Text style={styles.xpValue}>+{activity.xpEarned}</Text>
          <Text style={styles.xpLabel}>XP</Text>
          {activity.multiplier && activity.multiplier > 1 && (
            <View style={styles.multiplierBadge}>
              <Text style={styles.multiplierText}>{activity.multiplier}x</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading battle pass...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!season) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Battle Pass Not Found</Text>
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

  const totalXPEarned = activities.reduce((sum, activity) => sum + activity.xpEarned, 0);
  const unlockedTiers = tiers.filter(t => t.isUnlocked).length;
  const completedTiers = tiers.filter(t => t.isCompleted).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Pass Progress</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Season Overview */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.seasonCard}
        >
          <Text style={styles.seasonName}>{season.name}</Text>
          <Text style={styles.seasonDescription}>{season.description}</Text>

          <View style={styles.seasonStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{season.currentTier}</Text>
              <Text style={styles.statLabel}>Current Tier</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalXPEarned.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(season.progressToNextTier)}%</Text>
              <Text style={styles.statLabel}>To Next Tier</Text>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpText}>
                {season.totalXP} / {season.totalXP + season.xpToNextTier} XP
              </Text>
              <Text style={styles.xpToNext}>+{season.xpToNextTier} to next tier</Text>
            </View>

            <View style={styles.xpBarContainer}>
              <View
                style={[styles.xpBarFill, { width: `${season.progressToNextTier}%` }]}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Tier Progress */}
        <View style={styles.tiersSection}>
          <Text style={styles.sectionTitle}>Tier Progress</Text>
          <Text style={styles.sectionSubtitle}>
            {completedTiers} completed • {unlockedTiers} unlocked • {season.totalTiers} total
          </Text>

          <FlatList
            data={tiers}
            renderItem={renderTierCard}
            keyExtractor={(item) => item.tier.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tiersList}
            initialScrollIndex={Math.max(0, season.currentTier - 3)}
            getItemLayout={(data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
          />
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>

          <FlatList
            data={activities}
            renderItem={renderActivity}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.activitiesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyActivities}>
                <Icon name="timeline" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No Activities Yet</Text>
                <Text style={styles.emptyText}>
                  Start earning XP by participating in charitable activities!
                </Text>
              </View>
            }
          />
        </View>

        {/* XP Sources */}
        <View style={styles.sourcesSection}>
          <Text style={styles.sectionTitle}>Ways to Earn XP</Text>

          <View style={styles.sourcesGrid}>
            <TouchableOpacity
              style={styles.sourceCard}
              onPress={() => (navigation as any).navigate('GiveScreen')}
            >
              <View style={[styles.sourceIcon, { backgroundColor: colors.success + '20' }]}>
                <Icon name="volunteer-activism" size={24} color={colors.success} />
              </View>
              <Text style={styles.sourceName}>Make Donations</Text>
              <Text style={styles.sourceXP}>+50 XP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sourceCard}
              onPress={() => (navigation as any).navigate('Referral')}
            >
              <View style={[styles.sourceIcon, { backgroundColor: colors.info + '20' }]}>
                <Icon name="group-add" size={24} color={colors.info} />
              </View>
              <Text style={styles.sourceName}>Refer Friends</Text>
              <Text style={styles.sourceXP}>+75 XP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sourceCard}
              onPress={() => (navigation as any).navigate('WeeklyChallenges')}
            >
              <View style={[styles.sourceIcon, { backgroundColor: colors.warning + '20' }]}>
                <Icon name="emoji-events" size={24} color={colors.warning} />
              </View>
              <Text style={styles.sourceName}>Complete Challenges</Text>
              <Text style={styles.sourceXP}>+100 XP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sourceCard}
              onPress={() => Alert.alert('Coming Soon', 'Daily streaks coming soon!')}
            >
              <View style={[styles.sourceIcon, { backgroundColor: colors.error + '20' }]}>
                <Icon name="local-fire-department" size={24} color={colors.error} />
              </View>
              <Text style={styles.sourceName}>Maintain Streaks</Text>
              <Text style={styles.sourceXP}>+25 XP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Rewards */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => (navigation as any).navigate('BattlePassRewards', { seasonId })}
          >
            <Text style={styles.primaryActionText}>View All Rewards</Text>
            <Icon name="card-giftcard" size={20} color={colors.white} />
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
  seasonCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  seasonName: {
    ...typography.h2,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  seasonDescription: {
    ...typography.bodyRegular,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  seasonStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  xpSection: {
    marginBottom: spacing.md,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  xpText: {
    ...typography.bodyBold,
    color: '#FFF',
  },
  xpToNext: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.9,
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  tiersSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  tiersList: {
    paddingVertical: spacing.sm,
  },
  tierCard: {
    width: 70,
    height: 70,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm,
    marginRight: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  tierCardCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  tierCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  tierCardLocked: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tierNumber: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tierNumberLocked: {
    color: colors.gray[400],
  },
  tierXP: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  tierRewards: {
    marginTop: spacing.xs,
  },
  rewardIndicators: {
    flexDirection: 'row',
    gap: 2,
  },
  rewardDotFree: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.info,
  },
  rewardDotPremium: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
  },
  activitiesSection: {
    marginTop: spacing.lg,
  },
  activitiesList: {
    paddingBottom: spacing.md,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  activityXP: {
    alignItems: 'flex-end',
  },
  xpValue: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  xpLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  multiplierBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  multiplierText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  emptyActivities: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  sourcesSection: {
    marginTop: spacing.lg,
  },
  sourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sourceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sourceName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sourceXP: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  actionsSection: {
    marginTop: spacing.lg,
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
});

export default BattlePassProgressScreen;