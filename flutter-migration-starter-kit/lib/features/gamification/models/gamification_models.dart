import 'package:freezed_annotation/freezed_annotation.dart';

part 'gamification_models.freezed.dart';
part 'gamification_models.g.dart';

@freezed
class DailyMission with _$DailyMission {
  const factory DailyMission({
    required String id,
    required String userId,
    required DateTime date,

    // Mission 1
    required String mission1Type,
    required String mission1Name,
    required String mission1Desc,
    required bool mission1Done,
    required int mission1Reward,

    // Mission 2
    required String mission2Type,
    required String mission2Name,
    required String mission2Desc,
    required bool mission2Done,
    required int mission2Reward,

    // Mission 3
    required String mission3Type,
    required String mission3Name,
    required String mission3Desc,
    required bool mission3Done,
    required int mission3Reward,

    // Overall status
    required bool allCompleted,
    required int bonusReward,
    required int totalCoinsEarned,

    required DateTime createdAt,
    DateTime? completedAt,
  }) = _DailyMission;

  factory DailyMission.fromJson(Map<String, dynamic> json) =>
      _$DailyMissionFromJson(json);
}

@freezed
class DailyStreak with _$DailyStreak {
  const factory DailyStreak({
    required String id,
    required String userId,
    required int currentStreak,
    required int longestStreak,
    DateTime? lastLoginDate,
    required int totalCoinsEarned,
    required String streakLevel,
    required List<int> milestones,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _DailyStreak;

  factory DailyStreak.fromJson(Map<String, dynamic> json) =>
      _$DailyStreakFromJson(json);
}

@freezed
class DailyProgress with _$DailyProgress {
  const factory DailyProgress({
    required String id,
    required String userId,
    required DateTime date,

    // Give ring
    required int giveGoal,
    required int giveProgress,
    required bool giveClosed,

    // Earn ring
    required int earnGoal,
    required int earnProgress,
    required bool earnClosed,

    // Engage ring
    required int engageGoal,
    required int engageProgress,
    required bool engageClosed,

    // Overall status
    required bool allRingsClosed,
    required bool bonusAwarded,
    required int bonusAmount,

    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _DailyProgress;

  factory DailyProgress.fromJson(Map<String, dynamic> json) =>
      _$DailyProgressFromJson(json);
}

@freezed
class WeeklyChallenge with _$WeeklyChallenge {
  const factory WeeklyChallenge({
    required String id,
    required String name,
    required String description,
    required String type,
    required int targetValue,
    required int rewardCoins,
    String? rewardType,
    String? rewardValue,
    required DateTime startDate,
    required DateTime endDate,
    required int weekNumber,
    required bool isActive,
    required DateTime createdAt,
  }) = _WeeklyChallenge;

  factory WeeklyChallenge.fromJson(Map<String, dynamic> json) =>
      _$WeeklyChallengeFromJson(json);
}

@freezed
class WeeklyChallengeProgress with _$WeeklyChallengeProgress {
  const factory WeeklyChallengeProgress({
    required String id,
    required String userId,
    required String challengeId,
    required int currentValue,
    required int targetValue,
    required double percentage,
    required bool completed,
    DateTime? completedAt,
    required bool rewardClaimed,
    required WeeklyChallenge challenge,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _WeeklyChallengeProgress;

  factory WeeklyChallengeProgress.fromJson(Map<String, dynamic> json) =>
      _$WeeklyChallengeProgressFromJson(json);
}

@freezed
class Achievement with _$Achievement {
  const factory Achievement({
    required String id,
    required String code,
    required String name,
    required String description,
    required String category,
    required String requirementType,
    required int requirementValue,
    required int rewardCoins,
    String? rewardBadge,
    required String tier,
    required String icon,
    required String color,
    required bool isSecret,
    required bool isActive,
    bool? isUnlocked,
  }) = _Achievement;

  factory Achievement.fromJson(Map<String, dynamic> json) =>
      _$AchievementFromJson(json);
}

@freezed
class UserAchievement with _$UserAchievement {
  const factory UserAchievement({
    required String id,
    required String userId,
    required String achievementId,
    required DateTime unlockedAt,
    required int progress,
    required int maxProgress,
    required bool isNew,
    DateTime? viewedAt,
    required Achievement achievement,
  }) = _UserAchievement;

  factory UserAchievement.fromJson(Map<String, dynamic> json) =>
      _$UserAchievementFromJson(json);
}

@freezed
class GamificationStats with _$GamificationStats {
  const factory GamificationStats({
    required String id,
    required String userId,
    required int totalCoinsEarned,
    required int totalMissionsCompleted,
    required int totalPerfectDays,
    required int totalAchievements,
    required int weeklyMissionsCompleted,
    required int weeklyPerfectDays,
    required int level,
    required int experience,
    required int nextLevelXP,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _GamificationStats;

  factory GamificationStats.fromJson(Map<String, dynamic> json) =>
      _$GamificationStatsFromJson(json);
}

@freezed
class GamificationDashboard with _$GamificationDashboard {
  const factory GamificationDashboard({
    required DailyMission missions,
    DailyStreak? streak,
    required DailyProgress progress,
    required List<WeeklyChallengeProgress> challenges,
    required int totalAchievements,
    GamificationStats? stats,
  }) = _GamificationDashboard;

  factory GamificationDashboard.fromJson(Map<String, dynamic> json) =>
      _$GamificationDashboardFromJson(json);
}

@freezed
class MissionCompletionResult with _$MissionCompletionResult {
  const factory MissionCompletionResult({
    required String message,
    required int coinsAwarded,
    required bool allComplete,
  }) = _MissionCompletionResult;

  factory MissionCompletionResult.fromJson(Map<String, dynamic> json) =>
      _$MissionCompletionResultFromJson(json);
}

@freezed
class RingUpdateResult with _$RingUpdateResult {
  const factory RingUpdateResult({
    required String message,
    required bool ringClosed,
    required bool allRingsClosed,
    required bool bonusAwarded,
  }) = _RingUpdateResult;

  factory RingUpdateResult.fromJson(Map<String, dynamic> json) =>
      _$RingUpdateResultFromJson(json);
}