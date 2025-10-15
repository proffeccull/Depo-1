import { Router } from 'express';
import * as disputeController from '../controllers/dispute.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as disputeValidation from '../validations/dispute.validation';
import { requireFeature } from '../middleware/featureFlag';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * User Endpoints
 */

// Create dispute
router.post(
  '/create',
  requireFeature('disputes'),
  validate(disputeValidation.createDisputeSchema),
  disputeController.createDispute
);

// Get my disputes
router.get(
  '/my-disputes',
  disputeController.getMyDisputes
);

// Get dispute details
router.get(
  '/:disputeId',
  disputeController.getDisputeDetails
);

// Add message to dispute
router.post(
  '/:disputeId/message',
  validate(disputeValidation.addMessageSchema),
  disputeController.addDisputeMessage
);

// Upload evidence
router.post(
  '/:disputeId/evidence',
  validate(disputeValidation.uploadEvidenceSchema),
  disputeController.uploadDisputeEvidence
);

/**
 * Admin Endpoints
 */

// Get all disputes
router.get(
  '/admin/all',
  requireRole('csc_council', 'agent'),
  disputeController.getAllDisputes
);

// Assign dispute to mediator
router.post(
  '/:disputeId/assign',
  requireRole('csc_council', 'agent'),
  validate(disputeValidation.assignDisputeSchema),
  disputeController.assignDispute
);

// Resolve dispute
router.post(
  '/:disputeId/resolve',
  requireRole('csc_council', 'agent'),
  validate(disputeValidation.resolveDisputeSchema),
  disputeController.resolveDispute
);

export default router;
