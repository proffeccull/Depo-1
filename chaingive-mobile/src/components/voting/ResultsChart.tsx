import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface ResultsChartProps {
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  totalVotes: number;
  size?: 'small' | 'large';
}

export const ResultsChart: React.FC<ResultsChartProps> = ({
  yesVotes,
  noVotes,
  abstainVotes,
  totalVotes,
  size = 'small',
}) => {
  const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (abstainVotes / totalVotes) * 100 : 0;

  const isSmall = size === 'small';

  const voteData = [
    {
      label: 'Yes',
      votes: yesVotes,
      percentage: yesPercentage,
      color: colors.success,
    },
    {
      label: 'No',
      votes: noVotes,
      percentage: noPercentage,
      color: colors.error,
    },
    {
      label: 'Abstain',
      votes: abstainVotes,
      percentage: abstainPercentage,
      color: colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      {voteData.map((item, index) => (
        <View key={item.label} style={styles.voteRow}>
          <View style={styles.voteLabel}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: item.color },
              ]}
            />
            <Text
              style={[
                isSmall ? styles.smallLabel : styles.largeLabel,
                { color: colors.text.primary },
              ]}
            >
              {item.label}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={item.percentage / 100}
              color={item.color}
              style={[
                styles.progressBar,
                isSmall ? styles.smallProgressBar : styles.largeProgressBar,
              ]}
            />
            <View style={styles.statsContainer}>
              <Text
                style={[
                  isSmall ? styles.smallStatsText : styles.largeStatsText,
                  { color: colors.text.secondary },
                ]}
              >
                {item.votes} ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>
      ))}

      {totalVotes > 0 && (
        <View style={styles.summary}>
          <Text
            style={[
              isSmall ? styles.smallSummaryText : styles.largeSummaryText,
              { color: colors.text.secondary },
            ]}
          >
            {yesPercentage >= 50 ? '✅ Proposal likely to pass' :
             noPercentage >= 50 ? '❌ Proposal likely to fail' :
             '🤔 Vote is too close to call'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  voteLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 70,
    gap: spacing.xs,
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  smallLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  largeLabel: {
    ...typography.bodyRegular,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    borderRadius: 4,
  },
  smallProgressBar: {
    height: 6,
  },
  largeProgressBar: {
    height: 8,
  },
  statsContainer: {
    marginTop: spacing.xxs,
  },
  smallStatsText: {
    ...typography.caption,
    textAlign: 'right',
  },
  largeStatsText: {
    ...typography.bodySmall,
    textAlign: 'right',
  },
  summary: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  smallSummaryText: {
    ...typography.caption,
    fontStyle: 'italic',
  },
  largeSummaryText: {
    ...typography.bodySmall,
    fontStyle: 'italic',
  },
});