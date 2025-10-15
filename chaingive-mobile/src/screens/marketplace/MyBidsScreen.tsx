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

interface UserBid {
  id: string;
  auction: {
    id: string;
    item: {
      name: string;
      images: string[];
    };
    currentBid: number;
    status: 'active' | 'upcoming' | 'ended';
    endTime: string;
  };
  amount: number;
  timestamp: string;
  isWinning: boolean;
  isOutbid: boolean;
}

const MyBidsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [bids, setBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadUserBids();
  }, []);

  const loadUserBids = async () => {
    try {
      // Mock data - replace with actual API call
      const mockBids: UserBid[] = [
        {
          id: 'bid_1',
          auction: {
            id: 'auction_1',
            item: { name: 'iPhone 13 Pro Max', images: [] },
            currentBid: 75000,
            status: 'active',
            endTime: new Date(Date.now() + 7200000).toISOString(),
          },
          amount: 65000,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          isWinning: false,
          isOutbid: true,
        },
        {
          id: 'bid_2',
          auction: {
            id: 'auction_2',
            item: { name: 'MacBook Pro M1', images: [] },
            currentBid: 120000,
            status: 'active',
            endTime: new Date(Date.now() + 3600000).toISOString(),
          },
          amount: 120000,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isWinning: true,
          isOutbid: false,
        },
        {
          id: 'bid_3',
          auction: {
            id: 'auction_3',
            item: { name: 'Samsung Galaxy S21', images: [] },
            currentBid: 45000,
            status: 'ended',
            endTime: new Date(Date.now() - 86400000).toISOString(),
          },
          amount: 40000,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          isWinning: false,
          isOutbid: false,
        },
        {
          id: 'bid_4',
          auction: {
            id: 'auction_4',
            item: { name: 'Sony PlayStation 5', images: [] },
            currentBid: 85000,
            status: 'ended',
            endTime: new Date(Date.now() - 259200000).toISOString(),
          },
          amount: 85000,
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          isWinning: true,
          isOutbid: false,
        },
      ];

      setBids(mockBids);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserBids();
    setRefreshing(false);
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const getBidStatus = (bid: UserBid) => {
    if (bid.auction.status === 'ended') {
      return bid.isWinning ? 'Won' : 'Lost';
    }
    if (bid.isOutbid) return 'Outbid';
    if (bid.isWinning) return 'Winning';
    return 'Active';
  };

  const getBidStatusColor = (bid: UserBid) => {
    if (bid.auction.status === 'ended') {
      return bid.isWinning ? colors.success : colors.error;
    }
    if (bid.isOutbid) return colors.warning;
    if (bid.isWinning) return colors.success;
    return colors.info;
  };

  const filteredBids = bids.filter(bid => {
    switch (filter) {
      case 'active':
        return bid.auction.status === 'active';
      case 'won':
        return bid.auction.status === 'ended' && bid.isWinning;
      case 'lost':
        return bid.auction.status === 'ended' && !bid.isWinning;
      default:
        return true;
    }
  });

  const renderBid = ({ item: bid }: { item: UserBid }) => (
    <TouchableOpacity
      style={styles.bidCard}
      onPress={() => (navigation as any).navigate('AuctionDetail', { auctionId: bid.auction.id })}
      activeOpacity={0.9}
    >
      {/* Item Image Placeholder */}
      <View style={styles.itemImage}>
        <Icon name="image" size={32} color={colors.gray[400]} />
      </View>

      {/* Bid Content */}
      <View style={styles.bidContent}>
        <Text style={styles.itemName} numberOfLines={1}>
          {bid.auction.item.name}
        </Text>

        <View style={styles.bidDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Your Bid:</Text>
            <Text style={styles.detailValue}>₦{bid.amount.toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Bid:</Text>
            <Text style={styles.detailValue}>₦{bid.auction.currentBid.toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>
              {bid.auction.status === 'ended' ? 'Ended' : getTimeRemaining(bid.auction.endTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={styles.bidStatus}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getBidStatusColor(bid) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getBidStatusColor(bid) }
          ]}>
            {getBidStatus(bid)}
          </Text>
        </View>

        {bid.isOutbid && bid.auction.status === 'active' && (
          <TouchableOpacity
            style={styles.rebidButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              (navigation as any).navigate('AuctionDetail', { auctionId: bid.auction.id });
            }}
          >
            <Text style={styles.rebidButtonText}>Rebid</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType: 'all' | 'active' | 'won' | 'lost', label: string) => (
    <TouchableOpacity
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
          <Text style={styles.loadingText}>Loading your bids...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeBids = bids.filter(b => b.auction.status === 'active');
  const winningBids = bids.filter(b => b.isWinning);
  const outbidBids = bids.filter(b => b.isOutbid);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bids</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeBids.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{winningBids.length}</Text>
          <Text style={styles.statLabel}>Winning</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{outbidBids.length}</Text>
          <Text style={styles.statLabel}>Outbid</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('active', 'Active')}
        {renderFilterButton('won', 'Won')}
        {renderFilterButton('lost', 'Lost')}
      </View>

      {/* Bids List */}
      <FlatList
        data={filteredBids}
        renderItem={renderBid}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bidsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="gavel" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Bids Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'You haven\'t placed any bids yet. Start bidding on auctions!'
                : `No ${filter} bids found.`
              }
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => (navigation as any).navigate('AuctionHouse')}
            >
              <Text style={styles.browseButtonText}>Browse Auctions</Text>
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
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
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
  bidsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  bidCard: {
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
  bidContent: {
    flex: 1,
  },
  itemName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  bidDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '500',
  },
  bidStatus: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  rebidButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
  },
  rebidButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
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
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  browseButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default MyBidsScreen;