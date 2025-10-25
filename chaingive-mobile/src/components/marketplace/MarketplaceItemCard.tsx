import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Styles
import styles from './MarketplaceItemCard.styles';

// Types
interface MarketplaceItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  imageUrl?: string;
  confidence: number;
  reasoning: string[];
  trending?: boolean;
  limitedTime?: boolean;
}

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onRedeem: () => void;
  onFeedback: (liked: boolean) => void;
  userCoins: number;
}

const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({
  item,
  onRedeem,
  onFeedback,
  userCoins,
}) => {
  const canAfford = userCoins >= item.cost;
  const confidencePercentage = Math.round(item.confidence * 100);

  const handleFeedback = (liked: boolean) => {
    onFeedback(liked);
    Alert.alert(
      liked ? 'Thanks for the feedback!' : 'Not interested',
      liked ? 'We\'ll show you more items like this.' : 'We\'ll refine our recommendations.'
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'airtime':
        return 'call';
      case 'data':
        return 'wifi';
      case 'groceries':
        return 'basket';
      case 'utilities':
        return 'flash';
      case 'entertainment':
        return 'film';
      default:
        return 'gift';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'airtime':
        return '#007AFF';
      case 'data':
        return '#2E8B57';
      case 'groceries':
        return '#FF9500';
      case 'utilities':
        return '#FF3B30';
      case 'entertainment':
        return '#AF52DE';
      default:
        return '#8E8E93';
    }
  };

  return (
    <View style={styles.card}>
      {/* Badges */}
      <View style={styles.badges}>
        {item.trending && (
          <View style={[styles.badge, styles.trendingBadge]}>
            <MaterialIcons name="trending-up" size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>Trending</Text>
          </View>
        )}
        {item.limitedTime && (
          <View style={[styles.badge, styles.limitedBadge]}>
            <Ionicons name="time" size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>Limited</Text>
          </View>
        )}
        <View style={[styles.badge, styles.confidenceBadge]}>
          <Text style={styles.confidenceText}>{confidencePercentage}% match</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Image/Icon */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(item.category) }]}>
              <Ionicons
                name={getCategoryIcon(item.category) as any}
                size={32}
                color="#FFFFFF"
              />
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.costContainer}>
              <Text style={styles.cost}>🪙 {item.cost.toLocaleString()}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Reasoning */}
          {item.reasoning.length > 0 && (
            <View style={styles.reasoning}>
              <Text style={styles.reasoningLabel}>Why recommended:</Text>
              {item.reasoning.slice(0, 2).map((reason, index) => (
                <Text key={index} style={styles.reasoningText} numberOfLines={1}>
                  • {reason}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Feedback Buttons */}
        <View style={styles.feedback}>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => handleFeedback(true)}
          >
            <Ionicons name="thumbs-up-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => handleFeedback(false)}
          >
            <Ionicons name="thumbs-down-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Redeem Button */}
        <TouchableOpacity
          style={[
            styles.redeemButton,
            !canAfford && styles.redeemButtonDisabled
          ]}
          onPress={canAfford ? onRedeem : () => Alert.alert('Insufficient Coins', 'You don\'t have enough coins for this item.')}
          disabled={!canAfford}
        >
          <Text style={[
            styles.redeemButtonText,
            !canAfford && styles.redeemButtonTextDisabled
          ]}>
            {canAfford ? 'Redeem' : 'Not Enough'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MarketplaceItemCard;