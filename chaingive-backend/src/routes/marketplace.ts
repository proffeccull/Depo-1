import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getPersonalizedRecommendations,
  getMarketplaceAnalytics,
  getSuggestedCategories,
  updateRecommendationFeedback,
  getTrendingItems,
  getCategoryPerformance,
  getUserMarketplaceInsights,
  getSearchSuggestions,
} from '../controllers/marketplace.controller';

const router = Router();

// All marketplace routes require authentication
router.use(auth);

// Personalized recommendations
router.get('/recommendations', getPersonalizedRecommendations);

// Analytics and insights
router.get('/analytics', getMarketplaceAnalytics);
router.get('/analytics/trending', getTrendingItems);
router.get('/analytics/categories', getCategoryPerformance);
router.get('/analytics/suggestions', getSuggestedCategories);

// User-specific insights
router.get('/insights', getUserMarketplaceInsights);

// Search and discovery
router.get('/search/suggestions', getSearchSuggestions);

// User interaction feedback
router.post('/feedback', updateRecommendationFeedback);

export default router;