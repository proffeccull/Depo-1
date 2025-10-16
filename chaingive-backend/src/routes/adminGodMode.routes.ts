import { Router } from 'express';
import * as adminGodModeController from '../controllers/adminGodMode.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication and CSC_Council role (highest admin level)
router.use(authenticate);
router.use(requireRole('csc_council')); // Only CSC Council can access god mode

/**
 * GOD MODE ENDPOINTS - EXTREME CAUTION REQUIRED
 * These endpoints bypass all validations and restrictions
 */

/**
 * Transaction Overrides
 */

// Override transaction status
router.patch(
  '/transactions/:transactionId/status',
  validate(Joi.object({
    status: Joi.string().valid('pending', 'in_transit', 'completed', 'failed', 'cancelled').required(),
    notes: Joi.string().max(500).optional(),
  })),
  adminGodModeController.overrideTransactionStatus
);

// Force release escrow
router.post(
  '/escrows/:escrowId/release',
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminGodModeController.forceReleaseEscrow
);

/**
 * Balance Overrides
 */

// Override user balance
router.patch(
  '/users/:userId/balance',
  validate(Joi.object({
    amount: Joi.number().min(-1000000).max(1000000).required(),
    reason: Joi.string().min(10).max(500).required(),
    balanceType: Joi.string().valid('wallet', 'coins').default('wallet'),
  })),
  adminGodModeController.overrideUserBalance
);

// Override user verification
router.patch(
  '/users/:userId/verification',
  validate(Joi.object({
    tier: Joi.number().valid(1, 2, 3).optional(),
    kycStatus: Joi.string().valid('pending', 'approved', 'rejected', 'not_required').optional(),
    trustScore: Joi.number().min(0).max(5).optional(),
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminGodModeController.overrideUserVerification
);

/**
 * Destructive Operations
 */

// Force delete record
router.delete(
  '/records/:tableName/:recordId',
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminGodModeController.forceDeleteRecord
);

/**
 * Database Operations (EXTREME DANGER)
 */

// Execute raw SQL query
router.post(
  '/database/query',
  validate(Joi.object({
    query: Joi.string().min(1).max(10000).required(),
    params: Joi.array().optional(),
  })),
  adminGodModeController.executeRawQuery
);

export default router;