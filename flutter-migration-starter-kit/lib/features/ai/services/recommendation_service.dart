import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/ai_match.dart';
import '../models/ai_prediction.dart';

class RecommendationService {
  final Dio _apiClient;

  RecommendationService(this._apiClient);

  /// Get personalized donation recommendations
  Future<List<AIMatch>> getDonationRecommendations({
    required String userId,
    required double amount,
    int limit = 5,
  }) async {
    try {
      final response = await _apiClient.get('/ai/recommendations/donations', queryParameters: {
        'userId': userId,
        'amount': amount,
        'limit': limit,
      });

      final recommendations = (response.data['recommendations'] as List)
          .map((json) => AIMatch.fromJson(json))
          .toList();

      return recommendations;
    } catch (e) {
      throw Exception('Failed to get donation recommendations: $e');
    }
  }

  /// Get recipient matching recommendations
  Future<List<AIMatch>> getRecipientRecommendations({
    required String userId,
    required double amount,
    int limit = 3,
  }) async {
    try {
      final response = await _apiClient.get('/ai/recommendations/recipients', queryParameters: {
        'userId': userId,
        'amount': amount,
        'limit': limit,
      });

      final recommendations = (response.data['recommendations'] as List)
          .map((json) => AIMatch.fromJson(json))
          .toList();

      return recommendations;
    } catch (e) {
      throw Exception('Failed to get recipient recommendations: $e');
    }
  }

  /// Get marketplace item recommendations
  Future<List<AIMatch>> getMarketplaceRecommendations({
    required String userId,
    int limit = 5,
  }) async {
    try {
      final response = await _apiClient.get('/ai/recommendations/marketplace', queryParameters: {
        'userId': userId,
        'limit': limit,
      });

      final recommendations = (response.data['recommendations'] as List)
          .map((json) => AIMatch.fromJson(json))
          .toList();

      return recommendations;
    } catch (e) {
      throw Exception('Failed to get marketplace recommendations: $e');
    }
  }

  /// Get social circle recommendations
  Future<List<AIMatch>> getSocialCircleRecommendations({
    required String userId,
    int limit = 3,
  }) async {
    try {
      final response = await _apiClient.get('/ai/recommendations/circles', queryParameters: {
        'userId': userId,
        'limit': limit,
      });

      final recommendations = (response.data['recommendations'] as List)
          .map((json) => AIMatch.fromJson(json))
          .toList();

      return recommendations;
    } catch (e) {
      throw Exception('Failed to get social circle recommendations: $e');
    }
  }

  /// Get gamification suggestions
  Future<List<AIMatch>> getGamificationSuggestions({
    required String userId,
  }) async {
    try {
      final response = await _apiClient.get('/ai/recommendations/gamification', queryParameters: {
        'userId': userId,
      });

      final recommendations = (response.data['recommendations'] as List)
          .map((json) => AIMatch.fromJson(json))
          .toList();

      return recommendations;
    } catch (e) {
      throw Exception('Failed to get gamification suggestions: $e');
    }
  }

  /// Get AI-powered donation amount suggestions
  Future<List<Map<String, dynamic>>> getAmountSuggestions({
    required String userId,
    required String recipientId,
  }) async {
    try {
      final response = await _apiClient.get('/ai/recommendations/amounts', queryParameters: {
        'userId': userId,
        'recipientId': recipientId,
      });

      return List<Map<String, dynamic>>.from(response.data['suggestions']);
    } catch (e) {
      throw Exception('Failed to get amount suggestions: $e');
    }
  }

  /// Get optimal donation timing suggestions
  Future<Map<String, dynamic>> getOptimalTiming({
    required String userId,
  }) async {
    try {
      final response = await _apiClient.get('/ai/timing/optimal', queryParameters: {
        'userId': userId,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to get optimal timing: $e');
    }
  }

  /// Get user behavior analysis and insights
  Future<Map<String, dynamic>> getUserInsights({
    required String userId,
  }) async {
    try {
      final response = await _apiClient.get('/ai/insights/user', queryParameters: {
        'userId': userId,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to get user insights: $e');
    }
  }

  /// Get comprehensive AI insights dashboard
  Future<Map<String, dynamic>> getInsightsDashboard({
    required String userId,
  }) async {
    try {
      final response = await _apiClient.get('/ai/insights/dashboard', queryParameters: {
        'userId': userId,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to get insights dashboard: $e');
    }
  }

  /// Get donation impact predictions
  Future<Map<String, dynamic>> getImpactPredictions({
    required double amount,
    required String currency,
  }) async {
    try {
      final response = await _apiClient.get('/ai/predictions/impact', queryParameters: {
        'amount': amount,
        'currency': currency,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to get impact predictions: $e');
    }
  }

  /// Get behavioral predictions
  Future<List<AIPrediction>> getPredictions({
    required String userId,
    required String timeframe,
  }) async {
    try {
      final response = await _apiClient.get('/ai/predictions', queryParameters: {
        'userId': userId,
        'timeframe': timeframe,
      });

      final predictions = (response.data['predictions'] as List)
          .map((json) => AIPrediction.fromJson(json))
          .toList();

      return predictions;
    } catch (e) {
      throw Exception('Failed to get predictions: $e');
    }
  }

  /// Submit user feedback on AI recommendations
  Future<void> submitFeedback({
    required String recommendationId,
    required double rating,
    required bool helpful,
    String? comments,
  }) async {
    try {
      await _apiClient.post('/ai/feedback', data: {
        'recommendationId': recommendationId,
        'rating': rating,
        'helpful': helpful,
        'comments': comments,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to submit feedback: $e');
    }
  }

  /// Update recommendation interaction
  Future<void> updateRecommendationInteraction({
    required String recommendationId,
    required String interactionType, // 'viewed', 'clicked', 'dismissed'
  }) async {
    try {
      await _apiClient.patch('/ai/recommendations/$recommendationId/interaction', data: {
        'interactionType': interactionType,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to update recommendation interaction: $e');
    }
  }

  /// Get recommendation performance metrics
  Future<Map<String, dynamic>> getRecommendationMetrics({
    required String userId,
    String? timeframe,
  }) async {
    try {
      final response = await _apiClient.get('/ai/metrics/recommendations', queryParameters: {
        'userId': userId,
        'timeframe': timeframe,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to get recommendation metrics: $e');
    }
  }

  /// Refresh user recommendation model
  Future<void> refreshUserModel(String userId) async {
    try {
      await _apiClient.post('/ai/models/refresh', data: {
        'userId': userId,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to refresh user model: $e');
    }
  }
}

// Provider for RecommendationService
final recommendationServiceProvider = Provider<RecommendationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return RecommendationService(apiClient);
});