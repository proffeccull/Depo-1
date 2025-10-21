import 'package:freezed_annotation/freezed_annotation.dart';

part 'ai_prediction.freezed.dart';
part 'ai_prediction.g.dart';

@freezed
class AIPrediction with _$AIPrediction {
  const factory AIPrediction({
    required String id,
    required String userId,
    required String predictionType,
    required Map<String, dynamic> data,
    required double confidence,
    required DateTime predictedAt,
    required DateTime validUntil,
  }) = _AIPrediction;

  factory AIPrediction.fromJson(Map<String, dynamic> json) => _$AIPredictionFromJson(json);
}