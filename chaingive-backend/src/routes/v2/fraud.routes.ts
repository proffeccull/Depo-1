import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { FraudController } from '../../controllers/v2/fraud.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

const router = Router();
const fraudController = new FraudController();

// Rate limiting for fraud endpoints
const fraudLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many fraud-related requests from this IP, please try again later.',
});

// Apply authentication to all routes
router.use(authenticate);

// Fraud Detection & Prevention
router.post('/check',
  fraudLimiter,
  [
    body('transactionId').optional().isUUID(),
    body('userId').optional().isUUID(),
    body('amount').optional().isFloat({ min: 0 }),
    body('transactionType').optional().isIn(['donation', 'redemption', 'transfer']),
    body('metadata').optional().isObject(),
  ],
  validateRequest,
  fraudController.checkTransaction
);

router.post('/report',
  [
    body('transactionId').optional().isUUID(),
    body('userId').optional().isUUID(),
    body('type').isIn(['suspicious_activity', 'fraudulent_transaction', 'account_compromise', 'scam_attempt']),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('evidence').optional().isArray(),
    body('severity').isIn(['low', 'medium', 'high', 'critical']),
  ],
  validateRequest,
  fraudController.reportFraud
);

// Risk Assessment
router.get('/risk-assessment/:userId',
  [param('userId').isUUID()],
  validateRequest,
  fraudController.getUserRiskAssessment
);

router.post('/risk-assessment/:userId/update',
  [
    param('userId').isUUID(),
    body('riskLevel').isIn(['low', 'medium', 'high', 'critical']),
    body('reason').trim().isLength({ min: 10, max: 500 }),
    body('actions').optional().isArray(),
  ],
  validateRequest,
  fraudController.updateRiskAssessment
);

// Transaction Monitoring
router.get('/transactions/suspicious',
  [
    query('status').optional().isIn(['flagged', 'investigating', 'resolved', 'dismissed']),
    query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  fraudController.getSuspiciousTransactions
);

router.post('/transactions/:transactionId/investigate',
  [
    param('transactionId').isUUID(),
    body('notes').optional().trim().isLength({ max: 500 }),
    body('assignedTo').optional().isUUID(),
  ],
  validateRequest,
  fraudController.investigateTransaction
);

router.post('/transactions/:transactionId/resolve',
  [
    param('transactionId').isUUID(),
    body('resolution').isIn(['legitimate', 'fraudulent', 'suspicious_but_allowed']),
    body('notes').trim().isLength({ min: 10, max: 500 }),
    body('actions').optional().isArray(),
  ],
  validateRequest,
  fraudController.resolveTransaction
);

// Pattern Analysis
router.get('/patterns',
  [
    query('timeframe').optional().isIn(['hour', 'day', 'week', 'month']),
    query('patternType').optional().isIn(['velocity', 'geographic', 'amount', 'behavioral']),
  ],
  validateRequest,
  fraudController.getFraudPatterns
);

router.post('/patterns/alert',
  [
    body('patternId').isUUID(),
    body('alertType').isIn(['email', 'sms', 'dashboard', 'integration']),
    body('recipients').isArray(),
    body('message').trim().isLength({ min: 10, max: 500 }),
  ],
  validateRequest,
  fraudController.createPatternAlert
);

// AI Model Management (Admin only)
router.use(requireAdmin); // All routes below require admin access

router.get('/ai/models',
  fraudController.getAIModels
);

router.post('/ai/models/train',
  [
    body('modelType').isIn(['transaction_scoring', 'behavioral_analysis', 'network_detection']),
    body('trainingData').isObject(),
    body('parameters').optional().isObject(),
  ],
  validateRequest,
  fraudController.trainAIModel
);

router.get('/ai/models/:modelId/performance',
  [param('modelId').isUUID()],
  validateRequest,
  fraudController.getModelPerformance
);

router.post('/ai/models/:modelId/deploy',
  [param('modelId').isUUID()],
  validateRequest,
  fraudController.deployModel
);

// Fraud Analytics
router.get('/analytics/overview',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']),
  ],
  validateRequest,
  fraudController.getFraudAnalytics
);

router.get('/analytics/trends',
  [
    query('metric').optional().isIn(['detection_rate', 'false_positive_rate', 'response_time', 'financial_impact']),
    query('period').optional().isIn(['day', 'week', 'month', 'quarter', 'year']),
  ],
  validateRequest,
  fraudController.getFraudTrends
);

// Compliance Reporting
router.get('/compliance/reports',
  [
    query('type').optional().isIn(['ndpr', 'aml', 'fraud_prevention', 'regulatory']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  fraudController.getComplianceReports
);

router.post('/compliance/reports/generate',
  [
    body('type').isIn(['ndpr', 'aml', 'fraud_prevention', 'regulatory']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('format').optional().isIn(['pdf', 'json', 'csv']),
  ],
  validateRequest,
  fraudController.generateComplianceReport
);

// System Health & Monitoring
router.get('/health',
  fraudController.getSystemHealth
);

router.get('/alerts',
  [
    query('status').optional().isIn(['active', 'resolved', 'acknowledged']),
    query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  fraudController.getAlerts
);

router.post('/alerts/:alertId/acknowledge',
  [param('alertId').isUUID()],
  validateRequest,
  fraudController.acknowledgeAlert
);

export default router;