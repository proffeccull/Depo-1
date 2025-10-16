import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Import voting components
import { ProposalCard } from '../../components/voting/ProposalCard';
import { VoteButtons } from '../../components/voting/VoteButtons';
import { ResultsChart } from '../../components/voting/ResultsChart';
import { CreateProposalModal } from '../../components/voting/CreateProposalModal';

const { width: screenWidth } = Dimensions.get('window');

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  timeRemaining: number;
  userVote?: string;
  canVote: boolean;
  creator: {
    firstName: string;
    lastName: string;
    trustScore: number;
  };
}

const CommunityVotingScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All Proposals', icon: 'list' },
    { key: 'feature_request', label: 'Features', icon: 'lightbulb' },
    { key: 'charity_category', label: 'Charities', icon: 'volunteer-activism' },
    { key: 'platform_improvement', label: 'Platform', icon: 'build' },
    { key: 'governance', label: 'Governance', icon: 'gavel' },
  ];

  useEffect(() => {
    loadProposals();
  }, [selectedCategory]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockProposals: Proposal[] = [
        {
          id: '1',
          title: 'Add Ramadan Charity Category',
          description: 'Create a dedicated category for Ramadan donations with special rewards and matching.',
          category: 'charity_category',
          status: 'active',
          totalVotes: 156,
          yesVotes: 124,
          noVotes: 23,
          abstainVotes: 9,
          timeRemaining: 120, // hours
          userVote: 'yes',
          canVote: false,
          creator: {
            firstName: 'Ahmed',
            lastName: 'Mohammed',
            trustScore: 95,
          },
        },
        {
          id: '2',
          title: 'Implement Dark Mode',
          description: 'Add dark mode support across the entire platform for better user experience.',
          category: 'platform_improvement',
          status: 'active',
          totalVotes: 89,
          yesVotes: 67,
          noVotes: 15,
          abstainVotes: 7,
          timeRemaining: 48,
          canVote: true,
          creator: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            trustScore: 87,
          },
        },
      ];

      const filteredProposals = selectedCategory === 'all'
        ? mockProposals
        : mockProposals.filter(p => p.category === selectedCategory);

      setProposals(filteredProposals);
    } catch (error) {
      Alert.alert('Error', 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProposals();
    setRefreshing(false);
  };

  const handleVote = async (proposalId: string, voteType: string) => {
    try {
      Haptics.selectionAsync();

      // TODO: Replace with actual API call
      // await votingApi.castVote(proposalId, voteType);

      // Update local state
      setProposals(prev => prev.map(proposal => {
        if (proposal.id === proposalId) {
          const newVotes = { ...proposal };
          if (voteType === 'yes') newVotes.yesVotes++;
          else if (voteType === 'no') newVotes.noVotes++;
          else newVotes.abstainVotes++;
          newVotes.totalVotes++;
          newVotes.userVote = voteType;
          newVotes.canVote = false;
          return newVotes;
        }
        return proposal;
      }));

      Alert.alert('Success', 'Vote cast successfully! You earned 5 coins.');
    } catch (error) {
      Alert.alert('Error', 'Failed to cast vote');
    }
  };

  const handleCreateProposal = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to create proposals');
      return;
    }
    setShowCreateModal(true);
  };

  const renderProposal = ({ item }: { item: Proposal }) => (
    <ProposalCard
      proposal={item}
      onVote={handleVote}
      onPress={() => navigation.navigate('ProposalDetail', { proposalId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Voting</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProposal}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Icon
                name={category.icon}
                size={16}
                color={selectedCategory === category.key ? colors.white : colors.text.secondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats Banner */}
      <LinearGradient
        colors={[colors.primary + '20', colors.primary + '10']}
        style={styles.statsBanner}
      >
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{proposals.length}</Text>
          <Text style={styles.statLabel}>Active Proposals</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {proposals.reduce((sum, p) => sum + p.totalVotes, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Votes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {proposals.filter(p => p.userVote).length}
          </Text>
          <Text style={styles.statLabel}>Your Votes</Text>
        </View>
      </LinearGradient>

      {/* Proposals List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading proposals...</Text>
          </View>
        ) : proposals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="how-to-vote" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No proposals found</Text>
            <Text style={styles.emptyText}>
              {selectedCategory === 'all'
                ? 'Be the first to create a proposal!'
                : `No ${selectedCategory.replace('_', ' ')} proposals yet.`
              }
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={handleCreateProposal}
            >
              <Text style={styles.createFirstText}>Create First Proposal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          proposals.map((proposal) => (
            <View key={proposal.id} style={styles.proposalWrapper}>
              {renderProposal({ item: proposal })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Proposal Modal */}
      <CreateProposalModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (proposalData) => {
          // TODO: Implement proposal creation
          Alert.alert('Success', 'Proposal created successfully!');
          setShowCreateModal(false);
          loadProposals();
        }}
      />
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
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  createButton: {
    padding: spacing.xs,
  },
  categoryContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryScroll: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.white,
  },
  statsBanner: {
    flexDirection: 'row',
    margin: layout.screenPadding,
    padding: spacing.lg,
    borderRadius: 12,
    ...shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.border.medium,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  createFirstText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  proposalWrapper: {
    marginBottom: spacing.md,
  },
});

export default CommunityVotingScreen;