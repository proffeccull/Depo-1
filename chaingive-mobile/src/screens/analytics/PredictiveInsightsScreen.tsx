import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchPredictiveInsights,
  markInsightAsRead,
  generatePersonalizedInsights,
} from '../../store/slices/predictiveAnalyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const PredictiveInsightsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    insights,
    givingPredictions,
    trendAnalysis,
    coinOptimization,
    socialRecommendations,
    loading,
    insightsEnabled
  } = useSelector((state: RootState) => state.predictiveAnalytics);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (user?.id && insightsEnabled) {
      dispatch(fetchPredictiveInsights(user.id));
    }
  }, [dispatch, user?.id, insightsEnabled]);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await dispatch(fetchPredictiveInsights(user.id));
      setRefreshing(false);
    }
  };

  const handleInsightPress = async (insight: any) => {
    if (!insight.isRead && user?.id) {
      await dispatch(markInsightAsRead({ insightId: insight.id, userId: user.id }));
    }

    // Navigate based on insight type
    if (insight.actionable && insight.actionType) {
      switch (insight.actionType) {
        case 'donate':
          navigation.navigate('DonationScreen' as never);
          break;
        case 'buy_coins':
          navigation.navigate('CoinPurchaseScreen' as never);
          break;
        case 'join_circle':
          navigation.navigate('GivingCircles' as never);
          break;
        case 'view_achievements':
          navigation.navigate('Achievements' as never);
          break;
        default:
          // Show insight details
          showToast('Insight action: ' + insight.actionLabel, 'info');
      }
    }
  };

  const handleGenerateInsights = async () => {
    if (user?.id) {
      try {
        await dispatch(generatePersonalizedInsights({
          userId: user.id,
          context: { triggeredByUser: true }
        }));
        showToast('New insights generated!', 'success');
      } catch (error: any) {
        showToast('Failed to generate insights', 'error');
      }
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'donation_prediction': return 'trending-up';
      case 'giving_streak': return 'local-fire-department';
      case 'coin_optimization': return 'account-balance-wallet';
      case 'social_impact': return 'people';
      case 'achievement_unlock': return 'emoji-events';
      case 'market_trend': return 'show-chart';
      default: return 'lightbulb';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'donation_prediction': return colors.primary;
      case 'giving_streak': return colors.warning;
      case 'coin_optimization': return colors.tertiary;
      case 'social_impact': return colors.secondary;
      case 'achievement_unlock': return colors.success;
      case 'market_trend': return colors.info;
      default: return colors.primary;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.text.secondary;
    }
  };

  const filteredInsights = selectedCategory === 'all'
    ? insights
    : insights.filter(insight => insight.category === selectedCategory);

  const unreadCount = insights.filter(insight => !insight.isRead).length;

  const renderInsightCard = ({ item: insight }: { item: any }) => {
    const iconName = getInsightIcon(insight.type);
    const iconColor = getInsightColor(insight.type);
    const impactColor = getImpactColor(insight.impact);

    return (
      <TouchableOpacity
        style={[
          styles.insightCard,
          !insight.isRead && styles.unreadCard,
        ]}
        onPress={() => handleInsightPress(insight)}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: iconColor + '20' }]}>
            <Icon name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.insightMeta}>
            <View style={styles.insightBadges}>
              <View style={[styles.impactBadge, { backgroundColor: impactColor + '20' }]}>
                <Text style={[styles.impactText, { color: impactColor }]}>
                  {insight.impact.toUpperCase()} IMPACT
                </Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(insight.confidence * 100)}% confidence
                </Text>
              </View>
            </View>
            {!insight.isRead && <View style={styles.unreadDot} />}
          </View>
        </View>

        {/* Content */}
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>

          {insight.predictedValue && (
            <View style={styles.predictionValue}>
              <Text style={styles.predictionLabel}>Predicted:</Text>
              <Text style={styles.predictionAmount}>
                ₦{insight.predictedValue.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Action */}
        {insight.actionable && insight.actionLabel && (
          <View style={styles.insightAction}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: iconColor }]}
              onPress={() => handleInsightPress(insight)}
            >
              <Text style={[styles.actionButtonText, { color: iconColor }]}>
                {insight.actionLabel}
              </Text>
              <Icon name="arrow-forward" size={16} color={iconColor} />
            </TouchableOpacity>
          </View>
        )}

        {/* Timeframe */}
        <View style={styles.insightFooter}>
          <Text style={styles.timeframeText}>
            {insight.timeFrame.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={styles.timestampText}>
            {new Date(insight.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => {
    const categories = [
      { key: 'all', label: 'All', icon: 'list' },
      { key: 'giving', label: 'Giving', icon: 'favorite' },
      { key: 'social', label: 'Social', icon: 'people' },
      { key: 'financial', label: 'Financial', icon: 'account-balance-wallet' },
      { key: 'achievement', label: 'Achievement', icon: 'emoji-events' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilter}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(category.key);
            }}
          >
            <Icon
              name={category.icon}
              size={16}
              color={selectedCategory === category.key ? colors.white : colors.text.secondary}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.key && styles.categoryButtonTextSelected,
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (!insightsEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Icon name="psychology" size={64} color={colors.gray[300]} />
          <Text style={styles.disabledTitle}>Predictive Insights</Text>
          <Text style={styles.disabledMessage}>
            Predictive analytics features are currently disabled.
            Enable them in your settings to receive personalized insights.
          </Text>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Predictive Insights</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleGenerateInsights}
          style={styles.generateButton}
        >
          <Icon name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Insights List */}
      <FlatList
        data={filteredInsights}
        renderItem={renderInsightCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.insightsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="psychology" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Insights Yet</Text>
            <Text style={styles.emptyMessage}>
              Your personalized insights will appear here as we analyze your giving patterns.
            </Text>
            <TouchableOpacity
              style={styles.generateInsightsButton}
              onPress={handleGenerateInsights}
            >
              <Text style={styles.generateInsightsButtonText}>Generate Insights</Text>
            </TouchableOpacity>
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
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  disabledTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  disabledMessage: {
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  generateButton: {
    padding: spacing.xs,
  },
  categoryFilter: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.xs,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: colors.white,
  },
  insightsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  insightMeta: {
    flex: 1,
  },
  insightBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  impactBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  impactText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  confidenceBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  insightContent: {
    marginBottom: spacing.md,
  },
  insightTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  insightDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  predictionValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  predictionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  predictionAmount: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  insightAction: {
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.button,
    fontWeight: 'bold',
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeframeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  timestampText: {
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
    marginBottom: spacing.lg,
  },
  generateInsightsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  generateInsightsButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default PredictiveInsightsScreen;