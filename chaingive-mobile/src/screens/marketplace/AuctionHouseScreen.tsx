import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchAuctions,
  placeBid,
  buyNow,
  fetchUserBids,
} from '../../store/slices/marketplaceSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';
import { AnimatedNumber } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

const AuctionHouseScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { auctions, userBids, auctionsEnabled, loading } = useSelector(
    (state: RootState) => state.marketplace
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { balance } = useSelector((state: RootState) => state.coin);

  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'ended'>('active');

  useEffect(() => {
    dispatch(fetchAuctions(activeTab));
    if (user?.id) {
      dispatch(fetchUserBids(user.id));
    }
  }, [dispatch, activeTab, user?.id]);

  const handlePlaceBid = async () => {
    if (!selectedAuction || !bidAmount) return;

    const amount = parseInt(bidAmount);
    const minBid = selectedAuction.currentBid + selectedAuction.minimumIncrement;

    if (amount < minBid) {
      showToast(`Minimum bid is ${minBid} coins`, 'error');
      return;
    }

    if (amount > balance.current) {
      showToast('Insufficient coins', 'error');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(placeBid({
        auctionId: selectedAuction.id,
        amount,
        userId: user?.id || '',
      })).unwrap();

      showToast('Bid placed successfully!', 'success');
      setShowBidModal(false);
      setBidAmount('');
      setSelectedAuction(null);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to place bid', 'error');
    }
  };

  const handleBuyNow = async (auction: any) => {
    if (auction.buyNowPrice > balance.current) {
      showToast('Insufficient coins', 'error');
      return;
    }

    Alert.alert(
      'Buy Now',
      `Purchase this item for ${auction.buyNowPrice} coins? This will end the auction immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await dispatch(buyNow({
                auctionId: auction.id,
                userId: user?.id || '',
              })).unwrap();

              showToast('Item purchased successfully!', 'success');
            } catch (error: any) {
              showToast(error.message || 'Purchase failed', 'error');
            }
          },
        },
      ]
    );
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderAuctionCard = ({ item: auction }: { item: any }) => {
    const timeRemaining = getTimeRemaining(auction.endTime);
    const isEnded = auction.status === 'ended';
    const isWinner = auction.winner?.id === user?.id;
    const hasBid = userBids.some(bid => bid.auctionId === auction.id);

    return (
      <TouchableOpacity
        style={styles.auctionCard}
        onPress={() => navigation.navigate('AuctionDetail' as never, { auctionId: auction.id })}
        activeOpacity={0.9}
      >
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          auction.status === 'active' && styles.activeBadge,
          auction.status === 'upcoming' && styles.upcomingBadge,
          auction.status === 'ended' && styles.endedBadge,
        ]}>
          <Text style={styles.statusText}>
            {auction.status === 'active' ? '🔥 LIVE' :
             auction.status === 'upcoming' ? '⏰ Upcoming' :
             '🏁 Ended'}
          </Text>
        </View>

        {/* Item Image Placeholder */}
        <View style={styles.itemImage}>
          <Icon name="shopping-bag" size={40} color={colors.white} />
        </View>

        {/* Content */}
        <View style={styles.auctionContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {auction.item.name}
          </Text>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {auction.item.description}
          </Text>

          {/* Auction Stats */}
          <View style={styles.auctionStats}>
            <View style={styles.stat}>
              <Icon name="gavel" size={14} color={colors.text.secondary} />
              <Text style={styles.statText}>{auction.totalBids} bids</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="schedule" size={14} color={colors.text.secondary} />
              <Text style={styles.statText}>{timeRemaining}</Text>
            </View>
          </View>

          {/* Current Bid */}
          <View style={styles.bidSection}>
            <Text style={styles.currentBidLabel}>Current Bid:</Text>
            <AnimatedNumber
              value={auction.currentBid}
              style={styles.currentBidAmount}
              formatter={(val) => `${Math.round(val).toLocaleString()} coins`}
            />
          </View>

          {/* Winner Badge */}
          {isWinner && (
            <View style={styles.winnerBadge}>
              <Icon name="emoji-events" size={16} color={colors.white} />
              <Text style={styles.winnerText}>You Won!</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {auction.status === 'active' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.bidButton]}
                onPress={() => {
                  setSelectedAuction(auction);
                  setBidAmount((auction.currentBid + auction.minimumIncrement).toString());
                  setShowBidModal(true);
                }}
              >
                <Icon name="gavel" size={16} color={colors.white} />
                <Text style={styles.bidButtonText}>Bid</Text>
              </TouchableOpacity>

              {auction.buyNowPrice && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.buyNowButton]}
                  onPress={() => handleBuyNow(auction)}
                >
                  <Text style={styles.buyNowButtonText}>
                    Buy Now ({auction.buyNowPrice})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {auction.status === 'upcoming' && (
            <View style={styles.upcomingNotice}>
              <Text style={styles.upcomingText}>Starts in {getTimeRemaining(auction.startTime)}</Text>
            </View>
          )}

          {auction.status === 'ended' && (
            <View style={styles.endedNotice}>
              {isWinner ? (
                <Text style={styles.winnerNoticeText}>🎉 Congratulations!</Text>
              ) : (
                <Text style={styles.endedNoticeText}>
                  Won by {auction.winner?.name || 'Anonymous'}
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderBidModal = () => {
    if (!selectedAuction) return null;

    const minBid = selectedAuction.currentBid + selectedAuction.minimumIncrement;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Place Your Bid</Text>

          <View style={styles.bidItemInfo}>
            <Text style={styles.bidItemName}>{selectedAuction.item.name}</Text>
            <Text style={styles.bidCurrentBid}>
              Current Bid: {selectedAuction.currentBid.toLocaleString()} coins
            </Text>
            <Text style={styles.bidMinIncrement}>
              Minimum Increment: {selectedAuction.minimumIncrement} coins
            </Text>
          </View>

          <Text style={styles.bidInputLabel}>Your Bid (coins)</Text>
          <TextInput
            style={styles.bidInput}
            value={bidAmount}
            onChangeText={setBidAmount}
            placeholder={`${minBid} coins minimum`}
            keyboardType="numeric"
          />

          {bidAmount && parseInt(bidAmount) < minBid && (
            <Text style={styles.bidError}>Bid must be at least {minBid} coins</Text>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowBidModal(false);
                setSelectedAuction(null);
                setBidAmount('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                (!bidAmount || parseInt(bidAmount) < minBid) && styles.confirmButtonDisabled,
              ]}
              onPress={handlePlaceBid}
              disabled={!bidAmount || parseInt(bidAmount) < minBid}
            >
              <Text style={styles.confirmButtonText}>Place Bid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!auctionsEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Icon name="gavel" size={64} color={colors.gray[300]} />
          <Text style={styles.disabledTitle}>Auction House</Text>
          <Text style={styles.disabledMessage}>
            The auction house is currently disabled by administrators.
            Check back later for exciting auctions!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auction House</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateAuction' as never)}
          style={styles.createButton}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {(['active', 'upcoming', 'ended'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab);
            }}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === tab && styles.tabButtonTextSelected,
            ]}>
              {tab === 'active' ? 'Live' :
               tab === 'upcoming' ? 'Upcoming' :
               'Ended'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Auctions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading auctions...</Text>
        </View>
      ) : (
        <FlatList
          data={auctions}
          renderItem={renderAuctionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.auctionsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="gavel" size={64} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No Auctions</Text>
              <Text style={styles.emptyMessage}>
                {activeTab === 'active' ? 'No live auctions right now.' :
                 activeTab === 'upcoming' ? 'No upcoming auctions scheduled.' :
                 'No completed auctions yet.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Bid Modal */}
      {showBidModal && renderBidModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  disabledTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  disabledMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  createButton: {
    padding: spacing.xs,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  tabButtonSelected: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  tabButtonTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  auctionsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  auctionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: colors.error,
  },
  upcomingBadge: {
    backgroundColor: colors.warning,
  },
  endedBadge: {
    backgroundColor: colors.gray[400],
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  auctionContent: {
    marginBottom: spacing.md,
  },
  itemName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  itemDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  auctionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  bidSection: {
    alignItems: 'center',
    backgroundColor: colors.tertiary + '10',
    padding: spacing.md,
    borderRadius: 8,
  },
  currentBidLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  currentBidAmount: {
    ...typography.h3,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  winnerText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  bidButton: {
    backgroundColor: colors.primary,
  },
  bidButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  buyNowButton: {
    backgroundColor: colors.tertiary,
  },
  buyNowButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  upcomingNotice: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
  },
  upcomingText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: 'bold',
  },
  endedNotice: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  winnerNoticeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
  },
  endedNoticeText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    minHeight: '50%',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  bidItemInfo: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  bidItemName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  bidCurrentBid: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bidMinIncrement: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  bidInputLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  bidInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    backgroundColor: colors.white,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bidError: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default AuctionHouseScreen;