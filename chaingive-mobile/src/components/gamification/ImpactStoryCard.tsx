import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

const { width: screenWidth } = Dimensions.get('window');

interface ImpactStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  story: string;
  donationAmount: number;
  category: string;
  impact: string;
  timestamp: string;
  likes: number;
  shares: number;
  isLiked?: boolean;
  isShared?: boolean;
  tags: string[];
}

interface ImpactStoryCardProps {
  story: ImpactStory;
  onLike?: (storyId: string) => void;
  onShare?: (storyId: string) => void;
  onReadMore?: (story: ImpactStory) => void;
  compact?: boolean;
}

export const ImpactStoryCard: React.FC<ImpactStoryCardProps> = ({
  story,
  onLike,
  onShare,
  onReadMore,
  compact = false,
}) => {
  const [isLiked, setIsLiked] = useState(story.isLiked || false);
  const [isShared, setIsShared] = useState(story.isShared || false);
  const [likesCount, setLikesCount] = useState(story.likes);
  const [sharesCount, setSharesCount] = useState(story.shares);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLike?.(story.id);
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const shareMessage = `🌟 Impact Story: "${story.title}"\n\n${story.story}\n\n${story.impact}\n\nShared via ChainGive #GivingBack #ImpactStories`;

      await Share.share({
        message: shareMessage,
      });

      if (!isShared) {
        setIsShared(true);
        setSharesCount(prev => prev + 1);
        onShare?.(story.id);
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share story');
      }
    }
  };

  const handleReadMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReadMore?.(story);
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education': return colors.primary;
      case 'healthcare': return colors.success;
      case 'environment': return colors.info;
      case 'poverty': return colors.warning;
      case 'emergency': return colors.error;
      default: return colors.secondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education': return 'school';
      case 'healthcare': return 'local-hospital';
      case 'environment': return 'nature';
      case 'poverty': return 'people';
      case 'emergency': return 'warning';
      default: return 'favorite';
    }
  };

  const timeAgo = () => {
    const now = new Date();
    const storyTime = new Date(story.timestamp);
    const diffInHours = Math.floor((now.getTime() - storyTime.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return storyTime.toLocaleDateString();
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handleReadMore}>
        <View style={styles.compactHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {story.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.compactUserName}>{story.userName}</Text>
              <Text style={styles.compactTime}>{timeAgo()}</Text>
            </View>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(story.category) + '20' }]}>
            <Icon name={getCategoryIcon(story.category)} size={12} color={getCategoryColor(story.category)} />
          </View>
        </View>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.compactStory} numberOfLines={3}>
          {story.story}
        </Text>
        <View style={styles.compactFooter}>
          <Text style={styles.compactImpact}>
            {story.impact}
          </Text>
          <View style={styles.compactActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Icon
                name={isLiked ? "favorite" : "favorite-border"}
                size={16}
                color={isLiked ? colors.error : colors.text.secondary}
              />
              <Text style={styles.actionCount}>{likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share" size={16} color={colors.text.secondary} />
              <Text style={styles.actionCount}>{sharesCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#f8f9fa', '#ffffff']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {story.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{story.userName}</Text>
              <Text style={styles.timestamp}>{timeAgo()}</Text>
            </View>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(story.category) + '20' }]}>
            <Icon name={getCategoryIcon(story.category)} size={16} color={getCategoryColor(story.category)} />
            <Text style={[styles.categoryText, { color: getCategoryColor(story.category) }]}>
              {story.category}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{story.title}</Text>

        {/* Story Content */}
        <Text style={styles.story} numberOfLines={4}>
          {story.story}
        </Text>

        {/* Impact */}
        <View style={styles.impactSection}>
          <Icon name="celebration" size={20} color={colors.primary} />
          <Text style={styles.impact}>{story.impact}</Text>
        </View>

        {/* Donation Amount */}
        <View style={styles.donationSection}>
          <Text style={styles.donationLabel}>Donation Amount:</Text>
          <Text style={styles.donationAmount}>{formatCurrency(story.donationAmount)}</Text>
        </View>

        {/* Tags */}
        {story.tags.length > 0 && (
          <View style={styles.tagsSection}>
            {story.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Icon
              name={isLiked ? "favorite" : "favorite-border"}
              size={20}
              color={isLiked ? colors.error : colors.text.secondary}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share" size={20} color={colors.text.secondary} />
            <Text style={styles.actionText}>{sharesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.readMoreButton} onPress={handleReadMore}>
            <Text style={styles.readMoreText}>Read More</Text>
            <Icon name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: spacing.md,
    ...shadows.card,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
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
    fontSize: 12,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  story: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  impactSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  impact: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
    fontStyle: 'italic',
  },
  donationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  donationLabel: {
    ...typography.bodyBold,
    color: colors.text.secondary,
  },
  donationAmount: {
    ...typography.h4,
    color: colors.success,
    fontWeight: 'bold',
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
  },
  tagText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actionTextActive: {
    color: colors.error,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  readMoreText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
  // Compact styles
  compactCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  compactUserName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 14,
  },
  compactTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  compactTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  compactStory: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  compactImpact: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: 'italic',
    flex: 1,
    marginRight: spacing.md,
  },
  compactActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCount: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
});

export default ImpactStoryCard;