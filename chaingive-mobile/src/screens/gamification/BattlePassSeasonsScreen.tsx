import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface Season {
  id: string;
  name: string;
  theme: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  totalTiers: number;
  currentTier: number;
  backgroundImage?: string;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface SeasonReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockTier: number;
  isExclusive: boolean;
  isClaimed: boolean;
}

interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'challenge' | 'reward' | 'milestone';
  seasonId: string;
}

const BattlePassSeasonsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [seasonRewards, setSeasonRewards] = useState<SeasonReward[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'calendar'>('overview');

  useEffect(() => {
    loadSeasonsData();
  }, []);

  const loadSeasonsData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockSeasons: Season[] = [
        {
          id: 'season_1',
          name: 'Season of Giving',
          theme: 'Holiday Spirit',
          description: 'Spread joy and generosity this holiday season',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          isCompleted: false,
          totalTiers: 50,
          currentTier: 12,
          themeColors: {
            primary: '#FF6B6B',
            secondary: '#4ECDC4',
            accent: '#FFD93D',
          },
        },
        {
          id: 'season_2',
          name: 'Heroes Rising',
          theme: 'Community Heroes',
          description: 'Celebrate everyday heroes in our communities',
          startDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: false,
          isCompleted: false,
          totalTiers: 50,
          currentTier: 0,
          themeColors: {
            primary: '#6C5CE7',
            secondary: '#A29BFE',
            accent: '#FD79A8',
          },
        },
        {
          id: 'season_3',
          name: 'Future Builders',
          theme: 'Building Tomorrow',
          description: 'Invest in education and future opportunities',
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: false,
          isCompleted: true,
          totalTiers: 50,
          currentTier: 50,
          themeColors: {
            primary: '#00B894',
            secondary: '#00CEC9',
            accent: '#FDCB6E',
          },
        },
      ];

      const mockRewards: SeasonReward[] = [
        {
          id: 'reward_1',
          name: 'Holiday Cheer Badge',
          description: 'Exclusive holiday-themed achievement badge',
          icon: 'celebration',
          rarity: 'rare',
          unlockTier: 10,
          isExclusive: true,
          isClaimed: true,
        },
        {
          id: 'reward_2',
          name: 'Generosity Multiplier',
          description: '2x coin multiplier for 24 hours',
          icon: 'flash',
          rarity: 'epic',
          unlockTier: 25,
          isExclusive: false,
          isClaimed: false,
        },
        {
          id: 'reward_3',
          name: 'Community Champion Title',
          description: 'Special profile title for top contributors',
          icon: 'military-tech',
          rarity: 'legendary',
          unlockTier: 50,
          isExclusive: true,
          isClaimed: false,
        },
      ];

      const mockEvents: UpcomingEvent[] = [
        {
          id: 'event_1',
          title: 'Holiday Giving Spree',
          description: 'Double rewards for all donations this weekend',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'challenge',
          seasonId: 'season_1',
        },
        {
          id: 'event_2',
          title: 'Tier 25 Rewards Unlock',
          description: 'New exclusive rewards become available',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'reward',
          seasonId: 'season_1',
        },
        {
          id: 'event_3',
          title: 'Season Finale',
          description: 'Final challenges and ultimate rewards',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'milestone',
          seasonId: 'season_1',
        },
      ];

      setSeasons(mockSeasons);
      setSelectedSeason(mockSeasons.find(s => s.isActive) || mockSeasons[0]);
      setSeasonRewards(mockRewards);
      setUpcomingEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load seasons data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'challenge': return 'emoji-events';
      case 'reward': return 'card-giftcard';
      case 'milestone': return 'celebration';
      default: return 'event';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'challenge': return colors.warning;
      case 'reward': return colors.success;
      case 'milestone': return colors.primary;
      default: return colors.info;
    }
  };

  const renderSeasonCard = ({ item: season }: { item: Season }) => (
    <TouchableOpacity
      style={[
        styles.seasonCard,
        selectedSeason?.id === season.id && styles.seasonCardSelected,
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        setSelectedSeason(season);
      }}
    >
      <LinearGradient
        colors={[season.themeColors.primary, season.themeColors.secondary]}
        style={styles.seasonGradient}
      >
        <View style={styles.seasonHeader}>
          <Text style={styles.seasonName}>{season.name}</Text>
          <View style={styles.seasonStatus}>
            {season.isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            )}
            {season.isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>Completed</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.seasonTheme}>{season.theme}</Text>
        <Text style={styles.seasonDescription}>{season.description}</Text>

        <View style={styles.seasonProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(season.currentTier / season.totalTiers) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Tier {season.currentTier} / {season.totalTiers}
          </Text>
        </View>

        <View style={styles.seasonDates}>
          <Text style={styles.dateText}>
            {season.isActive ? 'Ends' : season.isCompleted ? 'Ended' : 'Starts'}: {new Date(season.endDate).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderRewardCard = ({ item: reward }: { item: SeasonReward }) => (
    <View style={styles.rewardCard}>
      <LinearGradient
        colors={[getRarityColor(reward.rarity), getRarityColor(reward.rarity) + '80']}
        style={styles.rewardGradient}
      >
        <View style={styles.rewardHeader}>
          <View style={styles.rewardIcon}>
            <Icon name={reward.icon as any} size={24} color="#FFF" />
          </View>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardName}>{reward.name}</Text>
            <Text style={styles.rewardRarity}>{reward.rarity.toUpperCase()}</Text>
          </View>
          {reward.isExclusive && (
            <View style={styles.exclusiveBadge}>
              <Text style={styles.exclusiveText}>Exclusive</Text>
            </View>
          )}
        </View>

        <Text style={styles.rewardDescription}>{reward.description}</Text>

        <View style={styles.rewardFooter}>
          <Text style={styles.unlockText}>Unlock at Tier {reward.unlockTier}</Text>
          {reward.isClaimed && (
            <View style={styles.claimedBadge}>
              <Icon name="check-circle" size={16} color={colors.success} />
              <Text style={styles.claimedText}>Claimed</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderEventCard = ({ item: event }: { item: UpcomingEvent }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={[styles.eventIcon, { backgroundColor: getEventColor(event.type) + '20' }]}>
          <Icon name={getEventIcon(event.type) as any} size={20} color={getEventColor(event.type)} />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>
            {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString()}
          </Text>
        </View>
      </View>
      <Text style={styles.eventDescription}>{event.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading seasons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedSeason) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>No Seasons Available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const seasonEvents = upcomingEvents.filter(event => event.seasonId === selectedSeason.id);
  const seasonRewardsFiltered = seasonRewards.filter(reward =>
    selectedSeason.isCompleted || reward.unlockTier <= selectedSeason.currentTier
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Battle Pass Seasons</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Season Selector */}
      <View style={styles.seasonSelector}>
        <FlatList
          data={seasons}
          renderItem={renderSeasonCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.seasonList}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['overview', 'rewards', 'calendar'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(tab);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Season Overview</Text>

            {/* Season Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="trending-up" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{selectedSeason.currentTier}</Text>
                <Text style={styles.statLabel}>Current Tier</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="schedule" size={24} color={colors.info} />
                <Text style={styles.statValue}>
                  {Math.max(0, Math.ceil((new Date(selectedSeason.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                </Text>
                <Text style={styles.statLabel}>Days Left</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="card-giftcard" size={24} color={colors.success} />
                <Text style={styles.statValue}>
                  {seasonRewardsFiltered.filter(r => !r.isClaimed).length}
                </Text>
                <Text style={styles.statLabel}>Rewards Available</Text>
              </View>
            </View>

            {/* Next Milestone */}
            <View style={styles.milestoneSection}>
              <Text style={styles.sectionTitle}>Next Milestone</Text>
              <View style={styles.milestoneCard}>
                <View style={styles.milestoneIcon}>
                  <Icon name="flag" size={24} color={colors.primary} />
                </View>
                <View style={styles.milestoneInfo}>
                  <Text style={styles.milestoneTitle}>Tier {selectedSeason.currentTier + 1}</Text>
                  <Text style={styles.milestoneDescription}>
                    {selectedSeason.totalTiers - selectedSeason.currentTier - 1} tiers remaining
                  </Text>
                </View>
                <View style={styles.milestoneProgress}>
                  <Text style={styles.progressPercent}>
                    {Math.round((selectedSeason.currentTier / selectedSeason.totalTiers) * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'rewards' && (
          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>Season Rewards</Text>
            <FlatList
              data={seasonRewardsFiltered}
              renderItem={renderRewardCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.rewardsList}
              ListEmptyComponent={
                <View style={styles.emptyRewards}>
                  <Icon name="card-giftcard" size={48} color={colors.gray[300]} />
                  <Text style={styles.emptyTitle}>No Rewards Yet</Text>
                  <Text style={styles.emptyText}>
                    Keep progressing to unlock exclusive season rewards!
                  </Text>
                </View>
              }
            />
          </View>
        )}

        {activeTab === 'calendar' && (
          <View style={styles.calendarSection}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <FlatList
              data={seasonEvents}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.eventsList}
              ListEmptyComponent={
                <View style={styles.emptyEvents}>
                  <Icon name="event" size={48} color={colors.gray[300]} />
                  <Text style={styles.emptyTitle}>No Upcoming Events</Text>
                  <Text style={styles.emptyText}>
                    Check back later for new challenges and rewards!
                  </Text>
                </View>
              }
            />
          </View>
        )}

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
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
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
  backButton: {
    padding: spacing.sm,
  },
  seasonSelector: {
    marginVertical: spacing.md,
  },
  seasonList: {
    paddingHorizontal: spacing.md,
  },
  seasonCard: {
    width: screenWidth * 0.8,
    height: 180,
    marginRight: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  seasonCardSelected: {
    borderColor: colors.primary,
  },
  seasonGradient: {
    flex: 1,
    padding: spacing.lg,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  seasonName: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
    flex: 1,
  },
  seasonStatus: {
    alignItems: 'flex-end',
  },
  activeBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  activeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  completedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  completedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  seasonTheme: {
    ...typography.bodyBold,
    color: '#FFF',
    opacity: 0.9,
  },
  seasonDescription: {
    ...typography.bodyRegular,
    color: '#FFF',
    opacity: 0.8,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  seasonProgress: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: '#FFF',
    textAlign: 'center',
  },
  seasonDates: {
    marginTop: spacing.sm,
  },
  dateText: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.xxs,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  overviewSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  milestoneSection: {
    marginBottom: spacing.lg,
  },
  milestoneCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  milestoneDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  milestoneProgress: {
    alignItems: 'flex-end',
  },
  progressPercent: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  rewardsSection: {
    marginBottom: spacing.lg,
  },
  rewardsList: {
    paddingBottom: spacing.md,
  },
  rewardCard: {
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rewardGradient: {
    padding: spacing.lg,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    ...typography.h4,
    color: '#FFF',
    fontWeight: 'bold',
  },
  rewardRarity: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: 'bold',
  },
  exclusiveBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  exclusiveText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: 'bold',
  },
  rewardDescription: {
    ...typography.bodyRegular,
    color: '#FFF',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unlockText: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.8,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  claimedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  emptyRewards: {
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
  calendarSection: {
    marginBottom: spacing.lg,
  },
  eventsList: {
    paddingBottom: spacing.md,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  eventDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  eventDescription: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 20,
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});

export default BattlePassSeasonsScreen;