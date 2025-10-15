import { Router } from 'express';
import * as adminAdvancedController from '../controllers/adminAdvanced.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as adminAdvancedValidation from '../validations/adminAdvanced.validation';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('csc_council', 'agent')); // Admin roles

/**
 * User Promotion & Management
 */

// Promote user to agent role
router.post(
  '/users/:userId/promote-to-agent',
  adminAdvancedController.promoteToAgent
);

// Update user role
router.patch(
  '/users/:userId/role',
  validate(adminAdvancedValidation.updateUserRoleSchema),
  adminAdvancedController.updateUserRole
);

// Promote user in match queue (priority matching)
router.post(
  '/users/:userId/promote-match-queue',
  adminAdvancedController.promoteInMatchQueue
);

/**
 * Coin Management
 */

// Send coins to any user/agent
router.post(
  '/coins/send',
  validate(adminAdvancedValidation.sendCoinsSchema),
  adminAdvancedController.sendCoins
);

/**
 * Email Notifications
 */

// Send bulk email
router.post(
  '/emails/bulk',
  validate(adminAdvancedValidation.sendBulkEmailSchema),
  adminAdvancedController.sendBulkEmail
);

// Send single email
router.post(
  '/emails/single',
  validate(adminAdvancedValidation.sendSingleEmailSchema),
  adminAdvancedController.sendSingleEmail
);

/**
 * Feature Flags
 */

// Get all feature flags
router.get(
  '/features',
  adminAdvancedController.getFeatureFlags
);

// Toggle feature flag
router.post(
  '/features/toggle',
  validate(adminAdvancedValidation.toggleFeatureFlagSchema),
  adminAdvancedController.toggleFeatureFlag
);

/**
 * Admin Action Logs
 */

// Get admin action logs
router.get(
  '/logs',
  adminAdvancedController.getAdminActionLogs
);

export default router;
