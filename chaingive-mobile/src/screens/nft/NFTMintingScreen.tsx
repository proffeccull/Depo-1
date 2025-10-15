import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { mintNFTAchievement } from '../../store/slices/nftSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const NFTMintingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { balance } = useSelector((state: RootState) => state.coin);
  const { blockchainEnabled } = useSelector((state: RootState) => state.nft);

  const { achievementId } = route.params as { achievementId: string };

  const [selectedBlockchain, setSelectedBlockchain] = useState<'polygon' | 'ethereum' | 'bsc'>('polygon');
  const [isMinting, setIsMinting] = useState(false);

  // Mock achievement data - in real app this would come from API
  const achievement = {
    id: achievementId,
    name: 'Generous Heart',
    description: 'Awarded for completing 10 donation cycles',
    rarity: 'epic',
    coinReward: 5000,
    icon: 'favorite',
    unlockedAt: new Date().toISOString(),
  };

  const blockchainOptions = [
    {
      id: 'polygon' as const,
      name: 'Polygon',
      symbol: 'MATIC',
      fee: 0.01,
      time: '~30 seconds',
      color: colors.primary,
      description: 'Fast and low-cost minting',
    },
    {
      id: 'ethereum' as const,
      name: 'Ethereum',
      symbol: 'ETH',
      fee: 0.005,
      time: '~3-5 minutes',
      color: colors.secondary,
      description: 'Maximum security and decentralization',
    },
    {
      id: 'bsc' as const,
      name: 'BSC',
      symbol: 'BNB',
      fee: 0.0005,
      time: '~3 seconds',
      color: colors.tertiary,
      description: 'Ultra-fast and cost-effective',
    },
  ];

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return { colors: ['#CD7F32', '#8B4513'], textColor: colors.white };
      case 'rare':
        return { colors: ['#C0C0C0', '#808080'], textColor: colors.white };
      case 'epic':
        return { colors: ['#9932CC', '#8A2BE2'], textColor: colors.white };
      case 'legendary':
        return { colors: ['#FFD700', '#FFA500'], textColor: colors.black };
      case 'mythic':
        return { colors: ['#FF1493', '#00CED1', '#FFD700', '#FF69B4'], textColor: colors.white };
      default:
        return { colors: ['#666', '#333'], textColor: colors.white };
    }
  };

  const handleMintNFT = async () => {
    if (!user?.id || !achievementId) return;

    const selectedChain = blockchainOptions.find(chain => chain.id === selectedBlockchain);
    if (!selectedChain) return;

    // Check if user has enough balance for minting fee (if any)
    if (balance.current < 100) { // Minimum balance check
      showToast('Insufficient coins for minting', 'error');
      return;
    }

    Alert.alert(
      'Mint NFT Achievement',
      `Mint "${achievement.name}" as an NFT on ${selectedChain.name}?\n\n` +
      `Network Fee: ${selectedChain.fee} ${selectedChain.symbol}\n` +
      `Estimated Time: ${selectedChain.time}\n\n` +
      `This will create a unique digital collectible of your achievement!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mint NFT',
          onPress: async () => {
            try {
              setIsMinting(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              await dispatch(mintNFTAchievement({
                achievementId,
                userId: user.id,
                blockchain: selectedBlockchain,
              })).unwrap();

              showToast('NFT minted successfully! 🎉', 'success');

              // Navigate to NFT gallery
              navigation.navigate('NFTGallery' as never);
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              showToast(error.message || 'Failed to mint NFT', 'error');
            } finally {
              setIsMinting(false);
            }
          },
        },
      ]
    );
  };

  if (!blockchainEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Icon name="token" size={64} color={colors.gray[300]} />
          <Text style={styles.disabledTitle}>NFT Minting</Text>
          <Text style={styles.disabledMessage}>
            NFT features are currently disabled by administrators.
            Check back later to mint your achievement NFTs!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const rarityConfig = getRarityConfig(achievement.rarity);

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
          <Text style={styles.headerTitle}>Mint NFT Achievement</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Achievement Preview */}
        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>Achievement Preview</Text>

          <LinearGradient
            colors={rarityConfig.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.achievementCard}
          >
            <View style={styles.achievementHeader}>
              <View style={styles.rarityBadge}>
                <Text style={[styles.rarityText, { color: rarityConfig.textColor }]}>
                  {achievement.rarity.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.achievementIcon}>
              <Icon name={achievement.icon} size={64} color={rarityConfig.textColor} />
            </View>

            <View style={styles.achievementInfo}>
              <Text style={[styles.achievementName, { color: rarityConfig.textColor }]}>
                {achievement.name}
              </Text>
              <Text style={[styles.achievementDescription, { color: rarityConfig.textColor + 'CC' }]}>
                {achievement.description}
              </Text>
            </View>

            <View style={styles.achievementStats}>
              <View style={styles.stat}>
                <Icon name="monetization-on" size={20} color={colors.tertiary} />
                <Text style={styles.statText}>+{achievement.coinReward.toLocaleString()} coins</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="event" size={20} color={rarityConfig.textColor} />
                <Text style={[styles.statText, { color: rarityConfig.textColor }]}>
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* NFT Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>NFT Benefits</Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefit}>
              <Icon name="verified" size={24} color={colors.success} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Permanent Record</Text>
                <Text style={styles.benefitDescription}>
                  Your achievement is permanently recorded on the blockchain
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Icon name="sell" size={24} color={colors.primary} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Tradeable Asset</Text>
                <Text style={styles.benefitDescription}>
                  Sell or trade your achievement NFT on marketplaces
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Icon name="group" size={24} color={colors.secondary} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Social Proof</Text>
                <Text style={styles.benefitDescription}>
                  Showcase your philanthropy achievements to the world
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Icon name="stars" size={24} color={colors.tertiary} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Rarity Value</Text>
                <Text style={styles.benefitDescription}>
                  Limited edition NFTs increase in value over time
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Blockchain Selection */}
        <View style={styles.blockchainSection}>
          <Text style={styles.sectionTitle}>Choose Blockchain</Text>

          {blockchainOptions.map((chain) => (
            <TouchableOpacity
              key={chain.id}
              style={[
                styles.blockchainOption,
                selectedBlockchain === chain.id && styles.blockchainOptionSelected,
                { borderColor: chain.color + '40' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedBlockchain(chain.id);
              }}
            >
              <View style={styles.blockchainHeader}>
                <View style={[styles.blockchainIcon, { backgroundColor: chain.color + '20' }]}>
                  <Text style={[styles.blockchainSymbol, { color: chain.color }]}>
                    {chain.symbol}
                  </Text>
                </View>
                <View style={styles.blockchainInfo}>
                  <Text style={styles.blockchainName}>{chain.name}</Text>
                  <Text style={styles.blockchainDescription}>{chain.description}</Text>
                </View>
                {selectedBlockchain === chain.id && (
                  <Icon name="check-circle" size={24} color={chain.color} />
                )}
              </View>

              <View style={styles.blockchainStats}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Fee:</Text>
                  <Text style={styles.statValue}>{chain.fee} {chain.symbol}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Time:</Text>
                  <Text style={styles.statValue}>{chain.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mint Button */}
        <View style={styles.mintSection}>
          <TouchableOpacity
            style={[styles.mintButton, isMinting && styles.mintButtonDisabled]}
            onPress={handleMintNFT}
            disabled={isMinting}
          >
            <LinearGradient
              colors={rarityConfig.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mintButtonGradient}
            >
              {isMinting ? (
                <View style={styles.mintingContainer}>
                  <Icon name="hourglass-empty" size={24} color={colors.white} />
                  <Text style={styles.mintButtonText}>Minting...</Text>
                </View>
              ) : (
                <View style={styles.mintContainer}>
                  <Icon name="token" size={24} color={colors.white} />
                  <Text style={styles.mintButtonText}>Mint NFT Achievement</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.mintNote}>
            Minting requires a small network fee. Your NFT will be added to your gallery once confirmed.
          </Text>
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
  achievementSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  achievementCard: {
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  achievementHeader: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  rarityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  rarityText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  achievementIcon: {
    marginBottom: spacing.md,
  },
  achievementInfo: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementName: {
    ...typography.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    ...typography.body,
    textAlign: 'center',
    opacity: 0.9,
  },
  achievementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  benefitsSection: {
    marginBottom: spacing.lg,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    ...shadows.card,
  },
  benefitText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  benefitTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  benefitDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  blockchainSection: {
    marginBottom: spacing.lg,
  },
  blockchainOption: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    ...shadows.card,
  },
  blockchainOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  blockchainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  blockchainSymbol: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  blockchainInfo: {
    flex: 1,
  },
  blockchainName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  blockchainDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  blockchainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  mintSection: {
    alignItems: 'center',
  },
  mintButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  mintButtonDisabled: {
    opacity: 0.6,
  },
  mintButtonGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  mintingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mintButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  mintNote: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default NFTMintingScreen;