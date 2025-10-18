import 'package:dio/dio.dart';
import '../models/coin_models.dart';

class CoinService {
  final Dio _dio;

  CoinService(this._dio);

  // Fetch coin balance
  Future<CoinBalance> fetchCoinBalance(String userId) async {
    try {
      final response = await _dio.get('/api/users/$userId/coins/balance');
      return CoinBalance.fromJson(response.data);
    } catch (e) {
      // Return mock data for development
      return CoinBalance(
        current: 1250,
        trend: 'up',
        change24h: 5.2,
        lastUpdated: DateTime.now(),
      );
    }
  }

  // Fetch coin transactions
  Future<List<CoinTransaction>> fetchCoinTransactions(
    String userId, {
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _dio.get(
        '/api/users/$userId/coins/transactions',
        queryParameters: {'limit': limit, 'offset': offset},
      );
      final List<dynamic> data = response.data;
      return data.map((json) => CoinTransaction.fromJson(json)).toList();
    } catch (e) {
      // Return mock data for development
      return [
        CoinTransaction(
          id: '1',
          type: 'earned',
          amount: 50,
          description: 'Daily login bonus',
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        ),
        CoinTransaction(
          id: '2',
          type: 'spent',
          amount: -25,
          description: 'Donation to local charity',
          timestamp: DateTime.now().subtract(const Duration(hours: 4)),
          category: 'donation',
        ),
      ];
    }
  }

  // Earn coins
  Future<CoinTransaction> earnCoins({
    required String userId,
    required int amount,
    required String source,
    required String description,
  }) async {
    try {
      final response = await _dio.post(
        '/api/users/$userId/coins/earn',
        data: {
          'amount': amount,
          'source': source,
          'description': description,
        },
      );
      return CoinTransaction.fromJson(response.data['transaction']);
    } catch (e) {
      // Return mock transaction for development
      return CoinTransaction(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: 'earned',
        amount: amount,
        description: description,
        timestamp: DateTime.now(),
        category: source,
      );
    }
  }

  // Spend coins
  Future<CoinTransaction> spendCoins({
    required String userId,
    required int amount,
    required String category,
    required String description,
  }) async {
    try {
      final response = await _dio.post(
        '/api/users/$userId/coins/spend',
        data: {
          'amount': amount,
          'category': category,
          'description': description,
        },
      );
      return CoinTransaction.fromJson(response.data['transaction']);
    } catch (e) {
      // Return mock transaction for development
      return CoinTransaction(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: 'spent',
        amount: -amount,
        description: description,
        timestamp: DateTime.now(),
        category: category,
      );
    }
  }

  // Purchase coins
  Future<CoinTransaction> purchaseCoins({
    required String userId,
    required String agentId,
    required int quantity,
  }) async {
    try {
      final response = await _dio.post(
        '/api/users/$userId/coins/purchase',
        data: {
          'agentId': agentId,
          'quantity': quantity,
        },
      );
      return CoinTransaction.fromJson(response.data['transaction']);
    } catch (e) {
      // Return mock transaction for development
      return CoinTransaction(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        type: 'purchased',
        amount: quantity,
        description: 'Coin purchase from agent',
        timestamp: DateTime.now(),
        relatedId: agentId,
      );
    }
  }

  // Fetch coin milestones
  Future<List<CoinMilestone>> fetchCoinMilestones(String userId) async {
    try {
      final response = await _dio.get('/api/users/$userId/coins/milestones');
      final List<dynamic> data = response.data;
      return data.map((json) => CoinMilestone.fromJson(json)).toList();
    } catch (e) {
      // Return mock milestones for development
      return [
        CoinMilestone(
          id: '1',
          name: 'First Steps',
          target: 100,
          current: 75,
          reward: 25,
          unlocked: false,
        ),
        CoinMilestone(
          id: '2',
          name: 'Generous Soul',
          target: 500,
          current: 320,
          reward: 50,
          unlocked: false,
        ),
      ];
    }
  }

