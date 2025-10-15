import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as walletValidation from '../validations/wallet.validation';
import { rateLimitMiddleware, withdrawalLimiter } from '../middleware/advancedRateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /v1/wallet/balance
 * @desc    Get wallet balance
 * @access  Private
 */
router.get('/balance', walletController.getBalance);

/**
 * @route   GET /v1/wallet/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get('/transactions', walletController.getTransactions);

/**
 * @route   GET /v1/wallet/transactions/:id
 * @desc    Get transaction details
 * @access  Private
 */
router.get('/transactions/:id', walletController.getTransactionById);

/**
 * @route   POST /v1/wallet/deposit
 * @desc    Initiate deposit
 * @access  Private
 */
router.post('/deposit', validate(walletValidation.depositSchema), walletController.initiateDeposit);

/**
 * @route   POST /v1/wallet/withdraw
 * @desc    Initiate withdrawal
 * @access  Private
 */
router.post(
  '/withdraw', 
  rateLimitMiddleware(withdrawalLimiter, 'Too many withdrawal requests'),
  validate(walletValidation.withdrawSchema), 
  walletController.initiateWithdrawal
);

/**
 * @route   POST /v1/wallet/deposit/confirm
 * @desc    Confirm deposit (webhook)
 * @access  Private
 */
router.post('/deposit/confirm', walletController.confirmDeposit);

export default router;
