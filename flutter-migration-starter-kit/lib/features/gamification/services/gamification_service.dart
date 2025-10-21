import 'package:dio/dio.dart';
import '../models/gamification_models.dart';

class GamificationService {
  final Dio _dio;

  GamificationService(this._dio);

  // ============================================
  // DAILY MISSIONS
  // ============================================

  Future<DailyMission> getTodaysMissions() async {
    try {
      final response = await _dio.get('/gamification/missions/today');
      return DailyMission.fromJson(response.data['missions']);
    } catch (e) {
      // Return mock data for development
      return DailyMission(
        id: 'today-missions',
        userId: 'current_user',
        date: DateTime.now(),

        // Mission 1
        mission1Type: 'donation',
        mission1Name: 'First Donation',
        mission1Desc: 'Make your first donation today',
        mission1Done: false,
        mission1Reward: 10,

        // Mission 2
        mission2Type: 'login',
        mission2Name: 'Daily Login',
        mission2Desc: 'Log in to the app',
        mission2Done: true,
        mission2Reward: 5,

        // Mission 3
        mission3Type: 'social',
        mission3Name: 'Share Story',
        mission3Desc: 'Share a donation story',
        mission3Done: false,
        mission3Reward: 15,

        // Overall status
        allCompleted: false,
        bonusReward: 25,
        totalCoinsEarned: 5,

        createdAt: DateTime.now(),
      );
    }
  }

  Future<MissionCompletionResult> completeMission(String missionType) async {
    try {
      final response = await _dio.post('/gamification/missions/complete', data: {'missionType': missionType});
      return MissionCompletionResult.fromJson(response.data);
    } catch (e) {
      // Return mock completion result
      return MissionCompletionResult(
        message: 'Mission completed successfully!',
        coinsAwarded: 10,
        allComplete: false,
      );
    }
  }

  // ============================================
  // DAILY STREAK
  // ============================================

  Future<DailyStreak> getStreak() async {
    try {
      final response = await _dio.get('/gamification/streak');
      return DailyStreak.fromJson(response.data['streak']);
    } catch (e) {
      // Return mock streak data
      return DailyStreak(
        id: 'user-streak',
        userId: 'current_user',
        currentStreak: 5,
        longestStreak: 12,
        lastLoginDate: DateTime.now().subtract(const Duration(hours: 2)),
        totalCoinsEarned: 150,
        streakLevel: 'Bronze',
        milestones: [7, 14, 30, 60, 100],
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
        updatedAt: DateTime.now(),
      );
    }
  }

  // ============================================
  // PROGRESS RINGS
  // ============================================

