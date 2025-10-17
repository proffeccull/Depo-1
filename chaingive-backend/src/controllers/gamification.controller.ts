import { Request, Response } from 'express';
import gamificationService from '../services/gamification.service';
import logger from '../utils/logger';

/**
 * Gamification Controller (User-facing)
 * Handles user interactions with gamification features
 */

// ============================================ 
// DAILY MISSIONS
// ============================================ 

/**
 * Get today's missions for the authenticated user
 */
export async function getTodaysMissions(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    
    const missions = await gamificationService.getTodaysMissions(userId);
    
    res.json({ missions });
  } catch (error: any) {
    logger.error('Error fetching today\'s missions:', error);
    res.status(500).json({ error: { message: 'Failed to fetch missions' } });
  }
}

/**
 * Complete a mission
 */
export async function completeMission(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { missionType } = req.body;
    
    const result = await gamificationService.completeMission(userId, missionType);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: { message: 'Mission already completed or not found' } 
      });
    }
    
    res.json({ 
      message: 'Mission completed!',
      coinsAwarded: result.coinsAwarded,
      allComplete: result.allComplete,
    });
  } catch (error: any) {
    logger.error('Error completing mission:', error);
    res.status(500).json({ error: { message: 'Failed to complete mission' } });
  }
}

// ============================================ 
// DAILY STREAK
// ============================================ 

/**
 * Get current streak for the authenticated user
 */
export async function getStreak(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    
    const streak = await gamificationService.updateStreak(userId);
    
    res.json({ streak });
  } catch (error: any) {
    logger.error('Error fetching streak:', error);
    res.status(500).json({ error: { message: 'Failed to fetch streak' } });
  }
}

// ============================================ 
// PROGRESS RINGS
// ============================================ 

/**
 * Get today's progress rings
 */
export async function getTodaysProgress(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    
    const progress = await gamificationService.getTodaysProgress(userId);
    
    res.json({ progress });
  } catch (error: any) {
    logger.error('Error fetching progress:', error);
    res.status(500).json({ error: { message: 'Failed to fetch progress' } });
  }
}

/**
 * Update ring progress (internal use - called by other services)
 */
export async function updateRingProgress(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { ringType, incrementBy } = req.body;
    
    const result = await gamificationService.updateRingProgress(userId, ringType, incrementBy);
    
    res.json({ 
      message: 'Progress updated',
      ...result,
    });
  } catch (error: any) {
    logger.error('Error updating progress:', error);
    res.status(500).json({ error: { message: 'Failed to update progress' } });
  }
}

// ============================================ 
// WEEKLY CHALLENGES
// ============================================ 

/**
 * Get active weekly challenges
 */
export async function getActiveChallenges(req: Request, res: Response) {
  try {
    const challenges = await gamificationService.getActiveWeeklyChallenges();
    
    res.json({ challenges });
  } catch (error: any) {
    logger.error('Error fetching challenges:', error);
    res.status(500).json({ error: { message: 'Failed to fetch challenges' } });
  }
}

/**
 * Get user's progress on weekly challenges
 */
export async function getChallengeProgress(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    
    const progress = await gamificationService.getUserWeeklyChallengeProgress(userId);
    
    res.json({ progress });
  } catch (error: any) {
    logger.error('Error fetching challenge progress:', error);
    res.status(500).json({ error: { message: 'Failed to fetch progress' } });
  }
}

// ============================================ 
// ACHIEVEMENTS
// ============================================ 

/**
 * Get all achievements (locked and unlocked)
 */
export async function getAllAchievements(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    
    const achievements = await gamificationService.getAllAchievements(userId);
    
    res.json({ achievements });
  } catch (error: any) {
    logger.error('Error fetching achievements:', error);
    res.status(500).json({ error: { message: 'Failed to fetch achievements' } });
  }
}

/**
 * Get unlocked achievements
 */
export async function getUnlockedAchievements(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    
    const achievements = await gamificationService.getUnlockedAchievements(userId);
    
    res.json({ achievements });
  } catch (error: any) {
    logger.error('Error fetching unlocked achievements:', error);
    res.status(500).json({ error: { message: 'Failed to fetch achievements' } });
  }
}

// ============================================ 
// DASHBOARD
// ============================================ 

/**
 * Get full gamification dashboard data
 */
export async function getDashboard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    
    const [missions, streak, progress, challenges, achievements, stats] = await Promise.all([
      gamificationService.getTodaysMissions(userId),
      gamificationService.getDailyStreak(userId),
      gamificationService.getTodaysProgress(userId),
      gamificationService.getUserWeeklyChallengeProgress(userId),
      gamificationService.getUserAchievementCount(userId),
      gamificationService.getGamificationStats(userId),
    ]);
    
    res.json({
      missions,
      streak,
      progress,
      challenges,
      totalAchievements: achievements,
      stats,
    });
  } catch (error: any) {
    logger.error('Error fetching gamification dashboard:', error);
    res.status(500).json({ error: { message: 'Failed to fetch dashboard' } });
  }
}