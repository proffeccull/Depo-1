import 'package:freezed_annotation/freezed_annotation.dart';

part 'donation_models.freezed.dart';
part 'donation_models.g.dart';

@freezed
class DonationCycle with _$DonationCycle {
  const factory DonationCycle({
    required String id,
    required String giverId,
    String? receiverId,
    required int amount,
    required String currency,
    required String status, // 'pending', 'matched', 'completed', 'cancelled'
    String? transactionId,
    String? paymentMethod,
    DateTime? matchedAt,
    DateTime? completedAt,
    DateTime? expiresAt,
    required DateTime createdAt,
    required DateTime updatedAt,
    Map<String, dynamic>? metadata,
  }) = _DonationCycle;

  factory DonationCycle.fromJson(Map<String, dynamic> json) =>
      _$DonationCycleFromJson(json);
}

@freezed
class DonationParty with _$DonationParty {
  const factory DonationParty({
    required String id,
    required String cycleId,
    required String userId,
    required String role, // 'giver', 'receiver'
    required bool confirmedReceipt,
    DateTime? confirmedAt,
    String? feedback,
    int? rating,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _DonationParty;

  factory DonationParty.fromJson(Map<String, dynamic> json) =>
      _$DonationPartyFromJson(json);
}

@freezed
class DonationRequest with _$DonationRequest {
  const factory DonationRequest({
    required int amount,
    required String currency,
    required String recipientPreference, // 'algorithm', 'manual'
    String? recipientId,
    String? location,
    String? faith,
    String? message,
    bool? anonymous,
    Map<String, dynamic>? metadata,
  }) = _DonationRequest;

  factory DonationRequest.fromJson(Map<String, dynamic> json) =>
      _$DonationRequestFromJson(json);
}

@freezed
class DonationResult with _$DonationResult {
  const factory DonationResult({
    required String cycleId,
    required String transactionId,
    required int amount,
    required String currency,
    String? receiverId,
    String? receiverName,
    String? message,
    required DateTime createdAt,
  }) = _DonationResult;

  factory DonationResult.fromJson(Map<String, dynamic> json) =>
      _$DonationResultFromJson(json);
}

@freezed
class ReceiptConfirmation with _$ReceiptConfirmation {
  const factory ReceiptConfirmation({
    required String transactionId,
    required bool confirm,
    String? feedback,
    int? rating,
  }) = _ReceiptConfirmation;

  factory ReceiptConfirmation.fromJson(Map<String, dynamic> json) =>
      _$ReceiptConfirmationFromJson(json);
}

@freezed
class DonationStats with _$DonationStats {
  const factory DonationStats({
    required int totalDonated,
    required int totalReceived,
    required int cyclesCompleted,
    required int cyclesPending,
    required int averageRating,
    required int totalRatings,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _DonationStats;

  factory DonationStats.fromJson(Map<String, dynamic> json) =>
      _$DonationStatsFromJson(json);
}

@freezed
class DonationHistory with _$DonationHistory {
  const factory DonationHistory({
    required List<DonationCycle> cycles,
    required int totalCount,
    required int page,
    required int limit,
    required bool hasMore,
  }) = _DonationHistory;

  factory DonationHistory.fromJson(Map<String, dynamic> json) =>
      _$DonationHistoryFromJson(json);
}