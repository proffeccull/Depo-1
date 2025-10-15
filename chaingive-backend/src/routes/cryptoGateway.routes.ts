import { Router } from 'express';
import { CryptoGatewayController } from '../controllers/cryptoGateway.controller';
import { auth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import {
  createPaymentSchema,
  verifyPaymentSchema,
  exchangeRateSchema
} from '../validations/cryptoGateway.validation';

const router = Router();
const cryptoGatewayController = new CryptoGatewayController();

/**
 * Crypto Gateway Routes
 * Base path: /api/crypto
 */

// Create crypto payment
router.post(
  '/payments',
  auth,
  rateLimiter,
  validateRequest(createPaymentSchema),
  cryptoGatewayController.createPayment.bind(cryptoGatewayController)
);

// Verify crypto payment
router.post(
  '/payments/:paymentId/verify',
  auth,
  rateLimiter,
  validateRequest(verifyPaymentSchema),
  cryptoGatewayController.verifyPayment.bind(cryptoGatewayController)
);

// Get supported currencies for gateway
router.get(
  '/gateways/:gateway/currencies',
  auth,
  rateLimiter,
  cryptoGatewayController.getSupportedCurrencies.bind(cryptoGatewayController)
);

// Get exchange rate
router.get(
  '/exchange-rate',
  auth,
  rateLimiter,
  validateRequest(exchangeRateSchema),
  cryptoGatewayController.getExchangeRate.bind(cryptoGatewayController)
);

/**
 * Webhook Routes (No auth required - verified via signatures)
 * Base path: /api/crypto/webhooks
 */

// BTCPay webhook
router.post(
  '/webhooks/btcpay',
  cryptoGatewayController.handleBTCPayWebhook.bind(cryptoGatewayController)
);

// Coinbase webhook
router.post(
  '/webhooks/coinbase',
  cryptoGatewayController.handleCoinbaseWebhook.bind(cryptoGatewayController)
);

// Cryptomus webhook
router.post(
  '/webhooks/cryptomus',
  cryptoGatewayController.handleCryptomusWebhook.bind(cryptoGatewayController)
);

// Binance webhook
router.post(
  '/webhooks/binance',
  cryptoGatewayController.handleBinanceWebhook.bind(cryptoGatewayController)
);

// PayPal webhook
router.post(
  '/webhooks/paypal',
  cryptoGatewayController.handlePayPalWebhook.bind(cryptoGatewayController)
);

export default router;