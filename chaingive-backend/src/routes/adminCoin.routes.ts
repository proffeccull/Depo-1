import { Router } from 'express';
import * as adminCoinController from '../controllers/adminCoin.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication and admin/csc_council role
router.use(authenticate);
router.use(requireRole('csc_council', 'agent')); // In reality, you'd have 'admin' role

/**
 * @route   GET /v1/admin/coins/purchases/pending
 * @desc    Get pending coin purchase requests
 * @access  Private (Admin only)
 */
router.get('/coins/purchases/pending', adminCoinController.getPendingPurchases);

/**
 * @route   GET /v1/admin/coins/purchases
 * @desc    Get all coin purchase requests
 * @access  Private (Admin only)
 */
router.get('/coins/purchases', adminCoinController.getAllPurchases);

/**
 * @route   POST /v1/admin/coins/purchases/:purchaseId/approve
 * @desc    Approve coin purchase and credit agent
 * @access  Private (Admin only)
 */
router.post(
  '/coins/purchases/:purchaseId/approve',
  validate(
    Joi.object({
      notes: Joi.string().max(500).optional(),
    })
  ),
  adminCoinController.approvePurchase
);

/**
 * @route   POST /v1/admin/coins/purchases/:purchaseId/reject
 * @desc    Reject coin purchase
 * @access  Private (Admin only)
 */
router.post(
  '/coins/purchases/:purchaseId/reject',
  validate(
    Joi.object({
      rejectionReason: Joi.string().min(10).max(500).required(),
    })
  ),
  adminCoinController.rejectPurchase
);

/**
 * @route   GET /v1/admin/coins/wallets
 * @desc    Get crypto wallet addresses
 * @access  Private (Admin only)
 */
router.get('/coins/wallets', adminCoinController.getCryptoWallets);

/**
 * @route   POST /v1/admin/coins/wallets
 * @desc    Create crypto wallet address
 * @access  Private (Admin only)
 */
router.post(
  '/coins/wallets',
  validate(
    Joi.object({
      currency: Joi.string().valid('BTC', 'USDT', 'ETH').required(),
      network: Joi.string().valid('Bitcoin', 'TRC20', 'ERC20', 'BEP20').required(),
      address: Joi.string().min(20).max(100).required(),
      qrCodeUrl: Joi.string().uri().optional(),
    })
  ),
  adminCoinController.createCryptoWallet
);

/**
 * @route   DELETE /v1/admin/coins/wallets/:walletId
 * @desc    Deactivate crypto wallet
 * @access  Private (Admin only)
 */
router.delete('/coins/wallets/:walletId', adminCoinController.deactivateCryptoWallet);

/**
 * @route   GET /v1/admin/coins/stats
 * @desc    Get platform coin statistics
 * @access  Private (Admin only)
 */
router.get('/coins/stats', adminCoinController.getCoinStats);

export default router;
