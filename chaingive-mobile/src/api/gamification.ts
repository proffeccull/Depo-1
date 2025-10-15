import { apiClient } from './client';

/**
 * Gamification API Client
 * Handles all gamification-related API calls
 */

export interface DailyMission {
  id: string;
  userId: string;
  date: string;
  
  mission1Type: string;
  mission1Name: string;
  mission1Desc: string;
  mission1Done: boolean;
  mission1Reward: number;
  
  mission2Type: string;
  mission2Name: string;
  mission2Desc: string;
  mission2Done: boolean;
  mission2Reward: number;
  
  mission3Type: string;
  mission3Name: string;
  mission3Desc: string;
  mission3Done: boolean;
  mission3Reward: number;
  
  allCompleted: boolean;
  bonusReward: number;
  totalCoinsEarned: number;
  
  createdAt: string;
  completedAt?: string;
}

export interface DailyStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate?: string;
  totalCoinsEarned: number;
  streakLevel: string;
  milestones: number[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgress {
  id: string;
  userId: string;
  date: string;
  
  giveGoal: number;
  giveProgress: number;
  giveClosed: boolean;
  
  earnGoal: number;
  earnProgress: number;
  earnClosed: boolean;
  
  engageGoal: number;
  engageProgress: number;
  engageClosed: boolean;
  
  allRingsClosed: boolean;
  bonusAwarded: boolean;
  bonusAmount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  type: string;
  targetValue: number;
  rewardCoins: number;
  rewardType?: string;
  rewardValue?: string;
  startDate: string;
  endDate: string;
  weekNumber: number;
  isActive: boolean;
  createdAt: string;
}

export interface WeeklyChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  completed: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
  challenge: WeeklyChallenge;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  requirementType: string;
  requirementValue: number;
  rewardCoins: number;
  rewardBadge?: string;
  tier: string;
  icon: string;
  color: string;
  isSecret: boolean;
  isActive: boolean;
  isUnlocked?: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
  maxProgress: number;
  isNew: boolean;
  viewedAt?: string;
  achievement: Achievement;
}

export interface GamificationStats {
  id: string;
  userId: string;
  totalCoinsEarned: number;
  totalMissionsCompleted: number;
  totalPerfectDays: number;
  totalAchievements: number;
  weeklyMissionsCompleted: number;
  weeklyPerfectDays: number;
  level: number;
  experience: number;
  nextLevelXP: number;
  createdAt: string;
  updatedAt: string;
}

export interface GamificationDashboard {
  missions: DailyMission;
  streak: DailyStreak | null;
  progress: DailyProgress;
  challenges: WeeklyChallengeProgress[];
  totalAchievements: number;
  stats: GamificationStats | null;
}

// ============================================
// DAILY MISSIONS
// ============================================

export const getTodaysMissions = async (): Promise<{ missions: DailyMission }> => {
  const response = await apiClient.get('/gamification/missions/today');
  return response.data;
};

export const completeMission = async (missionType: string): Promise<{
  message: string;
  coinsAwarded: number;
  allComplete: boolean;
}> => {
  const response = await apiClient.post('/gamification/missions/complete', { missionType });
  return response.data;
};

// ============================================
// DAILY STREAK
// ============================================

export const getStreak = async (): Promise<{ streak: DailyStreak }> => {
  const response = await apiClient.get('/gamification/streak');
  return response.data;
};

// ============================================
// PROGRESS RINGS
// ============================================

export const getTodaysProgress = async (): Promise<{ progress: DailyProgress }> => {
  const response = await apiClient.get('/gamification/progress/today');
  return response.data;
};

export const updateRingProgress = async (
  ringType: 'give' | 'earn' | 'engage',
  incrementBy: number
): Promise<{
  message: string;
  ringClosed: boolean;
  allRingsClosed: boolean;
  bonusAwarded: boolean;
}> => {
  const response = await apiClient.post('/gamification/progress/update', { ringType, incrementBy });
  return response.data;
};

// ============================================
// WEEKLY CHALLENGES
// ============================================

export const getActiveChallenges = async (): Promise<{ challenges: WeeklyChallenge[] }> => {
  const response = await apiClient.get('/gamification/challenges/active');
  return response.data;
};

export const getChallengeProgress = async (): Promise<{ progress: WeeklyChallengeProgress[] }> => {
  const response = await apiClient.get('/gamification/challenges/my-progress');
  return response.data;
};

// ============================================
// ACHIEVEMENTS
// ============================================

export const getAllAchievements = async (): Promise<{ achievements: Achievement[] }> => {
  const response = await apiClient.get('/gamification/achievements');
  return response.data;
};

export const getUnlockedAchievements = async (): Promise<{ achievements: UserAchievement[] }> => {
  const response = await apiClient.get('/gamification/achievements/unlocked');
  return response.data;
};

// ============================================
// DASHBOARD
// ============================================

export const getDashboard = async (): Promise<GamificationDashboard> => {
  const response = await apiClient.get('/gamification/dashboard');
  return response.data;
};

export default {
  getTodaysMissions,
  completeMission,
  getStreak,
  getTodaysProgress,
  updateRingProgress,
  getActiveChallenges,
  getChallengeProgress,
  getAllAchievements,
  getUnlockedAchievements,
  getDashboard,
};
