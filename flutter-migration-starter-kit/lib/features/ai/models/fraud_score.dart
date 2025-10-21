import 'package:freezed_annotation/freezed_annotation.dart';

part 'fraud_score.freezed.dart';
part 'fraud_score.g.dart';

@freezed
class FraudScore with _$FraudScore {
  const factory FraudScore({
    required String transactionId,
    required double riskScore,
    required String riskLevel, // 'low', 'medium', 'high', 'critical'
    required Map<String, dynamic> riskFactors,
    required List<String> flags,
    required DateTime assessedAt,
    required String recommendation,
  }) = _FraudScore;

  factory FraudScore.fromJson(Map<String, dynamic> json) => _$FraudScoreFromJson(json);
}