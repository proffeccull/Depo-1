import Joi from 'joi';

export const registerMerchant = {
  body: Joi.object({
    businessName: Joi.string().required().min(1).max(100),
    businessType: Joi.string().required().valid('retail', 'service', 'food', 'other'),
    description: Joi.string().optional().max(500),
    location: Joi.object({
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }).optional()
    }).optional(),
    contactInfo: Joi.object({
      phone: Joi.string().required(),
      email: Joi.string().email().optional(),
      address: Joi.string().optional()
    }).required()
  })
};

export const updateMerchantProfile = {
  body: Joi.object({
    businessName: Joi.string().optional().min(1).max(100),
    businessType: Joi.string().optional().valid('retail', 'service', 'food', 'other'),
    description: Joi.string().optional().max(500),
    location: Joi.object({
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }).optional()
    }).optional(),
    contactInfo: Joi.object({
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      address: Joi.string().optional()
    }).optional()
  }).min(1)
};

export const getMerchantProfile = {
  // No validation needed - uses authenticated user
};

export const generateQRCode = {
  // No validation needed - uses authenticated user
};

export const processQRPayment = {
  body: Joi.object({
    merchantId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('wallet', 'card', 'bank_transfer').required()
  })
};

export const getMerchantDirectory = {
  query: Joi.object({
    businessType: Joi.string().valid('retail', 'service', 'food', 'other').optional(),
    location: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20)
  })
};

export const getMerchantById = {
  params: Joi.object({
    merchantId: Joi.string().uuid().required()
  })
};

export const updateMerchantRating = {
  params: Joi.object({
    merchantId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    review: Joi.string().optional().max(500)
  })
};

export const getMerchantReviews = {
  params: Joi.object({
    merchantId: Joi.string().uuid().required()
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  })
};

export const searchMerchants = {
  query: Joi.object({
    q: Joi.string().required().min(1).max(100),
    businessType: Joi.string().valid('retail', 'service', 'food', 'other').optional(),
    location: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20)
  })
};