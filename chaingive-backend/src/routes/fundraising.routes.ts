import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache.middleware';
import * as fundraisingController from '../controllers/fundraising.controller';

const router = Router();

router.get('/thermometer/:categoryId', cacheMiddleware(60), fundraisingController.getThermometer);
router.get('/leaderboard', cacheMiddleware(300), fundraisingController.getLeaderboardWithBadges);
router.get('/leaderboard/teams', cacheMiddleware(300), require('../controllers/team-leaderboard.controller').getTeamLeaderboard);
router.get('/badges', authenticate, fundraisingController.getUserBadges);
router.post('/share', authenticate, require('../controllers/share.controller').generateShareImage);

export default router;
