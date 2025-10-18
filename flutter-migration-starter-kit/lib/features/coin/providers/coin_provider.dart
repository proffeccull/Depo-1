import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/coin_models.dart';
import '../services/coin_service.dart';

// Coin service provider
final coinServiceProvider = Provider<CoinService>((ref) {
  final dio = ref.watch(apiClientProvider);
  return CoinService(dio);
});

// Coin balance provider
final coinBalanceProvider = StateNotifierProvider<CoinBalanceNotifier, AsyncValue<CoinBalance>>((ref) {
  final coinService = ref.watch(coinServiceProvider);
  return CoinBalanceNotifier(coinService);
});

// Coin transactions provider
final coinTransactionsProvider = StateNotifierProvider<CoinTransactionsNotifier, AsyncValue<List<CoinTransaction>>>((ref) {
  final coinService = ref.watch(coinServiceProvider);
  return CoinTransactionsNotifier(coinService);
});

// Coin milestones provider
final coinMilestonesProvider = StateNotifierProvider<CoinMilestonesNotifier, AsyncValue<List<CoinMilestone>>>((ref) {
  final coinService = ref.watch(coinServiceProvider);
  return CoinMilestonesNotifier(coinService);
});

// Coin streak provider
final coinStreakProvider = StateNotifierProvider<CoinStreakNotifier, AsyncValue<CoinStreak>>((ref) {
  final coinService = ref.watch(coinServiceProvider);
  return CoinStreakNotifier(coinService);
});

// Achievements provider
final achievementsProvider = StateNotifierProvider<AchievementsNotifier, AsyncValue<List<Achievement>>>((ref) {
  final coinService = ref.watch(coinServiceProvider);
  return AchievementsNotifier(coinService);
});

// Battle pass provider
final battlePassProvider = StateNotifierProvider<BattlePassNotifier, AsyncValue<BattlePass?>>((ref) {
  final coinService = ref.watch(coinServiceProvider);
  return BattlePassNotifier(coinService);
});

// Coin analytics provider
final coinAnalyticsProvider = StateNotifierProvider<CoinAnalyticsNotifier, AsyncValue<CoinAnalytics>>((ref) {
  final coinService = ref.watch(coinServiceProvider);
  return CoinAnalyticsNotifier(coinService);
});

// Notifiers
class CoinBalanceNotifier extends StateNotifier<AsyncValue<CoinBalance>> {
  final CoinService _coinService;

  CoinBalanceNotifier(this._coinService) : super(const AsyncValue.loading()) {
    fetchBalance();
  }

