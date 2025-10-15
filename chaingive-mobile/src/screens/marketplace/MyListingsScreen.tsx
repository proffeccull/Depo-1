import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
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

interface MyListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'coins' | 'naira';
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  images: string[];
  createdAt: string;
  status: 'active' | 'paused' | 'sold' | 'expired';
  tradeType: 'sell' | 'buy' | 'exchange';
  views: number;
  inquiries: number;
  isNegotiable: boolean;
}

const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'paused'>('all');

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      // Mock data - replace with actual API call
      const mockListings: MyListing[] = [
        {
          id: 'listing_1',
          title: 'iPhone 13 Pro Max 256GB',
          description: 'Brand new iPhone 13 Pro Max in Graphite color. Comes with original box and accessories.',
          price: 850000,
          currency: 'naira',
          category: 'Electronics',
          condition: 'new',
          location: 'Lagos, Nigeria',
          images: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'active',
          tradeType: 'sell',
          views: 45,
          inquiries: 3,
          isNegotiable: true,
        },
        {
          id: 'listing_2',
          title: 'Looking for Gaming Laptop',
          description: 'Budget: ₦150,000 - ₦200,000. Must have good specs for gaming.',
          price: 175000,
          currency: 'naira',
          category: 'Electronics',
          condition: 'new',
          location: 'Abuja, Nigeria',
          images: [],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'active',
          tradeType: 'buy',
          views: 23,
          inquiries: 1,
          isNegotiable: true,
        },
        {
          id: 'listing_3',
          title: 'Designer Watch Exchange',
          description: 'Rolex Submariner for exchange with luxury sedan or cash equivalent.',
          price: 2500000,
          currency: 'naira',
          category: 'Fashion',
          condition: 'used',
          location: 'Port Harcourt, Nigeria',
          images: [],
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          status: 'sold',
          tradeType: 'exchange',
          views: 67,
          inquiries: 5,
          isNegotiable: false,
        },
        {
          id: 'listing_4',
          title: 'Mountain Bike',
          description: 'Trek mountain bike, 2 years old, well maintained.',
          price: 45000,
          currency: 'naira',
          category: 'Sports',
          condition: 'used',
          location: 'Kano, Nigeria',
          images: [],
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          status: 'paused',
          tradeType: 'sell',
          views: 12,
          inquiries: 0,
          isNegotiable: true,
        },
      ];

      setListings(mockListings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyListings();
    setRefreshing(false);
  };

  const toggleListingStatus = async (listingId: string, currentStatus: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const action = newStatus === 'active' ? 'activated' : 'paused';

    // Mock status update - replace with actual API call
    setListings(prev => prev.map(listing =>
      listing.id === listingId
        ? { ...listing, status: newStatus as any }
        : listing
    ));

    Alert.alert('Status Updated', `Listing has been ${action}.`);
  };

  const deleteListing = (listingId: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setListings(prev => prev.filter(listing => listing.id !== listingId));
          },
        },
      ]
    );
  };

  const editListing = (listing: MyListing) => {
    // Navigate to edit screen - implement when needed
    Alert.alert('Edit Listing', 'Edit functionality coming soon!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'sold':
        return colors.info;
      case 'paused':
        return colors.warning;
      case 'expired':
        return colors.error;
      default:
        return colors.gray[500];
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

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });

  const renderListing = ({ item: listing }: { item: MyListing }) => (
    <View style={styles.listingCard}>
      {/* Item Image Placeholder */}
      <View style={styles.itemImage}>
        <Icon name="image" size={32} color={colors.gray[400]} />
      </View>

      {/* Listing Content */}
      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {listing.title}
          </Text>

          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(listing.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(listing.status) }
            ]}>
              {listing.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.itemPrice}>
          {listing.currency === 'naira' ? '₦' : ''}{listing.price.toLocaleString()}
          {listing.currency === 'coins' ? ' coins' : ''}
          {listing.isNegotiable && (
            <Text style={styles.negotiableText}> (Negotiable)</Text>
          )}
        </Text>

        <View style={styles.listingDetails}>
          <View style={styles.detailRow}>
            <Icon name={getTradeTypeIcon(listing.tradeType) as any} size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>{listing.tradeType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="visibility" size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>{listing.views} views</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="chat" size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>{listing.inquiries} inquiries</Text>
          </View>
        </View>

        <Text style={styles.listingDate}>
          Listed {new Date(listing.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => editListing(listing)}
        >
          <Icon name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleListingStatus(listing.id, listing.status)}
        >
          <Icon
            name={listing.status === 'active' ? "pause" : "play-arrow"}
            size={20}
            color={listing.status === 'active' ? colors.warning : colors.success}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteListing(listing.id)}
        >
          <Icon name="delete" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (filterType: 'all' | 'active' | 'sold' | 'paused', label: string) => (
    <TouchableOpacity
      key={filterType}
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilter(filterType);
      }}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active');
  const soldListings = listings.filter(l => l.status === 'sold');
  const pausedListings = listings.filter(l => l.status === 'paused');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => (navigation as any).navigate('ListItem')}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeListings.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{soldListings.length}</Text>
          <Text style={styles.statLabel}>Sold</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pausedListings.length}</Text>
          <Text style={styles.statLabel}>Paused</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('active', 'Active')}
        {renderFilterButton('sold', 'Sold')}
        {renderFilterButton('paused', 'Paused')}
      </View>

      {/* Listings List */}
      <FlatList
        data={filteredListings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listingsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="store" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Listings Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'You haven\'t created any listings yet.'
                : `No ${filter} listings found.`
              }
            </Text>
            <TouchableOpacity
              style={styles.createListingButton}
              onPress={() => (navigation as any).navigate('ListItem')}
            >
              <Text style={styles.createListingButtonText}>Create Your First Listing</Text>
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
  addButton: {
    padding: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  listingsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  listingCard: {
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
  listingContent: {
    flex: 1,
  },
  listingHeader: {
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
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  itemPrice: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  negotiableText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    fontWeight: 'normal',
  },
  listingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  listingDate: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
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
  createListingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  createListingButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default MyListingsScreen;