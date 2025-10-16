import { Router } from 'express';
import * as adminAdvancedController from '../controllers/adminAdvanced.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as adminAdvancedValidation from '../validations/adminAdvanced.validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('csc_council', 'agent')); // Admin roles

/**
 * @swagger
 * /admin/advanced/users/{userId}/promote-to-agent:
 *   post:
 *     summary: Promote user to agent role
 *     description: Grants agent privileges to a regular user, allowing them to participate in coin sales and management
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to promote
 *     responses:
 *       200:
 *         description: User promoted to agent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User promoted to agent successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/users/:userId/promote-to-agent',
  adminAdvancedController.promoteToAgent
);

/**
 * @swagger
 * /admin/advanced/users/{userId}/role:
 *   patch:
 *     summary: Update user role
 *     description: Changes a user's role in the system (admin, agent, user, etc.)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, agent, csc_council, merchant, corporate]
 *                 example: "agent"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 */
router.patch(
  '/users/:userId/role',
  validate(adminAdvancedValidation.updateUserRoleSchema),
  adminAdvancedController.updateUserRole
);

/**
 * @swagger
 * /admin/advanced/features:
 *   get:
 *     summary: Get all feature flags
 *     description: Returns a list of all feature flags with their current status and configuration
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feature flags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeatureFlag'
 */
router.get(
  '/features',
  adminAdvancedController.getFeatureFlags
);

/**
 * @swagger
 * /admin/advanced/features/toggle:
 *   post:
 *     summary: Toggle feature flag status
 *     description: Enables or disables a feature flag system-wide. All changes are logged in the admin actions table.
 *     tags: [Feature Flags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - featureName
 *               - isEnabled
 *             properties:
 *               featureName:
 *                 type: string
 *                 example: "gamification_system"
 *                 description: Name of the feature flag to toggle
 *               isEnabled:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to enable or disable the feature
 *     responses:
 *       200:
 *         description: Feature flag toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Feature flag 'gamification_system' enabled"
 *                 data:
 *                   $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/features/toggle',
  validate(adminAdvancedValidation.toggleFeatureFlagSchema),
  adminAdvancedController.toggleFeatureFlag
);

/**
 * @swagger
 * /admin/advanced/logs:
 *   get:
 *     summary: Get admin action logs
 *     description: Returns a paginated list of admin actions performed in the system, useful for audit trails
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of logs per page
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific admin user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by specific action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date onwards
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *     responses:
 *       200:
 *         description: Admin action logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminAction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         pages:
 *                           type: integer
 *                           example: 8
 */
router.get(
  '/logs',
  adminAdvancedController.getAdminActionLogs
);

/**
 * @swagger
 * /admin/advanced/leaderboard/reset:
 *   post:
 *     summary: Reset leaderboard
 *     description: Resets the entire leaderboard system, clearing all scores and rankings. This action is logged for audit purposes.
 *     tags: [Leaderboard Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Monthly leaderboard reset for new competition cycle"
 *                 description: Reason for resetting the leaderboard
 *     responses:
 *       200:
 *         description: Leaderboard reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Leaderboard reset successfully"
 */
router.post(
  '/leaderboard/reset',
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminAdvancedController.resetLeaderboard
);

/**
 * @swagger
 * /admin/advanced/leaderboard/users/{userId}/score:
 *   patch:
 *     summary: Adjust user leaderboard score
 *     description: Manually adjusts a user's leaderboard score by a specified amount. Useful for rewarding/punishing users or correcting errors.
 *     tags: [Leaderboard Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user whose score to adjust
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scoreAdjustment
 *               - reason
 *             properties:
 *               scoreAdjustment:
 *                 type: integer
 *                 minimum: -10000
 *                 maximum: 10000
 *                 example: 500
 *                 description: Amount to add/subtract from user's score (positive or negative)
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Bonus points for exceptional community contribution"
 *                 description: Reason for the score adjustment
 *     responses:
 *       200:
 *         description: User score adjusted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User score adjusted by 500 points"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/leaderboard/users/:userId/score',
  validate(Joi.object({
    scoreAdjustment: Joi.number().integer().min(-10000).max(10000).required(),
    reason: Joi.string().min(10).max(500).required(),
  })),
  adminAdvancedController.adjustLeaderboardScore
);

export default router;
