import { Router } from 'express';
import * as agentCoinController from '../controllers/agentCoin.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as agentCoinValidation from '../validations/agentCoin.validation';

const router = Router();

// All routes require authentication and agent role
router.use(authenticate);
router.use(requireRole('agent', 'power_partner'));

/**
 * @route   GET /v1/agents/coins/inventory
 * @desc    Get agent's coin inventory
 * @access  Private (Agent only)
 */
router.get('/coins/inventory', agentCoinController.getCoinInventory);

/**
 * @route   POST /v1/agents/coins/purchase-request
 * @desc    Request to buy coins from admin (crypto payment)
 * @access  Private (Agent only)
 */
router.post(
  '/coins/purchase-request',
  validate(agentCoinValidation.purchaseRequestSchema),
  agentCoinController.requestCoinPurchase
);

/**
 * @route   POST /v1/agents/coins/submit-payment-proof
 * @desc    Submit crypto payment proof
 * @access  Private (Agent only)
 */
router.post(
  '/coins/submit-payment-proof',
  validate(agentCoinValidation.submitProofSchema),
  agentCoinController.submitPaymentProof
);

/**
 * @route   GET /v1/agents/coins/purchases
 * @desc    Get coin purchase history
 * @access  Private (Agent only)
 */
router.get('/coins/purchases', agentCoinController.getPurchaseHistory);

/**
 * @route   POST /v1/agents/coins/sell
 * @desc    Sell coins to a user
 * @access  Private (Agent only)
 */
router.post(
  '/coins/sell',
  validate(agentCoinValidation.sellCoinsSchema),
  agentCoinController.sellCoinsToUser
);

/**
 * @route   GET /v1/agents/coins/sales
 * @desc    Get coin sales history
 * @access  Private (Agent only)
 */
router.get('/coins/sales', agentCoinController.getSalesHistory);

export default router;