  // Fetch coin streak
  Future<CoinStreak> fetchCoinStreak(String userId) async {
    try {
      final response = await _dio.get('/api/users/$userId/coins/streak');
      return CoinStreak.fromJson(response.data);
    } catch (e) {
      // Return mock streak for development
      return CoinStreak(
        current: 5,
        longest: 12,
        lastActivity: DateTime.now().subtract(const Duration(hours: 1)),
        freezeCount: 0,
        nextMilestone: 7,
      );
    }
  }

  // Fetch achievements
  Future<List<Achievement>> fetchAchievements(String userId) async {
    try {
      final response = await _dio.get('/api/users/$userId/achievements');
      final List<dynamic> data = response.data;
      return data.map((json) => Achievement.fromJson(json)).toList();
    } catch (e) {
      // Return mock achievements for development
      return [
        Achievement(
          id: '1',
          name: 'First Donation',
          description: 'Made your first charitable donation',
          icon: 'heart',
          rarity: 'common',
          coinReward: 10,
          unlocked: true,
          unlockedAt: DateTime.now().subtract(const Duration(days: 5)),
        ),
        Achievement(
          id: '2',
          name: 'Community Builder',
          description: 'Helped 10 people in your community',
          icon: 'people',
          rarity: 'rare',
          coinReward: 50,
          unlocked: false,
          progress: 7,
          target: 10,
        ),
      ];
    }
  }

  // Unlock achievement
  Future<Achievement> unlockAchievement(String userId, String achievementId) async {
    try {
      final response = await _dio.post('/api/users/$userId/achievements/$achievementId/unlock');
      return Achievement.fromJson(response.data);
    } catch (e) {
      // Return mock unlocked achievement for development
      return Achievement(
        id: achievementId,
        name: 'Achievement Unlocked',
        description: 'Achievement has been unlocked',
        icon: 'trophy',
        rarity: 'common',
        coinReward: 25,
        unlocked: true,
        unlockedAt: DateTime.now(),
      );
    }
  }

  // Fetch battle pass
  Future<BattlePass?> fetchBattlePass(String userId) async {
    try {
      final response = await _dio.get('/api/users/$userId/battle-pass');
      return BattlePass.fromJson(response.data);
    } catch (e) {
      // Return mock battle pass for development
      return BattlePass(
        id: 'season-1',
        name: 'Community Champions',
        season: 1,
        cost: 100,
        purchased: false,
        currentTier: 3,
        maxTier: 10,
        xpCurrent: 250,
        xpRequired: 100,
        freeRewards: [],
        premiumRewards: [],
        expiresAt: DateTime.now().add(const Duration(days: 30)),
      );
    }
  }

  // Purchase battle pass
  Future<BattlePass> purchaseBattlePass(String userId, String seasonId) async {
    try {
      final response = await _dio.post('/api/users/$userId/battle-pass/purchase', data: {'seasonId': seasonId});
      return BattlePass.fromJson(response.data);
    } catch (e) {
      // Return mock purchased battle pass for development
      return BattlePass(
        id: seasonId,
        name: 'Community Champions',
        season: 1,
        cost: 100,
        purchased: true,
        currentTier: 3,
        maxTier: 10,
        xpCurrent: 250,
        xpRequired: 100,
        freeRewards: [],
        premiumRewards: [],
        expiresAt: DateTime.now().add(const Duration(days: 30)),
      );
    }
  }

  // Fetch coin analytics
  Future<CoinAnalytics> fetchCoinAnalytics(String userId, {String timeframe = '30d'}) async {
    try {
      final response = await _dio.get(
        '/api/users/$userId/coins/analytics',
        queryParameters: {'timeframe': timeframe},
      );
      return CoinAnalytics.fromJson(response.data);
    } catch (e) {
      // Return mock analytics for development
      return CoinAnalytics(data: {
        'totalEarned': 1250,
        'totalSpent': 375,
        'currentBalance': 875,
        'averageDaily': 12.5,
        'topCategories': ['donations', 'achievements', 'daily_bonus'],
        'monthlyTrend': [10, 15, 8, 22, 18, 25, 30, 28, 35, 32, 40, 38],
      });
    }
  }
}