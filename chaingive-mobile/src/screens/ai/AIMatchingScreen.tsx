import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchAIMatches,
  acceptAIMatch,
  updateAISmartProfile,
} from '../../store/slices/aiSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

const AIMatchingScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { matches, smartProfile, loading } = useSelector((state: RootState) => state.ai);
  const { user } = useSelector((state: RootState) => state.auth);
  const { balance } = useSelector((state: RootState) => state.coin);

  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAIMatches({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  const handleAcceptMatch = async (matchId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(acceptAIMatch({ matchId, userId: user?.id || '' })).unwrap();
      showToast('Match accepted! Starting collaboration...', 'success');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to accept match', 'error');
    }
  };

  const handleViewMatchDetails = (match: any) => {
    setSelectedMatch(match);
    setShowMatchDetails(true);
  };

  const renderMatchCard = ({ item: match }: { item: any }) => {
    const compatibilityScore = Math.round(match.matchScore * 100);
    const confidenceLevel = Math.round(match.confidenceLevel * 100);

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => handleViewMatchDetails(match)}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.matchHeader}>
          <View style={styles.matchScore}>
            <LinearGradient
              colors={
                compatibilityScore >= 90 ? [colors.success, colors.primary] :
                compatibilityScore >= 80 ? [colors.warning, colors.primary] :
                [colors.info, colors.secondary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scoreGradient}
            >
              <Text style={styles.scoreText}>{compatibilityScore}%</Text>
              <Text style={styles.scoreLabel}>Match</Text>
            </LinearGradient>
          </View>
          <View style={styles.matchActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleViewMatchDetails(match)}
            >
              <Icon name="visibility" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptMatch(match.id)}
            >
              <Icon name="check" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.matchContent}>
          <Text style={styles.matchReason}>{match.matchReason}</Text>

          {/* Compatibility Factors */}
          <View style={styles.compatibilityFactors}>
            <View style={styles.factor}>
              <Icon name="favorite" size={14} color={colors.success} />
              <Text style={styles.factorText}>
                Giving: {Math.round(match.compatibilityFactors.givingHistory * 100)}%
              </Text>
            </View>
            <View style={styles.factor}>
              <Icon name="category" size={14} color={colors.primary} />
              <Text style={styles.factorText}>
                Causes: {Math.round(match.compatibilityFactors.causesAlignment * 100)}%
              </Text>
            </View>
            <View style={styles.factor}>
              <Icon name="schedule" size={14} color={colors.secondary} />
              <Text style={styles.factorText}>
                Timing: {Math.round(match.compatibilityFactors.donationFrequency * 100)}%
              </Text>
            </View>
          </View>

          {/* Recommended Amount */}
          <View style={styles.recommendation}>
            <Text style={styles.recommendationLabel}>Suggested Amount:</Text>
            <AnimatedNumber
              value={match.recommendedAmount}
              style={styles.recommendationAmount}
              formatter={(val) => `₦${Math.round(val).toLocaleString()}`}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.matchFooter}>
          <View style={styles.confidenceBadge}>
            <Icon name="psychology" size={14} color={colors.tertiary} />
            <Text style={styles.confidenceText}>{confidenceLevel}% confident</Text>
          </View>
          <Text style={styles.matchDate}>
            {new Date(match.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMatchDetails = () => {
    if (!selectedMatch) return null;

    return (
      <View style={styles.detailsOverlay}>
        <View style={styles.detailsModal}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Match Details</Text>
            <TouchableOpacity
              onPress={() => setShowMatchDetails(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Compatibility Breakdown</Text>
              {Object.entries(selectedMatch.compatibilityFactors).map(([key, value]: [string, any]) => (
                <View key={key} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </Text>
                  <Text style={styles.detailValue}>{Math.round(value * 100)}%</Text>
                </View>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>AI Reasoning</Text>
              <Text style={styles.detailReasoning}>{selectedMatch.matchReason}</Text>
            </View>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.detailButton, styles.declineButton]}
                onPress={() => {
                  setShowMatchDetails(false);
                  // Handle decline
                }}
              >
                <Text style={styles.declineButtonText}>Not Interested</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.detailButton, styles.acceptDetailButton]}
                onPress={() => {
                  handleAcceptMatch(selectedMatch.id);
                  setShowMatchDetails(false);
                }}
              >
                <Text style={styles.acceptDetailButtonText}>Accept Match</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding your perfect matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Matching</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AISettings' as never)}
          style={styles.settingsButton}
        >
          <Icon name="settings" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Icon name="psychology" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Our AI analyzes giving patterns, causes alignment, and social activity to find your perfect collaboration partners.
        </Text>
      </View>

      {/* Matches List */}
      <FlatList
        data={matches}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.matchesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Matches Yet</Text>
            <Text style={styles.emptyMessage}>
              We're analyzing your giving patterns to find perfect matches.
              Check back soon!
            </Text>
          </View>
        }
      />

      {/* Match Details Modal */}
      {showMatchDetails && renderMatchDetails()}
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
    ...typography.body,
    color: colors.text.secondary,
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  matchesList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  matchCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  matchScore: {
    flex: 1,
  },
  scoreGradient: {
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  scoreText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: 'bold',
  },
  scoreLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.9,
  },
  matchActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: colors.primary + '20',
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  matchContent: {
    marginBottom: spacing.md,
  },
  matchReason: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  compatibilityFactors: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  factor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  factorText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  recommendation: {
    alignItems: 'center',
    backgroundColor: colors.tertiary + '10',
    padding: spacing.md,
    borderRadius: 8,
  },
  recommendationLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  recommendationAmount: {
    ...typography.h3,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: '600',
  },
  matchDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  detailsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  detailsModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '70%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailsTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.xs,
  },
  detailsContent: {
    padding: spacing.lg,
  },
  detailSection: {
    marginBottom: spacing['2xl'],
  },
  detailTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  detailReasoning: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  detailActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  detailButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: colors.gray[200],
  },
  declineButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  acceptDetailButton: {
    backgroundColor: colors.primary,
  },
  acceptDetailButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default AIMatchingScreen;