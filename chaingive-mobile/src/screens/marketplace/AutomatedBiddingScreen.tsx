import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchAutomatedBids,
  createAutomatedBid,
  updateAutomatedBid,
  deleteAutomatedBid,
} from '../../store/slices/marketplaceSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const AutomatedBiddingScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { automatedBids, loading } = useSelector((state: RootState) => state.marketplace);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState('');
  const [maxBid, setMaxBid] = useState('');
  const [bidIncrement, setBidIncrement] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAutomatedBids(user.id));
    }
  }, [dispatch, user?.id]);

  const handleCreateAutomatedBid = async () => {
    if (!selectedAuction || !maxBid || !bidIncrement) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const maxBidAmount = parseFloat(maxBid);
    const incrementAmount = parseFloat(bidIncrement);

    if (maxBidAmount <= 0 || incrementAmount <= 0) {
      showToast('Please enter valid amounts', 'error');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(createAutomatedBid({
        userId: user?.id || '',
        auctionId: selectedAuction,
        maxBid: maxBidAmount,
        bidIncrement: incrementAmount,
        isActive,
      })).unwrap();

      setSelectedAuction('');
      setMaxBid('');
      setBidIncrement('');
      setShowCreateForm(false);
      showToast('Automated bid created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create automated bid', 'error');
    }
  };

  const handleToggleActive = async (bidId: string, currentStatus: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(updateAutomatedBid({
        bidId,
        updates: { isActive: !currentStatus },
      })).unwrap();

      showToast(`Automated bid ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update bid status', 'error');
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(deleteAutomatedBid(bidId)).unwrap();
      showToast('Automated bid deleted', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete bid', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderAutomatedBid = ({ item: bid }: { item: any }) => (
    <View style={styles.bidCard}>
      {/* Header */}
      <View style={styles.bidHeader}>
        <View style={styles.auctionInfo}>
          <Text style={styles.auctionTitle}>{bid.auction.title}</Text>
          <Text style={styles.auctionCategory}>{bid.auction.category}</Text>
        </View>
        <View style={styles.bidStatus}>
          <Switch
            value={bid.isActive}
            onValueChange={() => handleToggleActive(bid.id, bid.isActive)}
            trackColor={{ false: colors.gray[300], true: colors.primary }}
            thumbColor={bid.isActive ? colors.white : colors.gray[400]}
          />
        </View>
      </View>

      {/* Bid Details */}
      <View style={styles.bidDetails}>
        <View style={styles.bidMetric}>
          <Text style={styles.metricLabel}>Max Bid</Text>
          <Text style={styles.metricValue}>{formatCurrency(bid.maxBid)}</Text>
        </View>
        <View style={styles.bidMetric}>
          <Text style={styles.metricLabel}>Increment</Text>
          <Text style={styles.metricValue}>{formatCurrency(bid.bidIncrement)}</Text>
        </View>
        <View style={styles.bidMetric}>
          <Text style={styles.metricLabel}>Current Bid</Text>
          <Text style={styles.metricValue}>
            {bid.currentBid ? formatCurrency(bid.currentBid) : 'No bids yet'}
          </Text>
        </View>
      </View>

      {/* Auction Status */}
      <View style={styles.auctionStatus}>
        <View style={styles.statusItem}>
          <Icon name="schedule" size={16} color={colors.text.secondary} />
          <Text style={styles.statusText}>
            Ends: {new Date(bid.auction.endTime).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Icon name="gavel" size={16} color={colors.primary} />
          <Text style={styles.statusText}>
            {bid.auction.totalBids} total bids
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.bidActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AuctionDetail' as never, { auctionId: bid.auctionId })}
        >
          <Icon name="visibility" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>View Auction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBid(bid.id)}
        >
          <Icon name="delete" size={16} color={colors.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading automated bids...</Text>
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
        <Text style={styles.headerTitle}>Automated Bidding</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Icon name="smart-toy" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Set up automated bidding to place bids on your behalf when you're not available.
          Our AI will bid incrementally up to your maximum amount.
        </Text>
      </View>

      {/* Create Form */}
      {showCreateForm && (
        <View style={styles.createForm}>
          <Text style={styles.formTitle}>Create Automated Bid</Text>

          <TextInput
            style={styles.input}
            placeholder="Auction ID"
            value={selectedAuction}
            onChangeText={setSelectedAuction}
          />

          <TextInput
            style={styles.input}
            placeholder="Maximum bid amount"
            value={maxBid}
            onChangeText={setMaxBid}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Bid increment"
            value={bidIncrement}
            onChangeText={setBidIncrement}
            keyboardType="numeric"
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Activate immediately</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={isActive ? colors.white : colors.gray[400]}
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCreateForm(false);
                setSelectedAuction('');
                setMaxBid('');
                setBidIncrement('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateAutomatedBid}
            >
              <Text style={styles.createText}>Create Bid</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Automated Bids List */}
      <FlatList
        data={automatedBids}
        renderItem={renderAutomatedBid}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bidsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="smart-toy" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Automated Bids</Text>
            <Text style={styles.emptyMessage}>
              Create automated bids to never miss an auction. Our AI will bid for you!
            </Text>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.setupButtonText}>Set Up Automated Bidding</Text>
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
  addButton: {
    padding: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  createForm: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    ...shadows.card,
  },
  formTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  cancelText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  createText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  bidsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  bidCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  auctionInfo: {
    flex: 1,
  },
  auctionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  auctionCategory: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  bidStatus: {
    alignItems: 'center',
  },
  bidDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  bidMetric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  auctionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  bidActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
    backgroundColor: colors.primary + '20',
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: 'bold',
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
    marginBottom: spacing['2xl'],
    lineHeight: 20,
  },
  setupButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  setupButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default AutomatedBiddingScreen;