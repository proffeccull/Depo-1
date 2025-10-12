import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { agentService, PendingCoinPurchase } from '../../services/agentService';
import Button from '../../components/ui/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import {
  CountUpAnimation,
  ConfettiCelebration,
  PageTransition,
  LottieSuccess,
  FloatingHearts,
  PulseRing,
} from '../../components/animations';

const ConfirmCoinPaymentScreen: React.FC = () => {
  const navigation = useNavigation();

  const [purchases, setPurchases] = useState<PendingCoinPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PendingCoinPurchase | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await agentService.getPendingCoinRequests();
      setPurchases(response.purchases);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await fetchPendingRequests();
    setRefreshing(false);
  };

  const handleCallUser = (phoneNumber: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleConfirmPayment = (purchase: PendingCoinPurchase) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPurchase(purchase);
    setShowConfirmModal(true);
  };

  const handleReject = (purchase: PendingCoinPurchase) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelectedPurchase(purchase);
    setShowRejectModal(true);
  };

  const processConfirmation = async () => {
    if (!selectedPurchase) return;

    setConfirming(true);
    try {
      const response = await agentService.confirmPaymentAndRelease({
        purchaseId: selectedPurchase.id,
        paymentReceived: true,
      });

      setShowConfirmModal(false);
      
      // Show success animations!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setShowCelebration(false);
        
        Alert.alert(
          '🎉 Coins Released!',
          `You've successfully released ${formatCurrency(selectedPurchase.amount)} to ${selectedPurchase.user.firstName}.\n\n` +
          `Your commission: ${formatCurrency(response.commission)}`,
          [
            {
              text: 'Awesome!',
              onPress: () => fetchPendingRequests(),
            },
          ]
        );
      }, 2500);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  const processRejection = async () => {
    if (!selectedPurchase || !rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      await agentService.rejectCoinPurchase(selectedPurchase.id, rejectReason);

      setShowRejectModal(false);
      setRejectReason('');
      
      Alert.alert('Request Rejected', 'The purchase request has been rejected and coins unlocked.');
      fetchPendingRequests();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject request');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return date.toLocaleString('en-NG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: colors.warning,
          icon: 'pending',
          label: 'Pending',
        };
      case 'ESCROW_LOCKED':
        return {
          color: colors.info,
          icon: 'lock',
          label: 'Awaiting Payment',
        };
      default:
        return {
          color: colors.gray[500],
          icon: 'help',
          label: status,
        };
    }
  };

  const renderRequestCard = ({ item: purchase }: { item: PendingCoinPurchase }) => {
    const statusConfig = getStatusConfig(purchase.status);

    return (
      <View style={styles.requestCard}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
          <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Amount */}
        <Text style={styles.amount}>{formatCurrency(purchase.amount)}</Text>
        <Text style={styles.amountLabel}>User wants to buy</Text>
        
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userInfoRow}>
            <Icon name="person" size={18} color={colors.text.secondary} />
            <Text style={styles.userName}>
              {purchase.user.firstName} {purchase.user.lastName}
            </Text>
          </View>
          <View style={styles.userInfoRow}>
            <Icon name="phone" size={18} color={colors.text.secondary} />
            <Text style={styles.userContact}>{purchase.user.phoneNumber}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Method:</Text>
          <Text style={styles.infoValue}>{purchase.paymentMethod}</Text>
        </View>

        {/* Time */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Requested:</Text>
          <Text style={styles.infoValue}>{formatDate(purchase.createdAt)}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Icon name="info" size={20} color={colors.success} />
          <Text style={styles.instructionText}>
            Your coins are locked in escrow. Confirm when you receive {formatCurrency(purchase.amount)} from the user.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <Button
            label="Call User"
            onPress={() => handleCallUser(purchase.user.phoneNumber)}
            variant="outline"
            icon="phone"
            size="small"
            className="flex-1"
          />
          <Button
            label="Confirm Payment"
            onPress={() => handleConfirmPayment(purchase)}
            variant="primary"
            icon="check-circle"
            size="small"
            className="flex-1"
          />
        </View>
        
        <Button
          label="Payment Not Received"
          onPress={() => handleReject(purchase)}
          variant="ghost"
          size="small"
          className="mt-0"
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="check-circle" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyStateTitle}>No Pending Requests</Text>
      <Text style={styles.emptyStateSubtitle}>
        You don't have any pending coin purchase requests
      </Text>
    </View>
  );

  return (
    <PageTransition type="slideUp">
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Coin Requests</Text>
        <View style={styles.placeholder} />
      </View>

      {/* List */}
      <FlatList
        data={purchases}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={loading ? null : renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Payment Received"
      >
        {selectedPurchase && (
          <View>
            <View style={styles.confirmInfo}>
              <Icon name="check-circle" size={48} color={colors.success} />
              <Text style={styles.confirmAmount}>
                {formatCurrency(selectedPurchase.amount)}
              </Text>
              <Text style={styles.confirmText}>
                Confirm that you have received this amount from{' '}
                <Text style={styles.confirmName}>
                  {selectedPurchase.user.firstName}
                </Text>
              </Text>
            </View>

            <View style={styles.warningCard}>
              <Icon name="warning" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Only confirm if you have actually received the payment. This action cannot be reversed.
              </Text>
            </View>

            <Button
              label="Yes, I Received Payment"
              onPress={processConfirmation}
              loading={confirming}
              variant="primary"
              className="mb-4"
            />
            <Button
              label="Cancel"
              onPress={() => setShowConfirmModal(false)}
              variant="outline"
            />
          </View>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Reject Purchase Request"
      >
        {selectedPurchase && (
          <View>
            <Text style={styles.rejectInfo}>
              Rejecting request from{' '}
              <Text style={styles.confirmName}>{selectedPurchase.user.firstName}</Text>
              {' '}for {formatCurrency(selectedPurchase.amount)}
            </Text>

            <Input
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g., Payment not received after 30 minutes"
              label="Reason for rejection"
              multiline
              numberOfLines={3}
              required
            />

            <Button
              label="Reject Request"
              onPress={processRejection}
              variant="premium"
              className="mt-2 mb-4"
            />
            <Button
              label="Cancel"
              onPress={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
              variant="outline"
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: layout.screenPadding,
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  amount: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  amountLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  userSection: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  userContact: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.success}10`,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.success,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  confirmInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmAmount: {
    ...typography.h1,
    color: colors.success,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  confirmText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  confirmName: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.warning}10`,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    flex: 1,
  },
  rejectInfo: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
});

export default ConfirmCoinPaymentScreen;
lex: 1,
  },
  confirmButton: {
    marginBottom: spacing.sm,
  },
  rejectInfo: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  rejectSubmitButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});

export default ConfirmCoinPaymentScreen;
