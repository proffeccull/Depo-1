import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/accessibility/cultural_gesture_detector.dart';

// Mock data models
class MarketplaceItem {
  final String id;
  final String name;
  final String description;
  final String image;
  final double price;
  final String category;
  final double rating;
  final int reviewCount;
  final bool isPopular;
  final bool isNew;
  final String seller;
  final int stock;

  const MarketplaceItem({
    required this.id,
    required this.name,
    required this.description,
    required this.image,
    required this.price,
    required this.category,
    required this.rating,
    required this.reviewCount,
    required this.isPopular,
    required this.isNew,
    required this.seller,
    required this.stock,
  });
}

enum SortOption { popularity, priceLow, priceHigh, rating, newest }

class MarketplaceScreen extends ConsumerStatefulWidget {
  const MarketplaceScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends ConsumerState<MarketplaceScreen>
    with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';
  SortOption _selectedSort = SortOption.popularity;
  RangeValues _priceRange = const RangeValues(0, 500);
  double _minRating = 0.0;
  bool _showOnlyInStock = false;

  // Mock data
  final List<MarketplaceItem> _allItems = [
    const MarketplaceItem(
      id: '1',
      name: 'Premium Avatar Pack',
      description: 'Exclusive avatar customization pack with rare skins',
      image: 'assets/images/avatar_pack.png',
      price: 9.99,
      category: 'Avatars',
      rating: 4.8,
      reviewCount: 1247,
      isPopular: true,
      isNew: false,
      seller: 'ChainGive Official',
      stock: 50,
    ),
    const MarketplaceItem(
      id: '2',
      name: 'Gold Coin Boost',
      description: 'Instant 1000 coins to accelerate your progress',
      image: 'assets/images/coin_boost.png',
      price: 4.99,
      category: 'Boosts',
      rating: 4.6,
      reviewCount: 892,
      isPopular: true,
      isNew: true,
      seller: 'ChainGive Official',
      stock: 100,
    ),
    const MarketplaceItem(
      id: '3',
      name: 'Cultural Theme Bundle',
      description: 'Beautiful African-inspired themes and motifs',
      image: 'assets/images/theme_bundle.png',
      price: 14.99,
      category: 'Themes',
      rating: 4.9,
      reviewCount: 567,
      isPopular: false,
      isNew: false,
      seller: 'Cultural Creators',
      stock: 25,
    ),
    // Add more mock items...
  ];

  late List<MarketplaceItem> _filteredItems;

