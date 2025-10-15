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
import { toggleBlockchainFeatures } from '../../store/slices/nftSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const NFTManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { blockchainEnabled, collections, achievements } = useSelector(
    (state: RootState) => state.nft
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [localBlockchainEnabled, setLocalBlockchainEnabled] = useState(blockchainEnabled);

  useEffect(() => {
    setLocalBlockchainEnabled(blockchainEnabled);
  }, [blockchainEnabled]);

  const handleToggleBlockchain = async (enabled: boolean) => {
    Alert.alert(
      enabled ? 'Enable NFT Features' : 'Disable NFT Features',
      enabled
        ? 'This will allow users to mint and trade NFT achievements. Are you sure?'
        : 'This will disable all NFT minting and trading features. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: enabled ? 'Enable' : 'Disable',
          style: enabled ? 'default' : 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await dispatch(toggleBlockchainFeatures({
                enabled,
                adminId: user?.id || '',
              })).unwrap();

              showToast(
                `NFT features ${enabled ? 'enabled' : 'disabled'} successfully`,
                'success'
              );
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              showToast(error.message || 'Failed to update NFT settings', 'error');
            }
          },
        },
      ]
    );
  };

  const getNFTStats = () => {
    const totalMinted = achievements.length;
    const totalCollections = collections.length;
    const listedNFTs = achievements.filter(nft => nft.isListed).length;
    const totalVolume = achievements.reduce((sum, nft) => sum + (nft.listingPrice || 0), 0);

    return { totalMinted, totalCollections, listedNFTs, totalVolume };
  };

  const stats = getNFTStats();

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
          <Text style={styles.headerTitle}>NFT Management</Text>
          <View style={styles.placeholder} />
        </View>

        {/* NFT Features Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleHeader}>
            <View>
              <Text style={styles.toggleTitle}>NFT Features</Text>
              <Text style={styles.toggleDescription}>
                Enable or disable NFT minting and trading for all users
              </Text>
            </View>
            <Switch
              value={localBlockchainEnabled}
              onValueChange={(value) => {
                setLocalBlockchainEnabled(value);
                handleToggleBlockchain(value);
              }}
              trackColor={{ false: colors.gray[300], true: colors.success }}
              thumbColor={localBlockchainEnabled ? colors.white : colors.gray[400]}
            />
          </View>

          <View style={[
            styles.statusIndicator,
            localBlockchainEnabled ? styles.statusEnabled : styles.statusDisabled,
          ]}>
            <Icon
              name={localBlockchainEnabled ? "check-circle" : "cancel"}
              size={16}
              color={colors.white}
            />
            <Text style={styles.statusText}>
              {localBlockchainEnabled ? 'NFT Features are ENABLED' : 'NFT Features are DISABLED'}
            </Text>
          </View>
        </View>

        {/* NFT Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>NFT Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="token" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{stats.totalMinted}</Text>
              <Text style={styles.statLabel}>NFTs Minted</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="collections" size={24} color={colors.secondary} />
              <Text style={styles.statValue}>{stats.totalCollections}</Text>
              <Text style={styles.statLabel}>Collections</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="sell" size={24} color={colors.tertiary} />
              <Text style={styles.statValue}>{stats.listedNFTs}</Text>
              <Text style={styles.statLabel}>Listed for Sale</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="attach-money" size={24} color={colors.success} />
              <Text style={styles.statValue}>
                ₦{stats.totalVolume.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('NFTModeration' as never)}
            >
              <Icon name="admin-panel-settings" size={24} color={colors.primary} />
              <Text style={styles.actionTitle}>Moderate NFTs</Text>
              <Text style={styles.actionDescription}>
                Review and manage NFT listings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('NFTAnalytics' as never)}
            >
              <Icon name="analytics" size={24} color={colors.secondary} />
              <Text style={styles.actionTitle}>View Analytics</Text>
              <Text style={styles.actionDescription}>
                NFT marketplace performance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('NFTSettings' as never)}
            >
              <Icon name="settings" size={24} color={colors.tertiary} />
              <Text style={styles.actionTitle}>NFT Settings</Text>
              <Text style={styles.actionDescription}>
                Configure fees, limits, and policies
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('NFTDisputes' as never)}
            >
              <Icon name="gavel" size={24} color={colors.error} />
              <Text style={styles.actionTitle}>Handle Disputes</Text>
              <Text style={styles.actionDescription}>
                Resolve NFT trading disputes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Blockchain Networks */}
        <View style={styles.networksSection}>
          <Text style={styles.sectionTitle}>Supported Networks</Text>

          <View style={styles.networksGrid}>
            <View style={styles.networkCard}>
              <View style={[styles.networkIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.networkSymbol, { color: colors.primary }]}>MATIC</Text>
              </View>
              <Text style={styles.networkName}>Polygon</Text>
              <Text style={styles.networkStatus}>Active</Text>
            </View>

            <View style={styles.networkCard}>
              <View style={[styles.networkIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Text style={[styles.networkSymbol, { color: colors.secondary }]}>ETH</Text>
              </View>
              <Text style={styles.networkName}>Ethereum</Text>
              <Text style={styles.networkStatus}>Active</Text>
            </View>

            <View style={styles.networkCard}>
              <View style={[styles.networkIcon, { backgroundColor: colors.tertiary + '20' }]}>
                <Text style={[styles.networkSymbol, { color: colors.tertiary }]}>BNB</Text>
              </View>
              <Text style={styles.networkName}>BSC</Text>
              <Text style={styles.networkStatus}>Active</Text>
            </View>
          </View>
        </View>

        {/* Recent NFTs */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent NFTs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllNFTs' as never)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {achievements.slice(0, 3).map((nft) => (
            <TouchableOpacity
              key={nft.id}
              style={styles.nftItem}
              onPress={() => navigation.navigate('NFTDetail' as never, {
                nftId: nft.id,
                adminView: true
              })}
            >
              <View style={styles.nftInfo}>
                <Text style={styles.nftName} numberOfLines={1}>
                  {nft.name}
                </Text>
                <Text style={styles.nftDetails}>
                  {nft.collection} • {nft.rarity} • {nft.blockchain.toUpperCase()}
                </Text>
              </View>
              <View style={[
                styles.nftStatus,
                nft.isListed && styles.statusListed,
              ]}>
                <Text style={styles.nftStatusText}>
                  {nft.isListed ? 'LISTED' : 'OWNED'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {achievements.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="token" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No NFTs Yet</Text>
              <Text style={styles.emptyMessage}>
                NFTs will appear here once users start minting achievements.
              </Text>
            </View>
          )}
        </View>

        {/* System Health */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>Blockchain Health</Text>

          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <View style={styles.healthIndicator}>
                <Icon name="link" size={20} color={colors.success} />
                <Text style={styles.healthLabel}>Polygon RPC</Text>
              </View>
              <Text style={styles.healthValue}>Healthy</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.healthIndicator}>
                <Icon name="schedule" size={20} color={colors.warning} />
                <Text style={styles.healthLabel}>Avg Mint Time</Text>
              </View>
              <Text style={styles.healthValue}>45s</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.healthIndicator}>
                <Icon name="gas-meter" size={20} color={colors.primary} />
                <Text style={styles.healthLabel}>Gas Price</Text>
              </View>
              <Text style={styles.healthValue}>25 gwei</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.healthIndicator}>
                <Icon name="security" size={20} color={colors.success} />
                <Text style={styles.healthLabel}>Security</Text>
              </View>
              <Text style={styles.healthValue}>Secure</Text>
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
    color: colors.primary,
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
  networksSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  networksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  networkCard: {
    alignItems: 'center',
  },
  networkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  networkSymbol: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  networkName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  networkStatus: {
    ...typography.caption,
    color: colors.success,
    fontWeight: 'bold',
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
  nftItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  nftInfo: {
    flex: 1,
  },
  nftName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  nftDetails: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  nftStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusListed: {
    backgroundColor: colors.tertiary + '20',
  },
  nftStatusText: {
    ...typography.caption,
    fontWeight: 'bold',
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

export default NFTManagementScreen;