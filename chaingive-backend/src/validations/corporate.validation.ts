import { body, param, query } from 'express-validator';

export const createCorporateValidation = [
  body('companyName')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be 2-100 characters'),
  body('companySize')
    .isIn(['startup', 'small', 'medium', 'large', 'enterprise'])
    .withMessage('Invalid company size'),
  body('industry')
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Industry must be 2-50 characters'),
  body('contactPerson')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact person must be 2-100 characters'),
  body('contactInfo')
    .isObject()
    .withMessage('Contact info is required'),
  body('contactInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('contactInfo.phone')
    .isString()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be 10-15 characters'),
  body('csrBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('CSR budget must be non-negative')
];

export const updateCorporateValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  body('companyName')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be 2-100 characters'),
  body('companySize')
    .optional()
    .isIn(['startup', 'small', 'medium', 'large', 'enterprise'])
    .withMessage('Invalid company size'),
  body('industry')
    .optional()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Industry must be 2-50 characters'),
  body('contactPerson')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact person must be 2-100 characters'),
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
    .withMessage('Phone number must be 10-15 characters'),
  body('csrBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('CSR budget must be non-negative')
];

export const corporateIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid corporate ID')
];

export const createBulkDonationValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  body('donations')
    .isArray({ min: 1, max: 50 })
    .withMessage('Donations array must contain 1-50 items'),
  body('donations.*.amount')
    .isFloat({ min: 100 })
    .withMessage('Amount must be at least 100'),
  body('donations.*.currency')
    .isIn(['NGN', 'USD', 'EUR'])
    .withMessage('Invalid currency'),
  body('donations.*.recipientCount')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Recipient count must be 1-10'),
  body('donations.*.description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be max 500 characters')
];

export const processBulkDonationValidation = [
  param('bulkDonationId')
    .isUUID()
    .withMessage('Invalid bulk donation ID')
];

export const corporateDonationsValidation = [
  param('corporateId')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date')
];

export const corporateAnalyticsValidation = [
  param('corporateId')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  query('startDate')
    .isISO8601()
    .withMessage('Invalid start date'),
  query('endDate')
    .isISO8601()
    .withMessage('Invalid end date')
];

export const addTeamMemberValidation = [
  param('corporateId')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  body('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('role')
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role must be 2-50 characters')
];

export const removeTeamMemberValidation = [
  param('corporateId')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID')
];

export const getTeamMembersValidation = [
  param('corporateId')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

export const updateCorporateStatusValidation = [
  param('corporateId')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  body('status')
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid status')
];

export const corporateCSRTrackingValidation = [
  param('corporateId')
    .isUUID()
    .withMessage('Invalid corporate ID'),
  query('period')
    .optional()
    .isIn(['30d', '90d', '1y', 'all'])
    .withMessage('Invalid period')
];
