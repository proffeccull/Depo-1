import Joi from 'joi';

export const getCryptoGateways = {
  query: Joi.object({
    currency: Joi.string().valid('BTC', 'USDT', 'ETH', 'USDC').optional(),
    network: Joi.string().valid('TRC20', 'ERC20', 'Bitcoin', 'BEP20').optional(),
    activeOnly: Joi.boolean().default(true)
  })
};

export const createCryptoPayment = {
  body: Joi.object({
    gatewayId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('BTC', 'USDT', 'ETH', 'USDC').required(),
    purpose: Joi.string().valid('coin_purchase', 'donation', 'marketplace').required(),
    metadata: Joi.object().optional()
  })
};

export const getPaymentStatus = {
  params: Joi.object({
    paymentId: Joi.string().uuid().required()
  })
};

export const processWebhook = {
  params: Joi.object({
    gateway: Joi.string().valid('btcpay', 'coinbase', 'cryptomus', 'binance', 'paypal').required()
  }),
  body: Joi.object().unknown(true) // Allow any webhook payload structure
};

export const getTransactionHistory = {
  query: Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled').optional(),
    type: Joi.string().valid('coin_purchase', 'donation', 'marketplace').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
};

export const cancelPayment = {
  params: Joi.object({
    paymentId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    reason: Joi.string().optional().max(200)
  })
};

export const getSupportedCurrencies = {
  query: Joi.object({
    gateway: Joi.string().valid('btcpay', 'coinbase', 'cryptomus', 'binance', 'paypal').optional()
  })
};

export const estimateFees = {
  body: Joi.object({
    gatewayId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('BTC', 'USDT', 'ETH', 'USDC').required()
  })
};

export const validateAddress = {
  body: Joi.object({
    currency: Joi.string().valid('BTC', 'USDT', 'ETH', 'USDC').required(),
    network: Joi.string().valid('TRC20', 'ERC20', 'Bitcoin', 'BEP20').required(),
    address: Joi.string().required().min(20).max(100)
  })
};