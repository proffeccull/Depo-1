import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createMerchant,
  getMerchant,
  updateMerchant,
  deleteMerchant,
  getMerchantsByLocation,
  searchMerchants,
  generateMerchantQR,
  processMerchantPayment,
  getMerchantPayments,
  updateMerchantVerification,
  getMerchantAnalytics
} from '../controllers/merchant.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /merchants
 * @desc Create a new merchant account
 * @access Private (User)
 */
router.post('/', [
  body('businessName').isString().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
  body('businessType').isString().isIn(['retail', 'service', 'food', 'other']).withMessage('Invalid business type'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('contactInfo').isObject().withMessage('Contact info is required'),
  validate
], createMerchant);

/**
 * @route GET /merchants/:id
 * @desc Get merchant account details
 * @access Private (Merchant Owner or Admin)
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid merchant ID'),
  validate
], getMerchant);

/**
 * @route PUT /merchants/:id
 * @desc Update merchant account
 * @access Private (Merchant Owner or Admin)
 */
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid merchant ID'),
  body('businessName').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
  body('businessType').optional().isString().isIn(['retail', 'service', 'food', 'other']).withMessage('Invalid business type'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('contactInfo').optional().isObject().withMessage('Contact info must be an object'),
  validate
], updateMerchant);

/**
 * @route DELETE /merchants/:id
 * @desc Delete merchant account
 * @access Private (Merchant Owner or Admin)
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid merchant ID'),
  validate
], deleteMerchant);

/**
 * @route GET /merchants/location
 * @desc Get merchants by location
 * @access Public
 */
router.get('/location', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Radius must be 0.1-50 km'),
  validate
], getMerchantsByLocation);

/**
 * @route GET /merchants/search
 * @desc Search merchants
 * @access Public
 */
router.get('/search', [
  query('query').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Query must be 1-100 characters'),
  query('category').optional().isString().isIn(['retail', 'service', 'food', 'other']).withMessage('Invalid category'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  validate
], searchMerchants);

/**
 * @route GET /merchants/:id/qr
 * @desc Generate QR code for merchant
 * @access Private (Merchant Owner or Admin)
 */
router.get('/:id/qr', [
  param('id').isUUID().withMessage('Invalid merchant ID'),
  validate
], generateMerchantQR);

/**
 * @route POST /merchants/:id/pay
 * @desc Process payment to merchant
 * @access Private (User)
 */
router.post('/:id/pay', [
  param('id').isUUID().withMessage('Invalid merchant ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isString().isIn(['NGN', 'USD', 'EUR']).withMessage('Invalid currency'),
  body('paymentMethod').isString().isIn(['wallet', 'card', 'bank_transfer']).withMessage('Invalid payment method'),
  body('description').optional().isString().isLength({ max: 255 }).withMessage('Description must be max 255 characters'),
  validate
], processMerchantPayment);

/**
 * @route GET /merchants/:id/payments
 * @desc Get merchant payment history
 * @access Private (Merchant Owner or Admin)
 */
router.get('/:id/payments', [
  param('id').isUUID().withMessage('Invalid merchant ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  validate
], getMerchantPayments);

/**
 * @route PATCH /merchants/:id/verification
 * @desc Update merchant verification status
 * @access Private (Admin only)
 */
router.patch('/:id/verification', [
  param('id').isUUID().withMessage('Invalid merchant ID'),
  body('isVerified').isBoolean().withMessage('isVerified must be boolean'),
  body('rejectionReason').optional().isString().isLength({ max: 500 }).withMessage('Rejection reason must be max 500 characters'),
  validate
], updateMerchantVerification);

/**
 * @route GET /merchants/:id/analytics
 * @desc Get merchant analytics
 * @access Private (Merchant Owner or Admin)
 */
router.get('/:id/analytics', [
  param('id').isUUID().withMessage('Invalid merchant ID'),
  query('period').optional().isString().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
  validate
], getMerchantAnalytics);

export default router;