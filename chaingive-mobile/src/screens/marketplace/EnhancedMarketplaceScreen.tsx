import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TextInput } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchMarketplaceItems, setSelectedCategory, setSearchQuery } from '../../store/slices/marketplaceSlice';
import { MarketplaceItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import {
  FlipCard,
  ConfettiCelebration,
  FloatingHearts,
  ShimmerEffect,
  CountUpAnimation,
  PageTransition,
  LottieSuccess,
} from '../../components/animations';

// Import premium coin components
import {
  CoinBalanceWidget,
  CoinFOMOBanner,
  CoinMarketplaceWidget,
  CoinParticleSystem,
  coinSounds,
} from '../../components/coins';
import { FadeInView } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - (spacing.md * 3)) / 2;

const categories = ['all', 'airtime', 'data', 'vouchers', 'services'] as const;
type Category = typeof categories[number];

const EnhancedMarketplaceScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { filteredItems, selectedCategory, loading, page, hasMore } = useSelector((s: RootState) => s.marketplace);
  const { user } = useSelector((s: RootState) => s.auth);

  const [query, setQuery] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFOMOBanner, setShowFOMOBanner] = useState(true);
  const [showParticleEffect, setShowParticleEffect] = useState(false);

  useEffect(() => {
    dispatch(fetchMarketplaceItems());
  }, [dispatch, selectedCategory]);

  useEffect(() => {
    const id = setTimeout(() => {
      dispatch(setSearchQuery(query));
      dispatch(fetchMarketplaceItems());
    }, 300);
    if (query.length === 0) {
      dispatch(setSearchQuery(''));
      dispatch(fetchMarketplaceItems());
    }
    return () => clearTimeout(id);
  }, [dispatch, query]);

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await dispatch(fetchMarketplaceItems());
    setRefreshing(false);
  };

  const handleRedeemItem = async (item: MarketplaceItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await coinSounds.playCoinPurchase();

    setRedeemedItem(item.name);
    setShowSuccess(true);
    setShowParticleEffect(true);

    setTimeout(() => {
      setShowConfetti(true);
    }, 1000);

    setTimeout(() => {
      setShowHearts(true);
    }, 1500);
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <FlipCard
      frontContent={
        <View style={styles.cardFront}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.cardContent}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Icon name="stars" size={16} color={colors.gold} />
              <CountUpAnimation
                from={0}
                to={item.price}
                duration={800}
                formatter={(val) => ` ${Math.round(val)} CC`}
                style={styles.price}
              />
            </View>
            <View style={styles.metaRow}>
              <View style={styles.rating}>
                <Icon name="star" size={14} color={colors.warning} />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
              <Text style={[styles.stock, { color: item.inStock ? colors.success : colors.error }]}>
                {item.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </Text>
            </View>
          </View>
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to see details</Text>
          </View>
        </View>
      }
      backContent={
        <View style={styles.cardBack}>
          <Text style={styles.backTitle}>Item Details</Text>
          <Text style={styles.description} numberOfLines={4}>
            {item.description || 'Premium marketplace item. Redeem with your charity coins.'}
          </Text>
          
          <View style={styles.backInfo}>
            <View style={styles.infoRow}>
              <Icon name="inventory" size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>Stock: {item.inStock ? 'Available' : 'Sold Out'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="reviews" size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>{item.reviewCount} reviews</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.redeemButton, !item.inStock && styles.disabledButton]}
            onPress={() => item.inStock && handleRedeemItem(item)}
            disabled={!item.inStock}
          >
            <Icon name="redeem" size={20} color={colors.white} />
            <Text style={styles.redeemButtonText}>
              {item.inStock ? 'Redeem Now' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      }
      onFlip={(isFlipped) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
      style={styles.flipCard}
    />
  );

  const balance = user?.charityCoins || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Coin Balance Widget - Always Visible */}
      <CoinBalanceWidget
        balance={balance}
        trend="up"
        change24h={250}
        animation="pulse"
        size="medium"
        showQuickActions={true}
        onQuickAction={(action) => {
          switch (action) {
            case 'buy':
              navigation.navigate('BuyCoinsScreen');
              break;
            case 'earn':
              navigation.navigate('GiveScreen');
              break;
            case 'spend':
              // Already in marketplace
              break;
            case 'history':
              navigation.navigate('RedemptionHistoryScreen');
              break;
          }
        }}
      />

      {/* FOMO Banner */}
      {showFOMOBanner && (
        <CoinFOMOBanner
          message="Flash Sale! 50% off data bundles for next 30 minutes!"
          urgency="high"
          timer={1800}
          action="Shop Now"
          reward={500}
          onPress={() => {
            setShowFOMOBanner(false);
            // Scroll to data category
          }}
        />
      )}

      {/* Particle Effects */}
      {showParticleEffect && (
        <CoinParticleSystem
          trigger={showParticleEffect}
          type="rain"
          intensity="medium"
          duration={2000}
          onComplete={() => setShowParticleEffect(false)}
        />
      )}

      <PageTransition type="slideUp" duration={300}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Coin Marketplace</Text>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate('RedemptionHistoryScreen')}
            >
              <Icon name="history" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

        {/* Enhanced Marketplace Widget */}
        <FadeInView duration={400} delay={200}>
          <CoinMarketplaceWidget
            items={filteredItems.slice(0, 6).map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || 'Premium marketplace item',
              price: item.price,
              originalPrice: item.price > 1000 ? item.price * 1.2 : undefined,
              category: 'airtime' as any,
              scarcity: {
                available: Math.floor(Math.random() * 20) + 1,
                total: Math.floor(Math.random() * 50) + 20,
                urgency: (['low', 'medium', 'high', 'critical'] as const)[Math.floor(Math.random() * 4)],
              },
              coinback: Math.floor(item.price * 0.05),
              badge: Math.random() > 0.7 ? 'hot' : Math.random() > 0.8 ? 'new' : undefined,
            }))}
            userCoinBalance={balance}
            onPurchase={(item) => {
              handleRedeemItem(filteredItems.find(fi => fi.id === item.id)!);
            }}
            onViewAll={() => {
              // Scroll to full list
            }}
            maxItems={3}
          />
        </FadeInView>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items or vendors"
              value={query}
              onChangeText={setQuery}
              placeholderTextColor={colors.gray[400]}
            />
          </View>
        </View>

        <View style={styles.filters}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                (selectedCategory ?? 'all') === (cat === 'all' ? null : cat) && styles.filterSelected
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                dispatch(setSelectedCategory(cat === 'all' ? null : cat));
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  (selectedCategory ?? 'all') === (cat === 'all' ? null : cat) && styles.filterTextSelected
                ]}
              >
                {cat[0].toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.skeletonGrid}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.skeletonCard}>
                <ShimmerEffect width={cardWidth} height={180} borderRadius={12} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="shopping-cart" size={64} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No items found</Text>
                <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
              </View>
            }
          />
        )}
        </ScrollView>

        {/* Premium Animations */}
        <LottieSuccess
          visible={showSuccess}
          onAnimationFinish={() => setShowSuccess(false)}
        />

        <ConfettiCelebration
          visible={showConfetti}
          message="🎁 Item Redeemed!"
          submessage={`${redeemedItem} is on its way`}
          onComplete={() => setShowConfetti(false)}
          confettiCount={150}
        />

        {showHearts && (
          <FloatingHearts
            count={15}
            duration={2500}
            startX={screenWidth / 2}
            startY={300}
            color={colors.gold}
          />
        )}
      </PageTransition>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['4xl'],
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  historyButton: {
    padding: spacing.sm,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  balanceText: {
    ...typography.bodySmallBold,
    color: colors.white,
  },
  searchRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  filterSelected: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  filterTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  flipCard: {
    width: cardWidth,
    marginBottom: spacing.md,
  },
  cardFront: {
    width: cardWidth,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.gray[200],
  },
  cardContent: {
    padding: spacing.sm,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.bodyBold,
    color: colors.gold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  ratingText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  stock: {
    ...typography.caption,
    fontWeight: '600',
  },
  tapHint: {
    backgroundColor: `${colors.primary}10`,
    paddingVertical: spacing.xxs,
    alignItems: 'center',
  },
  tapHintText: {
    ...typography.caption,
    color: colors.primary,
  },
  cardBack: {
    width: cardWidth,
    minHeight: 220,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.card,
  },
  backTitle: {
    ...typography.h4,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.md,
  },
  backInfo: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  disabledButton: {
    backgroundColor: colors.gray[400],
  },
  redeemButtonText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  skeletonCard: {
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
});

export default EnhancedMarketplaceScreen;
