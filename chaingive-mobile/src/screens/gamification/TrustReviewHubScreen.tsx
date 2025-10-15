import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import {
  fetchTrustReviews,
  submitTrustReview,
  fetchUserTrustLevel,
} from '../../store/slices/trustSlice';
import { TrustReviewCard } from '../../components/gamification/TrustReviewCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const TrustReviewHubScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    reviews,
    userTrustLevel,
    pendingReviews,
    loading,
    error,
  } = useSelector((state: RootState) => state.trust);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = useState<'reviews' | 'pending' | 'myreviews'>('reviews');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'highrated'>('all');

  useEffect(() => {
    loadReviews();
    if (currentUser?.id) {
      dispatch(fetchUserTrustLevel(currentUser.id));
    }
  }, [selectedFilter]);

  const loadReviews = () => {
    const filters: any = {};
    if (selectedFilter === 'recent') {
      // Add date filter for recent reviews
    } else if (selectedFilter === 'highrated') {
      filters.rating = 4; // 4+ stars
    }

    dispatch(fetchTrustReviews(filters));
  };

  const displayedReviews = activeTab === 'pending' ? pendingReviews :
                          activeTab === 'myreviews' ? reviews.filter(r => r.reviewerId === currentUser?.id) :
                          reviews;

  const handleReviewPress = (review: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to review detail or expand in place
    Alert.alert('Review Detail', `View full details for review by ${review.reviewerName}`);
  };

  const handleSubmitReview = () => {
    Alert.alert('Submit Review', 'Review submission form would open here');
  };

  const renderReview = ({ item }: { item: any }) => (
    <TrustReviewCard
      review={item}
      currentUserId={currentUser?.id || ''}
      showActions={activeTab !== 'pending'}
      compact={false}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Trust Review Hub</Text>
      <Text style={styles.subtitle}>
        Build trust through verified video reviews and maintain payment security
      </Text>

      {/* Trust Level Display */}
      {userTrustLevel && (
        <View style={styles.trustLevelContainer}>
          <View style={styles.trustLevelBadge}>
            <Icon name="verified-user" size={20} color="#FFF" />
            <Text style={styles.trustLevelText}>
              Level {userTrustLevel.level} • {userTrustLevel.trustScore} Trust Score
            </Text>
          </View>
          <View style={styles.trustStats}>
            <Text style={styles.trustStat}>
              {userTrustLevel.totalReviews} Reviews
            </Text>
            <Text style={styles.trustStat}>
              {userTrustLevel.averageRating.toFixed(1)} Avg Rating
            </Text>
          </View>
        </View>
      )}

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        {[
          { key: 'reviews' as const, label: 'All Reviews', icon: 'rate-review' },
          { key: 'pending' as const, label: 'Pending', icon: 'schedule', badge: pendingReviews.length },
          { key: 'myreviews' as const, label: 'My Reviews', icon: 'person' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab.key);
            }}
          >
            <Icon name={tab.icon} size={18} color={activeTab === tab.key ? '#FFF' : colors.primary} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.badge && tab.badge > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Tabs */}
      {activeTab === 'reviews' && (
        <View style={styles.filterTabs}>
          {[
            { key: 'all', label: 'All' },
            { key: 'recent', label: 'Recent' },
            { key: 'highrated', label: 'High Rated' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.filterTabActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(filter.key as any);
              }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{reviews.length}</Text>
          <Text style={styles.statLabel}>Total Reviews</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {reviews.filter(r => r.isVerified).length}
          </Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="rate-review" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>
        {activeTab === 'pending' ? 'No Pending Reviews' :
         activeTab === 'myreviews' ? 'No Reviews Submitted' :
         'No Reviews Found'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'pending'
          ? 'Complete your pending video reviews to earn rewards'
          : activeTab === 'myreviews'
          ? 'Submit reviews after receiving payments to build trust'
          : 'Check back later for new reviews'
        }
      </Text>
      {activeTab === 'reviews' && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitReview}
        >
          <Icon name="add" size={20} color="#FFF" />
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Reviews</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadReviews}
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
        colors={[colors.info + '10', colors.background.primary]}
        style={styles.gradientBackground}
      >
        <FlatList
          data={displayedReviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleSubmitReview}
        >
          <Icon name="videocam" size={24} color="#FFF" />
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
  trustLevelContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  trustLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  trustLevelText: {
    ...typography.button,
    color: '#FFF',
    marginLeft: spacing.xs,
  },
  trustStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trustStat: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xxs,
    marginBottom: spacing.md,
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
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    position: 'relative',
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
  tabBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  tabBadgeText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
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
    color: colors.info,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  submitButtonText: {
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
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});