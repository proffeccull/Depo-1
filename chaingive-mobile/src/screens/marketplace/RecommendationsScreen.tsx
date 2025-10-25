import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  getPersonalizedRecommendations,
  MarketplaceRecommendation,
  updateRecommendationFeedback
} from '../../api/marketplace';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface RecommendationsScreenProps {
  route?: {
    params?: {
      category?: string;
      priceMin?: number;
      priceMax?: number;
    };
  };
}

export const RecommendationsScreen = ({ route }: RecommendationsScreenProps) => {
  const navigation = useNavigation();
  const { category, priceMin, priceMax } = route?.params || {};

  const [recommendations, setRecommendations] = useState<MarketplaceRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [category, priceMin, priceMax]);

  const loadRecommendations = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getPersonalizedRecommendations(20, category, priceMin, priceMax);
      setRecommendations(response.recommendations);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleItemPress = async (item: MarketplaceRecommendation) => {
    if (!item.item) return;

    // Record view interaction
    try {
      await updateRecommendationFeedback({
        itemId: item.item.id,
        action: 'view',
      });
    } catch (error) {
      // Silently fail for feedback
    }

    // Navigate to item details (would need to implement item details screen)
    // navigation.navigate('ItemDetails', { itemId: item.item.id });
    Alert.alert('Item Selected', `Selected: ${item.item.name}`);
  };

  const handleRefresh = () => {
    loadRecommendations(true);
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('history') || reason.includes('purchase')) {
      return 'basket-outline';
    } else if (reason.includes('popular') || reason.includes('trending')) {
      return 'trending-up-outline';
    } else if (reason.includes('new') || reason.includes('arrival')) {
      return 'sparkles-outline';
    } else if (reason.includes('donation') || reason.includes('charitable')) {
      return 'heart-outline';
    }
    return 'bulb-outline';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.success;
    if (confidence >= 0.6) return colors.warning;
    return colors.error;
  };

  const renderRecommendationItem = ({ item }: { item: MarketplaceRecommendation }) => {
    if (!item.item) return null;

    return (
      <TouchableOpacity
        style={styles.recommendationCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Card style={styles.itemCard}>
          {/* Item Image Placeholder */}
          <View style={styles.itemImage}>
            <Ionicons name="cube-outline" size={40} color={colors.primary} />
          </View>

          {/* Item Details */}
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.item.name}
            </Text>
            <Text style={styles.itemCategory}>{item.item.category}</Text>

            <View style={styles.priceContainer}>
              <View style={styles.coinPrice}>
                <Ionicons name="cash-outline" size={16} color={colors.primary} />
                <Text style={styles.coinText}>{item.item.coinPrice} coins</Text>
              </View>
              <Text style={styles.realValue}>₦{item.item.realValue.toLocaleString()}</Text>
            </View>

            {/* Recommendation Reason */}
            <View style={styles.reasonContainer}>
              <View style={styles.reasonBadge}>
                <Ionicons
                  name={getReasonIcon(item.reason) as any}
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.reasonText} numberOfLines={1}>
                  {item.reason}
                </Text>
              </View>

              <View style={[styles.confidenceIndicator, { backgroundColor: getConfidenceColor(item.confidence) }]}>
                <Text style={styles.confidenceText}>
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>
            </View>

            {/* Score and Sales */}
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Ionicons name="star-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.statText}>{item.score.toFixed(2)}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.statText}>{item.item.salesCount}</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bulb-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
      <Text style={styles.emptyText}>
        We're still learning your preferences. Check back soon for personalized recommendations!
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Recommended for You</Text>
      <Text style={styles.subtitle}>
        {category ? `In ${category}` : 'Personalized picks based on your activity'}
      </Text>

      {/* Active Filters */}
      {(category || priceMin || priceMax) && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>Active filters:</Text>
          <View style={styles.filterTags}>
            {category && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>{category}</Text>
                <TouchableOpacity
                  onPress={() => navigation.setParams({ category: undefined })}
                  style={styles.filterRemove}
                >
                  <Ionicons name="close" size={14} color={colors.surface} />
                </TouchableOpacity>
              </View>
            )}
            {priceMin && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Min: ₦{priceMin}</Text>
                <TouchableOpacity
                  onPress={() => navigation.setParams({ priceMin: undefined })}
                  style={styles.filterRemove}
                >
                  <Ionicons name="close" size={14} color={colors.surface} />
                </TouchableOpacity>
              </View>
            )}
            {priceMax && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Max: ₦{priceMax}</Text>
                <TouchableOpacity
                  onPress={() => navigation.setParams({ priceMax: undefined })}
                  style={styles.filterRemove}
                >
                  <Ionicons name="close" size={14} color={colors.surface} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Finding perfect recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.itemId}
        renderItem={renderRecommendationItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  filtersContainer: {
    marginTop: 16,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  filterRemove: {
    padding: 2,
  },
  recommendationCard: {
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coinPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  realValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  reasonText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  confidenceIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.surface,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
});