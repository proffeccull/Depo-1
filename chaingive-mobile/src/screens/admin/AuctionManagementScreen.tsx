import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { toggleAuctions } from '../../store/slices/marketplaceSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { showToast } from '../../components/common/Toast';

const AuctionManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { auctionsEnabled, auctions, loading } = useSelector(
    (state: RootState) => state.marketplace
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [localAuctionsEnabled, setLocalAuctionsEnabled] = useState(auctionsEnabled);

  useEffect(() => {
    setLocalAuctionsEnabled(auctionsEnabled);
  }, [auctionsEnabled]);

  const handleToggleAuctions = async (enabled: boolean) => {
    Alert.alert(
      enabled ? 'Enable Auction House' : 'Disable Auction House',
      enabled
        ? 'This will allow users to create and participate in auctions. Are you sure?'
        : 'This will stop all active auctions and prevent new ones from being created. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: enabled ? 'Enable' : 'Disable',
          style: enabled ? 'default' : 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await dispatch(toggleAuctions({
                enabled,
                adminId: user?.id || '',
              })).unwrap();

              showToast(
                `Auction House ${enabled ? 'enabled' : 'disabled'} successfully`,
                'success'
              );
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              showToast(error.message || 'Failed to update auction settings', 'error');
            }
          },
        },
      ]
    );
  };

  const getAuctionStats = () => {
    const active = auctions.filter(a => a.status === 'active').length;
    const upcoming = auctions.filter(a => a.status === 'upcoming').length;
    const ended = auctions.filter(a => a.status === 'ended').length;
    const totalValue = auctions.reduce((sum, a) => sum + a.currentBid, 0);

    return { active, upcoming, ended, totalValue };
  };

  const stats = getAuctionStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auction Management</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Auction House Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleHeader}>
            <View>
              <Text style={styles.toggleTitle}>Auction House</Text>
              <Text style={styles.toggleDescription}>
                Enable or disable the auction system for all users
              </Text>
            </View>
            <Switch
              value={localAuctionsEnabled}
              onValueChange={(value) => {
                setLocalAuctionsEnabled(value);
                handleToggleAuctions(value);
              }}
              trackColor={{ false: colors.gray[300], true: colors.success }}
              thumbColor={localAuctionsEnabled ? colors.white : colors.gray[400]}
            />
          </View>

          <View style={[
            styles.statusIndicator,
            localAuctionsEnabled ? styles.statusEnabled : styles.statusDisabled,
          ]}>
            <Icon
              name={localAuctionsEnabled ? "check-circle" : "cancel"}
              size={16}
              color={colors.white}
            />
            <Text style={styles.statusText}>
              {localAuctionsEnabled ? 'Auction House is ENABLED' : 'Auction House is DISABLED'}
            </Text>
          </View>
        </View>

        {/* Auction Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Auction Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="gavel" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active Auctions</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="schedule" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{stats.upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="check-circle" size={24} color={colors.success} />
              <Text style={styles.statValue}>{stats.ended}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="attach-money" size={24} color={colors.tertiary} />
              <Text style={styles.statValue}>
                ₦{stats.totalValue.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AuctionModeration' as never)}
            >
              <Icon name="admin-panel-settings" size={24} color={colors.primary} />
              <Text style={styles.actionTitle}>Moderate Auctions</Text>
              <Text style={styles.actionDescription}>
                Review and manage auction listings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AuctionAnalytics' as never)}
            >
              <Icon name="analytics" size={24} color={colors.secondary} />
              <Text style={styles.actionTitle}>View Analytics</Text>
              <Text style={styles.actionDescription}>
                Auction performance and user activity
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AuctionSettings' as never)}
            >
              <Icon name="settings" size={24} color={colors.tertiary} />
              <Text style={styles.actionTitle}>Auction Settings</Text>
              <Text style={styles.actionDescription}>
                Configure fees, limits, and rules
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('DisputeResolution' as never)}
            >
              <Icon name="gavel" size={24} color={colors.error} />
              <Text style={styles.actionTitle}>Dispute Resolution</Text>
              <Text style={styles.actionDescription}>
                Handle auction disputes and refunds
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Auctions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Auctions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllAuctions' as never)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {auctions.slice(0, 3).map((auction) => (
            <TouchableOpacity
              key={auction.id}
              style={styles.auctionItem}
              onPress={() => navigation.navigate('AuctionDetail' as never, {
                auctionId: auction.id,
                adminView: true
              })}
            >
              <View style={styles.auctionInfo}>
                <Text style={styles.auctionName} numberOfLines={1}>
                  {auction.item.name}
                </Text>
                <Text style={styles.auctionDetails}>
                  Current: ₦{auction.currentBid.toLocaleString()} • {auction.totalBids} bids
                </Text>
              </View>
              <View style={[
                styles.auctionStatus,
                auction.status === 'active' && styles.statusActive,
                auction.status === 'upcoming' && styles.statusUpcoming,
                auction.status === 'ended' && styles.statusEnded,
              ]}>
                <Text style={styles.auctionStatusText}>
                  {auction.status.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {auctions.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="gavel" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No Auctions Yet</Text>
              <Text style={styles.emptyMessage}>
                Auctions will appear here once users start creating them.
              </Text>
            </View>
          )}
        </View>

        {/* System Health */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>System Health</Text>

          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <View style={styles.healthIndicator}>
                <Icon name="check-circle" size={20} color={colors.success} />
                <Text style={styles.healthLabel}>API Status</Text>
              </View>
              <Text style={styles.healthValue}>Operational</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.healthIndicator}>
                <Icon name="schedule" size={20} color={colors.warning} />
                <Text style={styles.healthLabel}>Last Backup</Text>
              </View>
              <Text style={styles.healthValue}>2 hours ago</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.healthIndicator}>
                <Icon name="people" size={20} color={colors.primary} />
                <Text style={styles.healthLabel}>Active Users</Text>
              </View>
              <Text style={styles.healthValue}>1,247</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.healthIndicator}>
                <Icon name="attach-money" size={20} color={colors.tertiary} />
                <Text style={styles.healthLabel}>Revenue Today</Text>
              </View>
              <Text style={styles.healthValue}>₦45,230</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  toggleSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  toggleTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  toggleDescription: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.sm,
  },
  statusEnabled: {
    backgroundColor: colors.success,
  },
  statusDisabled: {
    backgroundColor: colors.error,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  statsSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionsSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    gap: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
  },
  actionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  actionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  recentSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  auctionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  auctionInfo: {
    flex: 1,
  },
  auctionName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  auctionDetails: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  auctionStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: colors.error + '20',
  },
  statusUpcoming: {
    backgroundColor: colors.warning + '20',
  },
  statusEnded: {
    backgroundColor: colors.gray[200],
  },
  auctionStatusText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  healthSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
  },
  healthGrid: {
    gap: spacing.md,
  },
  healthCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 8,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  healthLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  healthValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
});

export default AuctionManagementScreen;