import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/connectivity_service.dart';

// API Client Provider
final apiClientProvider = Provider<Dio>((ref) {
  final connectivityService = ref.watch(connectivityProvider);
  return ApiClient.create(connectivityService);
});

// API Client Configuration
class ApiClient {
  static Dio create(ConnectivityService connectivityService) {
    final dio = Dio(BaseOptions(
      baseUrl: 'https://api.chaingive.com', // Update with actual API URL
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    dio.interceptors.addAll([
      AuthInterceptor(),
      ConnectivityInterceptor(connectivityService),
      LoggingInterceptor(),
      RetryInterceptor(dio),
    ]);

    return dio;
  }
}

// Authentication Interceptor
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Add authentication token if available
    // final token = await secureStorage.read(key: 'auth_token');
    // if (token != null) {
    //   options.headers['Authorization'] = 'Bearer $token';
    // }

    // Add device and app info
    options.headers.addAll({
      'X-App-Version': '2.4.0',
      'X-Platform': 'flutter',
      'X-Device-Type': 'mobile',
    });

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Handle token expiration
      // Navigate to login screen
    }
    handler.next(err);
  }
}

// Connectivity Interceptor
class ConnectivityInterceptor extends Interceptor {
  final ConnectivityService _connectivityService;

  ConnectivityInterceptor(this._connectivityService);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final isOnline = await _connectivityService.isOnline();

    if (!isOnline && !options.extra.containsKey('allowOffline')) {
      // Queue request for later if offline
      handler.reject(
        DioException(
          requestOptions: options,
          type: DioExceptionType.unknown,
          error: 'No internet connection',
        ),
      );
      return;
    }

    handler.next(options);
  }
}

// Logging Interceptor
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('🌐 API Request: ${options.method} ${options.path}');
    if (options.data != null) {
      print('📤 Request Data: ${options.data}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('✅ API Response: ${response.statusCode} ${response.requestOptions.path}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    print('❌ API Error: ${err.type} ${err.message}');
    if (err.response != null) {
      print('Response: ${err.response?.data}');
    }
    handler.next(err);
  }
}

// Retry Interceptor for network resilience
class RetryInterceptor extends Interceptor {
  final Dio dio;
  final int maxRetries = 3;

  RetryInterceptor(this.dio);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final options = err.requestOptions;

    if (_shouldRetry(err) && options.extra['retryCount'] < maxRetries) {
      options.extra['retryCount'] = (options.extra['retryCount'] ?? 0) + 1;

      // Exponential backoff
      final delay = Duration(seconds: options.extra['retryCount']);
      await Future.delayed(delay);

      try {
        final response = await dio.request(
          options.path,
          data: options.data,
          queryParameters: options.queryParameters,
          options: Options(
            method: options.method,
            headers: options.headers,
            extra: options.extra,
          ),
        );
        handler.resolve(response);
        return;
      } catch (e) {
        // Continue to error handling if retry fails
      }
    }

    handler.next(err);
  }

  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
           err.type == DioExceptionType.receiveTimeout ||
           err.type == DioExceptionType.sendTimeout ||
           (err.response?.statusCode ?? 0) >= 500;
  }
}

// API Response wrapper for consistent error handling
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;
  final int? statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.statusCode,
  });

  factory ApiResponse.success(T data) {
    return ApiResponse(success: true, data: data);
  }

  factory ApiResponse.error(String error, {int? statusCode}) {
    return ApiResponse(
      success: false,
      error: error,
      statusCode: statusCode,
    );
  }

  factory ApiResponse.fromDioResponse(Response response) {
    try {
      if (response.statusCode != null &&
          response.statusCode! >= 200 &&
          response.statusCode! < 300) {
        return ApiResponse.success(response.data);
      } else {
        return ApiResponse.error(
          response.data?['message'] ?? 'Unknown error',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      return ApiResponse.error('Failed to parse response');
    }
  }
}

// API Service base class for consistent API calls
abstract class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  // Helper method for GET requests
  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.fromDioResponse(response);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  // Helper method for POST requests
  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.fromDioResponse(response);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  // Helper method for PUT requests
  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.fromDioResponse(response);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  // Helper method for DELETE requests
  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.fromDioResponse(response);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }
}