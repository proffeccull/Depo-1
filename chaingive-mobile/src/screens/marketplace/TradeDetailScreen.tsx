import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface RouteParams {
  tradeId: string;
}

interface TradeItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'coins' | 'naira';
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
    phoneNumber?: string;
    email?: string;
    totalTrades: number;
    memberSince: string;
  };
  images: string[];
  createdAt: string;
  isActive: boolean;
  tradeType: 'sell' | 'buy' | 'exchange';
  isNegotiable: boolean;
  contactMethod: 'phone' | 'email' | 'both';
}

const TradeDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();
  const { tradeId } = route.params as RouteParams;

  const [item, setItem] = useState<TradeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadTradeDetails();
  }, [tradeId]);

  const loadTradeDetails = async () => {
    try {
      // Mock data - replace with actual API call
      const mockItem: TradeItem = {
        id: tradeId,
        title: 'iPhone 13 Pro Max 256GB',
        description: 'Brand new iPhone 13 Pro Max in Graphite color. Comes with original box, charger, and 1-year warranty. Never been used, still sealed. Perfect condition, no scratches or dents. Bought from official Apple store but need to sell due to upgrade.',
        price: 850000,
        currency: 'naira',
        category: 'Electronics',
        condition: 'new',
        location: 'Lagos, Nigeria',
        seller: {
          id: 'seller_1',
          name: 'TechHub NG',
          rating: 4.8,
          verified: true,
          phoneNumber: '+2348012345678',
          email: 'contact@techhub.ng',
          totalTrades: 156,
          memberSince: '2022-03-15',
        },
        images: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isActive: true,
        tradeType: 'sell',
        isNegotiable: true,
        contactMethod: 'both',
      };

      setItem(mockItem);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trade details');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = (method: 'phone' | 'email') => {
    if (!item) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (method === 'phone' && item.seller.phoneNumber) {
      Linking.openURL(`tel:${item.seller.phoneNumber}`);
    } else if (method === 'email' && item.seller.email) {
      Linking.openURL(`mailto:${item.seller.email}?subject=Interest in ${item.title}`);
    }
  };

  const handleMakeOffer = () => {
    Alert.alert(
      'Make an Offer',
      'Enter your offer amount below',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Offer',
          onPress: () => {
            // Mock offer submission
            Alert.alert('Offer Sent!', 'Your offer has been sent to the seller.');
          },
        },
      ]
    );
  };

  const handleReportItem = () => {
    Alert.alert(
      'Report Item',
      'Why are you reporting this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Spam',
          onPress: () => Alert.alert('Reported', 'Item reported for spam.'),
        },
        {
          text: 'Fraud',
          onPress: () => Alert.alert('Reported', 'Item reported for fraud.'),
        },
        {
          text: 'Inappropriate',
          onPress: () => Alert.alert('Reported', 'Item reported as inappropriate.'),
        },
      ]
    );
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return colors.success;
      case 'used':
        return colors.warning;
      case 'refurbished':
        return colors.info;
      default:
        return colors.gray[500];
    }
  };

  const getTradeTypeColor = (tradeType: string) => {
    switch (tradeType) {
      case 'sell':
        return colors.success;
      case 'buy':
        return colors.info;
      case 'exchange':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getTradeTypeIcon = (tradeType: string) => {
    switch (tradeType) {
      case 'sell':
        return 'sell';
      case 'buy':
        return 'shopping-cart';
      case 'exchange':
        return 'swap-horiz';
      default:
        return 'store';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading trade details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Trade Not Found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trade Details</Text>
        <TouchableOpacity
          onPress={() => setIsFavorite(!isFavorite)}
          style={styles.favoriteButton}
        >
          <Icon
            name={isFavorite ? "favorite" : "favorite-border"}
            size={24}
            color={isFavorite ? colors.error : colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Item Images Placeholder */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={64} color={colors.gray[400]} />
            <Text style={styles.imageText}>Item Images</Text>
          </View>
        </View>

        {/* Trade Type Badge */}
        <View style={styles.tradeTypeContainer}>
          <View style={[
            styles.tradeTypeBadge,
            { backgroundColor: getTradeTypeColor(item.tradeType) + '20' }
          ]}>
            <Icon
              name={getTradeTypeIcon(item.tradeType) as any}
              size={16}
              color={getTradeTypeColor(item.tradeType)}
            />
            <Text style={[
              styles.tradeTypeText,
              { color: getTradeTypeColor(item.tradeType) }
            ]}>
              {item.tradeType.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Item Details */}
        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>{item.title}</Text>

          <View style={styles.itemMeta}>
            <View style={[
              styles.conditionBadge,
              { backgroundColor: getConditionColor(item.condition) + '20' }
            ]}>
              <Text style={[
                styles.conditionText,
                { color: getConditionColor(item.condition) }
              ]}>
                {item.condition.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.category}>{item.category}</Text>
          </View>

          <Text style={styles.itemPrice}>
            {item.currency === 'naira' ? '₦' : ''}{item.price.toLocaleString()}
            {item.currency === 'coins' ? ' coins' : ''}
            {item.isNegotiable && (
              <Text style={styles.negotiableText}> (Negotiable)</Text>
            )}
          </Text>

          <Text style={styles.itemDescription}>{item.description}</Text>

          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="schedule" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>
                Posted {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Seller Information */}
        <View style={styles.sellerCard}>
          <Text style={styles.sectionTitle}>Seller Information</Text>

          <View style={styles.sellerHeader}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitials}>
                {item.seller.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>

            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{item.seller.name}</Text>
                {item.seller.verified && (
                  <Icon name="verified" size={16} color={colors.success} />
                )}
              </View>

              <View style={styles.sellerStats}>
                <Icon name="star" size={14} color={colors.warning} />
                <Text style={styles.sellerRating}>{item.seller.rating}</Text>
                <Text style={styles.sellerTrades}>
                  ({item.seller.totalTrades} trades)
                </Text>
              </View>

              <Text style={styles.memberSince}>
                Member since {new Date(item.seller.memberSince).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Options */}
        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contact Seller</Text>

          <View style={styles.contactButtons}>
            {(item.contactMethod === 'phone' || item.contactMethod === 'both') && item.seller.phoneNumber && (
              <TouchableOpacity
                style={[styles.contactButton, styles.phoneButton]}
                onPress={() => handleContactSeller('phone')}
              >
                <Icon name="phone" size={20} color={colors.white} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
            )}

            {(item.contactMethod === 'email' || item.contactMethod === 'both') && item.seller.email && (
              <TouchableOpacity
                style={[styles.contactButton, styles.emailButton]}
                onPress={() => handleContactSeller('email')}
              >
                <Icon name="email" size={20} color={colors.white} />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
            )}
          </View>

          {item.isNegotiable && (
            <TouchableOpacity
              style={styles.makeOfferButton}
              onPress={handleMakeOffer}
            >
              <Icon name="local-offer" size={20} color={colors.primary} />
              <Text style={styles.makeOfferButtonText}>Make an Offer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Safety Tips */}
        <View style={styles.safetyCard}>
          <Text style={styles.sectionTitle}>🛡️ Safety Tips</Text>
          <Text style={styles.safetyText}>
            • Meet in public places for exchanges{'\n'}
            • Never send money before seeing the item{'\n'}
            • Verify item condition before payment{'\n'}
            • Keep records of all transactions{'\n'}
            • Report suspicious activities
          </Text>
        </View>

        {/* Report Button */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReportItem}
        >
          <Icon name="flag" size={20} color={colors.error} />
          <Text style={styles.reportButtonText}>Report this item</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.button,
    color: colors.white,
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
  favoriteButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageText: {
    ...typography.bodyRegular,
    color: colors.gray[500],
    marginTop: spacing.sm,
  },
  tradeTypeContainer: {
    padding: spacing.md,
  },
  tradeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  tradeTypeText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  itemCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  itemTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  conditionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  conditionText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  category: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  itemPrice: {
    ...typography.h2,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  negotiableText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    fontWeight: 'normal',
  },
  itemDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  itemDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  sellerCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sellerInitials: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sellerName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: spacing.sm,
  },
  sellerRating: {
    ...typography.caption,
    color: colors.text.primary,
  },
  sellerTrades: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  memberSince: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  contactCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.md,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  phoneButton: {
    backgroundColor: colors.success,
  },
  emailButton: {
    backgroundColor: colors.info,
  },
  contactButtonText: {
    ...typography.button,
    color: colors.white,
  },
  makeOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    gap: spacing.sm,
  },
  makeOfferButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  safetyCard: {
    backgroundColor: colors.warning + '10',
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  safetyText: {
    ...typography.bodySmall,
    color: colors.warning,
    lineHeight: 18,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  reportButtonText: {
    ...typography.bodyRegular,
    color: colors.error,
  },
});

export default TradeDetailScreen;