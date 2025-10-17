import { Router } from 'express';
import { MerchantController } from '../controllers/merchant.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as merchantValidation from '../validations/merchant.validation';

const router = Router();
const merchantController = new MerchantController();

// All routes require authentication
router.use(auth);

/**
 * @route POST /merchants
 * @desc Create a new merchant account
 * @access Private (User)
 */
router.post('/register', merchantValidation.createMerchantValidation, merchantController.registerMerchant);

/**
 * @route GET /merchants/:merchantId
 * @desc Get merchant account details
 * @access Private (Merchant Owner or Admin)
 */
router.get('/:merchantId', merchantValidation.merchantIdValidation, merchantController.getMerchant);

/**
 * @route GET /merchants/search/location
 * @desc Get merchants by location
 * @access Public
 */
router.get('/search/location', merchantValidation.searchMerchantsValidation, merchantController.searchByLocation);

/**
 * @route GET /merchants/search/query
 * @desc Search merchants
 * @access Public
 */
router.get('/search/query', merchantValidation.searchMerchantsValidation, merchantController.searchMerchants);

/**
 * @route POST /merchants/payment-request
 * @desc Create payment request
 * @access Private (Merchant)
 */
router.post('/payment-request', merchantValidation.createPaymentRequestValidation, merchantController.createPaymentRequest);

/**
 * @route GET /merchants/:merchantId/payment-requests
 * @desc Get merchant payment requests
 * @access Private (Merchant Owner or Admin)
 */
router.get('/:merchantId/payment-requests', merchantValidation.merchantIdValidation, merchantController.getMerchantPaymentRequests);

/**
 * @route POST /merchants/payment/:paymentRequestId/process
 * @desc Process payment
 * @access Private (User)
 */
router.post('/payment/:paymentRequestId/process', merchantValidation.processPaymentValidation, merchantController.processPayment);

/**
 * @route GET /merchants/:merchantId/analytics
 * @desc Get merchant analytics
 * @access Private (Merchant Owner or Admin)
 */
router.get('/:merchantId/analytics', merchantValidation.merchantAnalyticsValidation, merchantController.getMerchantAnalytics);

/**
 * @route PUT /merchants/:merchantId/status
 * @desc Update merchant status
 * @access Private (Admin)
 */
router.put('/:merchantId/status', merchantValidation.updateMerchantStatusValidation, merchantController.updateMerchantStatus);

export default router;
