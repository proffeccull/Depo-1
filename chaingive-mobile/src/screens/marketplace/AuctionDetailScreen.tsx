import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface RouteParams {
  auctionId: string;
}

interface Auction {
  id: string;
  item: {
    id: string;
    name: string;
    description: string;
    category: string;
    images: string[];
  };
  seller: {
    id: string;
    name: string;
    rating: number;
    totalSales: number;
  };
  startingPrice: number;
  currentBid: number;
  minimumIncrement: number;
  buyNowPrice?: number;
  totalBids: number;
  status: 'active' | 'upcoming' | 'ended';
  startTime: string;
  endTime: string;
  winner?: {
    id: string;
    name: string;
  };
}

interface Bid {
  id: string;
  bidder: {
    id: string;
    name: string;
  };
  amount: number;
  timestamp: string;
  isCurrentUser: boolean;
}

const AuctionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { auctionId } = route.params as RouteParams;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const { balance } = useSelector((state: RootState) => state.coin);

  useEffect(() => {
    loadAuctionDetails();
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [auctionId]);

  const loadAuctionDetails = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAuction: Auction = {
        id: auctionId,
        item: {
          id: 'item_001',
          name: 'iPhone 13 Pro Max',
          description: 'Brand new iPhone 13 Pro Max 256GB in Graphite. Comes with original box, charger, and warranty.',
          category: 'Electronics',
          images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
        },
        seller: {
          id: 'seller_001',
          name: 'TechStore NG',
          rating: 4.8,
          totalSales: 156,
        },
        startingPrice: 50000,
        currentBid: 75000,
        minimumIncrement: 5000,
        buyNowPrice: 120000,
        totalBids: 23,
        status: 'active',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      };

      const mockBids: Bid[] = [
        {
          id: 'bid_1',
          bidder: { id: 'user_1', name: 'John D.' },
          amount: 75000,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          isCurrentUser: false,
        },
        {
          id: 'bid_2',
          bidder: { id: 'user_2', name: 'Sarah M.' },
          amount: 70000,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          isCurrentUser: false,
        },
        {
          id: 'bid_3',
          bidder: { id: 'user_3', name: 'Mike R.' },
          amount: 65000,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          isCurrentUser: true,
        },
      ];

      setAuction(mockAuction);
      setBids(mockBids);
      setBidAmount((mockAuction.currentBid + mockAuction.minimumIncrement).toString());
      setTimeLeft(Math.floor((new Date(mockAuction.endTime).getTime() - new Date().getTime()) / 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!auction || !bidAmount) return;

    const amount = parseInt(bidAmount);
    const minBid = auction.currentBid + auction.minimumIncrement;

    if (amount < minBid) {
      Alert.alert('Invalid Bid', `Minimum bid is ₦${minBid.toLocaleString()}`);
      return;
    }

    if (amount > balance.current) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough coins for this bid.');
      return;
    }

    setPlacingBid(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Mock bid placement - replace with actual API call
      Alert.alert('Bid Placed!', `Your bid of ₦${amount.toLocaleString()} has been placed successfully.`);

      // Update local state
      const newBid: Bid = {
        id: `bid_${Date.now()}`,
        bidder: { id: user?.id || '', name: user?.firstName + ' ' + user?.lastName || 'You' },
        amount: amount,
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
      };

      setBids(prev => [newBid, ...prev]);
      setAuction(prev => prev ? { ...prev, currentBid: amount, totalBids: prev.totalBids + 1 } : null);
      setBidAmount((amount + auction.minimumIncrement).toString());
    } catch (error) {
      Alert.alert('Error', 'Failed to place bid. Please try again.');
    } finally {
      setPlacingBid(false);
    }
  };

  const handleBuyNow = () => {
    if (!auction?.buyNowPrice) return;

    Alert.alert(
      'Buy Now',
      `Purchase this item immediately for ₦${auction.buyNowPrice.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: () => {
            // Mock buy now - replace with actual API call
            Alert.alert('Purchase Complete!', 'Item purchased successfully!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = () => {
    if (timeLeft <= 0) return { text: 'Auction Ended', color: colors.error };
    if (timeLeft <= 300) return { text: 'Ending Soon!', color: colors.warning };
    return { text: 'Active', color: colors.success };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading auction...</Text>
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

  const timeStatus = getTimeStatus();
  const isAuctionActive = timeLeft > 0 && auction.status === 'active';
  const minBid = auction.currentBid + auction.minimumIncrement;
  const canBid = isAuctionActive && parseInt(bidAmount || '0') >= minBid;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auction Details</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('BidHistory', { auctionId })}>
          <Icon name="history" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Item Images Placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={64} color={colors.gray[400]} />
            <Text style={styles.imageText}>Item Images</Text>
          </View>
        </View>

        {/* Auction Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: timeStatus.color }]} />
            <Text style={[styles.statusText, { color: timeStatus.color }]}>
              {timeStatus.text}
            </Text>
            {timeLeft > 0 && (
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            )}
          </View>
        </View>

        {/* Item Details */}
        <View style={styles.itemCard}>
          <Text style={styles.itemName}>{auction.item.name}</Text>
          <Text style={styles.itemCategory}>{auction.item.category}</Text>
          <Text style={styles.itemDescription}>{auction.item.description}</Text>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerCard}>
          <View style={styles.sellerHeader}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitials}>
                {auction.seller.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{auction.seller.name}</Text>
              <View style={styles.sellerStats}>
                <Icon name="star" size={14} color={colors.warning} />
                <Text style={styles.sellerRating}>{auction.seller.rating}</Text>
                <Text style={styles.sellerSales}>({auction.seller.totalSales} sales)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Auction Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Starting Price:</Text>
            <Text style={styles.statValue}>₦{auction.startingPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Bid:</Text>
            <Text style={[styles.statValue, styles.currentBidValue]}>
              ₦{auction.currentBid.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Bids:</Text>
            <Text style={styles.statValue}>{auction.totalBids}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Minimum Increment:</Text>
            <Text style={styles.statValue}>₦{auction.minimumIncrement.toLocaleString()}</Text>
          </View>
        </View>

        {/* Recent Bids */}
        <View style={styles.bidsCard}>
          <Text style={styles.sectionTitle}>Recent Bids</Text>
          {bids.slice(0, 5).map((bid) => (
            <View key={bid.id} style={styles.bidRow}>
              <View style={styles.bidderInfo}>
                <Text style={styles.bidderName}>
                  {bid.isCurrentUser ? 'You' : bid.bidder.name}
                </Text>
                <Text style={styles.bidTime}>
                  {new Date(bid.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={[styles.bidAmount, bid.isCurrentUser && styles.yourBid]}>
                ₦{bid.amount.toLocaleString()}
              </Text>
            </View>
          ))}
          {bids.length > 5 && (
            <TouchableOpacity
              style={styles.viewAllBids}
              onPress={() => (navigation as any).navigate('BidHistory', { auctionId })}
            >
              <Text style={styles.viewAllBidsText}>View All Bids</Text>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Bidding Section */}
        {isAuctionActive && (
          <View style={styles.biddingCard}>
            <Text style={styles.sectionTitle}>Place Your Bid</Text>

            <View style={styles.bidInputContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.bidInput}
                value={bidAmount}
                onChangeText={setBidAmount}
                placeholder={`${minBid.toLocaleString()}`}
                keyboardType="numeric"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <Text style={styles.bidHint}>
              Minimum bid: ₦{minBid.toLocaleString()}
            </Text>

            <TouchableOpacity
              style={[styles.bidButton, (!canBid || placingBid) && styles.bidButtonDisabled]}
              onPress={handlePlaceBid}
              disabled={!canBid || placingBid}
            >
              {placingBid ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Icon name="gavel" size={20} color={colors.white} />
                  <Text style={styles.bidButtonText}>Place Bid</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Buy Now */}
        {auction.buyNowPrice && isAuctionActive && (
          <View style={styles.buyNowCard}>
            <Text style={styles.buyNowTitle}>Buy Now</Text>
            <Text style={styles.buyNowPrice}>₦{auction.buyNowPrice.toLocaleString()}</Text>
            <Text style={styles.buyNowDescription}>
              Purchase this item immediately and end the auction.
            </Text>
            <TouchableOpacity
              style={styles.buyNowButton}
              onPress={handleBuyNow}
            >
              <Text style={styles.buyNowButtonText}>Buy Now</Text>
              <Icon name="shopping-cart" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Auction Ended */}
        {timeLeft <= 0 && (
          <View style={styles.endedCard}>
            <Icon name="gavel" size={32} color={colors.text.secondary} />
            <Text style={styles.endedTitle}>Auction Ended</Text>
            {auction.winner ? (
              <Text style={styles.endedText}>
                Won by {auction.winner.name} for ₦{auction.currentBid.toLocaleString()}
              </Text>
            ) : (
              <Text style={styles.endedText}>No bids were placed</Text>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageText: {
    ...typography.bodyRegular,
    color: colors.gray[500],
    marginTop: spacing.sm,
  },
  statusCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.bodyBold,
    flex: 1,
  },
  timerText: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  itemCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  itemName: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  itemCategory: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  sellerCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sellerInitials: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  sellerRating: {
    ...typography.caption,
    color: colors.text.primary,
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
  },
  sellerSales: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statsCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  statLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  statValue: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  currentBidValue: {
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  bidsCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  bidderInfo: {
    flex: 1,
  },
  bidderName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '500',
  },
  bidTime: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  bidAmount: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  yourBid: {
    color: colors.primary,
  },
  viewAllBids: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  viewAllBidsText: {
    ...typography.bodyRegular,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  biddingCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  bidInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  currencySymbol: {
    ...typography.h4,
    color: colors.text.secondary,
    paddingLeft: spacing.md,
  },
  bidInput: {
    flex: 1,
    padding: spacing.md,
    ...typography.h3,
    color: colors.text.primary,
  },
  bidHint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  bidButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  bidButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  bidButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  buyNowCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.tertiary,
  },
  buyNowTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  buyNowPrice: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  buyNowDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  buyNowButton: {
    backgroundColor: colors.tertiary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  buyNowButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  endedCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  endedTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  endedText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default AuctionDetailScreen;