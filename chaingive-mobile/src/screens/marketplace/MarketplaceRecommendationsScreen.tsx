import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import MarketplaceItemCard from '../../components/marketplace/MarketplaceItemCard';

// Services
import { apiClient } from '../../services/apiClient';

// Styles
import styles from './MarketplaceRecommendationsScreen.styles';

// Types
interface Recommendation {
  id: string;
  itemId: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  imageUrl?: string;
  confidence: number;
  reasoning: string[];
  trending?: boolean;
  limitedTime?: boolean;
}

const MarketplaceRecommendationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: any) => state.auth.user);
  const userCoins = useSelector((state: any) => state.coins.balance);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'airtime', name: 'Airtime', icon: 'call' },
    { id: 'data', name: 'Data', icon: 'wifi' },
    { id: 'groceries', name: 'Groceries', icon: 'basket' },
    { id: 'utilities', name: 'Utilities', icon: 'flash' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film' },
  ];

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCategory]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await apiClient.get('/api/v2/marketplace/recommendations', { params });

      setRecommendations(response.data.recommendations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  const handleRedeem = async (recommendation: Recommendation) => {
    if (userCoins < recommendation.cost) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${recommendation.cost - userCoins} more coins to redeem this item.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Earn Coins', onPress: () => navigation.navigate('Gamification') }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Redeem "${recommendation.name}" for ${recommendation.cost} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => processRedemption(recommendation)
        }
      ]
    );
  };

  const processRedemption = async (recommendation: Recommendation) => {
    try {
      const response = await apiClient.post('/api/v2/marketplace/redeem', {
        itemId: recommendation.itemId,
        recommendationId: recommendation.id
      });

      // Update user coins in Redux store
      dispatch({
        type: 'coins/updateBalance',
        payload: userCoins - recommendation.cost
      });

      Alert.alert(
        'Success!',
        `You have successfully redeemed ${recommendation.name}. ${response.data.voucherCode ? `Voucher code: ${response.data.voucherCode}` : ''}`,
        [{ text: 'OK' }]
      );

      // Refresh recommendations to update based on new behavior
      fetchRecommendations();
    } catch (err: any) {
      Alert.alert('Redemption Failed', err.message || 'Unable to process redemption');
    }
  };

  const handleFeedback = async (recommendation: Recommendation, liked: boolean) => {
    try {
      await apiClient.post('/api/v2/marketplace/feedback', {
        recommendationId: recommendation.id,
        liked
      });

      // Remove from recommendations if not liked
      if (!liked) {
        setRecommendations(prev =>
          prev.filter(rec => rec.id !== recommendation.id)
        );
      }
    } catch (err: any) {
      console.error('Feedback submission failed:', err);
    }
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={selectedCategory === item.id ? '#FFFFFF' : '#8E8E93'}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === item.id && styles.categoryButtonTextActive
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  const renderRecommendation = ({ item }: { item: Recommendation }) => (
    <MarketplaceItemCard
      item={item}
      onRedeem={() => handleRedeem(item)}
      onFeedback={(liked) => handleFeedback(item, liked)}
      userCoins={userCoins}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="recommend" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>No Recommendations Yet</Text>
      <Text style={styles.emptyStateText}>
        Complete more donations to get personalized recommendations
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyStateButtonText}>Make a Donation</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>For You</Text>

        <View style={styles.headerRight}>
          <View style={styles.coinBalance}>
            <Text style={styles.coinText}>🪙 {userCoins.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Recommendations List */}
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={renderRecommendation}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2E8B57"
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState() : null}
        ListHeaderComponent={
          recommendations.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                Personalized for you based on your donation history
              </Text>
            </View>
          ) : null
        }
      />

      {error && (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} />
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchRecommendations}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MarketplaceRecommendationsScreen;