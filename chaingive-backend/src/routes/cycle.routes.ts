import { Router } from 'express';
import * as cycleController from '../controllers/cycle.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as cycleValidation from '../validations/cycle.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /v1/cycles
 * @desc    Get user's cycles
 * @access  Private
 */
router.get('/', validate(cycleValidation.getCyclesSchema), cycleController.getCycles);

/**
 * @route   GET /v1/cycles/:id
 * @desc    Get cycle details
 * @access  Private
 */
router.get('/:id', validate(cycleValidation.cycleIdSchema), cycleController.getCycleById);

export default router;
