import Joi from 'joi';

export const trackEvent = {
  body: Joi.object({
    eventType: Joi.string().required().min(1).max(100),
    eventData: Joi.object().optional(),
    sessionId: Joi.string().optional(),
    deviceInfo: Joi.object().optional(),
    ipAddress: Joi.string().optional(),
    userAgent: Joi.string().optional()
  })
};

export const getUserAnalytics = {
  params: Joi.object({
    userId: Joi.string().uuid().optional()
  }),
  query: Joi.object({
    timeframe: Joi.string().valid('1d', '7d', '30d', '90d', '1y').default('30d')
  })
};

export const getPlatformAnalytics = {
  query: Joi.object({
    timeframe: Joi.string().valid('1d', '7d', '30d', '90d', '1y').default('7d'),
    metrics: Joi.string().valid('all', 'users', 'donations', 'engagement').default('all')
  })
};

export const getDonationAnalytics = {
  query: Joi.object({
    timeframe: Joi.string().valid('1d', '7d', '30d', '90d', '1y').default('30d')
  })
};

export const getEngagementMetrics = {
  query: Joi.object({
    timeframe: Joi.string().valid('1d', '7d', '30d', '90d', '1y').default('7d')
  })
};

export const exportAnalytics = {
  query: Joi.object({
    type: Joi.string().valid('user', 'platform', 'donation').default('user'),
    format: Joi.string().valid('json', 'csv').default('json'),
    timeframe: Joi.string().valid('1d', '7d', '30d', '90d', '1y').default('30d')
  })
};

export const getRealTimeMetrics = {
  // No validation needed for this endpoint
};

export const getUserInsights = {
  params: Joi.object({
    userId: Joi.string().uuid().optional()
  })
};

export const getConversionFunnel = {
  query: Joi.object({
    timeframe: Joi.string().valid('1d', '7d', '30d', '90d', '1y').default('30d')
  })
};