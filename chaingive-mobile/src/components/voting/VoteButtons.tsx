import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface VoteButtonsProps {
  proposalId: string;
  onVote: (proposalId: string, voteType: string) => void;
  disabled?: boolean;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  proposalId,
  onVote,
  disabled = false,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleVote = async (voteType: string) => {
    if (disabled || loading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(voteType);

      await onVote(proposalId, voteType);

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to cast vote. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const voteOptions = [
    {
      type: 'yes',
      label: 'Yes',
      icon: 'thumb-up',
      color: colors.success,
      bgColor: colors.success + '20',
    },
    {
      type: 'no',
      label: 'No',
      icon: 'thumb-down',
      color: colors.error,
      bgColor: colors.error + '20',
    },
    {
      type: 'abstain',
      label: 'Abstain',
      icon: 'horizontal-rule',
      color: colors.warning,
      bgColor: colors.warning + '20',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cast Your Vote</Text>
      <View style={styles.buttonRow}>
        {voteOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.voteButton,
              { backgroundColor: option.bgColor },
              disabled && styles.disabledButton,
            ]}
            onPress={() => handleVote(option.type)}
            disabled={disabled || loading !== null}
            activeOpacity={0.8}
          >
            {loading === option.type ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.buttonText, { color: option.color }]}>
                  Voting...
                </Text>
              </View>
            ) : (
              <>
                <Icon name={option.icon} size={20} color={option.color} />
                <Text style={[styles.buttonText, { color: option.color }]}>
                  {option.label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rewardInfo}>
        <Icon name="stars" size={14} color={colors.tertiary} />
        <Text style={styles.rewardText}>Earn 5 coins for voting</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
    minHeight: 48,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button,
    fontWeight: 'bold',
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  rewardText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: '600',
  },
});