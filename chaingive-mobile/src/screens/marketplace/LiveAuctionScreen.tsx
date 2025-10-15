import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface RouteParams {
  auctionId: string;
}

interface Auction {
  id: string;
  item: {
    name: string;
    description: string;
    images: string[];
  };
  seller: {
    name: string;
    rating: number;
  };
  startingPrice: number;
  currentBid: number;
  minimumIncrement: number;
  totalBids: number;
  endTime: string;
}

interface Bid {
  id: string;
  bidder: {
    name: string;
    avatar?: string;
  };
  amount: number;
  timestamp: string;
  isCurrentUser: boolean;
}

const LiveAuctionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { auctionId } = route.params as RouteParams;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { balance } = useSelector((state: RootState) => state.coin);

  useEffect(() => {
    loadAuctionData();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAuctionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionId]);

  useEffect(() => {
    // Auto-scroll to bottom when new bids arrive
    if (scrollViewRef.current && bids.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [bids]);

  const loadAuctionData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAuction: Auction = {
        id: auctionId,
        item: {
          name: 'iPhone 13 Pro Max 256GB',
          description: 'Brand new sealed iPhone 13 Pro Max in Graphite color. Comes with all original accessories.',
          images: [],
        },
        seller: {
          name: 'Premium Electronics',
          rating: 4.9,
        },
        startingPrice: 50000,
        currentBid: 85000,
        minimumIncrement: 5000,
        totalBids: 24,
        endTime: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
      };

      const mockBids: Bid[] = [
        {
          id: 'bid_1',
          bidder: { name: 'John D.', avatar: 'JD' },
          amount: 85000,
          timestamp: new Date(Date.now() - 10000).toISOString(),
          isCurrentUser: false,
        },
        {
          id: 'bid_2',
          bidder: { name: 'Sarah M.', avatar: 'SM' },
          amount: 80000,
          timestamp: new Date(Date.now() - 20000).toISOString(),
          isCurrentUser: false,
        },
        {
          id: 'bid_3',
          bidder: { name: 'Mike R.', avatar: 'MR' },
          amount: 75000,
          timestamp: new Date(Date.now() - 30000).toISOString(),
          isCurrentUser: true,
        },
      ];

      setAuction(mockAuction);
      setBids(mockBids);
      setBidAmount((mockAuction.currentBid + mockAuction.minimumIncrement).toString());
      setTimeLeft(300); // 5 minutes
    } catch (error) {
      Alert.alert('Error', 'Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const handleAuctionEnd = () => {
    Alert.alert(
      'Auction Ended!',
      'This auction has now ended. Check the results.',
      [
        { text: 'View Results', onPress: () => navigation.goBack() },
        { text: 'Browse More', onPress: () => (navigation as any).navigate('AuctionHouse') },
      ]
    );
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Mock bid placement - replace with actual API call
      const newBid: Bid = {
        id: `bid_${Date.now()}`,
        bidder: { name: user?.firstName + ' ' + user?.lastName || 'You', avatar: 'YOU' },
        amount: amount,
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
      };

      setBids(prev => [...prev, newBid]);
      setAuction(prev => prev ? {
        ...prev,
        currentBid: amount,
        totalBids: prev.totalBids + 1
      } : null);
      setBidAmount((amount + auction.minimumIncrement).toString());

      Alert.alert('Bid Placed!', `Your bid of ₦${amount.toLocaleString()} is now the highest!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to place bid. Please try again.');
    } finally {
      setPlacingBid(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBidderInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading live auction...</Text>
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

  const minBid = auction.currentBid + auction.minimumIncrement;
  const isUrgent = timeLeft <= 60; // Last minute

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>LIVE AUCTION</Text>
          <View style={[styles.liveIndicator, isUrgent && styles.urgentIndicator]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              {isUrgent ? 'ENDING SOON' : 'LIVE NOW'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsFollowing(!isFollowing)}
          style={styles.followButton}
        >
          <Icon
            name={isFollowing ? "notifications-active" : "notifications-none"}
            size={24}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Item Display */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.itemDisplay}
        >
          <View style={styles.itemImage}>
            <Icon name="phone-iphone" size={80} color={colors.white} />
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {auction.item.name}
            </Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {auction.item.description}
            </Text>
          </View>
        </LinearGradient>

        {/* Current Bid Display */}
        <View style={styles.currentBidCard}>
          <View style={styles.bidStats}>
            <View style={styles.bidStat}>
              <Text style={styles.bidStatLabel}>Current Bid</Text>
              <Text style={styles.currentBidAmount}>₦{auction.currentBid.toLocaleString()}</Text>
            </View>
            <View style={styles.bidStat}>
              <Text style={styles.bidStatLabel}>Time Left</Text>
              <Text style={[styles.timeLeft, isUrgent && styles.timeLeftUrgent]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
            <View style={styles.bidStat}>
              <Text style={styles.bidStatLabel}>Total Bids</Text>
              <Text style={styles.totalBids}>{auction.totalBids}</Text>
            </View>
          </View>
        </View>

        {/* Live Bid Feed */}
        <View style={styles.bidFeed}>
          <Text style={styles.feedTitle}>Live Bid Feed</Text>

          <ScrollView
            ref={scrollViewRef}
            style={styles.feedScroll}
            showsVerticalScrollIndicator={false}
          >
            {bids.map((bid, index) => (
              <View key={bid.id} style={styles.bidItem}>
                <View style={[
                  styles.bidderAvatar,
                  bid.isCurrentUser && styles.userBidderAvatar,
                ]}>
                  <Text style={[
                    styles.bidderInitials,
                    bid.isCurrentUser && styles.userBidderInitials,
                  ]}>
                    {getBidderInitials(bid.bidder.name)}
                  </Text>
                </View>

                <View style={styles.bidContent}>
                  <Text style={[
                    styles.bidderName,
                    bid.isCurrentUser && styles.userBidderName,
                  ]}>
                    {bid.isCurrentUser ? 'You' : bid.bidder.name}
                  </Text>
                  <Text style={styles.bidTimestamp}>
                    {new Date(bid.timestamp).toLocaleTimeString()}
                  </Text>
                </View>

                <View style={styles.bidAmountContainer}>
                  <Text style={[
                    styles.bidAmount,
                    bid.isCurrentUser && styles.userBidAmount,
                  ]}>
                    ₦{bid.amount.toLocaleString()}
                  </Text>
                  {index === bids.length - 1 && (
                    <View style={styles.highestBidBadge}>
                      <Text style={styles.highestBidText}>Highest</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Bid Input */}
        <View style={styles.bidInputCard}>
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

          <Text style={styles.minBidText}>
            Minimum bid: ₦{minBid.toLocaleString()}
          </Text>

          <TouchableOpacity
            style={[styles.placeBidButton, placingBid && styles.placeBidButtonDisabled]}
            onPress={handlePlaceBid}
            disabled={placingBid || !bidAmount || parseInt(bidAmount) < minBid}
          >
            {placingBid ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Icon name="gavel" size={20} color={colors.white} />
                <Text style={styles.placeBidButtonText}>Place Bid</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: colors.primary,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginTop: 4,
  },
  urgentIndicator: {
    backgroundColor: colors.error,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  liveText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 8,
  },
  followButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  itemDisplay: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  itemInfo: {
    alignItems: 'center',
  },
  itemName: {
    ...typography.h3,
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  itemDescription: {
    ...typography.bodyRegular,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  currentBidCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  bidStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bidStat: {
    alignItems: 'center',
  },
  bidStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  currentBidAmount: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  timeLeft: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  timeLeftUrgent: {
    color: colors.error,
  },
  totalBids: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  bidFeed: {
    flex: 1,
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  feedTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  feedScroll: {
    flex: 1,
  },
  bidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  bidderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userBidderAvatar: {
    backgroundColor: colors.primary,
  },
  bidderInitials: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  userBidderInitials: {
    color: colors.white,
  },
  bidContent: {
    flex: 1,
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
  bidTimestamp: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  bidAmountContainer: {
    alignItems: 'flex-end',
  },
  bidAmount: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  userBidAmount: {
    color: colors.primary,
  },
  highestBidBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  highestBidText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 8,
  },
  bidInputCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
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
  minBidText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  placeBidButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  placeBidButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  placeBidButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default LiveAuctionScreen;