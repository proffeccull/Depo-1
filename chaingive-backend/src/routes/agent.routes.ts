import { Router } from 'express';
import * as agentController from '../controllers/agent.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as agentValidation from '../validations/agent.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /v1/agents/dashboard
 * @desc    Get agent dashboard stats
 * @access  Private (Agent only)
 */
router.get('/dashboard', requireRole('agent', 'power_partner'), agentController.getDashboard);

/**
 * @route   POST /v1/agents/verify-user
 * @desc    Verify a user (KYC)
 * @access  Private (Agent only)
 */
router.post(
  '/verify-user',
  requireRole('agent', 'power_partner'),
  validate(agentValidation.verifyUserSchema),
  agentController.verifyUser
);

/**
 * @route   POST /v1/agents/cash-deposit
 * @desc    Log a cash deposit
 * @access  Private (Agent only)
 */
router.post(
  '/cash-deposit',
  requireRole('agent', 'power_partner'),
  validate(agentValidation.cashDepositSchema),
  agentController.logCashDeposit
);

export default router;
