import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchUserNFTs,
  listNFTForSale,
  transferNFT,
} from '../../store/slices/nftSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const NFTGalleryScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { achievements: nfts, blockchainEnabled, loading } = useSelector(
    (state: RootState) => state.nft
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    if (user?.id && blockchainEnabled) {
      dispatch(fetchUserNFTs(user.id));
    }
  }, [dispatch, user?.id, blockchainEnabled]);

  const handleNFTAction = (action: 'sell' | 'transfer' | 'view') => {
    if (!selectedNFT) return;

    switch (action) {
      case 'sell':
        Alert.alert(
          'List for Sale',
          `List "${selectedNFT.name}" for sale on the NFT marketplace?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'List',
              onPress: () => {
                // Navigate to listing screen
                navigation.navigate('NFTListing' as never, { nftId: selectedNFT.id });
              },
            },
          ]
        );
        break;
      case 'transfer':
        Alert.alert(
          'Transfer NFT',
          'Enter the recipient\'s wallet address or ChainGive username:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Transfer',
              onPress: () => {
                // Navigate to transfer screen
                navigation.navigate('NFTTransfer' as never, { nftId: selectedNFT.id });
              },
            },
          ]
        );
        break;
      case 'view':
        navigation.navigate('NFTDetail' as never, { nftId: selectedNFT.id });
        break;
    }
    setShowActionModal(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return colors.gray[400];
      case 'rare': return colors.info;
      case 'epic': return colors.primary;
      case 'legendary': return colors.tertiary;
      case 'mythic': return colors.secondary;
      default: return colors.text.secondary;
    }
  };

  const renderNFTCard = ({ item: nft }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.nftCard}
        onPress={() => {
          setSelectedNFT(nft);
          setShowActionModal(true);
        }}
        activeOpacity={0.9}
      >
        {/* NFT Image */}
        <View style={styles.nftImageContainer}>
          <View style={styles.nftImage}>
            <Icon name="emoji-events" size={48} color={colors.white} />
          </View>

          {/* Rarity Badge */}
          <View style={[
            styles.rarityBadge,
            { backgroundColor: getRarityColor(nft.rarity) }
          ]}>
            <Text style={styles.rarityText}>
              {nft.rarity.toUpperCase()}
            </Text>
          </View>

          {/* Listed Badge */}
          {nft.isListed && (
            <View style={styles.listedBadge}>
              <Icon name="sell" size={14} color={colors.white} />
              <Text style={styles.listedText}>LISTED</Text>
            </View>
          )}
        </View>

        {/* NFT Info */}
        <View style={styles.nftInfo}>
          <Text style={styles.nftName} numberOfLines={1}>
            {nft.name}
          </Text>
          <Text style={styles.nftCollection}>
            {nft.collection}
          </Text>
          <Text style={styles.nftSerial}>
            #{nft.serialNumber.toString().padStart(4, '0')}
          </Text>
        </View>

        {/* Attributes Preview */}
        {nft.attributes && nft.attributes.length > 0 && (
          <View style={styles.attributesPreview}>
            {nft.attributes.slice(0, 2).map((attr: any, index: number) => (
              <View key={index} style={styles.attribute}>
                <Text style={styles.attributeLabel}>{attr.trait_type}:</Text>
                <Text style={styles.attributeValue}>{attr.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Blockchain Info */}
        <View style={styles.blockchainInfo}>
          <View style={styles.blockchainBadge}>
            <Text style={styles.blockchainText}>
              {nft.blockchain.toUpperCase()}
            </Text>
          </View>
          {nft.tokenId && (
            <Text style={styles.tokenId}>#{nft.tokenId}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderActionModal = () => {
    if (!selectedNFT) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>NFT Actions</Text>

          <View style={styles.nftPreview}>
            <View style={styles.previewImage}>
              <Icon name="emoji-events" size={32} color={colors.white} />
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{selectedNFT.name}</Text>
              <Text style={styles.previewCollection}>{selectedNFT.collection}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleNFTAction('view')}
            >
              <Icon name="visibility" size={20} color={colors.primary} />
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.sellButton]}
              onPress={() => handleNFTAction('sell')}
            >
              <Icon name="sell" size={20} color={colors.white} />
              <Text style={styles.sellButtonText}>List for Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.transferButton]}
              onPress={() => handleNFTAction('transfer')}
            >
              <Icon name="send" size={20} color={colors.white} />
              <Text style={styles.transferButtonText}>Transfer</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowActionModal(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!blockchainEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Icon name="token" size={64} color={colors.gray[300]} />
          <Text style={styles.disabledTitle}>NFT Gallery</Text>
          <Text style={styles.disabledMessage}>
            NFT features are currently disabled by administrators.
            Check back later to view your achievement NFTs!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>My NFT Gallery</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('NFTMarketplace' as never)}
          style={styles.marketplaceButton}
        >
          <Icon name="store" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{nfts.length}</Text>
          <Text style={styles.statLabel}>NFTs Owned</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {nfts.filter(nft => nft.isListed).length}
          </Text>
          <Text style={styles.statLabel}>Listed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {nfts.filter(nft => nft.rarity === 'mythic').length}
          </Text>
          <Text style={styles.statLabel}>Mythic</Text>
        </View>
      </View>

      {/* NFTs Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your NFTs...</Text>
        </View>
      ) : (
        <FlatList
          data={nfts}
          renderItem={renderNFTCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.nftsGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="token" size={64} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No NFTs Yet</Text>
              <Text style={styles.emptyMessage}>
                Complete achievements to earn NFT rewards!
                Visit the achievements screen to get started.
              </Text>
              <TouchableOpacity
                style={styles.achievementsButton}
                onPress={() => navigation.navigate('Achievements' as never)}
              >
                <Text style={styles.achievementsButtonText}>View Achievements</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Action Modal */}
      {showActionModal && renderActionModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  disabledTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  disabledMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
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
  marketplaceButton: {
    padding: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  nftsGrid: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  nftCard: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.card,
  },
  nftImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nftImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
  },
  rarityText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  listedBadge: {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    transform: [{ translateX: -25 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
    gap: spacing.xxs,
  },
  listedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  nftInfo: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nftName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  nftCollection: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  nftSerial: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  attributesPreview: {
    marginBottom: spacing.md,
  },
  attribute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  attributeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  attributeValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  blockchainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockchainBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
  },
  blockchainText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tokenId: {
    ...typography.caption,
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
    marginBottom: spacing.lg,
  },
  achievementsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  achievementsButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    minHeight: '40%',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  nftPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  previewCollection: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  viewButton: {
    backgroundColor: colors.primary + '20',
  },
  viewButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: 'bold',
  },
  sellButton: {
    backgroundColor: colors.success,
  },
  sellButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  transferButton: {
    backgroundColor: colors.secondary,
  },
  transferButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  closeButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[200],
    borderRadius: 12,
  },
  closeButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
});

export default NFTGalleryScreen;