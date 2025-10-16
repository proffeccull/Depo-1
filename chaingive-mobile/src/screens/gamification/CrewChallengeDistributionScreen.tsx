import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
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

interface CrewMember {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  contribution: number;
  tasksCompleted: number;
  isOnline: boolean;
}

interface ChallengeTask {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  points: number;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
}

interface CrewChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  totalTasks: number;
  completedTasks: number;
  crewMembers: CrewMember[];
  tasks: ChallengeTask[];
  startDate: string;
  endDate: string;
  rewardPool: number;
  status: 'planning' | 'active' | 'completed';
}

const CrewChallengeDistributionScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [challenge, setChallenge] = useState<CrewChallenge | null>(null);
  const [selectedTask, setSelectedTask] = useState<ChallengeTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'members'>('overview');

  useEffect(() => {
    loadChallengeData();
  }, []);

  const loadChallengeData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockChallenge: CrewChallenge = {
        id: 'challenge_1',
        title: 'Community Clean-Up Challenge',
        description: 'Work together to clean up the local park and earn rewards',
        category: 'environment',
        totalTasks: 12,
        completedTasks: 5,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        rewardPool: 2500,
        status: 'active',
        crewMembers: [
          { id: '1', name: 'Alice Johnson', level: 12, contribution: 450, tasksCompleted: 3, isOnline: true },
          { id: '2', name: 'Bob Smith', level: 8, contribution: 320, tasksCompleted: 2, isOnline: false },
          { id: '3', name: 'Carol Davis', level: 15, contribution: 680, tasksCompleted: 5, isOnline: true },
          { id: '4', name: 'David Wilson', level: 6, contribution: 180, tasksCompleted: 1, isOnline: true },
        ],
        tasks: [
          {
            id: 'task_1',
            title: 'Gather cleaning supplies',
            description: 'Collect gloves, trash bags, and cleaning tools',
            difficulty: 'easy',
            estimatedTime: 30,
            points: 50,
            assignedTo: '1',
            status: 'completed',
            priority: 'high',
          },
          {
            id: 'task_2',
            title: 'Map out cleaning zones',
            description: 'Divide the park into sections for efficient cleaning',
            difficulty: 'medium',
            estimatedTime: 45,
            points: 75,
            assignedTo: '3',
            status: 'in_progress',
            priority: 'high',
          },
          {
            id: 'task_3',
            title: 'Organize volunteer schedule',
            description: 'Create a schedule for crew members',
            difficulty: 'medium',
            estimatedTime: 60,
            points: 100,
            status: 'pending',
            priority: 'medium',
          },
          {
            id: 'task_4',
            title: 'Collect litter in Zone A',
            description: 'Clean the main entrance area',
            difficulty: 'easy',
            estimatedTime: 90,
            points: 80,
            status: 'pending',
            priority: 'medium',
          },
        ],
      };

      setChallenge(mockChallenge);
    } catch (error) {
      console.error('Failed to load challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = (taskId: string, memberId: string) => {
    if (!challenge) return;

    const updatedTasks = challenge.tasks.map(task =>
      task.id === taskId ? { ...task, assignedTo: memberId, status: 'in_progress' as const } : task
    );

    setChallenge({ ...challenge, tasks: updatedTasks });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCompleteTask = (taskId: string) => {
    if (!challenge) return;

    const updatedTasks = challenge.tasks.map(task =>
      task.id === taskId ? { ...task, status: 'completed' as const } : task
    );

    const completedTasks = updatedTasks.filter(task => task.status === 'completed').length;

    setChallenge({
      ...challenge,
      tasks: updatedTasks,
      completedTasks,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
      default: return colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.info;
      default: return colors.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.warning;
      case 'pending': return colors.gray[400];
      default: return colors.primary;
    }
  };

  const renderTaskCard = ({ item: task }: { item: ChallengeTask }) => {
    const assignedMember = challenge?.crewMembers.find(m => m.id === task.assignedTo);

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
          <View style={styles.taskMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(task.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(task.difficulty) }]}>
                {task.difficulty}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                {task.priority}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.taskStats}>
            <Text style={styles.taskStat}>
              <Icon name="schedule" size={14} color={colors.text.secondary} /> {task.estimatedTime}min
            </Text>
            <Text style={styles.taskStat}>
              <Icon name="stars" size={14} color={colors.tertiary} /> {task.points} pts
            </Text>
          </View>

          {assignedMember && (
            <View style={styles.assignedMember}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {assignedMember.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.memberName}>{assignedMember.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.taskActions}>
          {task.status === 'pending' && (
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => setSelectedTask(task)}
            >
              <Icon name="person-add" size={16} color={colors.white} />
              <Text style={styles.assignButtonText}>Assign</Text>
            </TouchableOpacity>
          )}

          {task.status === 'in_progress' && task.assignedTo === user?.id && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteTask(task.id)}
            >
              <Icon name="check" size={16} color={colors.white} />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(task.status) }]}>
            <Text style={styles.statusText}>{task.status.replace('_', ' ')}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMemberCard = ({ item: member }: { item: CrewMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{member.name}</Text>
            <View style={[styles.onlineIndicator, { backgroundColor: member.isOnline ? colors.success : colors.gray[400] }]} />
          </View>
          <Text style={styles.memberLevel}>Level {member.level}</Text>
        </View>
      </View>

      <View style={styles.memberStats}>
        <View style={styles.memberStat}>
          <Text style={styles.memberStatValue}>{member.tasksCompleted}</Text>
          <Text style={styles.memberStatLabel}>Tasks Done</Text>
        </View>
        <View style={styles.memberStat}>
          <Text style={styles.memberStatValue}>₦{member.contribution}</Text>
          <Text style={styles.memberStatLabel}>Contributed</Text>
        </View>
      </View>
    </View>
  );

  const renderMemberSelectionModal = () => {
    if (!selectedTask || !challenge) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Assign Task</Text>
          <Text style={styles.modalSubtitle}>{selectedTask.title}</Text>

          <FlatList
            data={challenge.crewMembers}
            renderItem={({ item: member }) => (
              <TouchableOpacity
                style={styles.memberOption}
                onPress={() => {
                  handleAssignTask(selectedTask.id, member.id);
                  setSelectedTask(null);
                }}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberOptionInfo}>
                  <Text style={styles.memberOptionName}>{member.name}</Text>
                  <Text style={styles.memberOptionLevel}>Level {member.level}</Text>
                </View>
                <Icon name="arrow-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setSelectedTask(null)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Challenge Not Found</Text>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = (challenge.completedTasks / challenge.totalTasks) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crew Challenge</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Challenge Overview */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.challengeCard}
      >
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <Text style={styles.challengeDescription}>{challenge.description}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {challenge.completedTasks} / {challenge.totalTasks} Tasks Completed
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <View style={styles.challengeStats}>
          <View style={styles.challengeStat}>
            <Text style={styles.challengeStatValue}>{challenge.crewMembers.length}</Text>
            <Text style={styles.challengeStatLabel}>Members</Text>
          </View>
          <View style={styles.challengeStat}>
            <Text style={styles.challengeStatValue}>₦{challenge.rewardPool.toLocaleString()}</Text>
            <Text style={styles.challengeStatLabel}>Reward Pool</Text>
          </View>
          <View style={styles.challengeStat}>
            <Text style={styles.challengeStatValue}>
              {Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
            </Text>
            <Text style={styles.challengeStatLabel}>Days Left</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['overview', 'tasks', 'members'] as const).map((tab) => (
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
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="assignment-turned-in" size={24} color={colors.success} />
                <Text style={styles.statValue}>{challenge.completedTasks}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="pending" size={24} color={colors.warning} />
                <Text style={styles.statValue}>{challenge.totalTasks - challenge.completedTasks}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="group" size={24} color={colors.info} />
                <Text style={styles.statValue}>{challenge.crewMembers.filter(m => m.isOnline).length}</Text>
                <Text style={styles.statLabel}>Online</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'tasks' && (
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Task Distribution</Text>
            <FlatList
              data={challenge.tasks}
              renderItem={renderTaskCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.tasksList}
            />
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Crew Members</Text>
            <FlatList
              data={challenge.crewMembers}
              renderItem={renderMemberCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.membersList}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Member Selection Modal */}
      {renderMemberSelectionModal()}
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
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    ...typography.button,
    color: colors.primary,
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
  challengeCard: {
    margin: spacing.md,
    borderRadius: 16,
    padding: spacing.lg,
  },
  challengeTitle: {
    ...typography.h2,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    ...typography.bodyRegular,
    color: '#FFF',
    opacity: 0.9,
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
  progressPercent: {
    ...typography.h4,
    color: '#FFF',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatValue: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  challengeStatLabel: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 2,
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
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
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
  tasksSection: {
    marginBottom: spacing.lg,
  },
  tasksList: {
    paddingBottom: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  taskDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  taskMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  difficultyText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  priorityText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 12,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  taskStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  taskStat: {
    ...typography.caption,
    color: colors.text.secondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  memberName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  assignButtonText: {
    ...typography.button,
    color: colors.white,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  completeButtonText: {
    ...typography.button,
    color: colors.white,
  },
  statusIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  membersSection: {
    marginBottom: spacing.lg,
  },
  membersList: {
    paddingBottom: spacing.md,
  },
  memberCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  memberLevel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  memberStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  memberStat: {
    alignItems: 'center',
  },
  memberStatValue: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  memberStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  memberOptionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberOptionName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  memberOptionLevel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  cancelButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default CrewChallengeDistributionScreen;