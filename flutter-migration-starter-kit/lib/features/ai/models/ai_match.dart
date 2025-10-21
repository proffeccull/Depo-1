import 'package:freezed_annotation/freezed_annotation.dart';

part 'ai_match.freezed.dart';
part 'ai_match.g.dart';

@freezed
class AIMatch with _$AIMatch {
  const factory AIMatch({
    required String id,
    required String charityId,
    required String charityName,
    required double matchScore,
    required Map<String, dynamic> reasons,
    required DateTime createdAt,
  }) = _AIMatch;

  factory AIMatch.fromJson(Map<String, dynamic> json) => _$AIMatchFromJson(json);
}