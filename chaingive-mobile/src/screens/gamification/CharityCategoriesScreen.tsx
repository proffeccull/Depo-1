import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import {
  fetchCharityCategories,
  createCharityCategory,
  updateCategoryProgress,
} from '../../store/slices/charityCategoriesSlice';
import { CharityCategoryCard } from '../../components/gamification/CharityCategoryCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const CharityCategoriesScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    categories,
    loading,
    error,
    userProgress,
  } = useSelector((state: RootState) => state.charityCategories);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'premium' | 'featured'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [selectedFilter]);

  const loadCategories = () => {
    const filters: any = {};
    if (selectedFilter === 'premium') filters.isPremium = true;
    if (selectedFilter === 'featured') filters.featured = true;

    dispatch(fetchCharityCategories(filters));
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCategoryPress = (category: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to category detail or donation flow
    Alert.alert(
      'Category Selected',
      `Donate to ${category.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Donate',
          onPress: () => {
            // Navigate to donation screen with category pre-selected
            console.log('Navigate to donation with category:', category.id);
          },
        },
      ]
    );
  };

  const handleCreateCategory = () => {
    // This would typically open a modal or navigate to create screen
    Alert.alert('Create Category', 'Admin feature - Category creation form would open here');
  };

  const renderCategory = ({ item }: { item: any }) => (
    <CharityCategoryCard
      category={item}
      onPress={() => handleCategoryPress(item)}
      showProgress={true}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Charity Categories</Text>
      <Text style={styles.subtitle}>
        Choose categories that match your values and earn rewards while giving back
      </Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.text.secondary}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All' },
          { key: 'featured', label: 'Featured' },
          { key: 'premium', label: 'Premium' },
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

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{categories.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {categories.reduce((sum, cat) => sum + cat.currentAmount, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Donated</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {userProgress.length}
          </Text>
          <Text style={styles.statLabel}>Your Categories</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="volunteer-activism" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>No Categories Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new categories'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Categories</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadCategories}
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
        colors={[colors.primary + '10', colors.background.primary]}
        style={styles.gradientBackground}
      >
        <FlatList
          data={filteredCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button for Admin */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateCategory}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text.primary,
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
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});