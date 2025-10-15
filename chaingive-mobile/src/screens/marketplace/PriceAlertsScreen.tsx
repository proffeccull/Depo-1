import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Switch,
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

interface PriceAlert {
  id: string;
  itemName: string;
  category: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  condition: 'below' | 'above' | 'change';
  changePercentage?: number;
}

const PriceAlertsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPriceAlerts();
  }, []);

  const loadPriceAlerts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAlerts: PriceAlert[] = [
        {
          id: 'alert_1',
          itemName: 'iPhone 13 Pro Max',
          category: 'Electronics',
          targetPrice: 80000,
          currentPrice: 85000,
          isActive: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          condition: 'below',
        },
        {
          id: 'alert_2',
          itemName: 'Gaming Laptop',
          category: 'Electronics',
          targetPrice: 150000,
          currentPrice: 165000,
          isActive: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          lastTriggered: new Date(Date.now() - 3600000).toISOString(),
          condition: 'below',
        },
        {
          id: 'alert_3',
          itemName: 'Designer Watch',
          category: 'Fashion',
          targetPrice: 25000,
          currentPrice: 30000,
          isActive: false,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          condition: 'change',
          changePercentage: 10,
        },
        {
          id: 'alert_4',
          itemName: 'Mountain Bike',
          category: 'Sports',
          targetPrice: 45000,
          currentPrice: 40000,
          isActive: true,
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          lastTriggered: new Date(Date.now() - 7200000).toISOString(),
          condition: 'above',
        },
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPriceAlerts();
    setRefreshing(false);
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mock toggle - replace with actual API call
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, isActive }
        : alert
    ));

    Alert.alert(
      'Alert Updated',
      `Price alert has been ${isActive ? 'activated' : 'deactivated'}.`
    );
  };

  const deleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this price alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setAlerts(prev => prev.filter(alert => alert.id !== alertId));
          },
        },
      ]
    );
  };

  const getConditionText = (alert: PriceAlert) => {
    switch (alert.condition) {
      case 'below':
        return `Alert when price goes below ₦${alert.targetPrice.toLocaleString()}`;
      case 'above':
        return `Alert when price goes above ₦${alert.targetPrice.toLocaleString()}`;
      case 'change':
        return `Alert when price changes by ${alert.changePercentage}%`;
      default:
        return 'Unknown condition';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'below':
        return 'trending-down';
      case 'above':
        return 'trending-up';
      case 'change':
        return 'swap-vert';
      default:
        return 'notifications';
    }
  };

  const renderAlert = ({ item: alert }: { item: PriceAlert }) => (
    <View style={[styles.alertCard, !alert.isActive && styles.alertCardInactive]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIcon}>
          <Icon
            name={getConditionIcon(alert.condition) as any}
            size={20}
            color={alert.isActive ? colors.primary : colors.gray[400]}
          />
        </View>

        <View style={styles.alertInfo}>
          <Text style={[styles.itemName, !alert.isActive && styles.itemNameInactive]}>
            {alert.itemName}
          </Text>
          <Text style={styles.category}>{alert.category}</Text>
        </View>

        <View style={styles.alertActions}>
          <Switch
            value={alert.isActive}
            onValueChange={(value) => toggleAlert(alert.id, value)}
            trackColor={{ false: colors.gray[300], true: colors.primary + '50' }}
            thumbColor={alert.isActive ? colors.primary : colors.gray[400]}
          />
        </View>
      </View>

      <Text style={styles.conditionText}>
        {getConditionText(alert)}
      </Text>

      <View style={styles.priceInfo}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <Text style={styles.currentPrice}>₦{alert.currentPrice.toLocaleString()}</Text>
        </View>

        {alert.condition !== 'change' && (
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Target Price</Text>
            <Text style={styles.targetPrice}>₦{alert.targetPrice.toLocaleString()}</Text>
          </View>
        )}

        {alert.changePercentage && (
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Change Threshold</Text>
            <Text style={styles.changePercentage}>{alert.changePercentage}%</Text>
          </View>
        )}
      </View>

      <View style={styles.alertFooter}>
        <View style={styles.alertMeta}>
          <Text style={styles.createdText}>
            Created {new Date(alert.createdAt).toLocaleDateString()}
          </Text>
          {alert.lastTriggered && (
            <Text style={styles.triggeredText}>
              Last triggered {new Date(alert.lastTriggered).toLocaleDateString()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteAlert(alert.id)}
        >
          <Icon name="delete" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading price alerts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeAlerts = alerts.filter(a => a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Alerts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Coming Soon', 'Create new price alert feature coming soon!')}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeAlerts.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{inactiveAlerts.length}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{alerts.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Alerts List */}
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.alertsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Price Alerts</Text>
            <Text style={styles.emptyText}>
              Create price alerts to get notified when items reach your target prices.
            </Text>
            <TouchableOpacity
              style={styles.createAlertButton}
              onPress={() => Alert.alert('Coming Soon', 'Create new price alert feature coming soon!')}
            >
              <Text style={styles.createAlertButtonText}>Create First Alert</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Info Card */}
      {alerts.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How Price Alerts Work</Text>
          <Text style={styles.infoText}>
            • Get notified when item prices meet your conditions{'\n'}
            • Alerts can trigger for price drops, increases, or percentage changes{'\n'}
            • You can activate/deactivate alerts anytime{'\n'}
            • Notifications are sent instantly when conditions are met
          </Text>
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
  addButton: {
    padding: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  alertsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  alertCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  alertCardInactive: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  itemNameInactive: {
    color: colors.gray[500],
  },
  category: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  alertActions: {
    alignItems: 'center',
  },
  conditionText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  currentPrice: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  targetPrice: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  changePercentage: {
    ...typography.h4,
    color: colors.warning,
    fontWeight: 'bold',
    marginTop: 2,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  alertMeta: {
    flex: 1,
  },
  createdText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  triggeredText: {
    ...typography.caption,
    color: colors.success,
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  createAlertButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  createAlertButtonText: {
    ...typography.button,
    color: colors.white,
  },
  infoCard: {
    margin: spacing.md,
    marginTop: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

export default PriceAlertsScreen;