  Future<void> fetchBalance() async {
    state = const AsyncValue.loading();
    try {
      final balance = await _coinService.fetchCoinBalance('current_user_id');
      state = AsyncValue.data(balance);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> updateBalance(CoinBalance newBalance) async {
    state = AsyncValue.data(newBalance);
  }
}

class CoinTransactionsNotifier extends StateNotifier<AsyncValue<List<CoinTransaction>>> {
  final CoinService _coinService;

  CoinTransactionsNotifier(this._coinService) : super(const AsyncValue.loading()) {
    fetchTransactions();
  }

  Future<void> fetchTransactions({int limit = 20, int offset = 0}) async {
    state = const AsyncValue.loading();
    try {
      final transactions = await _coinService.fetchCoinTransactions('current_user_id', limit: limit, offset: offset);
      state = AsyncValue.data(transactions);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> addTransaction(CoinTransaction transaction) async {
    state.whenData((currentTransactions) {
      final updatedTransactions = [transaction, ...currentTransactions];
      if (updatedTransactions.length > 100) {
        updatedTransactions.removeRange(100, updatedTransactions.length);
      }
      state = AsyncValue.data(updatedTransactions);
    });
  }
}

class CoinMilestonesNotifier extends StateNotifier<AsyncValue<List<CoinMilestone>>> {
  final CoinService _coinService;

  CoinMilestonesNotifier(this._coinService) : super(const AsyncValue.loading()) {
    fetchMilestones();
  }

  Future<void> fetchMilestones() async {
    state = const AsyncValue.loading();
    try {
      final milestones = await _coinService.fetchCoinMilestones('current_user_id');
      state = AsyncValue.data(milestones);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> updateMilestoneProgress(String milestoneId, int progress) async {
    state.whenData((currentMilestones) {
      final updatedMilestones = currentMilestones.map((milestone) {
        if (milestone.id == milestoneId) {
          final updatedMilestone = milestone.copyWith(current: progress);
          if (updatedMilestone.current >= updatedMilestone.target && !updatedMilestone.unlocked) {
            return updatedMilestone.copyWith(
              unlocked: true,
              unlockedAt: DateTime.now(),
            );
          }
          return updatedMilestone;
        }
        return milestone;
      }).toList();
      state = AsyncValue.data(updatedMilestones);
    });
  }
}

class CoinStreakNotifier extends StateNotifier<AsyncValue<CoinStreak>> {
  final CoinService _coinService;

  CoinStreakNotifier(this._coinService) : super(const AsyncValue.loading()) {
    fetchStreak();
  }

  Future<void> fetchStreak() async {
    state = const AsyncValue.loading();
    try {
      final streak = await _coinService.fetchCoinStreak('current_user_id');
      state = AsyncValue.data(streak);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> updateStreak(CoinStreak newStreak) async {
    state = AsyncValue.data(newStreak);
  }
}

class AchievementsNotifier extends StateNotifier<AsyncValue<List<Achievement>>> {
  final CoinService _coinService;

  AchievementsNotifier(this._coinService) : super(const AsyncValue.loading()) {
    fetchAchievements();
  }

  Future<void> fetchAchievements() async {
    state = const AsyncValue.loading();
    try {
      final achievements = await _coinService.fetchAchievements('current_user_id');
      state = AsyncValue.data(achievements);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> unlockAchievement(String achievementId) async {
    state.whenData((currentAchievements) {
      final updatedAchievements = currentAchievements.map((achievement) {
        if (achievement.id == achievementId && !achievement.unlocked) {
          return achievement.copyWith(
            unlocked: true,
            unlockedAt: DateTime.now(),
          );
        }
        return achievement;
      }).toList();
      state = AsyncValue.data(updatedAchievements);
    });
  }

  Future<void> updateAchievementProgress(String achievementId, int progress) async {
    state.whenData((currentAchievements) {
      final updatedAchievements = currentAchievements.map((achievement) {
        if (achievement.id == achievementId) {
          return achievement.copyWith(progress: progress);
        }
        return achievement;
      }).toList();
      state = AsyncValue.data(updatedAchievements);
    });
  }
}

class BattlePassNotifier extends StateNotifier<AsyncValue<BattlePass?>> {
  final CoinService _coinService;

  BattlePassNotifier(this._coinService) : super(const AsyncValue.loading()) {
    fetchBattlePass();
  }

  Future<void> fetchBattlePass() async {
    state = const AsyncValue.loading();
    try {
      final battlePass = await _coinService.fetchBattlePass('current_user_id');
      state = AsyncValue.data(battlePass);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> purchaseBattlePass() async {
    state.whenData((currentBattlePass) async {
      if (currentBattlePass != null && !currentBattlePass.purchased) {
        try {
          final updatedBattlePass = await _coinService.purchaseBattlePass('current_user_id', currentBattlePass.id);
          state = AsyncValue.data(updatedBattlePass);
        } catch (e, stack) {
          state = AsyncValue.error(e, stack);
        }
      }
    });
  }

  Future<void> updateBattlePassProgress(int xpGained) async {
    state.whenData((currentBattlePass) {
      if (currentBattlePass != null) {
        var updatedXp = currentBattlePass.xpCurrent + xpGained;
        var updatedTier = currentBattlePass.currentTier;

        // Check for tier advancement
        while (updatedXp >= currentBattlePass.xpRequired && updatedTier < currentBattlePass.maxTier) {
          updatedTier++;
          updatedXp -= currentBattlePass.xpRequired;
        }

        final updatedBattlePass = currentBattlePass.copyWith(
          xpCurrent: updatedXp,
          currentTier: updatedTier,
        );
        state = AsyncValue.data(updatedBattlePass);
      }
    });
  }
}

class CoinAnalyticsNotifier extends StateNotifier<AsyncValue<CoinAnalytics>> {
  final CoinService _coinService;

  CoinAnalyticsNotifier(this._coinService) : super(const AsyncValue.loading()) {
    fetchAnalytics();
  }

  Future<void> fetchAnalytics({String timeframe = '30d'}) async {
    state = const AsyncValue.loading();
    try {
      final analytics = await _coinService.fetchCoinAnalytics('current_user_id', timeframe: timeframe);
      state = AsyncValue.data(analytics);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}