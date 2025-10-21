import 'package:freezed_annotation/freezed_annotation.dart';

part 'donation_model.freezed.dart';
part 'donation_model.g.dart';

enum DonationStatus {
  pending,
  processing,
  completed,
  failed,
  refunded,
}

@freezed
class DonationModel with _$DonationModel {
  const factory DonationModel({
    required String id,
    required String userId,
    required String recipientId,
    required double amount,
    required String currency,
    required DonationStatus status,
    required DateTime createdAt,
    DateTime? completedAt,
    String? transactionId,
    String? message,
    bool? isAnonymous,
    Map<String, dynamic>? metadata,
  }) = _DonationModel;

  factory DonationModel.fromJson(Map<String, dynamic> json) =>
      _$DonationModelFromJson(json);
}