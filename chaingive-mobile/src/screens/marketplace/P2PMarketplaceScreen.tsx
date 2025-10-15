import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface P2PItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'coins' | 'naira';
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
  images: string[];
  createdAt: string;
  isActive: boolean;
  tradeType: 'sell' | 'buy' | 'exchange';
}

const P2PMarketplaceScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [items, setItems] = useState<P2PItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTradeType, setSelectedTradeType] = useState<'all' | 'sell' | 'buy' | 'exchange'>('all');

  const categories = ['all', 'electronics', 'fashion', 'books', 'home', 'sports', 'vehicles', 'services'];
  const tradeTypes = ['all', 'sell', 'buy', 'exchange'];

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  const loadMarketplaceItems = async () => {
    try {
      // Mock data - replace with actual API call
      const mockItems: P2PItem[] = [
        {
          id: 'item_1',
          title: 'iPhone 13 Pro Max 256GB',
          description: 'Slightly used, excellent condition. Comes with original box and accessories.',
          price: 85000,
          currency: 'naira',
          category: 'electronics',
          condition: 'used',
          location: 'Lagos, Nigeria',
          seller: {
            id: 'seller_1',
            name: 'TechHub NG',
            rating: 4.8,
            verified: true,
          },
          images: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true,
          tradeType: 'sell',
        },
        {
          id: 'item_2',
          title: 'Looking for Gaming Laptop',
          description: 'Budget: ₦150,000 - ₦200,000. Must have good specs for gaming.',
          price: 175000,
          currency: 'naira',
          category: 'electronics',
          condition: 'new',
          location: 'Abuja, Nigeria',
          seller: {
            id: 'seller_2',
            name: 'GamerPro',
            rating: 4.5,
            verified: false,
          },
          images: [],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          isActive: true,
          tradeType: 'buy',
        },
        {
          id: 'item_3',
          title: 'Designer Watch Exchange',
          description: 'Rolex Submariner for exchange with luxury sedan or cash equivalent.',
          price: 2500000,
          currency: 'naira',
          category: 'fashion',
          condition: 'used',
          location: 'Port Harcourt, Nigeria',
          seller: {
            id: 'seller_3',
            name: 'LuxuryTrader',
            rating: 4.9,
            verified: true,
          },
          images: [],
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          isActive: true,
          tradeType: 'exchange',
        },
        {
          id: 'item_4',
          title: 'Mountain Bike',
          description: 'Trek mountain bike, 2 years old, well maintained. Perfect for trails.',
          price: 45000,
          currency: 'naira',
          category: 'sports',
          condition: 'used',
          location: 'Kano, Nigeria',
          seller: {
            id: 'seller_4',
            name: 'BikeWorld',
            rating: 4.2,
            verified: true,
          },
          images: [],
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          isActive: true,
          tradeType: 'sell',
        },
        {
          id: 'item_5',
          title: '500 Charity Coins',
          description: 'Selling 500 charity coins at discounted rate. Quick transaction.',
          price: 25000,
          currency: 'naira',
          category: 'services',
          condition: 'new',
          location: 'Ibadan, Nigeria',
          seller: {
            id: 'seller_5',
            name: 'CoinTrader',
            rating: 4.6,
            verified: false,
          },
          images: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true,
          tradeType: 'sell',
        },
      ];

      setItems(mockItems);
    } catch (error) {
      console.error('Failed to load marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMarketplaceItems();
    setRefreshing(false);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTradeType = selectedTradeType === 'all' || item.tradeType === selectedTradeType;

    return matchesSearch && matchesCategory && matchesTradeType;
  });

  const getTradeTypeColor = (tradeType: string) => {
    switch (tradeType) {
      case 'sell':
        return colors.success;
      case 'buy':
        return colors.info;
      case 'exchange':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getTradeTypeIcon = (tradeType: string) => {
    switch (tradeType) {
      case 'sell':
        return 'sell';
      case 'buy':
        return 'shopping-cart';
      case 'exchange':
        return 'swap-horiz';
      default:
        return 'store';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return colors.success;
      case 'used':
        return colors.warning;
      case 'refurbished':
        return colors.info;
      default:
        return colors.gray[500];
    }
  };

  const renderItem = ({ item }: { item: P2PItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => (navigation as any).navigate('TradeDetail', { tradeId: item.id })}
      activeOpacity={0.9}
    >
      {/* Item Image Placeholder */}
      <View style={styles.itemImage}>
        <Icon name="image" size={32} color={colors.gray[400]} />
      </View>

      {/* Item Content */}
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={[
            styles.tradeTypeBadge,
            { backgroundColor: getTradeTypeColor(item.tradeType) + '20' }
          ]}>
            <Icon
              name={getTradeTypeIcon(item.tradeType) as any}
              size={14}
              color={getTradeTypeColor(item.tradeType)}
            />
            <Text style={[
              styles.tradeTypeText,
              { color: getTradeTypeColor(item.tradeType) }
            ]}>
              {item.tradeType.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.itemPrice}>
              {item.currency === 'naira' ? '₦' : ''}{item.price.toLocaleString()}
              {item.currency === 'coins' ? ' coins' : ''}
            </Text>

            <View style={[
              styles.conditionBadge,
              { backgroundColor: getConditionColor(item.condition) + '20' }
            ]}>
              <Text style={[
                styles.conditionText,
                { color: getConditionColor(item.condition) }
              ]}>
                {item.condition.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.sellerInfo}>
            <View style={styles.sellerRow}>
              <Text style={styles.sellerName}>{item.seller.name}</Text>
              {item.seller.verified && (
                <Icon name="verified" size={14} color={colors.success} />
              )}
            </View>

            <View style={styles.sellerStats}>
              <Icon name="star" size={12} color={colors.warning} />
              <Text style={styles.sellerRating}>{item.seller.rating}</Text>
              <Text style={styles.itemLocation}>📍 {item.location}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCategory(category);
      }}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.categoryButtonTextActive,
      ]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderTradeTypeButton = (tradeType: 'all' | 'sell' | 'buy' | 'exchange') => (
    <TouchableOpacity
      key={tradeType}
      style={[
        styles.tradeTypeButton,
        selectedTradeType === tradeType && styles.tradeTypeButtonActive,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTradeType(tradeType);
      }}
    >
      <Icon
        name={getTradeTypeIcon(tradeType) as any}
        size={16}
        color={selectedTradeType === tradeType ? colors.white : colors.text.secondary}
      />
      <Text style={[
        styles.tradeTypeButtonText,
        selectedTradeType === tradeType && styles.tradeTypeButtonTextActive,
      ]}>
        {tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading marketplace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>P2P Marketplace</Text>
        <TouchableOpacity
          style={styles.listButton}
          onPress={() => (navigation as any).navigate('ListItem')}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search items..."
            placeholderTextColor={colors.text.secondary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Trade Type Filter */}
      <View style={styles.tradeTypeFilter}>
        {tradeTypes.map((type) => renderTradeTypeButton(type as 'all' | 'sell' | 'buy' | 'exchange'))}
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        {categories.map(renderCategoryButton)}
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.itemsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="store" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== 'all' || selectedTradeType !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Be the first to list an item on the marketplace!'
              }
            </Text>
            {(searchQuery || selectedCategory !== 'all' || selectedTradeType !== 'all') ? (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTradeType('all');
                }}
              >
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.listItemButton}
                onPress={() => (navigation as any).navigate('ListItem')}
              >
                <Text style={styles.listItemButtonText}>List Your First Item</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.myListingsButton}
          onPress={() => (navigation as any).navigate('MyListings')}
        >
          <Icon name="list" size={20} color={colors.primary} />
          <Text style={styles.myListingsButtonText}>My Listings</Text>
        </TouchableOpacity>
      </View>
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
  },
  loadingText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
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
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  listButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  tradeTypeFilter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  tradeTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    gap: spacing.xs,
  },
  tradeTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tradeTypeButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  tradeTypeButtonTextActive: {
    color: colors.white,
  },
  categoryFilter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  itemsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  itemTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    flex: 1,
    marginRight: spacing.sm,
  },
  tradeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  tradeTypeText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  itemDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  itemDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  conditionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  conditionText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  sellerInfo: {
    marginTop: spacing.sm,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sellerName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: spacing.sm,
  },
  sellerRating: {
    ...typography.caption,
    color: colors.text.primary,
  },
  itemLocation: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  clearFiltersButton: {
    backgroundColor: colors.gray[200],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  listItemButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  listItemButtonText: {
    ...typography.button,
    color: colors.white,
  },
  quickActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  myListingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  myListingsButtonText: {
    ...typography.button,
    color: colors.primary,
  },
});

export default P2PMarketplaceScreen;