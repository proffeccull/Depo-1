import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/gamification_models.dart';
import '../services/gamification_service.dart';

// Gamification service provider
final gamificationServiceProvider = Provider<GamificationService>((ref) {
  final dio = ref.watch(apiClientProvider);
  return GamificationService(dio);
});

// Daily missions provider
final todaysMissionsProvider = StateNotifierProvider<TodaysMissionsNotifier, AsyncValue<DailyMission>>((ref) {
  final gamificationService = ref.watch(gamificationServiceProvider);
  return TodaysMissionsNotifier(gamificationService);
});

// Daily streak provider
final dailyStreakProvider = StateNotifierProvider<DailyStreakNotifier, AsyncValue<DailyStreak>>((ref) {
  final gamificationService = ref.watch(gamificationServiceProvider);
  return DailyStreakNotifier(gamificationService);
});

// Daily progress provider
final todaysProgressProvider = StateNotifierProvider<TodaysProgressNotifier, AsyncValue<DailyProgress>>((ref) {
  final gamificationService = ref.watch(gamificationServiceProvider);
  return TodaysProgressNotifier(gamificationService);
});

// Weekly challenges provider
final weeklyChallengesProvider = StateNotifierProvider<WeeklyChallengesNotifier, AsyncValue<List<WeeklyChallengeProgress>>>((ref) {
  final gamificationService = ref.watch(gamificationServiceProvider);
  return WeeklyChallengesNotifier(gamificationService);
});

// Achievements provider
final achievementsProvider = StateNotifierProvider<AchievementsNotifier, AsyncValue<List<Achievement>>>((ref) {
  final gamificationService = ref.watch(gamificationServiceProvider);
  return AchievementsNotifier(gamificationService);
});

// Unlocked achievements provider
final unlockedAchievementsProvider = StateNotifierProvider<UnlockedAchievementsNotifier, AsyncValue<List<UserAchievement>>>((ref) {
  final gamificationService = ref.watch(gamificationServiceProvider);
  return UnlockedAchievementsNotifier(gamificationService);
});

// Gamification dashboard provider
final gamificationDashboardProvider = StateNotifierProvider<GamificationDashboardNotifier, AsyncValue<GamificationDashboard>>((ref) {
  final gamificationService = ref.watch(gamificationServiceProvider);
  return GamificationDashboardNotifier(gamificationService);
});

// Notifiers
class TodaysMissionsNotifier extends StateNotifier<AsyncValue<DailyMission>> {
  final GamificationService _gamificationService;

  TodaysMissionsNotifier(this._gamificationService) : super(const AsyncValue.loading()) {
    fetchTodaysMissions();
  }

