import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  stock: number;
  image?: string;
}

const ProductListingManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Charity T-Shirt',
          price: 25.99,
          category: 'Clothing',
          status: 'active',
          stock: 50,
        },
        {
          id: '2',
          name: 'Donation Mug',
          price: 12.99,
          category: 'Accessories',
          status: 'active',
          stock: 25,
        },
        {
          id: '3',
          name: 'Fundraising Calendar',
          price: 15.99,
          category: 'Stationery',
          status: 'inactive',
          stock: 0,
        },
      ];
      setProducts(mockProducts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to add product screen
    Alert.alert('Add Product', 'Navigate to add product screen');
  };

  const handleEditProduct = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to edit product screen
    Alert.alert('Edit Product', `Edit ${product.name}`);
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      // TODO: API call to update product status
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id ? { ...p, status: newStatus } : p
        )
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to update product status');
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.status === filter;
  });

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.gray[400];
      case 'pending': return colors.warning;
      default: return colors.gray[400];
    }
  };

  const renderProduct = ({ item: product }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditProduct(product)}
          >
            <Icon name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleStatus(product)}
          >
            <Icon
              name={product.status === 'active' ? 'visibility-off' : 'visibility'}
              size={20}
              color={getStatusColor(product.status)}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>₦{product.price.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Stock:</Text>
          <Text style={styles.detailValue}>{product.stock}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(product.status) }]}>
            <Text style={styles.statusText}>{product.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterButtonText, filter === filterType && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Management</Text>
        <TouchableOpacity onPress={handleAddProduct}>
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('active', 'Active')}
        {renderFilterButton('inactive', 'Inactive')}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="inventory" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyStateText}>No products found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {filter === 'all' ? 'Add your first product to get started' : `No ${filter} products`}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  productsList: {
    padding: spacing.md,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  productCategory: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  productActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  productDetails: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    ...typography.bodyRegular,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default ProductListingManagementScreen;