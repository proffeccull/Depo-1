import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication and admin/csc_council role
router.use(authenticate);
router.use(requireRole('csc_council', 'agent')); // Placeholder for 'admin' role

/**
 * User Management
 */

// Get all users with filters
router.get(
  '/users',
  adminController.getAllUsers
);

// Get user details
router.get(
  '/users/:userId',
  adminController.getUserDetails
);

// Ban user
router.post(
  '/users/:userId/ban',
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminController.banUser
);

// Unban user
router.post(
  '/users/:userId/unban',
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
  adminController.approveKYC
);

// Reject KYC
router.post(
  '/kyc/:kycId/reject',
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

export default router;
