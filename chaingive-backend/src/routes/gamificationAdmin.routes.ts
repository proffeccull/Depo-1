import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as gamificationAdminController from '../controllers/gamificationAdmin.controller';

const router = Router();

// All routes require admin/csc_council role
router.use(authenticate);
router.use(requireRole('csc_council', 'agent')); // Agents can view, CSC can edit

// ============================================
// CONFIGURATION
// ============================================

router.get('/config', gamificationAdminController.getConfig);
router.put('/config', requireRole('csc_council'), gamificationAdminController.updateConfig);

// ============================================
// MISSION TEMPLATES
// ============================================

router.get('/missions', gamificationAdminController.getMissionTemplates);
router.post('/missions', requireRole('csc_council'), gamificationAdminController.createMissionTemplate);
router.patch('/missions/:id', requireRole('csc_council'), gamificationAdminController.updateMissionTemplate);
router.delete('/missions/:id', requireRole('csc_council'), gamificationAdminController.deleteMissionTemplate);

// ============================================
// WEEKLY CHALLENGES
// ============================================

router.get('/challenges', gamificationAdminController.getWeeklyChallenges);
router.post('/challenges', requireRole('csc_council'), gamificationAdminController.createWeeklyChallenge);
router.patch('/challenges/:id', requireRole('csc_council'), gamificationAdminController.updateWeeklyChallenge);

// ============================================
// ACHIEVEMENTS
// ============================================

router.get('/achievements', gamificationAdminController.getAchievements);
router.post('/achievements', requireRole('csc_council'), gamificationAdminController.createAchievement);
router.patch('/achievements/:id', requireRole('csc_council'), gamificationAdminController.updateAchievement);

// ============================================
// STATISTICS & USER DATA
// ============================================

router.get('/stats', gamificationAdminController.getStatistics);
router.get('/users/:userId', gamificationAdminController.getUserGamificationData);

export default router;
