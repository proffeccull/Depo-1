import 'package:freezed_annotation/freezed_annotation.dart';

part 'ai_analytics_models.freezed.dart';
part 'ai_analytics_models.g.dart';

@freezed
class AnalyticsDataPoint with _$AnalyticsDataPoint {
  const factory AnalyticsDataPoint({
    required String month,
    required int donations,
    required double impact,
  }) = _AnalyticsDataPoint;

  factory AnalyticsDataPoint.fromJson(Map<String, dynamic> json) =>
      _$AnalyticsDataPointFromJson(json);
}

enum InsightType {
  pattern,
  opportunity,
  geographic,
  behavioral,
  temporal,
}

enum ImpactLevel {
  low,
  medium,
  high,
  critical,
}

@freezed
class AIInsight with _$AIInsight {
  const factory AIInsight({
    required String title,
    required String description,
    required InsightType type,
    required ImpactLevel impact,
    String? actionText,
    String? category,
  }) = _AIInsight;

  factory AIInsight.fromJson(Map<String, dynamic> json) =>
      _$AIInsightFromJson(json);
}

@freezed
class ImpactPrediction with _$ImpactPrediction {
  const factory ImpactPrediction({
    required String timeframe,
    required double predictedImpact,
    required double confidence,
    required List<String> factors,
    String? recommendation,
  }) = _ImpactPrediction;

  factory ImpactPrediction.fromJson(Map<String, dynamic> json) =>
      _$ImpactPredictionFromJson(json);
}

@freezed
class AnalyticsMetrics with _$AnalyticsMetrics {
  const factory AnalyticsMetrics({
    required double totalImpact,
    required int recipientsHelped,
    required double successRate,
    required double averageResponseTime,
    required List<AnalyticsDataPoint> trendData,
    required List<AIInsight> insights,
    required List<ImpactPrediction> predictions,
  }) = _AnalyticsMetrics;

  factory AnalyticsMetrics.fromJson(Map<String, dynamic> json) =>
      _$AnalyticsMetricsFromJson(json);
}

@freezed
class UserBehaviorPattern with _$UserBehaviorPattern {
  const factory UserBehaviorPattern({
    required String patternId,
    required String description,
    required double frequency,
    required DateTime lastOccurrence,
    required List<String> relatedActions,
  }) = _UserBehaviorPattern;

  factory UserBehaviorPattern.fromJson(Map<String, dynamic> json) =>
      _$UserBehaviorPatternFromJson(json);
}