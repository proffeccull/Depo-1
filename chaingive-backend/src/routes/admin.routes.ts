import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requirePermission, requireRoleLevel } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication and minimum role level 2 (agent or higher)
router.use(authenticate);
router.use(requireRoleLevel(2));

/**
 * User Management
 */

// Get all users with filters
router.get(
  '/users',
  requirePermission('users', 'read'),
  adminController.getAllUsers
);

// Get user details
router.get(
  '/users/:userId',
  requirePermission('users', 'read'),
  adminController.getUserDetails
);

// Ban user
router.post(
  '/users/:userId/ban',
  requirePermission('users', 'manage'),
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminController.banUser
);

// Unban user
router.post(
  '/users/:userId/unban',
  requirePermission('users', 'manage'),
  adminController.unbanUser
);

/**
 * KYC Management
 */

// Get pending KYC
router.get(
  '/kyc/pending',
  adminController.getPendingKYC
);

// Approve KYC
router.post(
  '/kyc/:kycId/approve',
  requirePermission('kyc', 'approve'),
  adminController.approveKYC
);

// Reject KYC
router.post(
  '/kyc/:kycId/reject',
  requirePermission('kyc', 'reject'),
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminController.rejectKYC
);

/**
 * Platform Analytics
 */

// Dashboard stats
router.get(
  '/dashboard/stats',
  adminController.getDashboardStats
);

// Revenue report
router.get(
  '/reports/revenue',
  adminController.getRevenueReport
);

// User growth report
router.get(
  '/reports/user-growth',
  adminController.getUserGrowthReport
);

/**
 * User Management (CRUD)
 */

// Create user
router.post(
  '/users',
  requirePermission('users', 'create'),
  validate(Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    email: Joi.string().email().optional(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    role: Joi.string().valid('beginner', 'agent', 'power_partner', 'csc_council').default('beginner'),
    tier: Joi.number().valid(1, 2, 3).default(1),
    locationCity: Joi.string().max(100).optional(),
    locationState: Joi.string().max(100).optional(),
    isActive: Joi.boolean().default(true),
  })),
  adminController.createUser
);

// Update user
router.patch(
  '/users/:userId',
  requirePermission('users', 'update'),
  validate(Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    email: Joi.string().email().optional(),
    locationCity: Joi.string().max(100).optional(),
    locationState: Joi.string().max(100).optional(),
    isActive: Joi.boolean().optional(),
    trustScore: Joi.number().min(0).max(5).optional(),
    tier: Joi.number().valid(1, 2, 3).optional(),
  })),
  adminController.updateUser
);

// Delete user (soft delete)
router.delete(
  '/users/:userId',
  requirePermission('users', 'delete'),
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminController.deleteUser
);

// Get user permissions
router.get(
  '/users/:userId/permissions',
  adminController.getUserPermissions
);

/**
 * Donation Management
 */

// Override donation transaction
router.patch(
  '/donations/:transactionId/override',
  requirePermission('transactions', 'manage'),
  validate(Joi.object({
    amount: Joi.number().positive().optional(),
    status: Joi.string().valid('pending', 'in_transit', 'completed', 'failed', 'cancelled').optional(),
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminController.overrideDonation
);

export default router;