  Future<void> fetchTodaysMissions() async {
    state = const AsyncValue.loading();
    try {
      final missions = await _gamificationService.getTodaysMissions();
      state = AsyncValue.data(missions);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<MissionCompletionResult> completeMission(String missionType) async {
    try {
      final result = await _gamificationService.completeMission(missionType);
      // Refresh missions after completion
      await fetchTodaysMissions();
      return result;
    } catch (e) {
      rethrow;
    }
  }
}

class DailyStreakNotifier extends StateNotifier<AsyncValue<DailyStreak>> {
  final GamificationService _gamificationService;

  DailyStreakNotifier(this._gamificationService) : super(const AsyncValue.loading()) {
    fetchStreak();
  }

  Future<void> fetchStreak() async {
    state = const AsyncValue.loading();
    try {
      final streak = await _gamificationService.getStreak();
      state = AsyncValue.data(streak);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}

class TodaysProgressNotifier extends StateNotifier<AsyncValue<DailyProgress>> {
  final GamificationService _gamificationService;

  TodaysProgressNotifier(this._gamificationService) : super(const AsyncValue.loading()) {
    fetchTodaysProgress();
  }

  Future<void> fetchTodaysProgress() async {
    state = const AsyncValue.loading();
    try {
      final progress = await _gamificationService.getTodaysProgress();
      state = AsyncValue.data(progress);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<RingUpdateResult> updateRingProgress(String ringType, int incrementBy) async {
    try {
      final result = await _gamificationService.updateRingProgress(ringType, incrementBy);
      // Refresh progress after update
      await fetchTodaysProgress();
      return result;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateLocalProgress(String ring, int value) async {
    state.whenData((currentProgress) {
      final updatedProgress = _updateProgressRing(currentProgress, ring, value);
      state = AsyncValue.data(updatedProgress);
    });
  }

  DailyProgress _updateProgressRing(DailyProgress progress, String ring, int value) {
    switch (ring) {
      case 'give':
        final newValue = value.clamp(0, progress.giveGoal);
        return progress.copyWith(
          giveProgress: newValue,
          giveClosed: newValue >= progress.giveGoal,
        );
      case 'earn':
        final newValue = value.clamp(0, progress.earnGoal);
        return progress.copyWith(
          earnProgress: newValue,
          earnClosed: newValue >= progress.earnGoal,
        );
      case 'engage':
        final newValue = value.clamp(0, progress.engageGoal);
        return progress.copyWith(
          engageProgress: newValue,
          engageClosed: newValue >= progress.engageGoal,
        );
      default:
        return progress;
    }
  }
}

class WeeklyChallengesNotifier extends StateNotifier<AsyncValue<List<WeeklyChallengeProgress>>> {
  final GamificationService _gamificationService;

  WeeklyChallengesNotifier(this._gamificationService) : super(const AsyncValue.loading()) {
    fetchChallengeProgress();
  }

  Future<void> fetchChallengeProgress() async {
    state = const AsyncValue.loading();
    try {
      final challenges = await _gamificationService.getChallengeProgress();
      state = AsyncValue.data(challenges);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}

class AchievementsNotifier extends StateNotifier<AsyncValue<List<Achievement>>> {
  final GamificationService _gamificationService;

  AchievementsNotifier(this._gamificationService) : super(const AsyncValue.loading()) {
    fetchAchievements();
  }

  Future<void> fetchAchievements() async {
    state = const AsyncValue.loading();
    try {
      final achievements = await _gamificationService.getAllAchievements();
      state = AsyncValue.data(achievements);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}

class UnlockedAchievementsNotifier extends StateNotifier<AsyncValue<List<UserAchievement>>> {
  final GamificationService _gamificationService;

  UnlockedAchievementsNotifier(this._gamificationService) : super(const AsyncValue.loading()) {
    fetchUnlockedAchievements();
  }

  Future<void> fetchUnlockedAchievements() async {
    state = const AsyncValue.loading();
    try {
      final achievements = await _gamificationService.getUnlockedAchievements();
      state = AsyncValue.data(achievements);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> unlockAchievement(String achievementId) async {
    try {
      await _gamificationService.getAllAchievements(); // This would unlock in real implementation
      // Refresh unlocked achievements
      await fetchUnlockedAchievements();
    } catch (e) {
      rethrow;
    }
  }
}

class GamificationDashboardNotifier extends StateNotifier<AsyncValue<GamificationDashboard>> {
  final GamificationService _gamificationService;

  GamificationDashboardNotifier(this._gamificationService) : super(const AsyncValue.loading()) {
    fetchDashboard();
  }

  Future<void> fetchDashboard() async {
    state = const AsyncValue.loading();
    try {
      final dashboard = await _gamificationService.getDashboard();
      state = AsyncValue.data(dashboard);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> completeMission(String missionType) async {
    try {
      await _gamificationService.completeMission(missionType);
      // Refresh dashboard after mission completion
      await fetchDashboard();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateRingProgress(String ringType, int incrementBy) async {
    try {
      await _gamificationService.updateRingProgress(ringType, incrementBy);
      // Refresh dashboard after progress update
      await fetchDashboard();
    } catch (e) {
      rethrow;
    }
  }
}