import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchSocialFeed,
  likeFeedItem,
} from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const SocialFeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { socialFeed, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSocialFeed({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await dispatch(fetchSocialFeed({ userId: user.id }));
      setRefreshing(false);
    }
  };

  const handleLike = async (feedItemId: string) => {
    if (!user?.id) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(likeFeedItem({ feedItemId, userId: user.id }));
    } catch (error: any) {
      showToast('Failed to like post', 'error');
    }
  };

  const handleShare = (feedItem: any) => {
    // Implement share functionality
    showToast('Share feature coming soon!', 'info');
  };

  const handleComment = (feedItem: any) => {
    // Navigate to comments screen
    navigation.navigate('FeedComments' as never, { feedItemId: feedItem.id });
  };

  const getFeedItemIcon = (type: string) => {
    switch (type) {
      case 'achievement': return 'emoji-events';
      case 'donation': return 'favorite';
      case 'circle_join': return 'group-add';
      case 'challenge_complete': return 'check-circle';
      case 'milestone': return 'star';
      default: return 'celebration';
    }
  };

  const getFeedItemColor = (type: string) => {
    switch (type) {
      case 'achievement': return colors.tertiary;
      case 'donation': return colors.primary;
      case 'circle_join': return colors.secondary;
      case 'challenge_complete': return colors.success;
      case 'milestone': return colors.warning;
      default: return colors.info;
    }
  };

  const renderFeedItem = ({ item: feedItem }: { item: any }) => {
    const iconName = getFeedItemIcon(feedItem.type);
    const iconColor = getFeedItemColor(feedItem.type);

    return (
      <View style={styles.feedItem}>
        {/* Header */}
        <View style={styles.feedHeader}>
          <View style={[styles.feedIcon, { backgroundColor: iconColor + '20' }]}>
            <Icon name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.feedMeta}>
            <Text style={styles.feedTitle}>{feedItem.title}</Text>
            <Text style={styles.feedTimestamp}>
              {new Date(feedItem.timestamp).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.feedContent}>
          <Text style={styles.feedDescription}>{feedItem.description}</Text>

          {feedItem.image && (
            <View style={styles.feedImage}>
              <Text style={styles.imagePlaceholder}>[Image]</Text>
            </View>
          )}

          {feedItem.metadata && (
            <View style={styles.feedMetadata}>
              {feedItem.type === 'donation' && feedItem.metadata.amount && (
                <Text style={styles.metadataText}>
                  Amount: ₦{feedItem.metadata.amount.toLocaleString()}
                </Text>
              )}
              {feedItem.type === 'achievement' && feedItem.metadata.rarity && (
                <Text style={styles.metadataText}>
                  Rarity: {feedItem.metadata.rarity.toUpperCase()}
                </Text>
              )}
              {feedItem.type === 'challenge_complete' && feedItem.metadata.reward && (
                <Text style={styles.metadataText}>
                  Reward: {feedItem.metadata.reward} coins
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.feedActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(feedItem.id)}
          >
            <Icon
              name={feedItem.isLiked ? "favorite" : "favorite-border"}
              size={20}
              color={feedItem.isLiked ? colors.error : colors.text.secondary}
            />
            <Text style={[
              styles.actionText,
              feedItem.isLiked && { color: colors.error }
            ]}>
              {feedItem.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(feedItem)}
          >
            <Icon name="chat-bubble-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.actionText}>{feedItem.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(feedItem)}
          >
            <Icon name="share" size={20} color={colors.text.secondary} />
            <Text style={styles.actionText}>{feedItem.shares}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Social Feed</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost' as never)}
          style={styles.createButton}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={socialFeed}
        renderItem={renderFeedItem}
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
            <Icon name="feed" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Feed Activity</Text>
            <Text style={styles.emptyMessage}>
              Your social feed will show activities from your giving circles and connections.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('GivingCircles' as never)}
            >
              <Text style={styles.exploreButtonText}>Explore Circles</Text>
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
  feedList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  feedItem: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  feedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  feedMeta: {
    flex: 1,
  },
  feedTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  feedTimestamp: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  feedContent: {
    marginBottom: spacing.md,
  },
  feedDescription: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  feedImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.gray[200],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    ...typography.body,
    color: colors.text.secondary,
  },
  feedMetadata: {
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: 8,
  },
  metadataText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  feedActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  exploreButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default SocialFeedScreen;