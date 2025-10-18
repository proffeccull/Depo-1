import 'dart:async';
import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client.dart';

class OfflineSyncService {
  final Dio _apiClient;
  final Connectivity _connectivity;
  late Box<Map> _pendingOperationsBox;
  late Box<Map> _cachedDataBox;
  late Box<String> _syncMetadataBox;

  final StreamController<SyncStatus> _syncStatusController = StreamController<SyncStatus>.broadcast();
  Stream<SyncStatus> get syncStatusStream => _syncStatusController.stream;

  OfflineSyncService({
    required Dio apiClient,
    required Connectivity connectivity,
  })  : _apiClient = apiClient,
        _connectivity = connectivity {
    _initializeBoxes();
    _setupConnectivityListener();
  }

  Future<void> _initializeBoxes() async {
    _pendingOperationsBox = await Hive.openBox<Map>('pending_operations');
    _cachedDataBox = await Hive.openBox<Map>('cached_data');
    _syncMetadataBox = await Hive.openBox<String>('sync_metadata');
  }

  void _setupConnectivityListener() {
    _connectivity.onConnectivityChanged.listen((result) async {
      if (result != ConnectivityResult.none) {
        await _syncPendingOperations();
        _syncStatusController.add(SyncStatus.online);
      } else {
        _syncStatusController.add(SyncStatus.offline);
      }
    });
  }

  /// Queue operation for offline execution
  Future<String> queueOperation({
    required String operationId,
    required String endpoint,
    required String method,
    required Map<String, dynamic> data,
    required Map<String, dynamic> metadata,
    int priority = 1, // 1 = high, 2 = normal, 3 = low
  }) async {
    final operation = {
      'id': operationId,
      'endpoint': endpoint,
      'method': method,
      'data': data,
      'metadata': metadata,
      'priority': priority,
      'timestamp': DateTime.now().toIso8601String(),
      'retryCount': 0,
      'status': 'pending',
    };

    await _pendingOperationsBox.put(operationId, operation);

    // Try to execute immediately if online
    final connectivity = await _connectivity.checkConnectivity();
    if (connectivity != ConnectivityResult.none) {
      await _executeOperation(operationId);
    }

    return operationId;
  }

  /// Cache data for offline access
  Future<void> cacheData({
    required String key,
    required Map<String, dynamic> data,
    required Duration ttl,
    String? etag,
  }) async {
    final cacheEntry = {
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
      'expiresAt': DateTime.now().add(ttl).toIso8601String(),
      'etag': etag,
      'version': 1,
    };

    await _cachedDataBox.put(key, cacheEntry);
  }

  /// Get cached data
  Future<Map<String, dynamic>?> getCachedData(String key) async {
    final entry = _cachedDataBox.get(key);
    if (entry == null) return null;

    final expiresAt = DateTime.parse(entry['expiresAt']);
    if (DateTime.now().isAfter(expiresAt)) {
      await _cachedDataBox.delete(key);
      return null;
    }

    return entry['data'];
  }

  /// Check if data is cached and valid
  Future<bool> isDataCached(String key) async {
    final entry = _cachedDataBox.get(key);
    if (entry == null) return false;

    final expiresAt = DateTime.parse(entry['expiresAt']);
    return DateTime.now().isBefore(expiresAt);
  }

  /// Sync all pending operations
  Future<SyncResult> syncPendingOperations() async {
    return await _syncPendingOperations();
  }

