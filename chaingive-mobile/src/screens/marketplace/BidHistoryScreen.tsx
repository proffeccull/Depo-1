import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteParams {
  auctionId: string;
}

interface Bid {
  id: string;
  bidder: {
    id: string;
    name: string;
    avatar?: string;
  };
  amount: number;
  timestamp: string;
  isCurrentUser: boolean;
  isWinning: boolean;
}

interface Auction {
  id: string;
  item: {
    name: string;
  };
  currentBid: number;
  status: 'active' | 'ended';
}

const BidHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { auctionId } = route.params as RouteParams;

  const [bids, setBids] = useState<Bid[]>([]);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadBidHistory();
  }, [auctionId]);

  const loadBidHistory = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAuction: Auction = {
        id: auctionId,
        item: { name: 'iPhone 13 Pro Max' },
        currentBid: 75000,
        status: 'active',
      };

      const mockBids: Bid[] = [
        {
          id: 'bid_1',
          bidder: { id: 'user_1', name: 'John D.', avatar: 'JD' },
          amount: 75000,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          isCurrentUser: false,
          isWinning: true,
        },
        {
          id: 'bid_2',
          bidder: { id: 'user_2', name: 'Sarah M.', avatar: 'SM' },
          amount: 70000,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          isCurrentUser: false,
          isWinning: false,
        },
        {
          id: 'bid_3',
          bidder: { id: 'user_3', name: 'Mike R.', avatar: 'MR' },
          amount: 65000,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          isCurrentUser: true,
          isWinning: false,
        },
        {
          id: 'bid_4',
          bidder: { id: 'user_4', name: 'Emma L.', avatar: 'EL' },
          amount: 62000,
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          isCurrentUser: false,
          isWinning: false,
        },
        {
          id: 'bid_5',
          bidder: { id: 'user_5', name: 'David K.', avatar: 'DK' },
          amount: 60000,
          timestamp: new Date(Date.now() - 1500000).toISOString(),
          isCurrentUser: false,
          isWinning: false,
        },
        {
          id: 'bid_6',
          bidder: { id: 'user_6', name: 'Lisa P.', avatar: 'LP' },
          amount: 58000,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isCurrentUser: false,
          isWinning: false,
        },
        {
          id: 'bid_7',
          bidder: { id: 'user_7', name: 'Tom W.', avatar: 'TW' },
          amount: 55000,
          timestamp: new Date(Date.now() - 2100000).toISOString(),
          isCurrentUser: false,
          isWinning: false,
        },
        {
          id: 'bid_8',
          bidder: { id: 'user_8', name: 'Anna B.', avatar: 'AB' },
          amount: 52000,
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          isCurrentUser: false,
          isWinning: false,
        },
      ];

      setAuction(mockAuction);
      setBids(mockBids);
    } catch (error) {
      Alert.alert('Error', 'Failed to load bid history');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const bidTime = new Date(timestamp);
    const diffMs = now.getTime() - bidTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getBidderInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderBid = ({ item: bid, index }: { item: Bid; index: number }) => (
    <View style={[
      styles.bidCard,
      bid.isWinning && styles.winningBidCard,
      bid.isCurrentUser && styles.userBidCard,
    ]}>
      <View style={styles.bidHeader}>
        <View style={styles.bidderInfo}>
          <View style={[
            styles.bidderAvatar,
            bid.isWinning && styles.winningBidderAvatar,
            bid.isCurrentUser && styles.userBidderAvatar,
          ]}>
            <Text style={[
              styles.bidderInitials,
              bid.isWinning && styles.winningBidderInitials,
              bid.isCurrentUser && styles.userBidderInitials,
            ]}>
              {getBidderInitials(bid.bidder.name)}
            </Text>
          </View>

          <View style={styles.bidDetails}>
            <View style={styles.bidderNameRow}>
              <Text style={[
                styles.bidderName,
                bid.isCurrentUser && styles.userBidderName,
              ]}>
                {bid.isCurrentUser ? 'You' : bid.bidder.name}
              </Text>
              {bid.isWinning && (
                <View style={styles.winningBadge}>
                  <Icon name="emoji-events" size={12} color={colors.white} />
                  <Text style={styles.winningBadgeText}>Winning</Text>
                </View>
              )}
            </View>

            <Text style={styles.bidTime}>
              {formatTimeAgo(bid.timestamp)}
            </Text>
          </View>
        </View>

        <View style={styles.bidAmountContainer}>
          <Text style={[
            styles.bidAmount,
            bid.isWinning && styles.winningBidAmount,
            bid.isCurrentUser && styles.userBidAmount,
          ]}>
            ₦{bid.amount.toLocaleString()}
          </Text>
          <Text style={styles.bidPosition}>#{index + 1}</Text>
        </View>
      </View>

      {index === 0 && (
        <View style={styles.currentBidIndicator}>
          <Icon name="arrow-upward" size={16} color={colors.success} />
          <Text style={styles.currentBidText}>Current highest bid</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bid history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!auction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Auction Not Found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userBids = bids.filter(bid => bid.isCurrentUser);
  const winningBid = bids.find(bid => bid.isWinning);
  const isUserWinning = winningBid?.isCurrentUser;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bid History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Auction Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.itemName} numberOfLines={1}>
          {auction.item.name}
        </Text>

        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Current Bid</Text>
            <Text style={styles.statValue}>₦{auction.currentBid.toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Bids</Text>
            <Text style={styles.statValue}>{bids.length}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Your Bids</Text>
            <Text style={styles.statValue}>{userBids.length}</Text>
          </View>
        </View>

        {isUserWinning && (
          <View style={styles.winningIndicator}>
            <Icon name="celebration" size={20} color={colors.white} />
            <Text style={styles.winningIndicatorText}>You're winning!</Text>
          </View>
        )}
      </View>

      {/* Bid List */}
      <FlatList
        data={bids}
        renderItem={renderBid}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bidsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="gavel" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Bids Yet</Text>
            <Text style={styles.emptyText}>
              Be the first to place a bid on this auction!
            </Text>
          </View>
        }
      />

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => (navigation as any).navigate('AuctionDetail', { auctionId })}
        >
          <Text style={styles.primaryActionText}>Back to Auction</Text>
          <Icon name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => (navigation as any).navigate('MyBids')}
        >
          <Text style={styles.secondaryActionText}>View My Bids</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.button,
    color: colors.white,
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
  summaryCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  itemName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.light,
  },
  winningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  winningIndicatorText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  bidsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  bidCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  winningBidCard: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  userBidCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bidderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bidderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  winningBidderAvatar: {
    backgroundColor: colors.success,
  },
  userBidderAvatar: {
    backgroundColor: colors.primary,
  },
  bidderInitials: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  winningBidderInitials: {
    color: colors.white,
  },
  userBidderInitials: {
    color: colors.white,
  },
  bidDetails: {
    flex: 1,
  },
  bidderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bidderName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  userBidderName: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  winningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginLeft: spacing.sm,
    gap: spacing.xs,
  },
  winningBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  bidTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  bidAmountContainer: {
    alignItems: 'flex-end',
  },
  bidAmount: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  winningBidAmount: {
    color: colors.success,
  },
  userBidAmount: {
    color: colors.primary,
  },
  bidPosition: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  currentBidIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  currentBidText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  primaryActionText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  secondaryAction: {
    backgroundColor: colors.gray[200],
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    ...typography.button,
    color: colors.text.primary,
  },
});

export default BidHistoryScreen;