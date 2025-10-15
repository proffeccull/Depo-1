import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import {
  fetchUserLevel,
  fetchLevelProgress,
  fetchLevelConfig,
  unlockLevelPerk,
  fetchRecentXP,
  fetchLevelLeaderboard,
  completeLevelMilestone,
} from '../../store/slices/userLevelsSlice';
import { UserLevelCard } from '../../components/gamification/UserLevelCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const UserLevelsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    userLevel,
    levelProgress,
    levelConfig,
    recentXP,
    levelLeaderboard,
    availablePerks,
    completedMilestones,
    loading,
    error,
  } = useSelector((state: RootState) => state.userLevels);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = useState<'overview' | 'perks' | 'leaderboard'>('overview');

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserLevel(currentUser.id));
      dispatch(fetchLevelProgress(currentUser.id));
      dispatch(fetchLevelConfig());
      dispatch(fetchRecentXP({ userId: currentUser.id, limit: 10 }));
    }
  }, [currentUser]);

  const handleUnlockPerk = (perkId: string) => {
    if (!currentUser?.id || !userLevel) return;

    Alert.alert(
      'Unlock Perk',
      'Are you sure you want to unlock this perk?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: () => {
            dispatch(unlockLevelPerk({
              userId: currentUser.id,
              perkId,
            }));
          },
        },
      ]
    );
  };

  const handleViewLeaderboard = () => {
    setActiveTab('leaderboard');
    dispatch(fetchLevelLeaderboard('weekly'));
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Current Level Card */}
      {userLevel && (
        <UserLevelCard
          level={userLevel}
          showPerks={false}
          showProgress={true}
          compact={false}
        />
      )}

      {/* Level Progress */}
      {levelProgress && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{levelProgress.currentXP}</Text>
              <Text style={styles.progressLabel}>Current XP</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{levelProgress.xpToNext}</Text>
              <Text style={styles.progressLabel}>XP to Next</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{levelProgress.progressPercent}%</Text>
              <Text style={styles.progressLabel}>Progress</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent XP Activity */}
      {recentXP.length > 0 && (
        <View style={styles.recentXPSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentXP.slice(0, 5).map((xpEntry) => (
            <View key={xpEntry.id} style={styles.xpEntry}>
              <View style={styles.xpEntryIcon}>
                <Icon name={getXPEntryIcon(xpEntry.category)} size={16} color={colors.primary} />
              </View>
              <View style={styles.xpEntryInfo}>
                <Text style={styles.xpEntryReason}>{xpEntry.reason}</Text>
                <Text style={styles.xpEntryTime}>
                  {new Date(xpEntry.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.xpEntryAmount}>+{xpEntry.amount} XP</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => setActiveTab('perks')}
        >
          <Icon name="stars" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>View Perks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleViewLeaderboard}
        >
          <Icon name="leaderboard" size={24} color={colors.secondary} />
          <Text style={styles.quickActionText}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => Alert.alert('Achievements', 'Achievement gallery would open')}
        >
          <Icon name="emoji-events" size={24} color={colors.tertiary} />
          <Text style={styles.quickActionText}>Achievements</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPerks = () => (
    <View style={styles.perksContainer}>
      <Text style={styles.sectionTitle}>Available Perks</Text>

      {availablePerks.length > 0 ? (
        <View style={styles.perksGrid}>
          {availablePerks.map((perk) => (
            <View key={perk.id} style={styles.perkCard}>
              <View style={styles.perkHeader}>
                <View style={styles.perkIcon}>
                  <Icon name={getPerkIcon(perk.type)} size={24} color="#FFF" />
                </View>
                {perk.isActive && (
                  <View style={styles.activeBadge}>
                    <Icon name="check-circle" size={16} color={colors.success} />
                  </View>
                )}
              </View>

              <View style={styles.perkContent}>
                <Text style={styles.perkName}>{perk.name}</Text>
                <Text style={styles.perkDescription}>{perk.description}</Text>
                {perk.value && (
                  <Text style={styles.perkValueText}>
                    {perk.value}x {perk.type.replace('_', ' ')}
                  </Text>
                )}
              </View>

              {!perk.isActive && (
                <TouchableOpacity
                  style={styles.unlockButton}
                  onPress={() => handleUnlockPerk(perk.id)}
                >
                  <Text style={styles.unlockButtonText}>Unlock</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyPerks}>
          <Icon name="stars" size={48} color={colors.text.secondary} />
          <Text style={styles.emptyPerksText}>No perks available yet</Text>
          <Text style={styles.emptyPerksSubtext}>Level up to unlock exclusive perks!</Text>
        </View>
      )}

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>Completed Milestones</Text>
          {completedMilestones.map((milestone) => (
            <View key={milestone.level} style={styles.milestoneCard}>
              <View style={styles.milestoneIcon}>
                <Icon name="emoji-events" size={20} color={colors.tertiary} />
              </View>
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneName}>Level {milestone.level} Complete!</Text>
                <Text style={styles.milestoneDate}>
                  {new Date(milestone.completedAt || '').toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <Text style={styles.sectionTitle}>Level Leaderboard</Text>

      {levelLeaderboard?.entries.length ? (
        <View style={styles.leaderboardList}>
          {levelLeaderboard.entries.slice(0, 10).map((entry, index) => (
            <View key={entry.userId} style={styles.leaderboardEntry}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </Text>
              </View>
              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>{entry.userName}</Text>
                <Text style={styles.entryStats}>
                  Level {entry.level} • {entry.totalXP.toLocaleString()} XP
                </Text>
              </View>
              {entry.change !== 0 && (
                <View style={styles.changeIndicator}>
                  <Icon
                    name={entry.change > 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={entry.change > 0 ? colors.success : colors.error}
                  />
                  <Text style={[
                    styles.changeText,
                    { color: entry.change > 0 ? colors.success : colors.error }
                  ]}>
                    {Math.abs(entry.change)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyLeaderboard}>
          <Icon name="leaderboard" size={48} color={colors.text.secondary} />
          <Text style={styles.emptyLeaderboardText}>Leaderboard loading...</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your level...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Level Data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (currentUser?.id) {
                dispatch(fetchUserLevel(currentUser.id));
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
        colors={[colors.primary + '10', colors.background.primary]}
        style={styles.gradientBackground}
      >
        {/* Header with Tabs */}
        <View style={styles.header}>
          <Text style={styles.title}>Level Progress</Text>
          <Text style={styles.subtitle}>
            Track your charitable journey and unlock exclusive perks
          </Text>

          <View style={styles.tabContainer}>
            {[
              { key: 'overview' as const, label: 'Overview', icon: 'dashboard' },
              { key: 'perks' as const, label: 'Perks', icon: 'stars' },
              { key: 'leaderboard' as const, label: 'Leaderboard', icon: 'leaderboard' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
              >
                <Icon name={tab.icon} size={18} color={activeTab === tab.key ? '#FFF' : colors.primary} />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'perks' && renderPerks()}
          {activeTab === 'leaderboard' && renderLeaderboard()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Helper functions
const getXPEntryIcon = (category: string) => {
  switch (category) {
    case 'donation': return 'volunteer-activism';
    case 'review': return 'rate-review';
    case 'crew': return 'groups';
    case 'challenge': return 'flag';
    case 'achievement': return 'emoji-events';
    case 'streak': return 'local-fire-department';
    default: return 'star';
  }
};

const getPerkIcon = (type: string) => {
  switch (type) {
    case 'coin_multiplier': return 'monetization-on';
    case 'faster_earning': return 'trending-up';
    case 'exclusive_access': return 'stars';
    case 'priority_support': return 'support';
    case 'customization': return 'palette';
    case 'social_badge': return 'verified';
    default: return 'star';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradientBackground: {
    flex: 1,
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
    marginBottom: spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xxs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  tabTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  overviewContainer: {
    padding: spacing.lg,
  },
  progressSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  recentXPSection: {
    marginTop: spacing.lg,
  },
  xpEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  xpEntryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  xpEntryInfo: {
    flex: 1,
  },
  xpEntryReason: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  xpEntryTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  xpEntryAmount: {
    ...typography.button,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
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
  perksContainer: {
    padding: spacing.lg,
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  perkCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  perkHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  perkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  perkContent: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  perkName: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  perkDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  perkValueText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  unlockButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  unlockButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  emptyPerks: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyPerksText: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyPerksSubtext: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  milestonesSection: {
    marginTop: spacing.lg,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  milestoneIcon: {
    marginRight: spacing.sm,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  milestoneDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  leaderboardContainer: {
    padding: spacing.lg,
  },
  leaderboardList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  rankBadge: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
  },
  entryStats: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    ...typography.caption,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  emptyLeaderboard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyLeaderboardText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
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
});