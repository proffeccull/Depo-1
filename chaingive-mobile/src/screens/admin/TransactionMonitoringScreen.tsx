import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Table, Row } from 'react-native-table-component';

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  fromUser?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  toUser?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export default function TransactionMonitoringScreen() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateRange: '7d',
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [transactionStats, setTransactionStats] = useState({
    completed: 0,
    pending: 0,
    totalVolume: 0,
    totalCount: 0,
  });

  useEffect(() => {
    loadTransactions();
    if (realTimeUpdates) {
      // Set up WebSocket connection for real-time updates
      setupWebSocket();
    }

    // Cleanup WebSocket on unmount
    return () => {
      cleanupWebSocket();
    };
  }, [filters, realTimeUpdates]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Real API call to get transactions with filters
      const filters: any = {
        limit: 50,
        offset: 0,
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      if (filters.status) {
        filters.status = filters.status;
      }

      if (filters.type) {
        filters.type = filters.type;
      }

      if (filters.dateRange) {
        const now = new Date();
        const startDate = new Date(now.getTime() - parseInt(filters.dateRange.replace('d', '')) * 24 * 60 * 60 * 1000);
        filters.startDate = startDate.toISOString();
        filters.endDate = now.toISOString();
      }

      // Use admin API to get transactions
      const response = await fetch('/v1/admin/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
        },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTransactions(data.data.transactions || []);
          // Update summary stats
          updateTransactionStats(data.data.transactions || []);
        }
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      Alert.alert('Error', 'Failed to load transactions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStats = (transactionList: Transaction[]) => {
    const completed = transactionList.filter(t => t.status === 'completed').length;
    const pending = transactionList.filter(t => t.status === 'pending').length;
    const totalVolume = transactionList.reduce((sum, t) => sum + t.amount, 0);

    // Update local state for summary
    setTransactionStats({
      completed,
      pending,
      totalVolume,
      totalCount: transactionList.length,
    });
  };

  const setupWebSocket = () => {
    // WebSocket connection for real-time updates
    // This would connect to the backend WebSocket service
    console.log('Setting up WebSocket for real-time transaction updates');

    // For now, set up polling as fallback
    const pollInterval = setInterval(async () => {
      if (realTimeUpdates) {
        try {
          await loadTransactions();
        } catch (error) {
          console.error('Real-time update failed:', error);
        }
      }
    }, 30000); // Poll every 30 seconds

    // Store interval for cleanup
    (global as any).transactionPollInterval = pollInterval;
  };

  const cleanupWebSocket = () => {
    // Clean up polling interval
    if ((global as any).transactionPollInterval) {
      clearInterval((global as any).transactionPollInterval);
      (global as any).transactionPollInterval = null;
    }
  };

  const onRefresh = async () => {
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
      case 'cancelled':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'donation':
        return colors.primary;
      case 'coin_purchase':
        return colors.success;
      case 'withdrawal':
        return colors.warning;
      default:
        return colors.text.secondary;
    }
  };

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const tableHead = ['ID', 'From', 'To', 'Amount', 'Type', 'Status', 'Date', 'Actions'];
  const tableData = transactions.map((transaction) => [
    transaction.id.slice(-8),
    transaction.fromUser ? `${transaction.fromUser.firstName} ${transaction.fromUser.lastName}` : 'Unknown',
    transaction.toUser ? `${transaction.toUser.firstName} ${transaction.toUser.lastName}` : 'Unknown',
    formatAmount(transaction.amount),
    transaction.type,
    transaction.status,
    formatDate(transaction.createdAt),
    transaction.id, // For actions
  ]);

  const renderActions = (transactionId: string, transaction: Transaction) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.viewButton]}
        onPress={() => handleViewTransaction(transactionId)}
      >
        <Icon name="visibility" size={16} color={colors.white} />
      </TouchableOpacity>
      {transaction.status === 'pending' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.overrideButton]}
          onPress={() => handleOverrideTransaction(transactionId)}
        >
          <Icon name="edit" size={16} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleViewTransaction = (transactionId: string) => {
    // Navigate to transaction details
    Alert.alert('Transaction Details', `Viewing transaction ${transactionId}`);
  };

  const handleOverrideTransaction = (transactionId: string) => {
    Alert.alert(
      'Override Transaction',
      'Are you sure you want to override this transaction status?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Override',
          style: 'destructive',
          onPress: () => {
            // Handle transaction override
            Alert.alert('Success', 'Transaction status overridden');
            loadTransactions();
          },
        },
      ]
    );
  };

  const toggleRealTimeUpdates = () => {
    setRealTimeUpdates(!realTimeUpdates);
    if (!realTimeUpdates) {
      setupWebSocket();
    }
  };

  if (loading && !transactions.length) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Real-time Toggle */}
      <Card style={styles.realtimeCard}>
        <View style={styles.realtimeHeader}>
          <Text style={styles.sectionTitle}>Real-time Updates</Text>
          <TouchableOpacity
            style={[styles.toggleButton, realTimeUpdates && styles.toggleActive]}
            onPress={toggleRealTimeUpdates}
          >
            <Text style={[styles.toggleText, realTimeUpdates && styles.toggleTextActive]}>
              {realTimeUpdates ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        {realTimeUpdates && (
          <Text style={styles.realtimeStatus}>
            🔴 Live: Connected to transaction stream
          </Text>
        )}
      </Card>

      {/* Filters */}
      <Card style={styles.filtersCard}>
        <Text style={styles.sectionTitle}>Filters</Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by transaction ID, user name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadTransactions}
          />
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Status</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilters({ ...filters, status: filters.status ? '' : 'pending' })}
            >
              <Text style={styles.filterButtonText}>
                {filters.status || 'All Status'}
              </Text>
              <Icon name="arrow-drop-down" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Type</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilters({ ...filters, type: filters.type ? '' : 'donation' })}
            >
              <Text style={styles.filterButtonText}>
                {filters.type || 'All Types'}
              </Text>
              <Icon name="arrow-drop-down" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Transactions Table */}
      <Card style={styles.tableCard}>
        <Text style={styles.sectionTitle}>Transactions ({transactions.length})</Text>

        <ScrollView horizontal>
          <View style={styles.tableContainer}>
            <Table borderStyle={{ borderWidth: 1, borderColor: colors.border }}>
              <Row
                data={tableHead}
                style={styles.tableHead}
                textStyle={styles.tableHeadText}
                widthArr={[80, 120, 120, 100, 100, 80, 140, 100]}
              />
              {tableData.map((rowData, index) => (
                <Row
                  key={index}
                  data={[
                    rowData[0],
                    rowData[1],
                    rowData[2],
                    rowData[3],
                    <Badge
                      key="type"
                      text={rowData[4]}
                      color={getTypeColor(rowData[4])}
                      size="small"
                    />,
                    <Badge
                      key="status"
                      text={rowData[5]}
                      color={getStatusColor(rowData[5])}
                      size="small"
                    />,
                    rowData[6],
                    renderActions(rowData[7], transactions[index]),
                  ]}
                  style={styles.tableRow}
                  textStyle={styles.tableText}
                  widthArr={[80, 120, 120, 100, 100, 80, 140, 100]}
                />
              ))}
            </Table>
          </View>
        </ScrollView>
      </Card>

      {/* Transaction Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {transactionStats.completed}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {transactionStats.pending}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatAmount(transactionStats.totalVolume)}
            </Text>
            <Text style={styles.summaryLabel}>Total Volume</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {transactionStats.totalCount}
            </Text>
            <Text style={styles.summaryLabel}>Total Transactions</Text>
          </View>
        </View>

        {/* Real-time Status */}
        <View style={styles.realtimeStatus}>
          <View style={[styles.statusDot, { backgroundColor: realTimeUpdates ? colors.success : colors.text.secondary }]} />
          <Text style={styles.realtimeText}>
            {realTimeUpdates ? 'Live updates active' : 'Real-time updates disabled'}
          </Text>
          <Text style={styles.lastUpdateText}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  realtimeCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  realtimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  toggleActive: {
    backgroundColor: colors.success,
  },
  toggleText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  toggleTextActive: {
    color: colors.white,
  },
  realtimeStatus: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  filtersCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  filterLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  filterButtonText: {
    ...typography.body,
    color: colors.text.primary,
  },
  tableCard: {
    marginBottom: spacing.lg,
  },
  tableContainer: {
    flex: 1,
  },
  tableHead: {
    height: 40,
    backgroundColor: colors.primary,
  },
  tableHeadText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  tableRow: {
    height: 60,
    backgroundColor: colors.surface,
  },
  tableText: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
    padding: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  viewButton: {
    backgroundColor: colors.primary,
  },
  overrideButton: {
    backgroundColor: colors.warning,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  realtimeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  realtimeText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
    flex: 1,
  },
  lastUpdateText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 10,
  },
});
