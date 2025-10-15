import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchCharityCategories } from '../../store/slices/charityCategoriesSlice';
import { CharityCategoryCard } from './CharityCategoryCard';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface CharityCategoryGridProps {
  numColumns?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  compact?: boolean;
  onCategoryPress?: (category: any) => void;
  onDonate?: (categoryId: string, amount: number) => void;
}

export const CharityCategoryGrid: React.FC<CharityCategoryGridProps> = ({
  numColumns = 2,
  showSearch = true,
  showFilters = true,
  compact = false,
  onCategoryPress,
  onDonate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, userProgress, loading, error } = useSelector(
    (state: RootState) => state.charityCategories
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'featured' | 'premium' | 'trending'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'progress' | 'newest' | 'reward'>('popularity');

  useEffect(() => {
    dispatch(fetchCharityCategories());
  }, [dispatch]);

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(category => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = category.name.toLowerCase().includes(query);
        const matchesDescription = category.description.toLowerCase().includes(query);
        const matchesTags = category.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }

      // Category filter
      switch (selectedFilter) {
        case 'featured':
          return category.featured;
        case 'premium':
          return category.isPremium;
        case 'trending':
          return category.popularity > 100; // High popularity threshold
        default:
          return true;
      }
    });

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'progress':
          const progressA = (a.currentAmount / a.targetAmount) * 100;
          const progressB = (b.currentAmount / b.targetAmount) * 100;
          return progressB - progressA;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'reward':
          return b.rewardMultiplier - a.rewardMultiplier;
        default:
          return 0;
      }
    });

    return filtered;
  }, [categories, searchQuery, selectedFilter, sortBy]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFilterPress = (filter: typeof selectedFilter) => {
    setSelectedFilter(filter);
    Haptics.selectionAsync();
  };

  const handleSortPress = (sort: typeof sortBy) => {
    setSortBy(sort);
    Haptics.selectionAsync();
  };

  const handleCategoryPress = (category: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCategoryPress?.(category);
  };

  const handleDonate = (categoryId: string, amount: number) => {
    onDonate?.(categoryId, amount);
  };

  const renderCategory = ({ item }: { item: any }) => {
    const userCategoryProgress = userProgress.find(p => p.categoryId === item.id);

    return (
      <CharityCategoryCard
        category={item}
        userProgress={userCategoryProgress}
        compact={compact}
        onPress={() => handleCategoryPress(item)}
        onDonate={(amount) => handleDonate(item.id, amount)}
        onViewDetails={() => handleCategoryPress(item)}
      />
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Icon name="clear" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {[
          { key: 'all', label: 'All', icon: 'grid-view' },
          { key: 'featured', label: 'Featured', icon: 'local-fire-department' },
          { key: 'premium', label: 'Premium', icon: 'star' },
          { key: 'trending', label: 'Trending', icon: 'trending-up' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterPress(filter.key as typeof selectedFilter)}
          >
            <Icon
              name={filter.icon}
              size={16}
              color={selectedFilter === filter.key ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <View style={styles.sortOptions}>
        {[
          { key: 'popularity', label: 'Popular' },
          { key: 'progress', label: 'Progress' },
          { key: 'newest', label: 'Newest' },
          { key: 'reward', label: 'Rewards' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortButton,
              sortBy === option.key && styles.sortButtonActive,
            ]}
            onPress={() => handleSortPress(option.key as typeof sortBy)}
          >
            <Text
              style={[
                styles.sortText,
                sortBy === option.key && styles.sortTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="category" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyTitle}>No categories found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? `No categories match "${searchQuery}"`
          : 'Check back later for new charity categories'
        }
      </Text>
      {searchQuery && (
        <TouchableOpacity
          style={styles.clearSearchButton}
          onPress={() => setSearchQuery('')}
        >
          <Text style={styles.clearSearchText}>Clear search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={64} color={colors.error} />
      <Text style={styles.errorTitle}>Unable to load categories</Text>
      <Text style={styles.errorText}>{error || 'Please try again later'}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => dispatch(fetchCharityCategories())}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading charity categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      {showSearch && renderSearchBar()}

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* Sort Options */}
      {showFilters && renderSortOptions()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredAndSortedCategories.length} categories
          {searchQuery && ` for "${searchQuery}"`}
        </Text>
      </View>

      {/* Categories Grid */}
      <FlatList
        data={filteredAndSortedCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.gridContainer,
          filteredAndSortedCategories.length === 0 && styles.emptyGrid,
        ]}
        ListEmptyComponent={error ? renderErrorState() : renderEmptyState()}
        onRefresh={() => dispatch(fetchCharityCategories())}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
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
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sortLabel: {
    ...typography.button,
    color: colors.text.secondary,
    marginRight: spacing.md,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortButton: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  sortTextActive: {
    color: colors.white,
  },
  resultsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  resultsText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyGrid: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  clearSearchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  clearSearchText: {
    ...typography.button,
    color: colors.white,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    ...typography.h1,
    color: colors.error,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});