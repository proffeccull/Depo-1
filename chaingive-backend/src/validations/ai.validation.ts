import Joi from 'joi';

export const getRecommendations = {
  query: Joi.object({
    type: Joi.string().valid('donation_amount', 'recipient', 'marketplace_item', 'social_circle').optional(),
    limit: Joi.number().integer().min(1).max(20).default(5)
  })
};

export const getUserInsights = {
  params: Joi.object({
    userId: Joi.string().uuid().optional()
  })
};

export const trackRecommendationInteraction = {
  body: Joi.object({
    recommendationId: Joi.string().uuid().required(),
    action: Joi.string().valid('viewed', 'clicked', 'actioned', 'dismissed').required(),
    metadata: Joi.object().optional()
  })
};

export const getPersonalizedFeed = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20)
  })
};

export const analyzeUserBehavior = {
  params: Joi.object({
    userId: Joi.string().uuid().optional()
  }),
  query: Joi.object({
    timeframe: Joi.string().valid('1d', '7d', '30d', '90d').default('30d')
  })
};

export const getSmartSuggestions = {
  query: Joi.object({
    context: Joi.string().valid('donation', 'marketplace', 'social', 'gamification').required(),
    limit: Joi.number().integer().min(1).max(10).default(3)
  })
};

export const updateUserPreferences = {
  body: Joi.object({
    preferences: Joi.object({
      donationAmount: Joi.number().positive().optional(),
      preferredCategories: Joi.array().items(Joi.string()).optional(),
      notificationFrequency: Joi.string().valid('low', 'medium', 'high').optional(),
      socialEngagement: Joi.boolean().optional()
    }).min(1)
  })
};

export const getPredictiveAnalytics = {
  query: Joi.object({
    metric: Joi.string().valid('churn_risk', 'engagement_score', 'donation_potential').required(),
    timeframe: Joi.string().valid('7d', '30d', '90d').default('30d')
  })
};