import { Router } from 'express';
import * as cryptoPaymentController from '../controllers/cryptoPayment.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// ============================================
// ADMIN ROUTES - Crypto Payment Configuration
// ============================================

// All admin routes require authentication and admin role
const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use(requireRole('csc_council', 'agent')); // Placeholder for 'admin' role

/**
 * BTCPay Server Configuration
 */

// Get BTCPay configuration
adminRouter.get('/config', cryptoPaymentController.getBTCPayConfig);

// Save/Update BTCPay configuration
adminRouter.post(
  '/config',
  validate(Joi.object({
    btcpayServerUrl: Joi.string().uri().required(),
    btcpayApiKey: Joi.string().min(20).required(),
    btcpayStoreId: Joi.string().required(),
  })),
  cryptoPaymentController.saveBTCPayConfig
);

// Update BTCPay configuration
adminRouter.patch(
  '/config',
  validate(Joi.object({
    btcpayServerUrl: Joi.string().uri(),
    btcpayApiKey: Joi.string().min(20),
    btcpayStoreId: Joi.string(),
    isEnabled: Joi.boolean(),
  })),
  cryptoPaymentController.updateBTCPayConfig
);

// Test BTCPay connection
adminRouter.post('/config/test', cryptoPaymentController.testBTCPayConnection);

// Delete BTCPay configuration
adminRouter.delete('/config', cryptoPaymentController.deleteBTCPayConfig);

/**
 * Crypto Coins Management
 */

// Get all crypto coins
adminRouter.get('/coins', cryptoPaymentController.getCryptoCoins);

// Add new crypto coin
adminRouter.post(
  '/coins',
  validate(Joi.object({
    symbol: Joi.string().uppercase().max(10).required(),
    name: Joi.string().max(100).required(),
    network: Joi.string().max(100).required(),
    walletAddress: Joi.string().required(),
    minAmount: Joi.number().min(0).default(10),
    maxAmount: Joi.number().min(0).default(1000000),
    confirmationsRequired: Joi.number().integer().min(0).default(3),
    icon: Joi.string().optional(),
    color: Joi.string().optional(),
  })),
  cryptoPaymentController.addCryptoCoin
);

// Update crypto coin
adminRouter.patch(
  '/coins/:coinId',
  validate(Joi.object({
    walletAddress: Joi.string(),
    isEnabled: Joi.boolean(),
    minAmount: Joi.number().min(0),
    maxAmount: Joi.number().min(0),
    confirmationsRequired: Joi.number().integer().min(0),
  })),
  cryptoPaymentController.updateCryptoCoin
);

// Toggle crypto coin status
adminRouter.patch(
  '/coins/:coinId/toggle',
  validate(Joi.object({
    isEnabled: Joi.boolean().required(),
  })),
  cryptoPaymentController.toggleCryptoCoin
);

// Delete crypto coin
adminRouter.delete('/coins/:coinId', cryptoPaymentController.deleteCryptoCoin);

/**
 * Payment Management
 */

// Get pending payments
adminRouter.get('/payments/pending', cryptoPaymentController.getPendingPayments);

// Get all payments with filters
adminRouter.get('/payments', cryptoPaymentController.getAllPayments);

// Get payment details
adminRouter.get('/payments/:paymentId', cryptoPaymentController.getPaymentDetails);

// Confirm payment
adminRouter.post(
  '/payments/:paymentId/confirm',
  validate(Joi.object({
    transactionHash: Joi.string().required(),
    confirmations: Joi.number().integer().min(0).default(0),
    notes: Joi.string().max(500).optional(),
  })),
  cryptoPaymentController.confirmPayment
);

// Reject payment
adminRouter.post(
  '/payments/:paymentId/reject',
  validate(Joi.object({
    reason: Joi.string().min(10).max(500).required(),
  })),
  cryptoPaymentController.rejectPayment
);

// Sync payment with BTCPay
adminRouter.post(
  '/payments/:paymentId/sync',
  cryptoPaymentController.syncBTCPayPayment
);

/**
 * BTCPay Integration
 */

// Create BTCPay invoice
adminRouter.post(
  '/btcpay/invoice',
  validate(Joi.object({
    amount: Joi.number().min(0).required(),
    currency: Joi.string().valid('NGN', 'USD').required(),
    orderId: Joi.string().required(),
    metadata: Joi.object().optional(),
  })),
  cryptoPaymentController.createBTCPayInvoice
);

// Get BTCPay invoice status
adminRouter.get('/btcpay/invoice/:invoiceId', cryptoPaymentController.getBTCPayInvoice);

/**
 * Stats & Analytics
 */

// Get crypto payment stats
adminRouter.get('/stats', cryptoPaymentController.getCryptoPaymentStats);

// ============================================
// AGENT ROUTES - Crypto Payment Purchase
// ============================================

const agentRouter = Router();
agentRouter.use(authenticate);
agentRouter.use(requireRole('agent')); // Only agents can purchase

// Get available crypto coins
agentRouter.get('/coins', cryptoPaymentController.getAvailableCryptoCoins);

// Initiate crypto purchase
agentRouter.post(
  '/purchase',
  validate(Joi.object({
    coinAmount: Joi.number().integer().min(1).required(),
    cryptoCoinId: Joi.string().uuid().required(),
  })),
  cryptoPaymentController.initiateAgentCryptoPurchase
);

// Get agent's crypto payments
agentRouter.get('/payments', cryptoPaymentController.getAgentCryptoPayments);

// ============================================
// MOUNT ROUTERS
// ============================================

router.use('/admin/crypto-payment', adminRouter);
router.use('/agent/crypto-payment', agentRouter);

export default router;
