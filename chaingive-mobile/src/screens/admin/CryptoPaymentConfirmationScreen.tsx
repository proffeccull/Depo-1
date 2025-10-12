import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  PageTransition,
  CountUpAnimation,
  PulseRing,
  LottieSuccess,
  ConfettiCelebration,
} from '../../components/animations';
import Button from '../../components/ui/Button';
import Modal from '../../components/common/Modal';
import EnhancedBadge from '../../components/common/EnhancedBadge';
import { CardSkeleton } from '../../components/skeletons';
import { cryptoPaymentService } from '../../services';
import type { CryptoPayment } from '../../services';

const CryptoPaymentConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<CryptoPayment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [confirmations, setConfirmations] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const pendingPayments = await cryptoPaymentService.getPendingPayments();
      setPayments(pendingPayments);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load payments:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handlePaymentPress = (payment: CryptoPayment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPayment(payment);
    setShowConfirmModal(true);
    setTransactionHash(payment.transactionHash || '');
    setConfirmations(payment.confirmations.toString());
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;

    if (!transactionHash.trim()) {
      Alert.alert('Error', 'Please enter transaction hash');
      return;
    }

    try {
      setProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      await cryptoPaymentService.confirmPayment(selectedPayment.id, {
        transactionHash: transactionHash.trim(),
        confirmations: parseInt(confirmations) || 0,
        notes: notes.trim(),
      });

      setProcessing(false);
      setShowConfirmModal(false);
      setSelectedPayment(null);
      setTransactionHash('');
      setConfirmations('');
      setNotes('');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setShowCelebration(false);
      }, 2500);

      Alert.alert('✅ Payment Confirmed', 'Crypto payment confirmed successfully!');
      loadPayments();
    } catch (error) {
      setProcessing(false);
      Alert.alert('Error', 'Failed to confirm payment');
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    Alert.alert(
      'Reject Payment',
      'Are you sure you want to reject this payment? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

              await cryptoPaymentService.rejectPayment(selectedPayment.id, {
                reason: rejectReason.trim(),
              });

              setProcessing(false);
              setShowConfirmModal(false);
              setSelectedPayment(null);
              setRejectReason('');

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Alert.alert('Payment Rejected', 'Payment has been rejected');
              loadPayments();
            } catch (error) {
              setProcessing(false);
              Alert.alert('Error', 'Failed to reject payment');
            }
          },
        },
      ]
    );
  };

  const handleCopyWallet = async (address: string) => {
    await Clipboard.setStringAsync(address);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('✅ Copied', 'Wallet address copied to clipboard');
  };

  const handleOpenBlockExplorer = (payment: CryptoPayment) => {
    const explorerUrls: Record<string, string> = {
      BTC: `https://blockchair.com/bitcoin/transaction/${payment.transactionHash}`,
      ETH: `https://etherscan.io/tx/${payment.transactionHash}`,
      USDT: `https://etherscan.io/tx/${payment.transactionHash}`,
    };

    const url = explorerUrls[payment.coinSymbol] || `https://blockchain.com/search?search=${payment.transactionHash}`;
    Linking.openURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'rejected': return colors.error;
      case 'expired': return colors.gray[500];
      default: return colors.gray[500];
    }
  };

  const getCryptoColor = (symbol: string): string => {
    const colorMap: Record<string, string> = {
      BTC: '#F7931A',
      ETH: '#627EEA',
      USDT: '#26A17B',
      USDC: '#2775CA',
      LTC: '#BEBEBE',
      BCH: '#8DC351',
      XRP: '#23292F',
    };
    return colorMap[symbol] || colors.primary;
  };

  const renderPayment = ({ item: payment }: { item: CryptoPayment }) => {
    const isExpiringSoon = new Date(payment.expiresAt).getTime() - Date.now() < 300000; // 5 minutes

    const PaymentCard = (
      <TouchableOpacity
        style={[styles.paymentCard, shadows.medium]}
        onPress={() => handlePaymentPress(payment)}
      >
        <View style={styles.paymentHeader}>
          <View
            style={[
              styles.cryptoIcon,
              { backgroundColor: `${getCryptoColor(payment.coinSymbol)}20` },
            ]}
          >
            <Icon
              name="currency-bitcoin"
              size={24}
              color={getCryptoColor(payment.coinSymbol)}
            />
            <Text style={styles.cryptoSymbol}>{payment.coinSymbol}</Text>
          </View>
          <EnhancedBadge
            value={payment.status.toUpperCase()}
            color={getStatusColor(payment.status)}
            size="small"
            pulse={payment.status === 'pending'}
          />
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Agent:</Text>
            <Text style={styles.detailValue}>{payment.agentName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Coin Amount:</Text>
            <CountUpAnimation
              value={payment.coinAmount}
              style={styles.detailValue}
              suffix=" coins"
            />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>NGN Amount:</Text>
            <CountUpAnimation
              value={payment.amount}
              style={styles.detailValue}
              prefix="₦"
            />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Crypto Amount:</Text>
            <Text style={styles.detailValue}>{payment.cryptoAmount} {payment.coinSymbol}</Text>
          </View>
        </View>

        <View style={styles.walletContainer}>
          <Text style={styles.walletLabel}>Wallet Address:</Text>
          <View style={styles.walletRow}>
            <Text style={styles.walletAddress} numberOfLines={1}>
              {payment.walletAddress}
            </Text>
            <TouchableOpacity onPress={() => handleCopyWallet(payment.walletAddress)}>
              <Icon name="content-copy" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {payment.transactionHash && (
          <View style={styles.txHashContainer}>
            <Text style={styles.txHashLabel}>TX Hash:</Text>
            <TouchableOpacity
              style={styles.txHashRow}
              onPress={() => handleOpenBlockExplorer(payment)}
            >
              <Text style={styles.txHash} numberOfLines={1}>
                {payment.transactionHash}
              </Text>
              <Icon name="open-in-new" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.paymentFooter}>
          <Text style={styles.paymentTime}>
            {new Date(payment.createdAt).toLocaleString()}
          </Text>
          {isExpiringSoon && payment.status === 'pending' && (
            <EnhancedBadge
              value="Expiring Soon!"
              color={colors.error}
              size="small"
              pulse
            />
          )}
        </View>
      </TouchableOpacity>
    );

    return payment.status === 'pending' ? (
      <PulseRing size="100%" color={colors.warning}>
        {PaymentCard}
      </PulseRing>
    ) : (
      PaymentCard
    );
  };

  return (
    <PageTransition type="slideUp">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crypto Payment Confirmation</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="pending" size={24} color={colors.warning} />
            <CountUpAnimation
              value={payments.filter(p => p.status === 'pending').length}
              style={styles.statValue}
            />
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle" size={24} color={colors.success} />
            <CountUpAnimation
              value={payments.filter(p => p.status === 'confirmed').length}
              style={styles.statValue}
            />
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
        </View>

        {/* Payment List */}
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.id}
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
          ListEmptyComponent={
            loading ? (
              <View>
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} height={200} style={styles.skeletonCard} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="account-balance-wallet" size={64} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No pending payments</Text>
                <Text style={styles.emptyMessage}>
                  Crypto payments will appear here for confirmation
                </Text>
              </View>
            )
          }
        />

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedPayment(null);
          }}
          title="Confirm Crypto Payment"
        >
          {selectedPayment && (
            <View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoLabel}>Agent:</Text>
                <Text style={styles.modalInfoValue}>{selectedPayment.agentName}</Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoLabel}>Crypto:</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedPayment.cryptoAmount} {selectedPayment.coinSymbol}
                </Text>
              </View>
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoLabel}>Coins:</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedPayment.coinAmount} coins
                </Text>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Transaction Hash *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter transaction hash..."
                  value={transactionHash}
                  onChangeText={setTransactionHash}
                  autoCapitalize="none"
                  multiline
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Confirmations</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0"
                  value={confirmations}
                  onChangeText={setConfirmations}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Add any notes..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <Button
                label="Confirm Payment"
                onPress={handleConfirmPayment}
                variant="primary"
                icon="check-circle"
                loading={processing}
                className="mb-4"
              />

              <View style={styles.rejectSection}>
                <Text style={styles.rejectTitle}>Reject Payment</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
                <Button
                  label="Reject Payment"
                  onPress={handleRejectPayment}
                  variant="premium"
                  icon="cancel"
                  loading={processing}
                  className="mb-4"
                />
              </View>
            </View>
          )}
        </Modal>

        {/* Success Animation */}
        {showSuccess && (
          <LottieSuccess size={200} onComplete={() => setShowSuccess(false)} />
        )}

        {/* Celebration */}
        {showCelebration && <ConfettiCelebration />}
      </SafeAreaView>
    </PageTransition>
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
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  listContent: {
    padding: spacing.md,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cryptoIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  cryptoSymbol: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  paymentDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodySmallBold,
    color: colors.text.primary,
  },
  walletContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  walletLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  walletAddress: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontFamily: 'monospace',
    flex: 1,
  },
  txHashContainer: {
    backgroundColor: colors.info + '10',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  txHashLabel: {
    ...typography.caption,
    color: colors.info,
    marginBottom: spacing.xxs,
  },
  txHashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  txHash: {
    ...typography.bodySmall,
    color: colors.info,
    fontFamily: 'monospace',
    flex: 1,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTime: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  skeletonCard: {
    marginBottom: spacing.md,
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalInfoLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  modalInfoValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  modalInputGroup: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  modalInputLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  modalTextArea: {
    minHeight: 80,
  },
  rejectSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  rejectTitle: {
    ...typography.bodyBold,
    color: colors.error,
    marginBottom: spacing.md,
  },
});

export default CryptoPaymentConfirmationScreen;
