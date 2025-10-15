import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../store/store';
import { CharitableNFT } from '../../store/slices/charitableNFTSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface CharitableNFTCardProps {
  nft: CharitableNFT;
  compact?: boolean;
  showActions?: boolean;
  onPress?: () => void;
  onShare?: (platform?: string) => void;
  onViewDetails?: () => void;
  isNew?: boolean;
}

export const CharitableNFTCard: React.FC<CharitableNFTCardProps> = ({
  nft,
  compact = false,
  showActions = true,
  onPress,
  onShare,
  onViewDetails,
  isNew = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const revealAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // New NFT reveal animation
    if (isNew) {
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(revealAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNew]);

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

  const handleShare = async (platform?: string) => {
    if (sharing) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSharing(true);

      const shareMessage = `🏆 I just earned the "${nft.name}" NFT on ChainGive for my charitable impact! ${nft.description}\n\n#ChainGive #NFT #Philanthropy #CryptoForGood`;
      const shareUrl = nft.external_url || 'https://chaingive.com';

      if (platform) {
        // Platform-specific sharing
        let shareContent = {
          message: shareMessage,
          url: shareUrl,
        };

        switch (platform) {
          case 'twitter':
            shareContent.message += ' #NFTCommunity';
            break;
          case 'facebook':
            // Facebook sharing would use different API
            break;
          case 'instagram':
            // Instagram sharing (stories/captions)
            break;
        }

        await Share.share(shareContent);
      } else {
        // General share
        await Share.share({
          message: shareMessage,
          url: shareUrl,
        });
      }

      onShare?.(platform);

    } catch (error) {
      Alert.alert(
        'Share Failed',
        'Unable to share this NFT. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSharing(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return ['#95a5a6', '#7f8c8d'];
      case 'rare': return ['#3498db', '#2980b9'];
      case 'epic': return ['#9b59b6', '#8e44ad'];
      case 'legendary': return ['#f39c12', '#e67e22'];
      case 'mythic': return ['#e74c3c', '#c0392b'];
      default: return ['#95a5a6', '#7f8c8d'];
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'star-border';
      case 'rare': return 'star-half';
      case 'epic': return 'star';
      case 'legendary': return 'local-fire-department';
      case 'mythic': return 'flash';
      default: return 'star-border';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getImpactMetrics = () => {
    // Extract impact metrics from NFT attributes
    const impactAttr = nft.attributes.find(attr =>
      attr.trait_type.toLowerCase().includes('impact') ||
      attr.trait_type.toLowerCase().includes('funds') ||
      attr.trait_type.toLowerCase().includes('people')
    );

    if (impactAttr) {
      return {
        label: impactAttr.trait_type,
        value: impactAttr.value,
      };
    }

    // Fallback based on category
    switch (nft.category.toLowerCase()) {
      case 'education':
        return { label: 'Students Helped', value: '50+' };
      case 'healthcare':
        return { label: 'Lives Improved', value: '25+' };
      case 'environment':
        return { label: 'Trees Planted', value: '100+' };
      case 'poverty':
        return { label: 'Families Supported', value: '10+' };
      default:
        return { label: 'Impact Created', value: 'Significant' };
    }
  };

  const impact = getImpactMetrics();
  const rarityColors = getRarityColor(nft.rarity);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.touchable, compact && styles.touchableCompact]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={rarityColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* NFT Image */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{
                  scale: revealAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
                opacity: revealAnim,
              },
            ]}
          >
            {nft.image ? (
              <Image
                source={{ uri: nft.image }}
                style={styles.nftImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon name="image" size={48} color={colors.gray[400]} />
              </View>
            )}

            {imageLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFF" />
              </View>
            )}

            {imageError && (
              <View style={styles.errorOverlay}>
                <Icon name="broken-image" size={32} color={colors.error} />
              </View>
            )}

            {/* Rarity Badge */}
            <View style={styles.rarityBadge}>
              <Icon name={getRarityIcon(nft.rarity)} size={14} color="#FFF" />
              <Text style={styles.rarityText}>{nft.rarity.toUpperCase()}</Text>
            </View>

            {/* New Badge */}
            {isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>NEW!</Text>
              </View>
            )}
          </Animated.View>

          {/* NFT Details */}
          <View style={styles.details}>
            <Text style={styles.nftName} numberOfLines={1}>
              {nft.name}
            </Text>

            {!compact && (
              <Text style={styles.nftDescription} numberOfLines={2}>
                {nft.description}
              </Text>
            )}

            {/* Impact Metrics */}
            <View style={styles.impactContainer}>
              <Icon name="volunteer-activism" size={16} color="#FFD700" />
              <Text style={styles.impactText}>
                {impact.label}: {impact.value}
              </Text>
            </View>

            {/* Earned Date */}
            <View style={styles.dateContainer}>
              <Icon name="event" size={14} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.dateText}>
                Earned {formatDate(nft.earnedAt)}
              </Text>
            </View>
          </View>

          {/* Attributes Preview */}
          {!compact && nft.attributes && nft.attributes.length > 0 && (
            <View style={styles.attributesContainer}>
              {nft.attributes.slice(0, 3).map((attr, index) => (
                <View key={index} style={styles.attribute}>
                  <Text style={styles.attributeLabel}>{attr.trait_type}:</Text>
                  <Text style={styles.attributeValue}>{attr.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          {showActions && !compact && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleShare()}
                disabled={sharing}
              >
                {sharing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Icon name="share" size={18} color={colors.primary} />
                    <Text style={styles.actionText}>Share</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onViewDetails}
              >
                <Text style={styles.secondaryButtonText}>Details</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Social Share Options */}
          {showActions && !compact && (
            <View style={styles.socialShare}>
              <Text style={styles.shareLabel}>Share on:</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleShare('twitter')}
                >
                  <Icon name="chat" size={16} color="#1DA1F2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleShare('facebook')}
                >
                  <Icon name="facebook" size={16} color="#4267B2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleShare('instagram')}
                >
                  <Icon name="camera-alt" size={16} color="#E4405F" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Achievement Badge */}
          {nft.achievements && nft.achievements.length > 0 && (
            <View style={styles.achievementBadge}>
              <Icon name="emoji-events" size={14} color="#FFD700" />
              <Text style={styles.achievementText}>
                {nft.achievements.length} Achievement{nft.achievements.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Soulbound Indicator */}
          {nft.isSoulbound && (
            <View style={styles.soulboundBadge}>
              <Icon name="lock" size={12} color="#FFD700" />
              <Text style={styles.soulboundText}>Soulbound</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  touchable: {
    borderRadius: 16,
  },
  touchableCompact: {
    // Compact styles can be added here
  },
  gradient: {
    padding: spacing.lg,
    minHeight: 300,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  nftImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  placeholderImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 12,
  },
  rarityBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  rarityText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 16,
  },
  newText: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: 'bold',
  },
  details: {
    marginBottom: spacing.lg,
  },
  nftName: {
    ...typography.h2,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  nftDescription: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  impactText: {
    ...typography.button,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: spacing.xs,
  },
  attributesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  attribute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  attributeLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  attributeValue: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  actionText: {
    ...typography.button,
    color: '#FFF',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
  socialShare: {
    marginBottom: spacing.md,
  },
  shareLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  achievementText: {
    ...typography.caption,
    color: '#000',
    fontWeight: 'bold',
  },
  soulboundBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  soulboundText: {
    ...typography.caption,
    color: '#000',
    fontWeight: 'bold',
  },
});