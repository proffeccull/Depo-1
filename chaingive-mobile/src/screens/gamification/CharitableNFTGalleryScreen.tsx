import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import {
  fetchUserNFTs,
  fetchNFTCollections,
  fetchNFTMarketplace,
  connectNFTWallet,
  getGasEstimate,
} from '../../store/slices/charitableNFTSlice';
import { CharitableNFTCard } from '../../components/gamification/CharitableNFTCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const CharitableNFTGalleryScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    userNFTs,
    collections,
    marketplace,
    wallet,
    loading,
    error,
  } = useSelector((state: RootState) => state.charitableNFT);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = useState<'gallery' | 'marketplace' | 'collections'>('gallery');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'listed' | 'unlisted'>('all');

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserNFTs(currentUser.id));
    }
    dispatch(fetchNFTCollections());
    dispatch(fetchNFTMarketplace());
  }, [currentUser]);

  const filteredNFTs = userNFTs.filter(nft => {
    if (selectedFilter === 'listed') return nft.isListed;
    if (selectedFilter === 'unlisted') return !nft.isListed;
    return true;
  });

  const handleNFTPress = (nft: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to NFT detail
    Alert.alert('NFT Detail', `View details for ${nft.name}`);
  };

  const handleConnectWallet = () => {
    Alert.alert(
      'Connect Wallet',
      'Connect your blockchain wallet to manage NFTs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => {
            dispatch(connectNFTWallet({
              address: '0x123...', // Would come from wallet connection
              network: 'polygon',
            }));
          },
        },
      ]
    );
  };

  const handleMintNFT = () => {
    Alert.alert('Mint NFT', 'NFT minting interface would open here');
  };

  const renderNFT = ({ item }: { item: any }) => (
    <CharitableNFTCard
      nft={item}
      currentUserId={currentUser?.id || ''}
      showActions={true}
      compact={false}
      onPress={() => handleNFTPress(item)}
    />
  );

  const renderCollection = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => Alert.alert('Collection', `View ${item.name} collection`)}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.collectionGradient}
      >
        <View style={styles.collectionContent}>
          <Text style={styles.collectionName}>{item.name}</Text>
          <Text style={styles.collectionStats}>
            {item.totalSupply} NFTs • Floor: {item.floorPrice || 'N/A'} MATIC
          </Text>
          <View style={styles.collectionBadge}>
            <Text style={styles.collectionBadgeText}>COLLECTION</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMarketplaceItem = ({ item }: { item: any }) => (
    <View style={styles.marketplaceCard}>
      <CharitableNFTCard
        nft={item.nft}
        currentUserId={currentUser?.id || ''}
        showActions={true}
        compact={true}
        onPress={() => handleNFTPress(item.nft)}
      />
      <View style={styles.marketplaceInfo}>
        <Text style={styles.marketplacePrice}>
          {item.price} {item.currency}
        </Text>
        <TouchableOpacity
          style={styles.marketplaceButton}
          onPress={() => Alert.alert('Purchase', `Buy for ${item.price} ${item.currency}?`)}
        >
          <Text style={styles.marketplaceButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>NFT Gallery</Text>
      <Text style={styles.subtitle}>
        Collect charitable NFTs that represent your impact and support causes you care about
      </Text>

      {/* Wallet Status */}
      {wallet?.isConnected ? (
        <View style={styles.walletConnected}>
          <Icon name="account-balance-wallet" size={20} color="#FFF" />
          <Text style={styles.walletText}>
            Wallet Connected • {wallet.balance.MATIC || 0} MATIC
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.connectWalletButton}
          onPress={handleConnectWallet}
        >
          <Icon name="account-balance-wallet" size={16} color="#FFF" />
          <Text style={styles.connectWalletText}>Connect Wallet</Text>
        </TouchableOpacity>
      )}

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        {[
          { key: 'gallery' as const, label: 'My NFTs', icon: 'collections' },
          { key: 'marketplace' as const, label: 'Marketplace', icon: 'shopping-cart' },
          { key: 'collections' as const, label: 'Collections', icon: 'grid-view' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab.key);
            }}
          >
            <Icon name={tab.icon} size={18} color={activeTab === tab.key ? '#FFF' : colors.primary} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Tabs for Gallery */}
      {activeTab === 'gallery' && (
        <View style={styles.filterTabs}>
          {[
            { key: 'all', label: 'All' },
            { key: 'listed', label: 'Listed' },
            { key: 'unlisted', label: 'Unlisted' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.filterTabActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(filter.key as any);
              }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{userNFTs.length}</Text>
          <Text style={styles.statLabel}>Owned NFTs</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {userNFTs.filter(nft => nft.isListed).length}
          </Text>
          <Text style={styles.statLabel}>Listed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            ₦{userNFTs.reduce((sum, nft) => sum + (nft.marketValue || 0), 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Est. Value</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="collections" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>
        {activeTab === 'gallery' ? 'No NFTs Yet' :
         activeTab === 'marketplace' ? 'No Marketplace Items' :
         'No Collections Available'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'gallery'
          ? 'Complete charitable actions to earn your first NFT!'
          : activeTab === 'marketplace'
          ? 'Check back later for NFTs available for purchase'
          : 'Collections will be available soon'
        }
      </Text>
      {activeTab === 'gallery' && (
        <TouchableOpacity
          style={styles.mintButton}
          onPress={handleMintNFT}
        >
          <Icon name="add" size={20} color="#FFF" />
          <Text style={styles.mintButtonText}>Mint NFT</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getCurrentData = () => {
    switch (activeTab) {
      case 'gallery': return filteredNFTs;
      case 'marketplace': return marketplace?.listings || [];
      case 'collections': return collections;
      default: return [];
    }
  };

  const getCurrentRenderItem = () => {
    switch (activeTab) {
      case 'gallery': return renderNFT;
      case 'marketplace': return renderMarketplaceItem;
      case 'collections': return renderCollection;
      default: return renderNFT;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading NFTs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Failed to Load NFTs</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (currentUser?.id) {
                dispatch(fetchUserNFTs(currentUser.id));
              }
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.tertiary + '10', colors.background.primary]}
        style={styles.gradientBackground}
      >
        <FlatList
          data={getCurrentData()}
          renderItem={getCurrentRenderItem()}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={activeTab === 'collections' ? 2 : 1}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleMintNFT}
        >
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  walletConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  walletText: {
    ...typography.button,
    color: '#FFF',
    marginLeft: spacing.xs,
  },
  connectWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  connectWalletText: {
    ...typography.button,
    color: '#FFF',
    marginLeft: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xxs,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  tabTextActive: {
    color: colors.white,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  collectionCard: {
    flex: 0.48,
    margin: spacing.xs,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  collectionGradient: {
    borderRadius: 12,
    padding: spacing.md,
    height: 120,
    justifyContent: 'space-between',
  },
  collectionContent: {
    justifyContent: 'space-between',
  },
  collectionName: {
    ...typography.button,
    color: '#FFF',
    fontWeight: 'bold',
  },
  collectionStats: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  collectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  collectionBadgeText: {
    ...typography.caption,
    color: '#000',
    fontWeight: 'bold',
  },
  marketplaceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  marketplaceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  marketplacePrice: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  marketplaceButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  marketplaceButtonText: {
    ...typography.button,
    color: '#FFF',
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  mintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  mintButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorTitle: {
    ...typography.h1,
    color: colors.error,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    ...typography.button,
    color: colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});