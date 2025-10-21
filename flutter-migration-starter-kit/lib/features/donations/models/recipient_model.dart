import 'package:freezed_annotation/freezed_annotation.dart';

part 'recipient_model.freezed.dart';
part 'recipient_model.g.dart';

enum RecipientCategory {
  individual,
  organization,
  community,
  emergency,
  education,
  healthcare,
  environment,
  animalWelfare,
}

@freezed
class RecipientModel with _$RecipientModel {
  const factory RecipientModel({
    required String id,
    required String name,
    required String description,
    required RecipientCategory category,
    required String location,
    required String imageUrl,
    required double trustScore,
    required int totalDonations,
    required double totalRaised,
    required bool isVerified,
    required DateTime createdAt,
    String? profileImageUrl,
    String? website,
    String? contactEmail,
    List<String>? tags,
    Map<String, dynamic>? metadata,
  }) = _RecipientModel;

  factory RecipientModel.fromJson(Map<String, dynamic> json) =>
      _$RecipientModelFromJson(json);
}