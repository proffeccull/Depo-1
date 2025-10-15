import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface PaymentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  timestamp: string;
  description: string;
}

const PaymentProcessingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTransactions: PaymentTransaction[] = [
        {
          id: 'txn_001',
          orderId: 'ORD-2024-001',
          customerName: 'John Doe',
          amount: 125.50,
          currency: 'NGN',
          status: 'completed',
          paymentMethod: 'Card Payment',
          timestamp: '2024-01-15 14:30',
          description: 'Charity T-Shirt Purchase',
        },
        {
          id: 'txn_002',
          orderId: 'ORD-2024-002',
          customerName: 'Jane Smith',
          amount: 89.99,
          currency: 'NGN',
          status: 'processing',
          paymentMethod: 'Bank Transfer',
          timestamp: '2024-01-15 13:45',
          description: 'Donation Mug Set',
        },
        {
          id: 'txn_003',
          orderId: 'ORD-2024-003',
          customerName: 'Bob Johnson',
          amount: 250.00,
          currency: 'NGN',
          status: 'pending',
          paymentMethod: 'Crypto Payment',
          timestamp: '2024-01-15 12:20',
          description: 'Bulk Fundraising Items',
        },
        {
          id: 'txn_004',
          orderId: 'ORD-2024-004',
          customerName: 'Alice Brown',
          amount: 45.75,
          currency: 'NGN',
          status: 'failed',
          paymentMethod: 'Card Payment',
          timestamp: '2024-01-15 11:10',
          description: 'Calendar Purchase',
        },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (transaction: PaymentTransaction) => {
    if (transaction.status !== 'pending') return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Implement payment processing API call
      Alert.alert('Processing', `Processing payment for ${transaction.customerName}`);

      // Simulate processing
      setTimeout(() => {
        setTransactions(prev =>
          prev.map(t =>
            t.id === transaction.id ? { ...t, status: 'processing' } : t
          )
        );
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  const handleRefundPayment = async (transaction: PaymentTransaction) => {
    if (transaction.status !== 'completed') {
      Alert.alert('Error', 'Only completed transactions can be refunded');
      return;
    }

    Alert.alert(
      'Confirm Refund',
      `Are you sure you want to refund ₦${transaction.amount} to ${transaction.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement refund API call
              setTransactions(prev =>
                prev.map(t =>
                  t.id === transaction.id ? { ...t, status: 'refunded' } : t
                )
              );
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'Refund processed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to process refund');
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (transaction: PaymentTransaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to transaction details screen
    Alert.alert('Transaction Details', `Order: ${transaction.orderId}\nAmount: ₦${transaction.amount}`);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.status === filter;
  });

  const getStatusColor = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'processing': return colors.warning;
      case 'pending': return colors.primary;
      case 'failed': return colors.error;
      case 'refunded': return colors.gray[500];
      default: return colors.gray[400];
    }
  };

  const renderTransaction = ({ item: transaction }: { item: PaymentTransaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => handleViewDetails(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.customerName}>{transaction.customerName}</Text>
          <Text style={styles.orderId}>{transaction.orderId}</Text>
        </View>
        <View style={styles.transactionActions}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{transaction.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{transaction.description}</Text>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>₦{transaction.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{transaction.timestamp}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {transaction.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.processButton]}
            onPress={() => handleProcessPayment(transaction)}
          >
            <Icon name="play-arrow" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Process</Text>
          </TouchableOpacity>
        )}
        {transaction.status === 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.refundButton]}
            onPress={() => handleRefundPayment(transaction)}
          >
            <Icon name="undo" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Refund</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => handleViewDetails(transaction)}
        >
          <Icon name="visibility" size={16} color={colors.primary} />
          <Text style={[styles.actionButtonText, styles.detailsButtonText]}>Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterButtonText, filter === filterType && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Processing</Text>
        <TouchableOpacity>
          <Icon name="filter-list" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('processing', 'Processing')}
        {renderFilterButton('completed', 'Completed')}
        {renderFilterButton('failed', 'Failed')}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.transactionsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="payment" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyStateText}>No transactions found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {filter === 'all' ? 'Transactions will appear here' : `No ${filter} transactions`}
                </Text>
              </View>
            }
          />
        )}
      </View>
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    backgroundColor: colors.gray[100],
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
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  transactionsList: {
    padding: spacing.md,
  },
  transactionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  transactionInfo: {
    flex: 1,
  },
  customerName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  orderId: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  transactionActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  description: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  transactionDetails: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  processButton: {
    backgroundColor: colors.primary,
  },
  refundButton: {
    backgroundColor: colors.error,
  },
  detailsButton: {
    backgroundColor: colors.gray[100],
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.white,
    marginLeft: spacing.xxs,
    fontWeight: '500',
  },
  detailsButtonText: {
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    ...typography.bodyRegular,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default PaymentProcessingScreen;