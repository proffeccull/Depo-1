import { Router } from 'express';
import * as coinPurchaseController from '../controllers/coinPurchase.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as coinPurchaseValidation from '../validations/coinPurchase.validation';
import { requireFeature } from '../middleware/featureFlag';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * User Endpoints
 */

// Get available agents
router.get(
  '/agents/available',
  coinPurchaseController.getAvailableAgents
);

// Request coin purchase (creates escrow)
router.post(
  '/request',
  requireFeature('coin_purchases'),
  validate(coinPurchaseValidation.requestPurchaseSchema),
  coinPurchaseController.requestCoinPurchase
);

// Confirm payment sent
router.post(
  '/:transactionId/confirm-payment',
  validate(coinPurchaseValidation.confirmPaymentSchema),
  coinPurchaseController.confirmPaymentSent
);

// Get purchase history
router.get(
  '/my-purchases',
  coinPurchaseController.getUserPurchaseHistory
);

/**
 * Agent Endpoints
 */

// Get pending confirmations
router.get(
  '/agent/pending',
  requireRole('agent', 'power_partner', 'csc_council'),
  coinPurchaseController.getAgentPendingConfirmations
);

// Confirm payment received (release coins)
router.post(
  '/agent/:transactionId/confirm',
  requireRole('agent', 'power_partner', 'csc_council'),
  coinPurchaseController.agentConfirmPayment
);

// Reject payment (cancel and return coins)
router.post(
  '/agent/:transactionId/reject',
  requireRole('agent', 'power_partner', 'csc_council'),
  validate(coinPurchaseValidation.rejectPaymentSchema),
  coinPurchaseController.agentRejectPayment
);

export default router;
