import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPlans,
  getSubscriptionStatus,
  subscribe,
  cancelSubscription,
  updateAutoRenew,
  getSubscriptionHistory,
  renewSubscription
} from '../controllers/subscription.controller';

const router = Router();

// Public routes
router.get('/plans', getPlans);

// Protected routes
router.use(authenticate);

router.get('/status', getSubscriptionStatus);
router.post('/subscribe', subscribe);
router.post('/cancel', cancelSubscription);
router.patch('/auto-renew', updateAutoRenew);
router.get('/history', getSubscriptionHistory);
router.post('/renew', renewSubscription);

export default router;