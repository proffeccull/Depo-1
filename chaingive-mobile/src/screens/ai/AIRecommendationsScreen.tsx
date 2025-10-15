import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  getAIRecommendations,
  actOnRecommendation,
} from '../../store/slices/aiSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const AIRecommendationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { recommendations, loading } = useSelector((state: RootState) => state.ai);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      dispatch(getAIRecommendations({
        userId: user.id,
        categories: selectedCategory !== 'all' ? [selectedCategory] : undefined
      }));
    }
  }, [dispatch, user?.id, selectedCategory]);

  const handleActOnRecommendation = async (recommendationId: string, action: 'view' | 'act' | 'dismiss') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(actOnRecommendation({
        recommendationId,
        userId: user?.id || '',
        action
      })).unwrap();

      const actionText = action === 'act' ? 'acted on' : action === 'dismiss' ? 'dismissed' : 'viewed';
      showToast(`Recommendation ${actionText}!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update recommendation', 'error');
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'cause': return 'category';
      case 'amount': return 'attach-money';
      case 'timing': return 'schedule';
      case 'social': return 'people';
      case 'challenge': return 'emoji-events';
      default: return 'lightbulb';
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'cause': return colors.primary;
      case 'amount': return colors.success;
      case 'timing': return colors.warning;
      case 'social': return colors.secondary;
      case 'challenge': return colors.tertiary;
      default: return colors.info;
    }
  };

  const categories = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'cause', label: 'Causes', icon: 'category' },
    { key: 'amount', label: 'Amounts', icon: 'attach-money' },
    { key: 'timing', label: 'Timing', icon: 'schedule' },
    { key: 'social', label: 'Social', icon: 'people' },
    { key: 'challenge', label: 'Challenges', icon: 'emoji-events' },
  ];

  const renderRecommendationCard = ({ item: recommendation }: { item: any }) => {
    const confidencePercent = Math.round(recommendation.confidence * 100);
    const categoryColor = getCategoryColor(recommendation.type);

    return (
      <View style={styles.recommendationCard}>
        {/* Header */}
        <View style={styles.recommendationHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Icon name={getCategoryIcon(recommendation.type)} size={16} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
            </Text>
          </View>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{confidencePercent}% confident</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.recommendationContent}>
          <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
          <Text style={styles.recommendationDescription}>
            {recommendation.description}
          </Text>

          {/* Reasoning */}
          <View style={styles.reasoningSection}>
            <Text style={styles.reasoningLabel}>Why this recommendation:</Text>
            <Text style={styles.reasoningText}>{recommendation.reasoning}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.recommendationActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleActOnRecommendation(recommendation.id, 'view')}
          >
            <Icon name="visibility" size={16} color={colors.primary} />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actButton]}
            onPress={() => handleActOnRecommendation(recommendation.id, 'act')}
          >
            <Icon name="check-circle" size={16} color={colors.white} />
            <Text style={styles.actButtonText}>I'll Try It</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dismissButton]}
            onPress={() => handleActOnRecommendation(recommendation.id, 'dismiss')}
          >
            <Icon name="close" size={16} color={colors.text.secondary} />
            <Text style={styles.dismissButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.recommendationFooter}>
          <Text style={styles.timestamp}>
            {new Date(recommendation.createdAt).toLocaleDateString()}
          </Text>
          {recommendation.status !== 'pending' && (
            <View style={[styles.statusBadge, {
              backgroundColor: recommendation.status === 'acted' ? colors.success + '20' :
                              recommendation.status === 'viewed' ? colors.info + '20' :
                              colors.gray[200]
            }]}>
              <Text style={[styles.statusText, {
                color: recommendation.status === 'acted' ? colors.success :
                        recommendation.status === 'viewed' ? colors.info :
                        colors.text.secondary
              }]}>
                {recommendation.status === 'acted' ? '✓ Acted' :
                 recommendation.status === 'viewed' ? '👁 Viewed' :
                 '✗ Dismissed'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your data for personalized recommendations...</Text>
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
        <Text style={styles.headerTitle}>AI Recommendations</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AISettings' as never)}
          style={styles.settingsButton}
        >
          <Icon name="settings" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.key && styles.categoryButtonSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(item.key);
              }}
            >
              <Icon
                name={item.icon}
                size={16}
                color={selectedCategory === item.key ? colors.white : colors.text.secondary}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === item.key && styles.categoryButtonTextSelected,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Icon name="psychology" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Our AI analyzes your giving patterns, preferences, and goals to provide personalized recommendations for maximum impact.
        </Text>
      </View>

      {/* Recommendations List */}
      <FlatList
        data={recommendations}
        renderItem={renderRecommendationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recommendationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="lightbulb-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
            <Text style={styles.emptyMessage}>
              We're still learning about your preferences. Check back soon for personalized suggestions!
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: spacing['2xl'],
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
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
  categoryFilter: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: colors.white,
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
  recommendationsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  recommendationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  confidenceBadge: {
    backgroundColor: colors.tertiary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
    fontSize: 10,
  },
  recommendationContent: {
    marginBottom: spacing.lg,
  },
  recommendationTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  recommendationDescription: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  reasoningSection: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 8,
  },
  reasoningLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  reasoningText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    lineHeight: 18,
  },
  recommendationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  viewButton: {
    backgroundColor: colors.primary + '20',
  },
  viewButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  actButton: {
    backgroundColor: colors.success,
  },
  actButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  dismissButton: {
    backgroundColor: colors.gray[200],
  },
  dismissButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
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
});

export default AIRecommendationsScreen;