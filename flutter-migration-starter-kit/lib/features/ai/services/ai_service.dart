import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/encryption_service.dart';
import '../models/ai_match.dart';
import '../models/ai_prediction.dart';
import '../models/fraud_score.dart';

final aiServiceProvider = Provider<AIService>((ref) {
  return AIService(
    apiClient: ref.watch(apiClientProvider),
    encryptionService: ref.watch(encryptionServiceProvider),
  );
});

class AIService {
  final Dio _apiClient;
  final EncryptionService _encryption;

  AIService({
    required Dio apiClient,
    required EncryptionService encryptionService,
  })  : _apiClient = apiClient,
        _encryption = encryptionService;

  /// Generate personalized donation matches using AI
  Future<List<AIMatch>> generateMatches({
    required String userId,
    required double amount,
    required Map<String, dynamic> preferences,
    required Map<String, dynamic> userProfile,
    required List<Map<String, dynamic>> history,
  }) async {
    try {
      // Encrypt sensitive user data before sending
      final encryptedProfile = await _encryption.encryptData(
        jsonEncode(userProfile)
      );
      final encryptedHistory = await _encryption.encryptData(
        jsonEncode(history)
      );

      final response = await _apiClient.post('/ai/matches', data: {
        'userId': userId,
        'amount': amount,
        'preferences': preferences,
        'encryptedProfile': encryptedProfile,
        'encryptedHistory': encryptedHistory,
      });

      final matches = (response.data['matches'] as List)
          .map((json) => AIMatch.fromJson(json))
          .toList();

      return matches;
    } catch (e) {
      throw Exception('Failed to generate AI matches: $e');
    }
  }

  /// Get predictive analytics for user behavior
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
      throw Exception('Failed to get AI predictions: $e');
    }
  }

  /// Assess fraud risk for transaction
  Future<FraudScore> assessFraudRisk({
    required Map<String, dynamic> transaction,
    required Map<String, dynamic> userProfile,
  }) async {
    try {
      final response = await _apiClient.post('/ai/fraud-check', data: {
        'transaction': transaction,
        'userProfile': userProfile,
      });

      return FraudScore.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to assess fraud risk: $e');
    }
  }

  /// Get personalized recommendations
  Future<List<Map<String, dynamic>>> getRecommendations({
    required String userId,
    required String category,
  }) async {
    try {
      final response = await _apiClient.get('/ai/recommendations', queryParameters: {
        'userId': userId,
        'category': category,
      });

      return List<Map<String, dynamic>>.from(response.data['recommendations']);
    } catch (e) {
      throw Exception('Failed to get recommendations: $e');
    }
  }

  /// Update user feedback on AI suggestions
  Future<void> updateFeedback({
    required String userId,
    required String suggestionId,
    required String feedback,
    required double rating,
  }) async {
    try {
      await _apiClient.post('/ai/feedback', data: {
        'userId': userId,
        'suggestionId': suggestionId,
        'feedback': feedback,
        'rating': rating,
      });
    } catch (e) {
      throw Exception('Failed to update AI feedback: $e');
    }
  }
}