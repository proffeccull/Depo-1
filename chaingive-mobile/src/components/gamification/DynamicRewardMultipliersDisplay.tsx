import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface MultiplierSource {
  id: string;
  type: 'streak' | 'crew' | 'event' | 'achievement' | 'time';
  name: string;
  description: string;
  multiplier: number;
  isActive: boolean;
  progress?: number;
  maxProgress?: number;
  icon: string;
  color: string;
}

interface DynamicRewardMultipliersDisplayProps {
  currentMultiplier: number;
  baseReward: number;
  sources: MultiplierSource[];
  onMultiplierChange?: (newMultiplier: number) => void;
  showTooltip?: boolean;
  animated?: boolean;
}

export const DynamicRewardMultipliersDisplay: React.FC<DynamicRewardMultipliersDisplayProps> = ({
  currentMultiplier,
  baseReward,
  sources,
  onMultiplierChange,
  showTooltip = true,
  animated = true,
}) => {
  const [animatedMultiplier] = useState(new Animated.Value(currentMultiplier));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [selectedSource, setSelectedSource] = useState<MultiplierSource | null>(null);
  const [showTooltipAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedMultiplier, {
        toValue: currentMultiplier,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [currentMultiplier, animated]);

  useEffect(() => {
    if (currentMultiplier > 1) {
      // Pulse animation for multiplier changes
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [currentMultiplier]);

  const handleSourcePress = (source: MultiplierSource) => {
    setSelectedSource(source);

    if (showTooltip) {
      Animated.timing(showTooltipAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const hideTooltip = () => {
    Animated.timing(showTooltipAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setSelectedSource(null));
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'streak': return 'local-fire-department';
      case 'crew': return 'groups';
      case 'event': return 'event';
      case 'achievement': return 'emoji-events';
      case 'time': return 'schedule';
      default: return 'star';
    }
  };

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'streak': return colors.error;
      case 'crew': return colors.secondary;
      case 'event': return colors.warning;
      case 'achievement': return colors.success;
      case 'time': return colors.info;
      default: return colors.primary;
    }
  };

  const activeSources = sources.filter(source => source.isActive);
  const totalBonusReward = baseReward * (currentMultiplier - 1);

  return (
    <View style={styles.container}>
      {/* Main Multiplier Display */}
      <Animated.View
        style={[
          styles.multiplierCard,
          animated && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <LinearGradient
          colors={currentMultiplier > 1 ? [colors.primary, colors.primaryDark] : [colors.gray[300], colors.gray[400]]}
          style={styles.multiplierGradient}
        >
          <View style={styles.multiplierHeader}>
            <Icon
              name={currentMultiplier > 1 ? "flash" : "star-border"}
              size={24}
              color="#FFF"
            />
            <Text style={styles.multiplierLabel}>Reward Multiplier</Text>
          </View>

          <View style={styles.multiplierValue}>
            <Animated.Text style={[styles.multiplierNumber, animated && { opacity: animatedMultiplier }]}>
              {animated ? animatedMultiplier.interpolate({
                inputRange: [1, 10],
                outputRange: ['1.0x', '10.0x']
              }) : `${currentMultiplier.toFixed(1)}x`}
            </Animated.Text>
          </View>

          {currentMultiplier > 1 && (
            <View style={styles.rewardBreakdown}>
              <Text style={styles.baseReward}>Base: ₦{baseReward}</Text>
              <Text style={styles.bonusReward}>Bonus: ₦{totalBonusReward.toFixed(0)}</Text>
              <Text style={styles.totalReward}>Total: ₦{(baseReward + totalBonusReward).toFixed(0)}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Active Multipliers List */}
      {activeSources.length > 0 && (
        <View style={styles.sourcesSection}>
          <Text style={styles.sourcesTitle}>Active Multipliers</Text>
          <View style={styles.sourcesList}>
            {activeSources.map((source) => (
              <TouchableOpacity
                key={source.id}
                style={[styles.sourceItem, { borderColor: source.color + '40' }]}
                onPress={() => handleSourcePress(source)}
                activeOpacity={0.8}
              >
                <View style={[styles.sourceIcon, { backgroundColor: source.color + '20' }]}>
                  <Icon name={getSourceIcon(source.type)} size={20} color={source.color} />
                </View>

                <View style={styles.sourceInfo}>
                  <Text style={styles.sourceName}>{source.name}</Text>
                  <Text style={styles.sourceMultiplier}>{source.multiplier.toFixed(1)}x</Text>
                </View>

                {source.progress !== undefined && source.maxProgress && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(source.progress / source.maxProgress) * 100}%`, backgroundColor: source.color }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {source.progress}/{source.maxProgress}
                    </Text>
                  </View>
                )}

                <Icon name="info-outline" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Predictive Calculator */}
      <View style={styles.predictorSection}>
        <Text style={styles.predictorTitle}>Potential Multipliers</Text>
        <View style={styles.predictorGrid}>
          {sources.filter(source => !source.isActive).slice(0, 4).map((source) => (
            <View key={source.id} style={styles.predictorItem}>
              <View style={[styles.predictorIcon, { backgroundColor: source.color + '20' }]}>
                <Icon name={getSourceIcon(source.type)} size={16} color={source.color} />
              </View>
              <Text style={styles.predictorName} numberOfLines={1}>
                {source.name}
              </Text>
              <Text style={styles.predictorMultiplier}>
                +{source.multiplier.toFixed(1)}x
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tooltip Modal */}
      {selectedSource && showTooltip && (
        <Animated.View
          style={[
            styles.tooltipOverlay,
            {
              opacity: showTooltipAnim,
              transform: [{
                scale: showTooltipAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }]
            }
          ]}
        >
          <TouchableOpacity style={styles.tooltipBackdrop} onPress={hideTooltip} activeOpacity={1}>
            <View style={styles.tooltipContent}>
              <View style={styles.tooltipHeader}>
                <View style={[styles.tooltipIcon, { backgroundColor: selectedSource.color + '20' }]}>
                  <Icon name={getSourceIcon(selectedSource.type)} size={24} color={selectedSource.color} />
                </View>
                <View style={styles.tooltipTitleSection}>
                  <Text style={styles.tooltipTitle}>{selectedSource.name}</Text>
                  <Text style={styles.tooltipMultiplier}>{selectedSource.multiplier.toFixed(1)}x multiplier</Text>
                </View>
                <TouchableOpacity onPress={hideTooltip}>
                  <Icon name="close" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.tooltipDescription}>{selectedSource.description}</Text>

              {selectedSource.progress !== undefined && selectedSource.maxProgress && (
                <View style={styles.tooltipProgress}>
                  <Text style={styles.tooltipProgressLabel}>Progress</Text>
                  <View style={styles.tooltipProgressBar}>
                    <View
                      style={[
                        styles.tooltipProgressFill,
                        {
                          width: `${(selectedSource.progress / selectedSource.maxProgress) * 100}%`,
                          backgroundColor: selectedSource.color
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.tooltipProgressText}>
                    {selectedSource.progress} / {selectedSource.maxProgress}
                  </Text>
                </View>
              )}

              <View style={styles.tooltipReward}>
                <Text style={styles.tooltipRewardLabel}>Reward Impact</Text>
                <Text style={styles.tooltipRewardValue}>
                  +₦{(baseReward * selectedSource.multiplier).toFixed(0)} bonus
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  multiplierCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  multiplierGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  multiplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  multiplierLabel: {
    ...typography.bodyBold,
    color: '#FFF',
  },
  multiplierValue: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  multiplierNumber: {
    ...typography.display,
    color: '#FFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  rewardBreakdown: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  baseReward: {
    ...typography.caption,
    color: '#FFF',
    opacity: 0.8,
  },
  bonusReward: {
    ...typography.bodyBold,
    color: '#FFD700',
  },
  totalReward: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  sourcesSection: {
    marginBottom: spacing.lg,
  },
  sourcesTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  sourcesList: {
    gap: spacing.sm,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  sourceMultiplier: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xxs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  predictorSection: {
    marginBottom: spacing.lg,
  },
  predictorTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  predictorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  predictorItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  predictorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  predictorName: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  predictorMultiplier: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  tooltipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tooltipBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  tooltipContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tooltipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tooltipTitleSection: {
    flex: 1,
  },
  tooltipTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  tooltipMultiplier: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  tooltipDescription: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tooltipProgress: {
    marginBottom: spacing.md,
  },
  tooltipProgressLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tooltipProgressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  tooltipProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tooltipProgressText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tooltipReward: {
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 12,
  },
  tooltipRewardLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  tooltipRewardValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default DynamicRewardMultipliersDisplay;