  Future<DailyProgress> getTodaysProgress() async {
    try {
      final response = await _dio.get('/gamification/progress/today');
      return DailyProgress.fromJson(response.data['progress']);
    } catch (e) {
      // Return mock progress data
      return DailyProgress(
        id: 'today-progress',
        userId: 'current_user',
        date: DateTime.now(),

        // Give ring
        giveGoal: 3,
        giveProgress: 1,
        giveClosed: false,

        // Earn ring
        earnGoal: 50,
        earnProgress: 25,
        earnClosed: false,

        // Engage ring
        engageGoal: 5,
        engageProgress: 3,
        engageClosed: false,

        // Additional properties
        streakCount: 0,
        achievementUnlocks: [],
        missionCompletions: [],

        // Overall status
        allRingsClosed: false,
        bonusAwarded: false,
        bonusAmount: 20,

        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    }
  }

  Future<RingUpdateResult> updateRingProgress(String ringType, int incrementBy) async {
    try {
      final response = await _dio.post('/gamification/progress/update', data: {
        'ringType': ringType,
        'incrementBy': incrementBy,
      });
      return RingUpdateResult.fromJson(response.data);
    } catch (e) {
      // Return mock update result
      return RingUpdateResult(
        message: 'Progress updated successfully!',
        ringClosed: false,
        allRingsClosed: false,
        bonusAwarded: false,
      );
    }
  }

  // ============================================
  // WEEKLY CHALLENGES
  // ============================================

  Future<List<WeeklyChallenge>> getActiveChallenges() async {
    try {
      final response = await _dio.get('/gamification/challenges/active');
      final List<dynamic> data = response.data['challenges'];
      return data.map((json) => WeeklyChallenge.fromJson(json)).toList();
    } catch (e) {
      // Return mock challenges
      return [
        WeeklyChallenge(
          id: 'challenge-1',
          name: 'Community Builder',
          description: 'Help 10 people in your community this week',
          type: 'social_impact',
          targetValue: 10,
          rewardCoins: 100,
          rewardType: 'badge',
          rewardValue: 'Community Hero',
          startDate: DateTime.now().subtract(const Duration(days: 3)),
          endDate: DateTime.now().add(const Duration(days: 4)),
          weekNumber: 45,
          isActive: true,
          createdAt: DateTime.now().subtract(const Duration(days: 7)),
        ),
      ];
    }
  }

  Future<List<WeeklyChallengeProgress>> getChallengeProgress() async {
    try {
      final response = await _dio.get('/gamification/challenges/my-progress');
      final List<dynamic> data = response.data['progress'];
      return data.map((json) => WeeklyChallengeProgress.fromJson(json)).toList();
    } catch (e) {
      // Return mock progress
      final challenge = WeeklyChallenge(
        id: 'challenge-1',
        name: 'Community Builder',
        description: 'Help 10 people in your community this week',
        type: 'social_impact',
        targetValue: 10,
        rewardCoins: 100,
        startDate: DateTime.now().subtract(const Duration(days: 3)),
        endDate: DateTime.now().add(const Duration(days: 4)),
        weekNumber: 45,
        isActive: true,
        createdAt: DateTime.now().subtract(const Duration(days: 7)),
      );

      return [
        WeeklyChallengeProgress(
          id: 'progress-1',
          userId: 'current_user',
          challengeId: 'challenge-1',
          currentValue: 7,
          targetValue: 10,
          percentage: 70.0,
          completed: false,
          rewardClaimed: false,
          challenge: challenge,
          createdAt: DateTime.now().subtract(const Duration(days: 3)),
          updatedAt: DateTime.now(),
        ),
      ];
    }
  }

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  Future<List<Achievement>> getAllAchievements() async {
    try {
      final response = await _dio.get('/gamification/achievements');
      final List<dynamic> data = response.data['achievements'];
      return data.map((json) => Achievement.fromJson(json)).toList();
    } catch (e) {
      // Return mock achievements
      return [
        Achievement(
          id: 'achievement-1',
          code: 'FIRST_DONATION',
          name: 'First Steps',
          description: 'Made your first charitable donation',
          category: 'donations',
          requirementType: 'donation_count',
          requirementValue: 1,
          rewardCoins: 25,
          rewardBadge: 'Philanthropist',
          tier: 'bronze',
          icon: 'heart',
          color: '#FFD700',
          isSecret: false,
          isActive: true,
          isUnlocked: true,
        ),
        Achievement(
          id: 'achievement-2',
          code: 'COMMUNITY_BUILDER',
          name: 'Community Builder',
          description: 'Helped 50 people in your community',
          category: 'social',
          requirementType: 'help_count',
          requirementValue: 50,
          rewardCoins: 100,
          rewardBadge: 'Community Hero',
          tier: 'gold',
          icon: 'people',
          color: '#FF6B35',
          isSecret: false,
          isActive: true,
          isUnlocked: false,
        ),
      ];
    }
  }

  Future<List<UserAchievement>> getUnlockedAchievements() async {
    try {
      final response = await _dio.get('/gamification/achievements/unlocked');
      final List<dynamic> data = response.data['achievements'];
      return data.map((json) => UserAchievement.fromJson(json)).toList();
    } catch (e) {
      // Return mock unlocked achievements
      final achievement = Achievement(
        id: 'achievement-1',
        code: 'FIRST_DONATION',
        name: 'First Steps',
        description: 'Made your first charitable donation',
        category: 'donations',
        requirementType: 'donation_count',
        requirementValue: 1,
        rewardCoins: 25,
        rewardBadge: 'Philanthropist',
        tier: 'bronze',
        icon: 'heart',
        color: '#FFD700',
        isSecret: false,
        isActive: true,
        isUnlocked: true,
      );

      return [
        UserAchievement(
          id: 'user-achievement-1',
          userId: 'current_user',
          achievementId: 'achievement-1',
          unlockedAt: DateTime.now().subtract(const Duration(days: 5)),
          progress: 1,
          maxProgress: 1,
          isNew: false,
          achievement: achievement,
        ),
      ];
    }
  }

  // ============================================
  // DASHBOARD
  // ============================================

  Future<GamificationDashboard> getDashboard() async {
    try {
      final response = await _dio.get('/gamification/dashboard');
      return GamificationDashboard.fromJson(response.data);
    } catch (e) {
      // Return mock dashboard data
      final missions = await getTodaysMissions();
      final streak = await getStreak();
      final progress = await getTodaysProgress();
      final challenges = await getChallengeProgress();
      final unlockedAchievements = await getUnlockedAchievements();

      return GamificationDashboard(
        missions: missions,
        streak: streak,
        progress: progress,
        challenges: challenges,
        totalAchievements: unlockedAchievements.length,
        stats: GamificationStats(
          id: 'user-stats',
          userId: 'current_user',
          totalCoinsEarned: 1250,
          totalMissionsCompleted: 45,
          totalPerfectDays: 12,
          totalAchievements: unlockedAchievements.length,
          weeklyMissionsCompleted: 15,
          weeklyPerfectDays: 3,
          level: 8,
          experience: 2450,
          nextLevelXP: 2800,
          createdAt: DateTime.now().subtract(const Duration(days: 60)),
          updatedAt: DateTime.now(),
        ),
      );
    }
  }
}