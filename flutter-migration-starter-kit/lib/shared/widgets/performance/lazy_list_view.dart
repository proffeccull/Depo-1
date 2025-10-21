import 'package:flutter/material.dart';

// Lazy loading list view with performance optimizations
class LazyListView<T> extends StatefulWidget {
  final List<T> items;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final Widget Function(BuildContext context)? loadingBuilder;
  final Widget Function(BuildContext context)? emptyBuilder;
  final int initialLoadCount;
  final int loadMoreCount;
  final double loadMoreThreshold;
  final Future<void> Function()? onLoadMore;
  final bool isLoading;
  final bool hasMoreData;
  final ScrollController? scrollController;
  final EdgeInsetsGeometry? padding;
  final ScrollPhysics? physics;

  const LazyListView({
    Key? key,
    required this.items,
    required this.itemBuilder,
    this.loadingBuilder,
    this.emptyBuilder,
    this.initialLoadCount = 20,
    this.loadMoreCount = 20,
    this.loadMoreThreshold = 200.0,
    this.onLoadMore,
    this.isLoading = false,
    this.hasMoreData = true,
    this.scrollController,
    this.padding,
    this.physics,
  }) : super(key: key);

  @override
  State<LazyListView<T>> createState() => _LazyListViewState<T>();
}

class _LazyListViewState<T> extends State<LazyListView<T>> {
  late ScrollController _scrollController;
  bool _isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    _scrollController = widget.scrollController ?? ScrollController();
    _scrollController.addListener(_onScroll);
  }

  @override
  void didUpdateWidget(LazyListView<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.scrollController != oldWidget.scrollController) {
      _scrollController.removeListener(_onScroll);
      _scrollController = widget.scrollController ?? ScrollController();
      _scrollController.addListener(_onScroll);
    }
  }

  @override
  void dispose() {
    if (widget.scrollController == null) {
      _scrollController.dispose();
    } else {
      _scrollController.removeListener(_onScroll);
    }
    super.dispose();
  }

  void _onScroll() {
    if (_isLoadingMore || !widget.hasMoreData || widget.onLoadMore == null) return;

    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;
    final threshold = widget.loadMoreThreshold;

    if (maxScroll - currentScroll <= threshold) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;

    setState(() => _isLoadingMore = true);

    try {
      await widget.onLoadMore?.call();
    } finally {
      if (mounted) {
        setState(() => _isLoadingMore = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.items.isEmpty && !widget.isLoading) {
      return widget.emptyBuilder?.call(context) ??
          const Center(child: Text('No items found'));
    }

    return ListView.builder(
      controller: _scrollController,
      padding: widget.padding,
      physics: widget.physics,
      itemCount: widget.items.length + (widget.isLoading || _isLoadingMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == widget.items.length) {
          return widget.loadingBuilder?.call(context) ??
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(),
                ),
              );
        }

        return widget.itemBuilder(context, widget.items[index], index);
      },
    );
  }
}

// Lazy loading grid view
class LazyGridView<T> extends StatefulWidget {
  final List<T> items;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final Widget Function(BuildContext context)? loadingBuilder;
  final Widget Function(BuildContext context)? emptyBuilder;
  final int initialLoadCount;
  final int loadMoreCount;
  final double loadMoreThreshold;
  final Future<void> Function()? onLoadMore;
  final bool isLoading;
  final bool hasMoreData;
  final ScrollController? scrollController;
  final EdgeInsetsGeometry? padding;
  final ScrollPhysics? physics;
  final SliverGridDelegate gridDelegate;

  const LazyGridView({
    Key? key,
    required this.items,
    required this.itemBuilder,
    required this.gridDelegate,
    this.loadingBuilder,
    this.emptyBuilder,
    this.initialLoadCount = 20,
    this.loadMoreCount = 20,
    this.loadMoreThreshold = 200.0,
    this.onLoadMore,
    this.isLoading = false,
    this.hasMoreData = true,
    this.scrollController,
    this.padding,
    this.physics,
  }) : super(key: key);

  @override
  State<LazyGridView<T>> createState() => _LazyGridViewState<T>();
}

class _LazyGridViewState<T> extends State<LazyGridView<T>> {
  late ScrollController _scrollController;
  bool _isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    _scrollController = widget.scrollController ?? ScrollController();
    _scrollController.addListener(_onScroll);
  }

  @override
  void didUpdateWidget(LazyGridView<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.scrollController != oldWidget.scrollController) {
      _scrollController.removeListener(_onScroll);
      _scrollController = widget.scrollController ?? ScrollController();
      _scrollController.addListener(_onScroll);
    }
  }

  @override
  void dispose() {
    if (widget.scrollController == null) {
      _scrollController.dispose();
    } else {
      _scrollController.removeListener(_onScroll);
    }
    super.dispose();
  }

  void _onScroll() {
    if (_isLoadingMore || !widget.hasMoreData || widget.onLoadMore == null) return;

    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;
    final threshold = widget.loadMoreThreshold;

    if (maxScroll - currentScroll <= threshold) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore) return;

    setState(() => _isLoadingMore = true);

    try {
      await widget.onLoadMore?.call();
    } finally {
      if (mounted) {
        setState(() => _isLoadingMore = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.items.isEmpty && !widget.isLoading) {
      return widget.emptyBuilder?.call(context) ??
          const Center(child: Text('No items found'));
    }

    return GridView.builder(
      controller: _scrollController,
      padding: widget.padding,
      physics: widget.physics,
      gridDelegate: widget.gridDelegate,
      itemCount: widget.items.length + (widget.isLoading || _isLoadingMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == widget.items.length) {
          return widget.loadingBuilder?.call(context) ??
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: CircularProgressIndicator(),
                ),
              );
        }

        return widget.itemBuilder(context, widget.items[index], index);
      },
    );
  }
}

