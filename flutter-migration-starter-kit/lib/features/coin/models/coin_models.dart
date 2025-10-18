import 'package:freezed_annotation/freezed_annotation.dart';

part 'coin_models.freezed.dart';
part 'coin_models.g.dart';

@freezed
class CoinBalance with _$CoinBalance {
  const factory CoinBalance({
    required int current,
    required String trend, // 'up' | 'down' | 'stable'
    required double change24h,
    required DateTime lastUpdated,
  }) = _CoinBalance;

  factory CoinBalance.fromJson(Map<String, dynamic> json) =>
      _$CoinBalanceFromJson(json);
}

@freezed
class CoinTransaction with _$CoinTransaction {
  const factory CoinTransaction({
    required String id,
    required String type, // 'earned' | 'spent' | 'purchased' | 'transferred'
    required int amount,
    required String description,
    required DateTime timestamp,
    String? category,
    String? relatedId,
  }) = _CoinTransaction;

  factory CoinTransaction.fromJson(Map<String, dynamic> json) =>
      _$CoinTransactionFromJson(json);
}

@freezed
class CoinMilestone with _$CoinMilestone {
  const factory CoinMilestone({
    required String id,
    required String name,
    required int target,
    required int current,
    required int reward,
    required bool unlocked,
    DateTime? unlockedAt,
  }) = _CoinMilestone;

  factory CoinMilestone.fromJson(Map<String, dynamic> json) =>
      _$CoinMilestoneFromJson(json);
}

@freezed
class CoinStreak with _$CoinStreak {
  const factory CoinStreak({
    required int current,
    required int longest,
    required DateTime lastActivity,
    required int freezeCount,
    required int nextMilestone,
  }) = _CoinStreak;

  factory CoinStreak.fromJson(Map<String, dynamic> json) =>
      _$CoinStreakFromJson(json);
}

@freezed
class Achievement with _$Achievement {
  const factory Achievement({
    required String id,
    required String name,
    required String description,
    required String icon,
    required String rarity, // 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
    required int coinReward,
    required bool unlocked,
    DateTime? unlockedAt,
    int? progress,
    int? target,
  }) = _Achievement;

  factory Achievement.fromJson(Map<String, dynamic> json) =>
      _$AchievementFromJson(json);
}

@freezed
class BattlePass with _$BattlePass {
  const factory BattlePass({
    required String id,
    required String name,
    required int season,
    required int cost,
    required bool purchased,
    required int currentTier,
    required int maxTier,
    required int xpCurrent,
    required int xpRequired,
    required List<dynamic> freeRewards,
    required List<dynamic> premiumRewards,
    required DateTime expiresAt,
  }) = _BattlePass;

  factory BattlePass.fromJson(Map<String, dynamic> json) =>
      _$BattlePassFromJson(json);
}

@freezed
class CoinAnalytics with _$CoinAnalytics {
  const factory CoinAnalytics({
    required Map<String, dynamic> data,
  }) = _CoinAnalytics;

  factory CoinAnalytics.fromJson(Map<String, dynamic> json) =>
      _$CoinAnalyticsFromJson(json);
}