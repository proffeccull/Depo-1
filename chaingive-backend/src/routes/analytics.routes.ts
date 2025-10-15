import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as analyticsValidation from '../validations/analytics.validation';

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes require authentication
router.use(auth);

// Track user events
router.post('/events', analyticsController.trackEvent);

// User analytics
router.get('/users/:userId?', analyticsController.getUserAnalytics);

// Platform analytics (admin only)
router.get('/platform', analyticsController.getPlatformAnalytics);

// Donation analytics
router.get('/donations', analyticsController.getDonationAnalytics);

// Engagement metrics
router.get('/engagement', analyticsController.getEngagementMetrics);

// Export analytics data
router.get('/export', analyticsController.exportAnalytics);

// Real-time metrics
router.get('/realtime', analyticsController.getRealTimeMetrics);

// User insights
router.get('/insights/:userId?', analyticsController.getUserInsights);

// Conversion funnel
router.get('/funnel', analyticsController.getConversionFunnel);

export default router;