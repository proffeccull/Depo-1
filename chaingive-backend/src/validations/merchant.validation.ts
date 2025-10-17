import { body, param, query } from 'express-validator';

export const createMerchantValidation = [
  body('businessName')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be 2-100 characters'),
  body('businessType')
    .isIn(['retail', 'service', 'food', 'other'])
    .withMessage('Invalid business type'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be max 500 characters'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
  body('contactInfo')
    .isObject()
    .withMessage('Contact info is required'),
  body('contactInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('contactInfo.phone')
    .isString()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be 10-15 characters')
];

export const updateMerchantValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid merchant ID'),
  body('businessName')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be 2-100 characters'),
  body('businessType')
    .optional()
    .isIn(['retail', 'service', 'food', 'other'])
    .withMessage('Invalid business type'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be max 500 characters'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
  body('contactInfo')
    .optional()
    .isObject()
    .withMessage('Contact info must be an object'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),
  body('contactInfo.phone')
    .optional()
    .isString()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be 10-15 characters')
];

export const merchantIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid merchant ID')
];

export const searchMerchantsValidation = [
  query('query')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Query must be 1-100 characters'),
  query('category')
    .optional()
    .isIn(['retail', 'service', 'food', 'other'])
    .withMessage('Invalid category'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

export const createPaymentRequestValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['NGN', 'USD', 'EUR'])
    .withMessage('Invalid currency'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('Description must be max 255 characters')
];

export const processPaymentValidation = [
  param('paymentRequestId')
    .isUUID()
    .withMessage('Invalid payment request ID'),
  body('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
];

export const merchantAnalyticsValidation = [
  param('merchantId')
    .isUUID()
    .withMessage('Invalid merchant ID'),
  query('startDate')
    .isISO8601()
    .withMessage('Invalid start date'),
  query('endDate')
    .isISO8601()
    .withMessage('Invalid end date')
];

export const updateMerchantStatusValidation = [
  param('merchantId')
    .isUUID()
    .withMessage('Invalid merchant ID'),
  body('status')
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid status')
];
