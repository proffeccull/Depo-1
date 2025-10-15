import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
  fetchCrews,
  fetchUserCrews,
  createCrew,
  joinCrew,
  leaveCrew,
} from '../../store/slices/crewSlice';
import { CrewProgressBar } from '../../components/gamification/CrewProgressBar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const CrewDashboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    crews,
    userCrews,
    loading,
    error,
  } = useSelector((state: RootState) => state.crew);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = useState<'discover' | 'mycrews'>('mycrews');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserCrews(currentUser.id));
      dispatch(fetchCrews({ isPublic: true }));
    }
  }, [currentUser]);

  const displayedCrews = activeTab === 'mycrews' ? userCrews : crews.filter(crew => !userCrews.some(uc => uc.id === crew.id));

  const handleCrewPress = (crew: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isMember = userCrews.some(uc => uc.id === crew.id);

    if (isMember) {
      // Navigate to crew detail
      Alert.alert('Crew Detail', `View details for ${crew.name}`);
    } else {
      // Show join prompt
      Alert.alert(
        'Join Crew',
        `Join "${crew.name}" and contribute to the ₦${crew.totalTarget.toLocaleString()} goal?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: () => {
              if (currentUser?.id) {
                dispatch(joinCrew({
                  crewId: crew.id,
                  userId: currentUser.id,
                }));
              }
            },
          },
        ]
      );
    }
  };

  const handleCreateCrew = () => {
    Alert.alert('Create Crew', 'Crew creation form would open here');
  };

  const handleLeaveCrew = (crewId: string) => {
    Alert.alert(
      'Leave Crew',
      'Are you sure you want to leave this crew?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            if (currentUser?.id) {
              dispatch(leaveCrew({
                crewId,
                userId: currentUser.id,
              }));
            }
          },
        },
      ]
    );
  };

  const renderCrew = ({ item }: { item: any }) => {
    const isMember = userCrews.some(uc => uc.id === item.id);

    return (
      <View style={styles.crewCard}>
        <CrewProgressBar
          crew={item}
          showMembers={true}
          showRewards={true}
          animated={true}
        />

        <View style={styles.crewActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => handleCrewPress(item)}
          >
            <Icon name={isMember ? "group" : "person-add"} size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>
              {isMember ? 'View Crew' : 'Join Crew'}
            </Text>
          </TouchableOpacity>

          {isMember && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleLeaveCrew(item.id)}
            >
              <Icon name="exit-to-app" size={16} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>
                Leave
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Crew Dashboard</Text>
      <Text style={styles.subtitle}>
        Join forces with others to achieve massive charitable goals together
      </Text>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mycrews' && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('mycrews');
          }}
        >
          <Icon name="groups" size={20} color={activeTab === 'mycrews' ? '#FFF' : colors.primary} />
          <Text style={[styles.tabText, activeTab === 'mycrews' && styles.tabTextActive]}>
            My Crews ({userCrews.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('discover');
          }}
        >
          <Icon name="explore" size={20} color={activeTab === 'discover' ? '#FFF' : colors.primary} />
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{userCrews.length}</Text>
          <Text style={styles.statLabel}>Active Crews</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            ₦{userCrews.reduce((sum, crew) => sum + crew.currentProgress, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Contributed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            ₦{userCrews.reduce((sum, crew) => sum + crew.rewardPool, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Potential Rewards</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="groups" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>
        {activeTab === 'mycrews' ? 'No Active Crews' : 'No Crews to Discover'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'mycrews'
          ? 'Join a crew or create your own to start collaborating on charitable goals'
          : 'Check back later for new crews to join'
        }
      </Text>
      {activeTab === 'mycrews' && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCrew}
        >
          <Icon name="add" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Create Crew</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading crews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Crews</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (currentUser?.id) {
                dispatch(fetchUserCrews(currentUser.id));
                dispatch(fetchCrews({ isPublic: true }));
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
        colors={[colors.secondary + '10', colors.background.primary]}
        style={styles.gradientBackground}
      >
        <FlatList
          data={displayedCrews}
          renderItem={renderCrew}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateCrew}
        >
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
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
    marginBottom: spacing.lg,
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
    paddingHorizontal: spacing.md,
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
  statsContainer: {
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
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  crewCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  crewActions: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  actionButtonText: {
    ...typography.button,
    color: '#FFF',
    marginLeft: spacing.xs,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.xs,
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
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});