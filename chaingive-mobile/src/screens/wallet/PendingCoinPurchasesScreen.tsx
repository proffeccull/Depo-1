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

import { walletService, AgentCoinPurchase } from '../../services/walletService';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const PendingCoinPurchasesScreen: React.FC = () => {
  const navigation = useNavigation();

  const [purchases, setPurchases] = useState<AgentCoinPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingPurchases();
  }, []);

  const fetchPendingPurchases = async () => {
    try {
      setLoading(true);
      const response = await walletService.getPendingAgentPurchases();
      setPurchases(response.purchases);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load pending purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingPurchases();
    setRefreshing(false);
  };

  const handleCallAgent = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleCancel = (purchase: AgentCoinPurchase) => {
    Alert.alert(
      'Cancel Purchase?',
      `Are you sure you want to cancel this coin purchase request?\n\nThe agent's coins will be released from escrow.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await walletService.cancelAgentPurchase(purchase.id);
              Alert.alert('Success', 'Purchase request cancelled');
              fetchPendingPurchases();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel');
            }
          },
        },
      ]
    );
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
    return date.toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: colors.warning,
          icon: 'pending',
          label: 'Waiting for Escrow',
        };
      case 'ESCROW_LOCKED':
        return {
          color: colors.info,
          icon: 'lock',
          label: 'Escrow Locked - Send Payment',
        };
      case 'COMPLETED':
        return {
          color: colors.success,
          icon: 'check-circle',
          label: 'Completed',
        };
      case 'CANCELLED':
        return {
          color: colors.error,
          icon: 'cancel',
          label: 'Cancelled',
        };
      default:
        return {
          color: colors.gray[500],
          icon: 'help',
          label: status,
        };
    }
  };

  const renderPurchaseCard = ({ item: purchase }: { item: AgentCoinPurchase }) => {
    const statusConfig = getStatusConfig(purchase.status);
    const isActive = purchase.status === 'ESCROW_LOCKED' || purchase.status === 'PENDING';

    return (
      <View style={styles.purchaseCard}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
          <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Amount */}
        <Text style={styles.purchaseAmount}>{formatCurrency(purchase.amount)}</Text>
        
        {/* Agent Info */}
        {purchase.agent && (
          <View style={styles.agentSection}>
            <View style={styles.agentInfoRow}>
              <Icon name="person" size={18} color={colors.text.secondary} />
              <Text style={styles.agentName}>
                {purchase.agent.firstName} {purchase.agent.lastName}
              </Text>
            </View>
            <View style={styles.agentInfoRow}>
              <Icon name="phone" size={18} color={colors.text.secondary} />
              <Text style={styles.agentContact}>{purchase.agent.phoneNumber}</Text>
            </View>
            <View style={styles.agentInfoRow}>
              <Icon name="location-on" size={18} color={colors.text.secondary} />
              <Text style={styles.agentContact}>{purchase.agent.location}</Text>
            </View>
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Method:</Text>
          <Text style={styles.infoValue}>{purchase.paymentMethod}</Text>
        </View>

        {/* Created Date */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Requested:</Text>
          <Text style={styles.infoValue}>{formatDate(purchase.createdAt)}</Text>
        </View>

        {/* Instructions for ESCROW_LOCKED */}
        {purchase.status === 'ESCROW_LOCKED' && (
          <View style={styles.instructionCard}>
            <Icon name="info" size={20} color={colors.info} />
            <Text style={styles.instructionText}>
              Agent's coins are locked. Send {formatCurrency(purchase.amount)} to the agent.
              Agent will confirm and release coins to you.
            </Text>
          </View>
        )}

        {/* Actions */}
        {isActive && purchase.agent && (
          <View style={styles.actionButtons}>
            <Button
              title="Call Agent"
              onPress={() => handleCallAgent(purchase.agent!.phoneNumber)}
              variant="secondary"
              icon="phone"
              size="small"
              style={styles.actionButton}
            />
            {purchase.status !== 'COMPLETED' && (
              <Button
                title="Cancel"
                onPress={() => handleCancel(purchase)}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="shopping-bag" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyStateTitle}>No Pending Purchases</Text>
      <Text style={styles.emptyStateSubtitle}>
        You don't have any pending coin purchases
      </Text>
      <Button
        title="Buy Coins"
        onPress={() => navigation.goBack()}
        icon="add-circle"
        style={styles.buyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Purchases</Text>
        <View style={styles.placeholder} />
      </View>

      {/* List */}
      <FlatList
        data={purchases}
        renderItem={renderPurchaseCard}
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
  purchaseCard: {
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
  purchaseAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  agentSection: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  agentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  agentName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  agentContact: {
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
    backgroundColor: `${colors.info}10`,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.info,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    marginBottom: spacing.lg,
  },
  buyButton: {
    minWidth: 150,
  },
});

export default PendingCoinPurchasesScreen;
