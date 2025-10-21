import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'connectivity_service.dart';

// Offline Sync Service Provider
final offlineSyncProvider = Provider<OfflineSyncService>((ref) {
  final connectivityService = ref.watch(connectivityProvider);
  return OfflineSyncService(connectivityService);
});

// Sync status provider
final syncStatusProvider = StreamProvider<SyncStatus>((ref) {
  final syncService = ref.watch(offlineSyncProvider);
  return syncService.syncStatusStream;
});

// Sync queue provider
final syncQueueProvider = StreamProvider<List<SyncOperation>>((ref) {
  final syncService = ref.watch(offlineSyncProvider);
  return syncService.syncQueueStream;
});

// Offline Sync Service
class OfflineSyncService {
  final ConnectivityService _connectivityService;
  final StreamController<SyncStatus> _syncStatusController = StreamController<SyncStatus>.broadcast();
  final StreamController<List<SyncOperation>> _syncQueueController = StreamController<List<SyncOperation>>.broadcast();

  Stream<SyncStatus> get syncStatusStream => _syncStatusController.stream;
  Stream<List<SyncOperation>> get syncQueueStream => _syncQueueController.stream;

  late Box<SyncOperation> _syncQueueBox;
  late Box<String> _cacheBox;
  late Box<String> _userDataBox;

  Timer? _syncTimer;
  bool _isInitialized = false;

  OfflineSyncService(this._connectivityService) {
    _initialize();
  }

  Future<void> _initialize() async {
    if (_isInitialized) return;

    // Initialize Hive boxes
    _syncQueueBox = await Hive.openBox<SyncOperation>('sync_queue');
    _cacheBox = await Hive.openBox<String>('api_cache');
    _userDataBox = await Hive.openBox<String>('user_data');

    // Listen to connectivity changes
    _connectivityService.connectionStream.listen((isOnline) {
      if (isOnline) {
        _startSyncProcess();
      } else {
        _syncStatusController.add(SyncStatus.offline);
      }
    });

    // Start periodic sync check
    _syncTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (_connectivityService.isOnline()) {
        _startSyncProcess();
      }
    });

    _isInitialized = true;
    _updateSyncQueue();
  }

  // Queue an operation for sync
  Future<void> queueOperation(SyncOperation operation) async {
    await _syncQueueBox.add(operation);
    _updateSyncQueue();

    // If online, try to sync immediately
    if (await _connectivityService.isOnline()) {
      _startSyncProcess();
    }
  }

  // Cache API response
  Future<void> cacheResponse(String key, dynamic data, {Duration? ttl}) async {
    final cacheEntry = CacheEntry(
      data: data,
      timestamp: DateTime.now(),
      ttl: ttl,
    );
    await _cacheBox.put(key, jsonEncode(cacheEntry.toJson()));
  }

  // Get cached response
  Future<dynamic> getCachedResponse(String key) async {
    final cached = _cacheBox.get(key);
    if (cached == null) return null;

    try {
      final cacheEntry = CacheEntry.fromJson(jsonDecode(cached));

      // Check if cache is expired
      if (cacheEntry.isExpired) {
        await _cacheBox.delete(key);
        return null;
      }

      return cacheEntry.data;
    } catch (e) {
      await _cacheBox.delete(key);
      return null;
    }
  }

  // Store user data locally
  Future<void> storeUserData(String key, dynamic data) async {
    await _userDataBox.put(key, jsonEncode(data));
  }

  // Get stored user data
  Future<dynamic> getUserData(String key) async {
    final data = _userDataBox.get(key);
    if (data == null) return null;

    try {
      return jsonDecode(data);
    } catch (e) {
      return null;
    }
  }

  // Clear all cached data
  Future<void> clearCache() async {
    await _cacheBox.clear();
  }

  // Clear sync queue
  Future<void> clearSyncQueue() async {
    await _syncQueueBox.clear();
    _updateSyncQueue();
  }

  // Get sync statistics
  Future<SyncStats> getSyncStats() async {
    final pendingOperations = _syncQueueBox.values.length;
    final cachedItems = _cacheBox.length;
    final userDataItems = _userDataBox.length;

    return SyncStats(
      pendingOperations: pendingOperations,
      cachedItems: cachedItems,
      userDataItems: userDataItems,
      lastSyncTime: await _getLastSyncTime(),
    );
  }

  Future<void> _startSyncProcess() async {
    if (_syncStatusController.hasListener && _syncStatusController.isClosed) return;

    _syncStatusController.add(SyncStatus.syncing);

    try {
      final operations = _syncQueueBox.values.toList();
      int successCount = 0;
      int failureCount = 0;

      for (final operation in operations) {
        try {
          final success = await _executeOperation(operation);
          if (success) {
            await operation.delete();
            successCount++;
          } else {
            failureCount++;
          }
        } catch (e) {
          failureCount++;
          print('Sync operation failed: $e');
        }
      }

      _updateSyncQueue();
      _syncStatusController.add(SyncStatus.synced);

      if (successCount > 0 || failureCount > 0) {
        print('Sync completed: $successCount successful, $failureCount failed');
      }
    } catch (e) {
      _syncStatusController.add(SyncStatus.error);
      print('Sync process failed: $e');
    }
  }

  Future<bool> _executeOperation(SyncOperation operation) async {
    // This would integrate with your API client to execute the operation
    // For now, we'll simulate success
    await Future.delayed(const Duration(milliseconds: 100));
    return true;
  }

  Future<DateTime?> _getLastSyncTime() async {
    // This would be stored in a separate box or shared preferences
    return DateTime.now().subtract(const Duration(hours: 1));
  }

  void _updateSyncQueue() {
    final operations = _syncQueueBox.values.toList();
    if (!_syncQueueController.isClosed) {
      _syncQueueController.add(operations);
    }
  }

  void dispose() {
    _syncTimer?.cancel();
    _syncStatusController.close();
    _syncQueueController.close();
    _syncQueueBox.close();
    _cacheBox.close();
    _userDataBox.close();
  }
}

