import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import {
  checkPaymentFraud,
  getFraudStatistics,
  reportFalsePositive,
  getUserRiskProfile,
  reviewFraudDecision,
  getPendingReviews,
  getFraudAlerts,
  acknowledgeAlert,
  trainFraudModel,
} from '../controllers/fraud.controller';

const router = Router();

// All fraud routes require authentication
router.use(auth);

// Payment fraud checking
router.post('/check', checkPaymentFraud);

// User-specific fraud endpoints
router.get('/profile', getUserRiskProfile);
router.post('/false-positive', reportFalsePositive);

// Fraud alerts
router.get('/alerts', getFraudAlerts);
router.put('/alerts/:alertId/acknowledge', acknowledgeAlert);

// Admin-only endpoints
router.get('/statistics', requireRole(['admin']), getFraudStatistics);
router.get('/reviews', requireRole(['admin']), getPendingReviews);
router.put('/reviews', requireRole(['admin']), reviewFraudDecision);
router.post('/train-model', requireRole(['admin']), trainFraudModel);

export default router;