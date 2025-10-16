import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { VoteButtons } from './VoteButtons';
import { ResultsChart } from './ResultsChart';

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

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposalId: string, voteType: string) => void;
  onPress: () => void;
}

const getCategoryColor = (category: string) => {
  const colors = {
    feature_request: '#4CAF50',
    charity_category: '#2196F3',
    platform_improvement: '#FF9800',
    governance: '#9C27B0',
  };
  return colors[category as keyof typeof colors] || '#666';
};

const getCategoryIcon = (category: string) => {
  const icons = {
    feature_request: 'lightbulb',
    charity_category: 'volunteer-activism',
    platform_improvement: 'build',
    governance: 'gavel',
  };
  return icons[category as keyof typeof icons] || 'help';
};

const formatTimeRemaining = (hours: number) => {
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
};

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onVote,
  onPress,
}) => {
  const categoryColor = getCategoryColor(proposal.category);
  const categoryIcon = getCategoryIcon(proposal.category);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.white, colors.gray[50]]}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Icon name={categoryIcon} size={16} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {proposal.category.replace('_', ' ')}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {formatTimeRemaining(proposal.timeRemaining)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {proposal.title}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {proposal.description}
        </Text>

        {/* Creator Info */}
        <View style={styles.creatorInfo}>
          <View style={styles.creatorAvatar}>
            <Icon name="person" size={16} color={colors.text.secondary} />
          </View>
          <Text style={styles.creatorName}>
            {proposal.creator.firstName} {proposal.creator.lastName}
          </Text>
          <View style={styles.trustScore}>
            <Icon name="verified" size={12} color={colors.success} />
            <Text style={styles.trustScoreText}>
              {proposal.creator.trustScore}
            </Text>
          </View>
        </View>

        {/* Vote Results */}
        {proposal.totalVotes > 0 && (
          <View style={styles.resultsContainer}>
            <ResultsChart
              yesVotes={proposal.yesVotes}
              noVotes={proposal.noVotes}
              abstainVotes={proposal.abstainVotes}
              totalVotes={proposal.totalVotes}
              size="small"
            />

            <View style={styles.voteStats}>
              <Text style={styles.totalVotesText}>
                {proposal.totalVotes} votes
              </Text>
              {proposal.userVote && (
                <View style={styles.userVoteBadge}>
                  <Text style={styles.userVoteText}>
                    You voted: {proposal.userVote}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Vote Buttons */}
        {proposal.canVote && (
          <VoteButtons
            proposalId={proposal.id}
            onVote={onVote}
            disabled={false}
          />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
            <Text style={styles.detailsText}>View Details</Text>
            <Icon name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    ...shadows.card,
  },
  card: {
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  description: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
  trustScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  trustScoreText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: spacing.md,
  },
  voteStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  totalVotesText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  userVoteBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
  },
  userVoteText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
    alignItems: 'flex-end',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailsText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
});