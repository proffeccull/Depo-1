import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createCorporateAccount,
  getCorporateAccount,
  updateCorporateAccount,
  deleteCorporateAccount,
  bulkCreateUsers,
  bulkInitiateDonations,
  getCorporateAnalytics,
  getCorporateTeam,
  updateCorporateBudget,
  getCorporateDonations,
  updateCorporateVerification,
  getCorporateCSRTracking
} from '../controllers/corporate.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /corporate
 * @desc Create a new corporate account
 * @access Private (User)
 */
router.post('/', [
  body('companyName').isString().isLength({ min: 2, max: 100 }).withMessage('Company name must be 2-100 characters'),
  body('companySize').isString().isIn(['startup', 'small', 'medium', 'large', 'enterprise']).withMessage('Invalid company size'),
  body('industry').isString().isLength({ min: 2, max: 50 }).withMessage('Industry must be 2-50 characters'),
  body('contactPerson').isString().isLength({ min: 2, max: 100 }).withMessage('Contact person must be 2-100 characters'),
  body('contactInfo').isObject().withMessage('Contact info is required'),
  body('csrBudget').optional().isFloat({ min: 0 }).withMessage('CSR budget must be non-negative'),
  validate
], createCorporateAccount);

/**
 * @route GET /corporate/:id
 * @desc Get corporate account details
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  validate
], getCorporateAccount);

/**
 * @route PUT /corporate/:id
 * @desc Update corporate account
 * @access Private (Corporate Owner or Admin)
 */
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  body('companyName').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Company name must be 2-100 characters'),
  body('companySize').optional().isString().isIn(['startup', 'small', 'medium', 'large', 'enterprise']).withMessage('Invalid company size'),
  body('industry').optional().isString().isLength({ min: 2, max: 50 }).withMessage('Industry must be 2-50 characters'),
  body('contactPerson').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Contact person must be 2-100 characters'),
  body('contactInfo').optional().isObject().withMessage('Contact info must be an object'),
  body('csrBudget').optional().isFloat({ min: 0 }).withMessage('CSR budget must be non-negative'),
  validate
], updateCorporateAccount);

/**
 * @route DELETE /corporate/:id
 * @desc Delete corporate account
 * @access Private (Corporate Owner or Admin)
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  validate
], deleteCorporateAccount);

/**
 * @route POST /corporate/:id/bulk-users
 * @desc Bulk create users
 * @access Private (Corporate Owner or Admin)
 */
router.post('/:id/bulk-users', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  body('users').isArray({ min: 1, max: 100 }).withMessage('Users array must contain 1-100 items'),
  body('users.*.firstName').isString().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('users.*.lastName').isString().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('users.*.email').isEmail().withMessage('Valid email is required'),
  body('users.*.phoneNumber').isString().isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 characters'),
  validate
], bulkCreateUsers);

/**
 * @route POST /corporate/:id/bulk-donations
 * @desc Bulk initiate donations
 * @access Private (Corporate Owner or Admin)
 */
router.post('/:id/bulk-donations', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  body('donations').isArray({ min: 1, max: 50 }).withMessage('Donations array must contain 1-50 items'),
  body('donations.*.amount').isFloat({ min: 100 }).withMessage('Amount must be at least 100'),
  body('donations.*.currency').isString().isIn(['NGN', 'USD', 'EUR']).withMessage('Invalid currency'),
  body('donations.*.recipientCount').optional().isInt({ min: 1, max: 10 }).withMessage('Recipient count must be 1-10'),
  validate
], bulkInitiateDonations);

/**
 * @route GET /corporate/:id/analytics
 * @desc Get corporate analytics
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:id/analytics', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  query('period').optional().isString().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
  validate
], getCorporateAnalytics);

/**
 * @route GET /corporate/:id/team
 * @desc Get corporate team members
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:id/team', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  validate
], getCorporateTeam);

/**
 * @route PATCH /corporate/:id/budget
 * @desc Update corporate CSR budget
 * @access Private (Corporate Owner or Admin)
 */
router.patch('/:id/budget', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be non-negative'),
  validate
], updateCorporateBudget);

/**
 * @route GET /corporate/:id/donations
 * @desc Get corporate donation history
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:id/donations', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('status').optional().isString().isIn(['pending', 'in_transit', 'received', 'obligated', 'fulfilled', 'defaulted']).withMessage('Invalid status'),
  validate
], getCorporateDonations);

/**
 * @route PATCH /corporate/:id/verification
 * @desc Update corporate verification status
 * @access Private (Admin only)
 */
router.patch('/:id/verification', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  body('isVerified').isBoolean().withMessage('isVerified must be boolean'),
  body('rejectionReason').optional().isString().isLength({ max: 500 }).withMessage('Rejection reason must be max 500 characters'),
  validate
], updateCorporateVerification);

/**
 * @route GET /corporate/:id/csr-tracking
 * @desc Get corporate CSR tracking
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:id/csr-tracking', [
  param('id').isUUID().withMessage('Invalid corporate ID'),
  query('period').optional().isString().isIn(['30d', '90d', '1y', 'all']).withMessage('Invalid period'),
  validate
], getCorporateCSRTracking);

export default router;