// Performance optimized image cache
class OptimizedImageCache {
  static const int maxCacheSize = 100; // Maximum number of cached images
  static const Duration cacheDuration = Duration(hours: 24); // Cache duration

  static final Map<String, CachedImageData> _cache = {};
  static final List<String> _accessOrder = [];

  static Widget cachedNetworkImage({
    required String url,
    required String altText,
    double? width,
    double? height,
    BoxFit fit = BoxFit.cover,
    Widget Function(BuildContext, String)? placeholder,
    Widget Function(BuildContext, String, dynamic)? errorWidget,
  }) {
    // Check if image is in cache and not expired
    final cached = _cache[url];
    if (cached != null && !cached.isExpired) {
      _updateAccessOrder(url);
      return cached.imageWidget;
    }

    // Create new cached image
    final imageWidget = Image.network(
      url,
      width: width,
      height: height,
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return placeholder?.call(context, url) ??
            Center(child: CircularProgressIndicator(
              value: loadingProgress.expectedTotalBytes != null
                  ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                  : null,
            ));
      },
      errorBuilder: (context, error, stackTrace) {
        return errorWidget?.call(context, url, error) ??
            const Icon(Icons.broken_image);
      },
    );

    // Cache the image
    _cache[url] = CachedImageData(
      imageWidget: imageWidget,
      timestamp: DateTime.now(),
    );
    _updateAccessOrder(url);
    _cleanupCache();

    return imageWidget;
  }

  static void _updateAccessOrder(String url) {
    _accessOrder.remove(url);
    _accessOrder.add(url);
  }

  static void _cleanupCache() {
    // Remove expired entries
    _cache.removeWhere((key, value) => value.isExpired);

    // Remove least recently used entries if cache is too large
    while (_cache.length > maxCacheSize && _accessOrder.isNotEmpty) {
      final oldestKey = _accessOrder.removeAt(0);
      _cache.remove(oldestKey);
    }
  }

  static void clearCache() {
    _cache.clear();
    _accessOrder.clear();
  }
}

class CachedImageData {
  final Widget imageWidget;
  final DateTime timestamp;

  CachedImageData({
    required this.imageWidget,
    required this.timestamp,
  });

  bool get isExpired {
    return DateTime.now().difference(timestamp) > OptimizedImageCache.cacheDuration;
  }
}

// Memory-efficient list tile with recycling
class OptimizedListTile extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final bool selected;
  final bool dense;
  final EdgeInsetsGeometry? contentPadding;
  final bool enabled;

  const OptimizedListTile({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.onLongPress,
    this.selected = false,
    this.dense = false,
    this.contentPadding,
    this.enabled = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: enabled ? onTap : null,
      onLongPress: enabled ? onLongPress : null,
      child: Container(
        padding: contentPadding ?? const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Row(
          children: [
            if (leading != null) ...[
              leading!,
              const SizedBox(width: 16),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (title != null) title!,
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    subtitle!,
                  ],
                ],
              ),
            ),
            if (trailing != null) ...[
              const SizedBox(width: 16),
              trailing!,
            ],
          ],
        ),
      ),
    );
  }
}

// Background task manager for heavy operations
class BackgroundTaskManager {
  static final Map<String, Future<void>> _runningTasks = {};

  static Future<T> runInBackground<T>(
    String taskId,
    Future<T> Function() task, {
    Duration timeout = const Duration(seconds: 30),
  }) async {
    // Cancel existing task with same ID
    if (_runningTasks.containsKey(taskId)) {
      // Note: In a real implementation, you'd want to properly cancel the task
      _runningTasks.remove(taskId);
    }

    final taskFuture = task().timeout(timeout);
    _runningTasks[taskId] = taskFuture;

    try {
      final result = await taskFuture;
      return result;
    } finally {
      _runningTasks.remove(taskId);
    }
  }

  static void cancelTask(String taskId) {
    _runningTasks.remove(taskId);
  }

  static bool isTaskRunning(String taskId) {
    return _runningTasks.containsKey(taskId);
  }
}

// Code splitting helper for large widgets
class LazyWidget extends StatefulWidget {
  final Widget Function() builder;
  final Widget? placeholder;

  const LazyWidget({
    Key? key,
    required this.builder,
    this.placeholder,
  }) : super(key: key);

  @override
  State<LazyWidget> createState() => _LazyWidgetState();
}

class _LazyWidgetState extends State<LazyWidget> {
  Widget? _builtWidget;

  @override
  void initState() {
    super.initState();
    // Build widget in next frame to avoid blocking UI
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        setState(() {
          _builtWidget = widget.builder();
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return _builtWidget ?? widget.placeholder ?? const SizedBox.shrink();
  }
}