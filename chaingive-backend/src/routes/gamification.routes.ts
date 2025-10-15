import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as gamificationController from '../controllers/gamification.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// DAILY MISSIONS
// ============================================

router.get('/missions/today', gamificationController.getTodaysMissions);
router.post('/missions/complete', gamificationController.completeMission);

// ============================================
// DAILY STREAK
// ============================================

router.get('/streak', gamificationController.getStreak);

// ============================================
// PROGRESS RINGS
// ============================================

router.get('/progress/today', gamificationController.getTodaysProgress);
router.post('/progress/update', gamificationController.updateRingProgress);

// ============================================
// WEEKLY CHALLENGES
// ============================================

router.get('/challenges/active', gamificationController.getActiveChallenges);
router.get('/challenges/my-progress', gamificationController.getChallengeProgress);

// ============================================
// ACHIEVEMENTS
// ============================================

router.get('/achievements', gamificationController.getAllAchievements);
router.get('/achievements/unlocked', gamificationController.getUnlockedAchievements);

// ============================================
// DASHBOARD
// ============================================

router.get('/dashboard', gamificationController.getDashboard);

export default router;