// Sync Operation Model
class SyncOperation {
  final String id;
  final String type; // 'create', 'update', 'delete'
  final String endpoint;
  final Map<String, dynamic> data;
  final DateTime timestamp;
  final int retryCount;

  SyncOperation({
    required this.id,
    required this.type,
    required this.endpoint,
    required this.data,
    DateTime? timestamp,
    this.retryCount = 0,
  }) : timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'endpoint': endpoint,
    'data': data,
    'timestamp': timestamp.toIso8601String(),
    'retryCount': retryCount,
  };

  factory SyncOperation.fromJson(Map<String, dynamic> json) => SyncOperation(
    id: json['id'],
    type: json['type'],
    endpoint: json['endpoint'],
    data: json['data'],
    timestamp: DateTime.parse(json['timestamp']),
    retryCount: json['retryCount'] ?? 0,
  );
}

// Cache Entry Model
class CacheEntry {
  final dynamic data;
  final DateTime timestamp;
  final Duration? ttl;

  CacheEntry({
    required this.data,
    required this.timestamp,
    this.ttl,
  });

  bool get isExpired {
    if (ttl == null) return false;
    return DateTime.now().difference(timestamp) > ttl!;
  }

  Map<String, dynamic> toJson() => {
    'data': data,
    'timestamp': timestamp.toIso8601String(),
    'ttl': ttl?.inSeconds,
  };

  factory CacheEntry.fromJson(Map<String, dynamic> json) => CacheEntry(
    data: json['data'],
    timestamp: DateTime.parse(json['timestamp']),
    ttl: json['ttl'] != null ? Duration(seconds: json['ttl']) : null,
  );
}

// Sync Status Enum
enum SyncStatus {
  offline,
  syncing,
  synced,
  error,
}

// Sync Statistics
class SyncStats {
  final int pendingOperations;
  final int cachedItems;
  final int userDataItems;
  final DateTime? lastSyncTime;

  SyncStats({
    required this.pendingOperations,
    required this.cachedItems,
    required this.userDataItems,
    this.lastSyncTime,
  });
}

// Offline-aware API wrapper
class OfflineAwareApi {
  final OfflineSyncService _syncService;

  OfflineAwareApi(this._syncService);

  Future<ApiResult<T>> call<T>(
    String endpoint,
    Future<T> Function() apiCall, {
    bool cacheResponse = false,
    Duration? cacheTtl,
    bool queueOnFailure = false,
    String? operationType,
    Map<String, dynamic>? operationData,
  }) async {
    // Try to get cached response first
    if (cacheResponse) {
      final cached = await _syncService.getCachedResponse(endpoint);
      if (cached != null) {
        return ApiResult.success(cached, isFromCache: true);
      }
    }

    try {
      final result = await apiCall();

      // Cache the response if requested
      if (cacheResponse) {
        await _syncService.cacheResponse(endpoint, result, ttl: cacheTtl);
      }

      return ApiResult.success(result);
    } catch (e) {
      // If offline and we have cached data, return it
      if (cacheResponse) {
        final cached = await _syncService.getCachedResponse(endpoint);
        if (cached != null) {
          return ApiResult.success(cached, isFromCache: true, isOffline: true);
        }
      }

      // Queue operation for later sync if requested
      if (queueOnFailure && operationType != null && operationData != null) {
        final operation = SyncOperation(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          type: operationType,
          endpoint: endpoint,
          data: operationData,
        );
        await _syncService.queueOperation(operation);
      }

      return ApiResult.error(e.toString(), isOffline: true);
    }
  }
}

// API Result wrapper
class ApiResult<T> {
  final bool success;
  final T? data;
  final String? error;
  final bool isFromCache;
  final bool isOffline;

  ApiResult._({
    required this.success,
    this.data,
    this.error,
    this.isFromCache = false,
    this.isOffline = false,
  });

  factory ApiResult.success(T data, {bool isFromCache = false, bool isOffline = false}) {
    return ApiResult._(
      success: true,
      data: data,
      isFromCache: isFromCache,
      isOffline: isOffline,
    );
  }

  factory ApiResult.error(String error, {bool isOffline = false}) {
    return ApiResult._(
      success: false,
      error: error,
      isOffline: isOffline,
    );
  }
}