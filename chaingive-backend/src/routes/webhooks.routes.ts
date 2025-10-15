import express from 'express';
import { WebhooksController } from '../controllers/webhooks.controller';
import { CryptoGatewayService } from '../services/cryptoGateway.service';

const router = express.Router();
const cryptoGatewayService = new CryptoGatewayService(
  require('../utils/prisma').default,
  require('../utils/logger')
);
const webhooksController = new WebhooksController(cryptoGatewayService);

// BTCPay webhook
router.post('/btcpay', (req, res) => webhooksController.handleBTCPayWebhook(req, res));

// Coinbase webhook
router.post('/coinbase', (req, res) => webhooksController.handleCoinbaseWebhook(req, res));

// Cryptomus webhook
router.post('/cryptomus', (req, res) => webhooksController.handleCryptomusWebhook(req, res));

// Binance Pay webhook
router.post('/binance', (req, res) => webhooksController.handleBinanceWebhook(req, res));

// PayPal webhook
router.post('/paypal', (req, res) => webhooksController.handlePayPalWebhook(req, res));

export default router;