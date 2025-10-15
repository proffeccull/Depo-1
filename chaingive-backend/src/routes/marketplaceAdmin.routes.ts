import { Router } from 'express';
import * as marketplaceAdminController from '../controllers/marketplaceAdmin.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('csc_council', 'agent'));

/**
 * Listing Management
 */

// Create listing
router.post(
  '/listings',
  validate(Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    coinPrice: Joi.number().integer().min(10).max(100000).required(),
    category: Joi.string().required(),
    imageUrl: Joi.string().uri().optional(),
    stockQuantity: Joi.number().integer().min(1).required(),
  })),
  marketplaceAdminController.createListing
);

// Update listing
router.patch(
  '/listings/:listingId',
  validate(Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(500).optional(),
    coinPrice: Joi.number().integer().min(10).max(100000).optional(),
    stockQuantity: Joi.number().integer().min(1).optional(),
    isAvailable: Joi.boolean().optional(),
  })),
  marketplaceAdminController.updateListing
);

// Delete listing
router.delete(
  '/listings/:listingId',
  marketplaceAdminController.deleteListing
);

/**
 * Redemption Management
 */

// Get all redemptions
router.get(
  '/redemptions',
  marketplaceAdminController.getAllRedemptions
);

// Approve redemption
router.post(
  '/redemptions/:redemptionId/approve',
  marketplaceAdminController.approveRedemption
);

// Reject redemption
router.post(
  '/redemptions/:redemptionId/reject',
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  marketplaceAdminController.rejectRedemption
);

export default router;