  Future<SyncResult> _syncPendingOperations() async {
    final operations = _pendingOperationsBox.values.toList();

    // Sort by priority (high priority first)
    operations.sort((a, b) => (a['priority'] as int).compareTo(b['priority'] as int));

    int successCount = 0;
    int failureCount = 0;
    final errors = <String>[];

    for (final operation in operations) {
      try {
        final success = await _executeOperation(operation['id']);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (e) {
        failureCount++;
        errors.add('${operation['id']}: $e');
      }
    }

    final result = SyncResult(
      successCount: successCount,
      failureCount: failureCount,
      errors: errors,
      timestamp: DateTime.now(),
    );

    // Update sync metadata
    await _updateSyncMetadata(result);

    return result;
  }

  Future<bool> _executeOperation(String operationId) async {
    final operation = _pendingOperationsBox.get(operationId);
    if (operation == null) return false;

    // Skip if already completed
    if (operation['status'] == 'completed') return true;

    try {
      Response response;
      switch (operation['method']) {
        case 'POST':
          response = await _apiClient.post(
            operation['endpoint'],
            data: operation['data'],
          );
          break;
        case 'PUT':
          response = await _apiClient.put(
            operation['endpoint'],
            data: operation['data'],
          );
          break;
        case 'PATCH':
          response = await _apiClient.patch(
            operation['endpoint'],
            data: operation['data'],
          );
          break;
        case 'DELETE':
          response = await _apiClient.delete(
            operation['endpoint'],
            data: operation['data'],
          );
          break;
        default:
          throw UnsupportedError('Unsupported method: ${operation['method']}');
      }

      // Operation successful, mark as completed
      operation['status'] = 'completed';
      operation['completedAt'] = DateTime.now().toIso8601String();
      operation['response'] = response.data;

      await _pendingOperationsBox.put(operationId, operation);

      // Update local cache if needed
      if (operation['metadata']['updateCache'] == true) {
        await cacheData(
          key: operation['metadata']['cacheKey'],
          data: response.data,
          ttl: Duration(hours: 24),
        );
      }

      return true;
    } catch (e) {
      // Increment retry count
      operation['retryCount'] = (operation['retryCount'] ?? 0) + 1;
      operation['lastError'] = e.toString();
      operation['lastAttemptAt'] = DateTime.now().toIso8601String();

      // Mark as failed if max retries exceeded
      if (operation['retryCount'] >= 3) {
        operation['status'] = 'failed';
      }

      await _pendingOperationsBox.put(operationId, operation);
      return false;
    }
  }

  /// Get sync status and statistics
  Future<Map<String, dynamic>> getSyncStatus() async {
    final pendingCount = _pendingOperationsBox.values
        .where((op) => op['status'] == 'pending')
        .length;

    final failedCount = _pendingOperationsBox.values
        .where((op) => op['status'] == 'failed')
        .length;

    final completedCount = _pendingOperationsBox.values
        .where((op) => op['status'] == 'completed')
        .length;

    final cachedEntries = _cachedDataBox.length;

    final lastSync = await _getLastSyncTime();

    return {
      'pendingOperations': pendingCount,
      'failedOperations': failedCount,
      'completedOperations': completedCount,
      'cachedEntries': cachedEntries,
      'isOnline': (await _connectivity.checkConnectivity()) != ConnectivityResult.none,
      'lastSync': lastSync?.toIso8601String(),
    };
  }

  /// Clear completed operations older than specified duration
  Future<void> clearOldOperations({Duration maxAge = const Duration(days: 7)}) async {
    final cutoffDate = DateTime.now().subtract(maxAge);
    final operations = _pendingOperationsBox.values.toList();

    for (final operation in operations) {
      if (operation['status'] == 'completed') {
        final completedAt = DateTime.parse(operation['completedAt']);
        if (completedAt.isBefore(cutoffDate)) {
          await _pendingOperationsBox.delete(operation['id']);
        }
      }
    }
  }

  /// Clear all cached data
  Future<void> clearCache() async {
    await _cachedDataBox.clear();
  }

  /// Clear failed operations
  Future<void> clearFailedOperations() async {
    final operations = _pendingOperationsBox.values.toList();

    for (final operation in operations) {
      if (operation['status'] == 'failed') {
        await _pendingOperationsBox.delete(operation['id']);
      }
    }
  }

  /// Retry failed operations
  Future<SyncResult> retryFailedOperations() async {
    final failedOperations = _pendingOperationsBox.values
        .where((op) => op['status'] == 'failed')
        .toList();

    int successCount = 0;
    int failureCount = 0;
    final errors = <String>[];

    for (final operation in failedOperations) {
      try {
        final success = await _executeOperation(operation['id']);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (e) {
        failureCount++;
        errors.add('${operation['id']}: $e');
      }
    }

    return SyncResult(
      successCount: successCount,
      failureCount: failureCount,
      errors: errors,
      timestamp: DateTime.now(),
    );
  }

  Future<void> _updateSyncMetadata(SyncResult result) async {
    final metadata = {
      'lastSync': result.timestamp.toIso8601String(),
      'successCount': result.successCount,
      'failureCount': result.failureCount,
      'errors': jsonEncode(result.errors),
    };

    await _syncMetadataBox.put('last_sync_result', jsonEncode(metadata));
  }

  Future<DateTime?> _getLastSyncTime() async {
    final metadata = _syncMetadataBox.get('last_sync_result');
    if (metadata == null) return null;

    final decoded = jsonDecode(metadata);
    return DateTime.parse(decoded['lastSync']);
  }

  /// Clean up resources
  void dispose() {
    _syncStatusController.close();
  }
}

// Sync status enum
enum SyncStatus {
  online,
  offline,
  syncing,
  error,
}

// Sync result class
class SyncResult {
  final int successCount;
  final int failureCount;
  final List<String> errors;
  final DateTime timestamp;

  SyncResult({
    required this.successCount,
    required this.failureCount,
    required this.errors,
    required this.timestamp,
  });

  bool get hasErrors => errors.isNotEmpty;
  bool get isSuccessful => failureCount == 0;
}

// Provider for OfflineSyncService
final offlineSyncServiceProvider = Provider<OfflineSyncService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final connectivity = Connectivity();
  return OfflineSyncService(
    apiClient: apiClient,
    connectivity: connectivity,
  );
});