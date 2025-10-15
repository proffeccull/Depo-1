import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { coinSounds } from './CoinSoundEffects';

const { width: screenWidth } = Dimensions.get('window');

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number; // coins
  originalPrice?: number;
  category: 'airtime' | 'data' | 'vouchers' | 'nft' | 'boost';
  scarcity: {
    available: number;
    total: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  coinback?: number; // coins earned back
  badge?: 'hot' | 'new' | 'exclusive' | 'limited';
  image?: string;
}

interface CoinMarketplaceWidgetProps {
  items: MarketplaceItem[];
  userCoinBalance: number;
  onPurchase?: (item: MarketplaceItem) => void;
  onViewAll?: () => void;
  maxItems?: number;
}

const CoinMarketplaceWidget: React.FC<CoinMarketplaceWidgetProps> = ({
  items,
  userCoinBalance,
  onPurchase,
  onViewAll,
  maxItems = 6,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const urgencyAnim = useRef(new Animated.Value(0)).current;
  const scarcityAnim = useRef(new Animated.Value(1)).current;

  const categories = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'airtime', label: 'Airtime', icon: 'phone-android' },
    { key: 'data', label: 'Data', icon: 'wifi' },
    { key: 'vouchers', label: 'Vouchers', icon: 'card-giftcard' },
    { key: 'nft', label: 'NFTs', icon: 'token' },
    { key: 'boost', label: 'Boost', icon: 'trending-up' },
  ];

  useEffect(() => {
    // Animate scarcity indicators for items running low
    const lowStockItems = items.filter(item =>
      item.scarcity.available / item.scarcity.total < 0.2
    );

    if (lowStockItems.length > 0) {
      const scarcityAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scarcityAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scarcityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      scarcityAnimation.start();
    }
  }, [items]);

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const displayItems = filteredItems.slice(0, maxItems);

  const getUrgencyConfig = (urgency: string) => {
    const configs = {
      low: { color: colors.info, text: 'Available' },
      medium: { color: colors.warning, text: 'Limited' },
      high: { color: colors.error, text: 'Running Low' },
      critical: { color: '#FF1493', text: 'Almost Gone!' },
    };
    return configs[urgency as keyof typeof configs] || configs.low;
  };

  const getBadgeConfig = (badge?: string) => {
    const configs = {
      hot: { color: colors.error, icon: 'local-fire-department' },
      new: { color: colors.success, icon: 'new-releases' },
      exclusive: { color: colors.secondary, icon: 'star' },
      limited: { color: colors.warning, icon: 'timer' },
    };
    return badge ? configs[badge as keyof typeof configs] : null;
  };

  const handlePurchase = async (item: MarketplaceItem) => {
    if (userCoinBalance < item.price) {
      await coinSounds.play('button_press');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await coinSounds.playCoinPurchase();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPurchase?.(item);
  };

  const renderCategoryTab = ({ key, label, icon }: typeof categories[0]) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.categoryTab,
        selectedCategory === key && styles.categoryTabSelected,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCategory(key);
      }}
    >
      <Icon
        name={icon}
        size={16}
        color={selectedCategory === key ? colors.white : colors.text.secondary}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === key && styles.categoryTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const urgencyConfig = getUrgencyConfig(item.scarcity.urgency);
    const badgeConfig = getBadgeConfig(item.badge);
    const canAfford = userCoinBalance >= item.price;
    const scarcityRatio = item.scarcity.available / item.scarcity.total;

    return (
      <Animated.View
        style={[
          styles.itemCard,
          item.scarcity.urgency === 'critical' && { transform: [{ scale: scarcityAnim }] },
        ]}
      >
        <LinearGradient
          colors={
            item.scarcity.urgency === 'critical'
              ? ['#FF1493', '#FF69B4']
              : [colors.white, colors.gray[50]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.itemGradient}
        >
          {/* Badge */}
          {badgeConfig && (
            <View style={[styles.badge, { backgroundColor: badgeConfig.color }]}>
              <Icon name={badgeConfig.icon} size={12} color={colors.white} />
            </View>
          )}

          {/* Scarcity Indicator */}
          <View style={[styles.scarcityIndicator, { backgroundColor: urgencyConfig.color + '20' }]}>
            <Text style={[styles.scarcityText, { color: urgencyConfig.color }]}>
              {item.scarcity.available} left
            </Text>
            <View style={[styles.scarcityBar, { backgroundColor: urgencyConfig.color }]}>
              <View
                style={[
                  styles.scarcityFill,
                  { width: `${scarcityRatio * 100}%`, backgroundColor: urgencyConfig.color },
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.itemContent}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Price */}
            <View style={styles.priceContainer}>
              <View style={styles.coinPrice}>
                <Icon name="monetization-on" size={16} color={colors.tertiary} />
                <Text style={[styles.priceText, !canAfford && styles.priceTextDisabled]}>
                  {item.price.toLocaleString()}
                </Text>
              </View>

              {item.originalPrice && (
                <Text style={styles.originalPrice}>
                  ₦{item.originalPrice.toLocaleString()}
                </Text>
              )}

              {item.coinback && (
                <View style={styles.coinback}>
                  <Icon name="add" size={12} color={colors.success} />
                  <Text style={styles.coinbackText}>
                    +{item.coinback} back
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              !canAfford && styles.purchaseButtonDisabled,
            ]}
            onPress={() => handlePurchase(item)}
            disabled={!canAfford}
          >
            <Text style={[
              styles.purchaseText,
              !canAfford && styles.purchaseTextDisabled,
            ]}>
              {canAfford ? 'Buy' : 'Need Coins'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="shopping-bag" size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Coin Marketplace</Text>
          <View style={styles.coinBalance}>
            <Icon name="monetization-on" size={16} color={colors.tertiary} />
            <Text style={styles.balanceText}>
              {userCoinBalance.toLocaleString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onViewAll?.();
          }}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {categories.map(renderCategoryTab)}
      </View>

      {/* Items Grid */}
      <FlatList
        data={displayItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsGrid}
        columnWrapperStyle={styles.columnWrapper}
      />

      {displayItems.length === 0 && (
        <View style={styles.emptyContainer}>
          <Icon name="inventory" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptyMessage}>
            Try selecting a different category
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  balanceText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  viewAllText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  categoryTabSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xxs,
  },
  categoryTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  itemsGrid: {
    paddingBottom: spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (screenWidth - spacing.lg * 2 - spacing.md * 2) / 2 - spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemGradient: {
    padding: spacing.md,
    minHeight: 160,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scarcityIndicator: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
    borderRadius: 8,
  },
  scarcityText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  scarcityBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  scarcityFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  itemContent: {
    marginTop: spacing.xl,
  },
  itemName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  itemDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 14,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    marginBottom: spacing.sm,
  },
  coinPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  priceText: {
    ...typography.h4,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  priceTextDisabled: {
    color: colors.gray[400],
  },
  originalPrice: {
    ...typography.caption,
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  coinback: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  coinbackText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    marginLeft: spacing.xxs,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  purchaseText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  purchaseTextDisabled: {
    color: colors.gray[500],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default CoinMarketplaceWidget;