  @override
  void initState() {
    super.initState();
    _filteredItems = List.from(_allItems);
    _applyFilters();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Marketplace'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilters,
          ),
          IconButton(
            icon: const Icon(Icons.shopping_cart),
            onPressed: _showCart,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildCategoryTabs(),
          _buildSortAndViewOptions(),
          Expanded(
            child: _filteredItems.isEmpty
                ? _buildEmptyState()
                : _buildItemsGrid(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showWishlist,
        child: const Icon(Icons.favorite),
        tooltip: 'Wishlist',
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Theme.of(context).cardColor,
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search items...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _applyFilters();
                  },
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          filled: true,
          fillColor: Theme.of(context).colorScheme.surface,
        ),
        onChanged: (value) => _applyFilters(),
      ),
    );
  }

  Widget _buildCategoryTabs() {
    final categories = ['All', 'Avatars', 'Boosts', 'Themes', 'Accessories', 'NFTs'];

    return Container(
      height: 50,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = category == _selectedCategory;

          return Container(
            margin: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(category),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  _selectedCategory = category;
                  _applyFilters();
                });
              },
              backgroundColor: Theme.of(context).colorScheme.surface,
              selectedColor: Theme.of(context).colorScheme.primaryContainer,
              checkmarkColor: Theme.of(context).colorScheme.onPrimaryContainer,
            ),
          );
        },
      ),
    );
  }

  Widget _buildSortAndViewOptions() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: DropdownButtonFormField<SortOption>(
              value: _selectedSort,
              decoration: const InputDecoration(
                labelText: 'Sort by',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              items: SortOption.values.map((option) {
                return DropdownMenuItem(
                  value: option,
                  child: Text(_getSortOptionText(option)),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    _selectedSort = value;
                    _applyFilters();
                  });
                }
              },
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.view_list),
            onPressed: () {
              // Toggle between grid and list view
            },
            tooltip: 'List View',
          ),
          IconButton(
            icon: const Icon(Icons.view_module),
            onPressed: () {
              // Toggle between grid and list view
            },
            tooltip: 'Grid View',
          ),
        ],
      ),
    );
  }

  Widget _buildItemsGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _filteredItems.length,
      itemBuilder: (context, index) {
        final item = _filteredItems[index];
        return _buildItemCard(item);
      },
    );
  }

  Widget _buildItemCard(MarketplaceItem item) {
    final theme = Theme.of(context);

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: CulturalGestureDetector(
        onTap: () => _showItemDetails(item),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Item image
            Expanded(
              flex: 3,
              child: Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(12),
                      ),
                      image: DecorationImage(
                        image: AssetImage(item.image),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  // Badges
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Row(
                      children: [
                        if (item.isPopular)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.orange,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Popular',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        if (item.isNew) ...[
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'New',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  // Favorite button
                  Positioned(
                    top: 8,
                    right: 8,
                    child: IconButton(
                      icon: const Icon(Icons.favorite_border),
                      onPressed: () => _toggleFavorite(item),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.8),
                        padding: const EdgeInsets.all(4),
                      ),
                      iconSize: 16,
                    ),
                  ),
                ],
              ),
            ),

            // Item details
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.star,
                          size: 14,
                          color: Colors.amber,
                        ),
                        Text(
                          '${item.rating}',
                          style: theme.textTheme.bodySmall,
                        ),
                        Text(
                          ' (${item.reviewCount})',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '\$${item.price.toStringAsFixed(2)}',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () => _addToCart(item),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 4,
                            ),
                            textStyle: const TextStyle(fontSize: 12),
                          ),
                          child: const Text('Add'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'No items found',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your filters or search terms',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _applyFilters() {
    setState(() {
      _filteredItems = _allItems.where((item) {
        // Search filter
        final searchTerm = _searchController.text.toLowerCase();
        if (searchTerm.isNotEmpty &&
            !item.name.toLowerCase().contains(searchTerm) &&
            !item.description.toLowerCase().contains(searchTerm)) {
          return false;
        }

        // Category filter
        if (_selectedCategory != 'All' && item.category != _selectedCategory) {
          return false;
        }

        // Price filter
        if (item.price < _priceRange.start || item.price > _priceRange.end) {
          return false;
        }

        // Rating filter
        if (item.rating < _minRating) {
          return false;
        }

        // Stock filter
        if (_showOnlyInStock && item.stock <= 0) {
          return false;
        }

        return true;
      }).toList();

      // Apply sorting
      _filteredItems.sort((a, b) {
        switch (_selectedSort) {
          case SortOption.popularity:
            return b.rating.compareTo(a.rating);
          case SortOption.priceLow:
            return a.price.compareTo(b.price);
          case SortOption.priceHigh:
            return b.price.compareTo(a.price);
          case SortOption.rating:
            return b.rating.compareTo(a.rating);
          case SortOption.newest:
            return b.isNew ? 1 : -1; // Simple sort for demo
        }
      });
    });
  }

  String _getSortOptionText(SortOption option) {
    switch (option) {
      case SortOption.popularity:
        return 'Popularity';
      case SortOption.priceLow:
        return 'Price: Low to High';
      case SortOption.priceHigh:
        return 'Price: High to Low';
      case SortOption.rating:
        return 'Rating';
      case SortOption.newest:
        return 'Newest';
    }
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          padding: const EdgeInsets.all(16),
          height: MediaQuery.of(context).size.height * 0.8,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Filters',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        _priceRange = const RangeValues(0, 500);
                        _minRating = 0.0;
                        _showOnlyInStock = false;
                      });
                    },
                    child: const Text('Reset'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Price Range'),
              RangeSlider(
                values: _priceRange,
                min: 0,
                max: 500,
                divisions: 50,
                labels: RangeLabels(
                  '\$${_priceRange.start.round()}',
                  '\$${_priceRange.end.round()}',
                ),
                onChanged: (values) {
                  setState(() => _priceRange = values);
                },
              ),
              const SizedBox(height: 16),
              const Text('Minimum Rating'),
              Slider(
                value: _minRating,
                min: 0,
                max: 5,
                divisions: 10,
                label: _minRating.toStringAsFixed(1),
                onChanged: (value) {
                  setState(() => _minRating = value);
                },
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                title: const Text('In Stock Only'),
                value: _showOnlyInStock,
                onChanged: (value) {
                  setState(() => _showOnlyInStock = value);
                },
              ),
              const Spacer(),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        _applyFilters();
                        Navigator.of(context).pop();
                      },
                      child: const Text('Apply Filters'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showItemDetails(MarketplaceItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.9,
        child: Column(
          children: [
            // Image
            Container(
              height: 250,
              width: double.infinity,
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: AssetImage(item.image),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            item.name,
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                        ),
                        Text(
                          '\$${item.price.toStringAsFixed(2)}',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.star, color: Colors.amber, size: 20),
                        Text('${item.rating} (${item.reviewCount} reviews)'),
                        const Spacer(),
                        Text('${item.stock} in stock'),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      item.description,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Seller: ${item.seller}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _addToCart(item),
                            icon: const Icon(Icons.add_shopping_cart),
                            label: const Text('Add to Cart'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          onPressed: () => _toggleFavorite(item),
                          icon: const Icon(Icons.favorite_border),
                          style: IconButton.styleFrom(
                            side: BorderSide(
                              color: Theme.of(context).colorScheme.outline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _addToCart(MarketplaceItem item) {
    // TODO: Implement add to cart functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${item.name} added to cart!')),
    );
  }

  void _toggleFavorite(MarketplaceItem item) {
    // TODO: Implement favorite functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${item.name} added to wishlist!')),
    );
  }

  void _showCart() {
    // TODO: Implement cart screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Cart functionality coming soon!')),
    );
  }

  void _showWishlist() {
    // TODO: Implement wishlist screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Wishlist functionality coming soon!')),
    );
  }
}