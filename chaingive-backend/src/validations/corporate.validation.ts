import Joi from 'joi';

export const registerCorporate = {
  body: Joi.object({
    companyName: Joi.string().required().min(1).max(100),
    companySize: Joi.string().required().valid('startup', 'small', 'medium', 'large', 'enterprise'),
    industry: Joi.string().required().min(1).max(50),
    description: Joi.string().optional().max(1000),
    contactPerson: Joi.string().required().min(1).max(100),
    contactInfo: Joi.object({
      phone: Joi.string().required(),
      email: Joi.string().email().required(),
      address: Joi.string().optional()
    }).required(),
    csrBudget: Joi.number().positive().optional()
  })
};

export const updateCorporateProfile = {
  body: Joi.object({
    companyName: Joi.string().optional().min(1).max(100),
    companySize: Joi.string().optional().valid('startup', 'small', 'medium', 'large', 'enterprise'),
    industry: Joi.string().optional().min(1).max(50),
    description: Joi.string().optional().max(1000),
    contactPerson: Joi.string().optional().min(1).max(100),
    contactInfo: Joi.object({
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      address: Joi.string().optional()
    }).optional(),
    csrBudget: Joi.number().positive().optional()
  }).min(1)
};

export const getCorporateProfile = {
  // No validation needed - uses authenticated user
};

export const createBulkCampaign = {
  body: Joi.object({
    campaignName: Joi.string().required().min(1).max(100),
    description: Joi.string().optional().max(500),
    targetAmount: Joi.number().positive().required(),
    targetRecipients: Joi.number().integer().positive().required(),
    donationAmount: Joi.number().positive().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().when('startDate', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('startDate')).required()
    })
  })
};

export const getCorporateCampaigns = {
  query: Joi.object({
    status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  })
};

export const processBulkDonations = {
  body: Joi.object({
    campaignId: Joi.string().uuid().required(),
    recipientIds: Joi.array().items(Joi.string().uuid()).min(1).max(1000).required(),
    donationAmount: Joi.number().positive().required()
  })
};

export const getCSRReport = {
  query: Joi.object({
    timeframe: Joi.string().valid('1month', '3months', '6months', '1year').default('1year')
  })
};

export const updateVerificationStatus = {
  params: Joi.object({
    corporateId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    isVerified: Joi.boolean().required(),
    verificationNotes: Joi.string().optional().max(500)
  })
};

export const getCorporateAPIKeys = {
  // No validation needed - uses authenticated user
};

export const regenerateAPIKeys = {
  // No validation needed - uses authenticated user
};