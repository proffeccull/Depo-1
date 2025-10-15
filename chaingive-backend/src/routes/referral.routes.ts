import { Router } from 'express';
import * as referralController from '../controllers/referral.controller';
import { authenticate } from '../middleware/auth';
import { requireFeature } from '../middleware/featureFlag';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /v1/referrals/my-code
 * @desc    Get user's referral code and stats
 * @access  Private
 */
router.get('/my-code', requireFeature('referrals'), referralController.getMyReferralCode);

/**
 * @route   GET /v1/referrals/history
 * @desc    Get referral history
 * @access  Private
 */
router.get('/history', referralController.getReferralHistory);

export default router;
