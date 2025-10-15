import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { auth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { generateRecommendationSchema, markRecommendationActionSchema } from '../validations/ai.validation';

const router = Router();
const aiController = new AIController();

/**
 * AI Routes
 * Base path: /api/ai
 */

// Generate personalized recommendation
router.post(
  '/recommendations',
  auth,
  rateLimiter,
  validateRequest(generateRecommendationSchema),
  aiController.generateRecommendation.bind(aiController)
);

// Get user insights and analytics
router.get(
  '/insights',
  auth,
  rateLimiter,
  aiController.getUserInsights.bind(aiController)
);

// Get user's recommendation history
router.get(
  '/recommendations/history',
  auth,
  rateLimiter,
  aiController.getRecommendationHistory.bind(aiController)
);

// Mark recommendation as viewed
router.post(
  '/recommendations/:id/view',
  auth,
  rateLimiter,
  validateRequest(markRecommendationActionSchema),
  aiController.markRecommendationViewed.bind(aiController)
);

// Mark recommendation as actioned
router.post(
  '/recommendations/:id/action',
  auth,
  rateLimiter,
  validateRequest(markRecommendationActionSchema),
  aiController.markRecommendationActioned.bind(aiController)
);

export default router;