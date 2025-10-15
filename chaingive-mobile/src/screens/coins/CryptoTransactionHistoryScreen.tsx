import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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

interface CryptoTransaction {
  id: string;
  type: 'purchase' | 'refund' | 'failed';
  amount: number;
  currency: string;
  coinsReceived: number;
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  gateway: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

const CryptoTransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTransactions: CryptoTransaction[] = [
        {
          id: 'txn_001',
          type: 'purchase',
          amount: 0.001,
          currency: 'BTC',
          coinsReceived: 1250,
          status: 'completed',
          gateway: 'Binance Pay',
          transactionHash: 'a1b2c3d4e5f6...',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'txn_002',
          type: 'purchase',
          amount: 50,
          currency: 'USDT',
          coinsReceived: 2500,
          status: 'completed',
          gateway: 'Coinbase Commerce',
          transactionHash: 'f6e5d4c3b2a1...',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'txn_003',
          type: 'purchase',
          amount: 0.05,
          currency: 'ETH',
          coinsReceived: 1800,
          status: 'pending',
          gateway: 'NOWPayments',
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'txn_004',
          type: 'failed',
          amount: 25,
          currency: 'USDT',
          coinsReceived: 0,
          status: 'failed',
          gateway: 'Stripe Crypto',
          createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      case 'refunded':
        return colors.info;
      default:
        return colors.gray[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'hourglass-empty';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'undo';
      default:
        return 'info';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'shopping-cart';
      case 'refund':
        return 'undo';
      case 'failed':
        return 'error-outline';
      default:
        return 'payment';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.status === filter;
  });

  const renderTransaction = ({ item: transaction }: { item: CryptoTransaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      activeOpacity={0.9}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.typeIcon}>
          <Icon
            name={getTypeIcon(transaction.type) as any}
            size={20}
            color={colors.primary}
          />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>
            {transaction.type === 'purchase' ? 'Coin Purchase' :
             transaction.type === 'refund' ? 'Refund' : 'Failed Transaction'}
          </Text>
          <Text style={styles.transactionGateway}>{transaction.gateway}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Icon
            name={getStatusIcon(transaction.status) as any}
            size={16}
            color={getStatusColor(transaction.status)}
          />
          <Text style={[
            styles.statusText,
            { color: getStatusColor(transaction.status) }
          ]}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount Sent:</Text>
          <Text style={styles.detailValue}>
            {transaction.amount} {transaction.currency}
          </Text>
        </View>

        {transaction.coinsReceived > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Coins Received:</Text>
            <Text style={styles.detailValue}>
              {transaction.coinsReceived.toLocaleString()}
            </Text>
          </View>
        )}

        {transaction.transactionHash && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>TX Hash:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {transaction.transactionHash}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(transaction.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType: 'all' | 'completed' | 'pending' | 'failed', label: string) => (
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
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('completed', 'Completed')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('failed', 'Failed')}
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="receipt" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'all'
                ? 'You haven\'t made any crypto transactions yet.'
                : `No ${filter} transactions found.`
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Summary */}
      {transactions.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Transactions</Text>
            <Text style={styles.summaryValue}>{transactions.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Successful</Text>
            <Text style={styles.summaryValue}>
              {transactions.filter(t => t.status === 'completed').length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Coins</Text>
            <Text style={styles.summaryValue}>
              {transactions
                .filter(t => t.status === 'completed')
                .reduce((sum, t) => sum + t.coinsReceived, 0)
                .toLocaleString()}
            </Text>
          </View>
        </View>
      )}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  transactionsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  transactionGateway: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  transactionDetails: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default CryptoTransactionHistoryScreen;