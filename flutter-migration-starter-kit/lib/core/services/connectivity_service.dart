import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Connectivity Provider
final connectivityProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService();
});

// Connectivity status provider
final connectivityStatusProvider = StreamProvider<bool>((ref) {
  final connectivityService = ref.watch(connectivityProvider);
  return connectivityService.connectionStream;
});

// Connectivity Service for network monitoring
class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  final StreamController<bool> _connectionController = StreamController<bool>.broadcast();
  Stream<bool> get connectionStream => _connectionController.stream;

  ConnectivityService() {
    _initialize();
  }

  void _initialize() {
    // Listen to connectivity changes
    _subscription = _connectivity.onConnectivityChanged.listen((results) {
      final isOnline = _isOnline(results);
      _connectionController.add(isOnline);
    });
  }

  // Check current connectivity status
  Future<bool> isOnline() async {
    try {
      final results = await _connectivity.checkConnectivity();
      return _isOnline(results);
    } catch (e) {
      return false;
    }
  }

  // Determine if connectivity result means online
  bool _isOnline(List<ConnectivityResult> results) {
    // Consider online if any result is not none
    return results.any((result) => result != ConnectivityResult.none);
  }

  // Get detailed connectivity information
  Future<Map<String, dynamic>> getConnectivityInfo() async {
    final results = await _connectivity.checkConnectivity();

    return {
      'isOnline': _isOnline(results),
      'connectionType': results.isNotEmpty ? results.first.name : 'unknown',
      'timestamp': DateTime.now().toIso8601String(),
    };
  }

  // Check if connection is suitable for large data transfers
  Future<bool> isHighBandwidth() async {
    final results = await _connectivity.checkConnectivity();
    // Consider WiFi and Ethernet as high bandwidth
    return results.any((result) => result == ConnectivityResult.wifi || result == ConnectivityResult.ethernet);
  }

  // Check if connection is suitable for real-time features
  Future<bool> isRealTimeSuitable() async {
    final results = await _connectivity.checkConnectivity();
    // WiFi and mobile data are suitable for real-time features
    return results.any((result) => result == ConnectivityResult.wifi ||
           result == ConnectivityResult.mobile ||
           result == ConnectivityResult.ethernet);
  }

  // Get connection quality estimate
  Future<String> getConnectionQuality() async {
    final results = await _connectivity.checkConnectivity();

    // Find the best connection quality
    if (results.any((result) => result == ConnectivityResult.wifi || result == ConnectivityResult.ethernet)) {
      return 'high'; // High bandwidth, low latency
    } else if (results.any((result) => result == ConnectivityResult.mobile)) {
      return 'medium'; // Variable bandwidth and latency
    } else {
      return 'offline'; // No connection
    }
  }

  // Monitor connection for a specific duration
  Future<List<Map<String, dynamic>>> monitorConnection({
    Duration duration = const Duration(minutes: 5),
    Duration interval = const Duration(seconds: 30),
  }) async {
    final List<Map<String, dynamic>> readings = [];
    final startTime = DateTime.now();

    final timer = Timer.periodic(interval, (timer) async {
      if (DateTime.now().difference(startTime) >= duration) {
        timer.cancel();
        return;
      }

      final info = await getConnectivityInfo();
      readings.add({
        ...info,
        'readingTime': DateTime.now().toIso8601String(),
      });
    });

    // Wait for monitoring to complete
    await Future.delayed(duration);
    timer.cancel();

    return readings;
  }

  // Clean up resources
  void dispose() {
    _subscription?.cancel();
    _connectionController.close();
  }
}

// Network-aware operation wrapper
class NetworkAwareOperation<T> {
  final ConnectivityService _connectivityService;

  NetworkAwareOperation(this._connectivityService);

  // Execute operation with network awareness
  Future<OperationResult<T>> execute(
    Future<T> Function() operation, {
    bool requiresNetwork = true,
    Duration? timeout,
    Future<T> Function()? offlineFallback,
  }) async {
    try {
      final isOnline = await _connectivityService.isOnline();

      if (requiresNetwork && !isOnline) {
        if (offlineFallback != null) {
          final result = await offlineFallback();
          return OperationResult.success(result, isOffline: true);
        }
        return OperationResult.offline();
      }

      final result = timeout != null
          ? await operation().timeout(timeout)
          : await operation();

      return OperationResult.success(result);
    } catch (e) {
      return OperationResult.error(e.toString());
    }
  }
}

// Operation result wrapper
class OperationResult<T> {
  final bool success;
  final T? data;
  final String? error;
  final bool isOffline;

  OperationResult._({
    required this.success,
    this.data,
    this.error,
    this.isOffline = false,
  });

  factory OperationResult.success(T data, {bool isOffline = false}) {
    return OperationResult._(
      success: true,
      data: data,
      isOffline: isOffline,
    );
  }

  factory OperationResult.error(String error) {
    return OperationResult._(
      success: false,
      error: error,
    );
  }

  factory OperationResult.offline() {
    return OperationResult._(
      success: false,
      error: 'No internet connection',
      isOffline: true,
    );
  }
}

// Network quality enum for more detailed classification
enum NetworkQuality {
  offline,
  poor,      // 2G or very weak signal
  fair,      // 3G or weak WiFi
  good,      // 4G or stable WiFi
  excellent, // 5G or high-speed connection
}

// Extended connectivity info
class ExtendedConnectivityInfo {
  final ConnectivityResult result;
  final NetworkQuality quality;
  final bool isOnline;
  final String? networkName;
  final int? signalStrength;

  ExtendedConnectivityInfo({
    required this.result,
    required this.quality,
    required this.isOnline,
    this.networkName,
    this.signalStrength,
  });

  factory ExtendedConnectivityInfo.fromConnectivityResult(ConnectivityResult result) {
    final isOnline = result != ConnectivityResult.none;
    final quality = _determineNetworkQuality(result);

    return ExtendedConnectivityInfo(
      result: result,
      quality: quality,
      isOnline: isOnline,
    );
  }

  static NetworkQuality _determineNetworkQuality(ConnectivityResult result) {
    switch (result) {
      case ConnectivityResult.wifi:
        return NetworkQuality.excellent;
      case ConnectivityResult.ethernet:
        return NetworkQuality.excellent;
      case ConnectivityResult.mobile:
        return NetworkQuality.good; // Assume 4G+ for mobile
      case ConnectivityResult.none:
      default:
        return NetworkQuality.offline;
    }
  }

  bool get canHandleLargeTransfers => quality == NetworkQuality.excellent || quality == NetworkQuality.good;
  bool get canHandleRealTime => quality != NetworkQuality.offline && quality != NetworkQuality.poor;
  bool get shouldUseLowBandwidthMode => quality == NetworkQuality.poor || quality == NetworkQuality.fair;
}