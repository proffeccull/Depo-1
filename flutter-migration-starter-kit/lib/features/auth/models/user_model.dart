import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    String? email,
    String? firstName,
    String? lastName,
    String? phoneNumber,
    String? emailVerified,
    String? profileImageUrl,
    DateTime? createdAt,
    DateTime? lastSignInAt,
    String? role,
    bool? isVerified,
    int? balance,
    int? charityCoins,
    String? trustScore,
    bool? isAgent,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}