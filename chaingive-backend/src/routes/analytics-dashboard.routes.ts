import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as analyticsDashboardController from '../controllers/analytics-dashboard.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin', 'csc_council'));

router.get('/trends', analyticsDashboardController.getDonationTrends);
router.get('/engagement', analyticsDashboardController.getUserEngagement);
router.get('/funnel', analyticsDashboardController.getConversionFunnel);
router.get('/heatmap', analyticsDashboardController.getDonationHeatmap);
router.get('/overview', analyticsDashboardController.getOverviewStats);

export default router;
