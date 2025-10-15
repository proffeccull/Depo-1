import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchTransactionHistory, exportTransactionHistory } from '../../store/slices/analyticsSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { transactionHistory, loading } = useSelector((state: RootState) => state.analytics);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'donations' | 'purchases' | 'rewards'>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTransactionHistory({ userId: user.id, filter: selectedFilter }));
    }
  }, [dispatch, user?.id, selectedFilter]);

  const filteredTransactions = transactionHistory.filter(transaction => {
    if (selectedFilter === 'all') return true;
    return transaction.type === selectedFilter;
  });

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await dispatch(fetchTransactionHistory({ userId: user.id, filter: selectedFilter }));
      setRefreshing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!user?.id) return;

    setExporting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(exportTransactionHistory({
        userId: user.id,
        format,
        filter: selectedFilter,
      })).unwrap();

      showToast(`${format.toUpperCase()} exported successfully!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'donation': return 'favorite';
      case 'purchase': return 'shopping-cart';
      case 'reward': return 'emoji-events';
      case 'refund': return 'undo';
      default: return 'swap-horiz';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'donation': return colors.primary;
      case 'purchase': return colors.secondary;
      case 'reward': return colors.tertiary;
      case 'refund': return colors.success;
      default: return colors.info;
    }
  };

  const getAmountColor = (type: string, amount: number) => {
    if (type === 'refund' || type === 'reward') return colors.success;
    if (amount < 0) return colors.error;
    return colors.text.primary;
  };

  const renderTransaction = ({ item: transaction }: { item: any }) => (
    <View style={styles.transactionItem}>
      {/* Icon */}
      <View style={[styles.transactionIcon, {
        backgroundColor: getTransactionColor(transaction.type) + '20'
      }]}>
        <Icon
          name={getTransactionIcon(transaction.type)}
          size={20}
          color={getTransactionColor(transaction.type)}
        />
      </View>

      {/* Content */}
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionDescription}>
          {transaction.description}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(transaction.timestamp).toLocaleDateString()} at{' '}
          {new Date(transaction.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: getAmountColor(transaction.type, transaction.amount) }
        ]}>
          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
        </Text>
        {transaction.coins && (
          <Text style={styles.coinsText}>
            {transaction.coins > 0 ? '+' : ''}{transaction.coins} coins
          </Text>
        )}
      </View>
    </View>
  );

  const getFilterStats = () => {
    const all = transactionHistory.length;
    const donations = transactionHistory.filter(t => t.type === 'donations').length;
    const purchases = transactionHistory.filter(t => t.type === 'purchases').length;
    const rewards = transactionHistory.filter(t => t.type === 'rewards').length;

    return { all, donations, purchases, rewards };
  };

  const stats = getFilterStats();

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
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExport('pdf')}
            disabled={exporting}
          >
            <Icon name="picture-as-pdf" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExport('csv')}
            disabled={exporting}
          >
            <Icon name="table-chart" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All', count: stats.all },
          { key: 'donations', label: 'Donations', count: stats.donations },
          { key: 'purchases', label: 'Purchases', count: stats.purchases },
          { key: 'rewards', label: 'Rewards', count: stats.rewards },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.filterTabSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedFilter(filter.key as any);
            }}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.key && styles.filterTabTextSelected,
            ]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Transactions</Text>
          <Text style={styles.summaryValue}>{filteredTransactions.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Coins Earned</Text>
          <Text style={styles.summaryValue}>
            {filteredTransactions.reduce((sum, t) => sum + (t.coins || 0), 0)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="receipt" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Transactions</Text>
          <Text style={styles.emptyMessage}>
            {selectedFilter === 'all'
              ? 'Your transaction history will appear here.'
              : `No ${selectedFilter} transactions found.`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transactionsList}
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
      )}
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exportButton: {
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 8,
    ...shadows.small,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  filterTabSelected: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTabTextSelected: {
    color: colors.white,
  },
  summaryCards: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
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
  transactionsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  transactionDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  coinsText: {
    ...typography.caption,
    color: colors.tertiary,
    marginTop: spacing.xxs,
  },
});

export default TransactionHistoryScreen;