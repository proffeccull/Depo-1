import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { TrustReview } from '../../store/slices/trustSlice';

const { width: screenWidth } = Dimensions.get('window');

interface TrustReviewCardProps {
  review: TrustReview;
  showFullText?: boolean;
  compact?: boolean;
  onPress?: () => void;
  onHelpfulPress?: () => void;
  onReportPress?: () => void;
  onVideoPress?: () => void;
}

export const TrustReviewCard: React.FC<TrustReviewCardProps> = ({
  review,
  showFullText = false,
  compact = false,
  onPress,
  onHelpfulPress,
  onReportPress,
  onVideoPress,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isExpanded, setIsExpanded] = useState(showFullText);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress?.();
  };

  const handleHelpfulPress = () => {
    if (!hasUserVoted) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setHasUserVoted(true);
      onHelpfulPress?.();
    }
  };

  const handleReportPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onReportPress?.();
  };

  const handleVideoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onVideoPress?.();
  };

  const toggleExpanded = () => {
    Haptics.selectionAsync();
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name={i < rating ? 'star' : 'star-border'}
        size={16}
        color={i < rating ? '#FFD700' : colors.gray[300]}
      />
    ));
  };

  const getTrustLevelColor = (rating: number) => {
    if (rating >= 4.5) return colors.success;
    if (rating >= 3.5) return colors.warning;
    return colors.error;
  };

  const getVerificationBadge = () => {
    if (review.isVerified) {
      return {
        icon: 'verified',
        text: 'Verified',
        color: colors.success,
      };
    } else if (review.status === 'approved') {
      return {
        icon: 'check-circle',
        text: 'Approved',
        color: colors.primary,
      };
    } else {
      return {
        icon: 'pending',
        text: 'Pending',
        color: colors.warning,
      };
    }
  };

  const badge = getVerificationBadge();
  const isLongText = review.reviewText.length > 150;
  const displayText = isExpanded || !isLongText
    ? review.reviewText
    : review.reviewText.substring(0, 150) + '...';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.container, compact && styles.containerCompact]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#f8f9fa', '#ffffff']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {review.reviewerAvatar ? (
                  <Image
                    source={{ uri: review.reviewerAvatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: getTrustLevelColor(review.rating) }]}>
                    <Text style={styles.avatarText}>
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={[styles.verificationBadge, { backgroundColor: badge.color }]}>
                  <Icon name={badge.icon} size={12} color="#FFF" />
                </View>
              </View>

              <View style={styles.userDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                  {review.isAnonymous && (
                    <View style={styles.anonymousBadge}>
                      <Icon name="visibility-off" size={12} color={colors.text.secondary} />
                    </View>
                  )}
                </View>
                <View style={styles.ratingRow}>
                  <View style={styles.starsContainer}>
                    {renderStars(review.rating)}
                  </View>
                  <Text style={styles.ratingText}>{review.rating}/5</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Text style={styles.timestamp}>{formatDate(review.createdAt)}</Text>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={handleReportPress}
              >
                <Icon name="more-vert" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Review Content */}
          <View style={styles.content}>
            <Text style={styles.reviewText}>
              {displayText}
            </Text>

            {isLongText && !showFullText && (
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={toggleExpanded}
              >
                <Text style={styles.readMoreText}>
                  {isExpanded ? 'Read less' : 'Read more'}
                </Text>
                <Icon
                  name={isExpanded ? 'expand-less' : 'expand-more'}
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Video Section */}
          {review.videoUrl && (
            <TouchableOpacity
              style={styles.videoSection}
              onPress={handleVideoPress}
            >
              <View style={styles.videoThumbnail}>
                {review.videoThumbnail ? (
                  <Image
                    source={{ uri: review.videoThumbnail }}
                    style={styles.videoImage}
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Icon name="videocam" size={32} color={colors.text.secondary} />
                  </View>
                )}
                <View style={styles.playButton}>
                  <Icon name="play-arrow" size={24} color="#FFF" />
                </View>
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoLabel}>Review Video</Text>
                <Text style={styles.videoDuration}>Verified Content</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Trust Indicators */}
          <View style={styles.trustIndicators}>
            <View style={styles.indicator}>
              <Icon name="thumb-up" size={16} color={colors.success} />
              <Text style={styles.indicatorText}>
                {review.helpfulVotes} helpful
              </Text>
            </View>

            {review.aiAnalysis && (
              <View style={styles.indicator}>
                <Icon name="psychology" size={16} color={colors.primary} />
                <Text style={styles.indicatorText}>
                  AI Verified
                </Text>
              </View>
            )}

            {review.status === 'flagged' && (
              <View style={styles.indicator}>
                <Icon name="flag" size={16} color={colors.error} />
                <Text style={styles.indicatorText}>
                  Under Review
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          {!compact && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  hasUserVoted && styles.actionButtonActive,
                ]}
                onPress={handleHelpfulPress}
                disabled={hasUserVoted}
              >
                <Icon
                  name="thumb-up"
                  size={18}
                  color={hasUserVoted ? colors.success : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.actionText,
                    hasUserVoted && styles.actionTextActive,
                  ]}
                >
                  Helpful
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReportPress}
              >
                <Icon name="flag" size={18} color={colors.text.secondary} />
                <Text style={styles.actionText}>Report</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FOMO Elements */}
          {review.helpfulVotes > 10 && (
            <View style={styles.fomoBadge}>
              <Icon name="local-fire-department" size={14} color="#FFF" />
              <Text style={styles.fomoText}>Most Helpful</Text>
            </View>
          )}

          {review.rating === 5 && review.isVerified && (
            <View style={styles.topRatedBadge}>
              <Icon name="star" size={14} color="#FFF" />
              <Text style={styles.topRatedText}>Top Rated</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  containerCompact: {
    marginBottom: spacing.sm,
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
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: 'bold',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  reviewerName: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  anonymousBadge: {
    padding: spacing.xxs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  ratingText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  moreButton: {
    padding: spacing.xs,
  },
  content: {
    marginBottom: spacing.md,
  },
  reviewText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 20,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    ...typography.button,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  videoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  videoThumbnail: {
    position: 'relative',
    width: 80,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoLabel: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  videoDuration: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  trustIndicators: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  indicatorText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
  },
  actionButtonActive: {
    backgroundColor: colors.success + '20',
  },
  actionText: {
    ...typography.button,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  actionTextActive: {
    color: colors.success,
  },
  fomoBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  fomoText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  topRatedBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  topRatedText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
});