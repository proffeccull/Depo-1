import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/donation_model.dart';
import '../models/recipient_model.dart';

class DonationService {
  final Dio _apiClient;

  DonationService(this._apiClient);

  /// Get AI-powered recipient recommendations
  Future<List<RecipientModel>> getRecipientRecommendations({
    required double amount,
    required String userId,
    int limit = 5,
  }) async {
    try {
      final response = await _apiClient.get('/ai/recipients/recommend', queryParameters: {
        'amount': amount,
        'userId': userId,
        'limit': limit,
      });

      final recipients = (response.data['recipients'] as List)
          .map((json) => RecipientModel.fromJson(json))
          .toList();

      return recipients;
    } catch (e) {
      throw Exception('Failed to get recipient recommendations: $e');
    }
  }

  /// Create a new donation
  Future<DonationModel> createDonation({
    required String userId,
    required String recipientId,
    required double amount,
    required String currency,
    String? message,
    String? category,
  }) async {
    try {
      final donationData = {
        'userId': userId,
        'recipientId': recipientId,
        'amount': amount,
        'currency': currency,
        'message': message,
        'category': category,
        'timestamp': DateTime.now().toIso8601String(),
      };

      final response = await _apiClient.post('/donations', data: donationData);

      return DonationModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create donation: $e');
    }
  }

  /// Get donation history for user
  Future<List<DonationModel>> getDonationHistory({
    required String userId,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _apiClient.get('/donations/history', queryParameters: {
        'userId': userId,
        'limit': limit,
        'offset': offset,
      });

      final donations = (response.data['donations'] as List)
          .map((json) => DonationModel.fromJson(json))
          .toList();

      return donations;
    } catch (e) {
      throw Exception('Failed to get donation history: $e');
    }
  }

  /// Get donation statistics
  Future<Map<String, dynamic>> getDonationStats(String userId) async {
    try {
      final response = await _apiClient.get('/donations/stats', queryParameters: {
        'userId': userId,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to get donation stats: $e');
    }
  }

  /// Process P2P donation (existing crypto payment integration)
  Future<DonationModel> processP2PDonation({
    required String userId,
    required String recipientId,
    required double amount,
    required String paymentMethod, // 'crypto', 'bank_transfer', etc.
    Map<String, dynamic>? paymentDetails,
  }) async {
    try {
      final donationData = {
        'userId': userId,
        'recipientId': recipientId,
        'amount': amount,
        'paymentMethod': paymentMethod,
        'paymentDetails': paymentDetails,
        'type': 'p2p',
      };

      final response = await _apiClient.post('/donations/p2p', data: donationData);

      return DonationModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to process P2P donation: $e');
    }
  }

  /// Get donation impact prediction
  Future<Map<String, dynamic>> getDonationImpact({
    required double amount,
    required String recipientId,
  }) async {
    try {
      final response = await _apiClient.get('/ai/impact/predict', queryParameters: {
        'amount': amount,
        'recipientId': recipientId,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to get donation impact: $e');
    }
  }

  /// Validate donation amount and recipient
  Future<Map<String, dynamic>> validateDonation({
    required String recipientId,
    required double amount,
    required String userId,
  }) async {
    try {
      final response = await _apiClient.post('/donations/validate', data: {
        'recipientId': recipientId,
        'amount': amount,
        'userId': userId,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to validate donation: $e');
    }
  }

  /// Get donation categories
  Future<List<Map<String, dynamic>>> getDonationCategories() async {
    try {
      final response = await _apiClient.get('/donations/categories');
      return List<Map<String, dynamic>>.from(response.data['categories']);
    } catch (e) {
      throw Exception('Failed to get donation categories: $e');
    }
  }

  /// Cancel pending donation
  Future<void> cancelDonation(String donationId) async {
    try {
      await _apiClient.post('/donations/$donationId/cancel');
    } catch (e) {
      throw Exception('Failed to cancel donation: $e');
    }
  }

  /// Get donation receipt
  Future<Map<String, dynamic>> getDonationReceipt(String donationId) async {
    try {
      final response = await _apiClient.get('/donations/$donationId/receipt');
      return response.data;
    } catch (e) {
      throw Exception('Failed to get donation receipt: $e');
    }
  }

  /// Report donation issue
  Future<void> reportDonationIssue({
    required String donationId,
    required String issueType,
    required String description,
  }) async {
    try {
      await _apiClient.post('/donations/$donationId/report', data: {
        'issueType': issueType,
        'description': description,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to report donation issue: $e');
    }
  }
}

// Provider for DonationService
final donationServiceProvider = Provider<DonationService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return DonationService(apiClient);
});