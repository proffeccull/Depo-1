import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchCommunityFeed,
  likeCommunityPost,
  shareCommunityPost,
} from '../../store/slices/communitySlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

interface CommunityPost {
  id: string;
  type: 'success_story' | 'event_announcement' | 'testimonial' | 'featured_request';
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: string;
  likes: number;
  shares: number;
  isLiked: boolean;
  isShared: boolean;
  metadata?: {
    eventDate?: string;
    eventLocation?: string;
    requestAmount?: number;
    requestCategory?: string;
    storyCategory?: string;
  };
  mediaUrls?: string[];
}

const CommunityFeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { communityFeed, loading } = useSelector((state: RootState) => state.community);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All', icon: 'view-list' },
    { key: 'success_story', label: 'Stories', icon: 'celebration' },
    { key: 'event_announcement', label: 'Events', icon: 'event' },
    { key: 'testimonial', label: 'Testimonials', icon: 'star' },
    { key: 'featured_request', label: 'Requests', icon: 'volunteer-activism' },
  ];

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCommunityFeed({ userId: user.id, category: selectedCategory }));
    }
  }, [dispatch, user?.id, selectedCategory]);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await dispatch(fetchCommunityFeed({ userId: user.id, category: selectedCategory }));
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(likeCommunityPost({ postId, userId: user.id }));
    } catch (error: any) {
      showToast('Failed to like post', 'error');
    }
  };

  const handleShare = async (postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(shareCommunityPost({ postId, userId: user.id }));
      showToast('Post shared successfully!', 'success');
    } catch (error: any) {
      showToast('Failed to share post', 'error');
    }
  };

  const handlePostAction = (post: CommunityPost) => {
    if (post.type === 'featured_request') {
      // Navigate to donation flow for featured request
      navigation.navigate('DonationAmount' as never, {
        requestId: post.id,
        amount: post.metadata?.requestAmount,
        category: post.metadata?.requestCategory,
      });
    } else if (post.type === 'event_announcement') {
      // Show event details modal or navigate to event screen
      Alert.alert(
        'Event Details',
        `Date: ${post.metadata?.eventDate}\nLocation: ${post.metadata?.eventLocation}`,
        [
          { text: 'RSVP', onPress: () => handleRSVP(post.id) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleRSVP = async (eventId: string) => {
    // Implement RSVP functionality
    showToast('RSVP functionality coming soon!', 'info');
  };

  const handleCreatePost = () => {
    navigation.navigate('CreateCommunityPost' as never);
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'success_story': return 'celebration';
      case 'event_announcement': return 'event';
      case 'testimonial': return 'star';
      case 'featured_request': return 'volunteer-activism';
      default: return 'article';
    }
  };

  const getPostColor = (type: string) => {
    switch (type) {
      case 'success_story': return colors.success;
      case 'event_announcement': return colors.primary;
      case 'testimonial': return colors.warning;
      case 'featured_request': return colors.secondary;
      default: return colors.info;
    }
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
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
              styles.categoryButtonText,
              selectedCategory === category.key && styles.categoryButtonTextActive,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPost = ({ item: post }: { item: CommunityPost }) => {
    const iconName = getPostIcon(post.type);
    const iconColor = getPostColor(post.type);

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => handlePostAction(post)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={[styles.postIcon, { backgroundColor: iconColor + '20' }]}>
            <Icon name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.postMeta}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postAuthor}>{post.authorName}</Text>
          </View>
          <Text style={styles.postTimestamp}>
            {new Date(post.timestamp).toLocaleDateString()}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.postContent}>
          <Text style={styles.postText}>{post.content}</Text>

          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <View style={styles.mediaContainer}>
              <Text style={styles.mediaPlaceholder}>[Media Content]</Text>
            </View>
          )}

          {post.metadata && (
            <View style={styles.metadataContainer}>
              {post.type === 'featured_request' && post.metadata.requestAmount && (
                <Text style={styles.metadataText}>
                  Requested: ₦{post.metadata.requestAmount.toLocaleString()}
                </Text>
              )}
              {post.type === 'event_announcement' && post.metadata.eventDate && (
                <Text style={styles.metadataText}>
                  📅 {post.metadata.eventDate}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(post.id)}
          >
            <Icon
              name={post.isLiked ? "favorite" : "favorite-border"}
              size={20}
              color={post.isLiked ? colors.error : colors.text.secondary}
            />
            <Text style={[
              styles.actionText,
              post.isLiked && { color: colors.error }
            ]}>
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(post.id)}
          >
            <Icon name="share" size={20} color={colors.text.secondary} />
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>

          {post.type === 'featured_request' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.donateButton]}
              onPress={() => handlePostAction(post)}
            >
              <Text style={styles.donateButtonText}>Donate</Text>
            </TouchableOpacity>
          )}

          {post.type === 'event_announcement' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.rsvpButton]}
              onPress={() => handleRSVP(post.id)}
            >
              <Text style={styles.rsvpButtonText}>RSVP</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Community Feed</Text>
        <TouchableOpacity
          onPress={handleCreatePost}
          style={styles.createButton}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Feed */}
      <FlatList
        data={communityFeed}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
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
            <Icon name="forum" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Community Posts</Text>
            <Text style={styles.emptyMessage}>
              Be the first to share a success story or create a community event!
            </Text>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.createPostButtonText}>Create Post</Text>
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
  createButton: {
    padding: spacing.xs,
  },
  categoryFilter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xxs,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  feedList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  postIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  postMeta: {
    flex: 1,
  },
  postTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  postAuthor: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  postTimestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  postContent: {
    marginBottom: spacing.md,
  },
  postText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  mediaContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.gray[200],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  mediaPlaceholder: {
    ...typography.body,
    color: colors.text.secondary,
  },
  metadataContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: 8,
  },
  metadataText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  donateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  donateButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  rsvpButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  rsvpButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['4xl'],
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
  createPostButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  createPostButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default CommunityFeedScreen;