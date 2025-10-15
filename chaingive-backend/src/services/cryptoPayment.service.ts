import prisma from '../utils/prisma';
import axios from 'axios';

// Exchange rates (in production, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  BTC: 27000000, // 1 BTC = ₦27,000,000
  ETH: 1800000,  // 1 ETH = ₦1,800,000
  USDT: 750,     // 1 USDT = ₦750
  USDC: 750,     // 1 USDC = ₦750
  LTC: 90000,    // 1 LTC = ₦90,000
  BCH: 200000,   // 1 BCH = ₦200,000
  XRP: 350,      // 1 XRP = ₦350
};

// Coin to NGN rate (adjust as needed)
const COIN_TO_NGN_RATE = 100; // 1 ChainGive coin = ₦100

/**
 * ============================================
 * BTCPAY CONFIGURATION
 * ============================================
 */

export const getBTCPayConfig = async () => {
  const config = await prisma.cryptoPaymentConfig.findFirst();
  return config;
};

export const saveBTCPayConfig = async (data: {
  btcpayServerUrl: string;
  btcpayApiKey: string;
  btcpayStoreId: string;
}) => {
  // Check if config already exists
  const existing = await prisma.cryptoPaymentConfig.findFirst();
  
  if (existing) {
    throw new Error('BTCPay configuration already exists. Use PATCH to update.');
  }
  
  const config = await prisma.cryptoPaymentConfig.create({
    data: {
      btcpayServerUrl: data.btcpayServerUrl,
      btcpayApiKey: data.btcpayApiKey, // TODO: Implement encryption for sensitive data
      btcpayStoreId: data.btcpayStoreId,
      isEnabled: false, // Default to disabled
    },
  });
  
  return config;
};

export const updateBTCPayConfig = async (data: Partial<{
  btcpayServerUrl: string;
  btcpayApiKey: string;
  btcpayStoreId: string;
  isEnabled: boolean;
}>) => {
  const config = await prisma.cryptoPaymentConfig.findFirst();
  
  if (!config) {
    throw new Error('BTCPay configuration not found. Use POST to create.');
  }
  
  const updated = await prisma.cryptoPaymentConfig.update({
    where: { id: config.id },
    data,
  });
  
  return updated;
};

export const testBTCPayConnection = async () => {
  const config = await getBTCPayConfig();
  
  if (!config) {
    throw new Error('BTCPay configuration not found');
  }
  
  try {
    // Test connection to BTCPay Server
    const response = await axios.get(`${config.btcpayServerUrl}/api/v1/stores/${config.btcpayStoreId}`, {
      headers: {
        'Authorization': `Token ${config.btcpayApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return {
      success: true,
      message: 'Successfully connected to BTCPay Server',
      storeInfo: {
        name: response.data.name,
        website: response.data.website,
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to connect to BTCPay Server: ${error.message}`);
  }
};

export const deleteBTCPayConfig = async () => {
  const config = await prisma.cryptoPaymentConfig.findFirst();
  
  if (!config) {
    throw new Error('BTCPay configuration not found');
  }
  
  await prisma.cryptoPaymentConfig.delete({
    where: { id: config.id },
  });
};

/**
 * ============================================
 * CRYPTO COINS MANAGEMENT
 * ============================================
 */

export const getCryptoCoins = async () => {
  const coins = await prisma.cryptoCoin.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return coins;
};

export const addCryptoCoin = async (data: {
  symbol: string;
  name: string;
  network: string;
  walletAddress: string;
  minAmount?: number;
  maxAmount?: number;
  confirmationsRequired?: number;
  icon?: string;
  color?: string;
}) => {
  // Check if coin already exists
  const existing = await prisma.cryptoCoin.findUnique({
    where: {
      symbol_network: {
        symbol: data.symbol,
        network: data.network,
      },
    },
  });
  
  if (existing) {
    throw new Error(`${data.symbol} on ${data.network} already exists`);
  }
  
  const coin = await prisma.cryptoCoin.create({
    data: {
      symbol: data.symbol,
      name: data.name,
      network: data.network,
      walletAddress: data.walletAddress,
      minAmount: data.minAmount || 10,
      maxAmount: data.maxAmount || 1000000,
      confirmationsRequired: data.confirmationsRequired || 3,
      icon: data.icon || 'currency-btc',
      color: data.color || '#F7931A',
      isEnabled: true,
    },
  });
  
  return coin;
};

export const updateCryptoCoin = async (coinId: string, data: Partial<{
  walletAddress: string;
  isEnabled: boolean;
  minAmount: number;
  maxAmount: number;
  confirmationsRequired: number;
}>) => {
  const coin = await prisma.cryptoCoin.update({
    where: { id: coinId },
    data,
  });
  
  return coin;
};

export const toggleCryptoCoin = async (coinId: string, isEnabled: boolean) => {
  const coin = await prisma.cryptoCoin.update({
    where: { id: coinId },
    data: { isEnabled },
  });
  
  return coin;
};

export const deleteCryptoCoin = async (coinId: string) => {
  // Check if coin has payments
  const paymentsCount = await prisma.cryptoPayment.count({
    where: { cryptoCoinId: coinId },
  });
  
  if (paymentsCount > 0) {
    throw new Error('Cannot delete crypto coin with existing payments');
  }
  
  await prisma.cryptoCoin.delete({
    where: { id: coinId },
  });
};

/**
 * ============================================
 * PAYMENT MANAGEMENT
 * ============================================
 */

export const getPendingPayments = async () => {
  const payments = await prisma.cryptoPayment.findMany({
    where: {
      status: 'pending',
      expiresAt: { gt: new Date() }, // Not expired
    },
    include: {
      cryptoCoin: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return payments;
};

export const getAllPayments = async (filters: {
  status?: string;
  agentId?: string;
  coinSymbol?: string;
  page?: number;
  limit?: number;
}) => {
  const { status, agentId, coinSymbol, page = 1, limit = 20 } = filters;
  
  const where: any = {};
  if (status) where.status = status;
  if (agentId) where.agentId = agentId;
  if (coinSymbol) where.coinSymbol = coinSymbol;
  
  const [payments, total] = await Promise.all([
    prisma.cryptoPayment.findMany({
      where,
      include: {
        cryptoCoin: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cryptoPayment.count({ where }),
  ]);
  
  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getPaymentDetails = async (paymentId: string) => {
  const payment = await prisma.cryptoPayment.findUnique({
    where: { id: paymentId },
    include: {
      cryptoCoin: true,
      logs: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  return payment;
};

export const confirmPayment = async (
  paymentId: string,
  data: {
    transactionHash: string;
    confirmations?: number;
    notes?: string;
  },
  adminId: string
) => {
  const payment = await prisma.cryptoPayment.findUnique({
    where: { id: paymentId },
  });
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  if (payment.status !== 'pending') {
    throw new Error(`Payment is already ${payment.status}`);
  }
  
  // Update payment
  const updated = await prisma.cryptoPayment.update({
    where: { id: paymentId },
    data: {
      status: 'confirmed',
      transactionHash: data.transactionHash,
      confirmations: data.confirmations || 0,
      adminNotes: data.notes,
      confirmedBy: adminId,
      confirmedAt: new Date(),
    },
  });
  
  // Create audit log
  await prisma.cryptoPaymentLog.create({
    data: {
      paymentId,
      action: 'confirmed',
      performedBy: adminId,
      details: JSON.stringify({
        transactionHash: data.transactionHash,
        confirmations: data.confirmations,
        notes: data.notes,
      }),
    },
  });
  
  // TODO: Credit coins to agent's account (requires agent service integration)
  // await creditAgentCoins(payment.agentId, payment.coinAmount);
  // TODO: Send notification to agent (requires notification service integration)

  
  return updated;
};

export const rejectPayment = async (
  paymentId: string,
  data: { reason: string },
  adminId: string
) => {
  const payment = await prisma.cryptoPayment.findUnique({
    where: { id: paymentId },
  });
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  if (payment.status !== 'pending') {
    throw new Error(`Payment is already ${payment.status}`);
  }
  
  // Update payment
  const updated = await prisma.cryptoPayment.update({
    where: { id: paymentId },
    data: {
      status: 'rejected',
      rejectionReason: data.reason,
      rejectedBy: adminId,
      rejectedAt: new Date(),
    },
  });
  
  // Create audit log
  await prisma.cryptoPaymentLog.create({
    data: {
      paymentId,
      action: 'rejected',
      performedBy: adminId,
      details: JSON.stringify({ reason: data.reason }),
    },
  });
  // TODO: Send notification to agent (requires notification service integration)

  
  return updated;
};

export const syncBTCPayPayment = async (paymentId: string) => {
  const payment = await prisma.cryptoPayment.findUnique({
    where: { id: paymentId },
  });
  
  if (!payment || !payment.btcpayInvoiceId) {
    throw new Error('Payment or BTCPay invoice not found');
  }
  
  const config = await getBTCPayConfig();
  if (!config) {
    throw new Error('BTCPay configuration not found');
  }
  
  try {
    // Fetch invoice from BTCPay
    const response = await axios.get(
      `${config.btcpayServerUrl}/api/v1/stores/${config.btcpayStoreId}/invoices/${payment.btcpayInvoiceId}`,
      {
        headers: {
          'Authorization': `Token ${config.btcpayApiKey}`,
        },
      }
    );
    
    const invoice = response.data;
    
    // Update payment based on invoice status
    let updateData: any = {
      confirmations: invoice.confirmations || 0,
    };
    
    if (invoice.status === 'Settled' || invoice.status === 'Processing') {
      updateData.status = 'confirmed';
      updateData.confirmedAt = new Date();
      updateData.confirmedBy = 'system';
    } else if (invoice.status === 'Expired') {
      updateData.status = 'expired';
    }
    
    const updated = await prisma.cryptoPayment.update({
      where: { id: paymentId },
      data: updateData,
    });
    
    // Create audit log
    await prisma.cryptoPaymentLog.create({
      data: {
        paymentId,
        action: 'synced',
        performedBy: 'system',
        details: JSON.stringify({ invoiceStatus: invoice.status }),
      },
    });
    
    return updated;
  } catch (error: any) {
    throw new Error(`Failed to sync with BTCPay: ${error.message}`);
  }
};

/**
 * ============================================
 * BTCPAY INTEGRATION
 * ============================================
 */

export const createBTCPayInvoice = async (data: {
  amount: number;
  currency: string;
  orderId: string;
  metadata?: any;
}) => {
  const config = await getBTCPayConfig();
  
  if (!config) {
    throw new Error('BTCPay configuration not found');
  }
  
  try {
    const response = await axios.post(
      `${config.btcpayServerUrl}/api/v1/stores/${config.btcpayStoreId}/invoices`,
      {
        amount: data.amount,
        currency: data.currency,
        orderId: data.orderId,
        metadata: data.metadata,
      },
      {
        headers: {
          'Authorization': `Token ${config.btcpayApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to create BTCPay invoice: ${error.message}`);
  }
};

export const getBTCPayInvoice = async (invoiceId: string) => {
  const config = await getBTCPayConfig();
  
  if (!config) {
    throw new Error('BTCPay configuration not found');
  }
  
  try {
    const response = await axios.get(
      `${config.btcpayServerUrl}/api/v1/stores/${config.btcpayStoreId}/invoices/${invoiceId}`,
      {
        headers: {
          'Authorization': `Token ${config.btcpayApiKey}`,
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to get BTCPay invoice: ${error.message}`);
  }
};

/**
 * ============================================
 * STATS & ANALYTICS
 * ============================================
 */

export const getCryptoPaymentStats = async () => {
  const [totalPayments, pendingPayments, confirmedPayments, payments] = await Promise.all([
    prisma.cryptoPayment.count(),
    prisma.cryptoPayment.count({ where: { status: 'pending' } }),
    prisma.cryptoPayment.count({ where: { status: 'confirmed' } }),
    prisma.cryptoPayment.findMany({
      where: { status: 'confirmed' },
      select: {
        coinSymbol: true,
        ngnAmount: true,
      },
    }),
  ]);
  
  // Calculate total volume
  const totalVolume = payments.reduce((sum, p) => sum + Number(p.ngnAmount), 0);
  
  // Calculate breakdown by coin
  const coinBreakdown: Record<string, { count: number; volume: number }> = {};
  payments.forEach(p => {
    if (!coinBreakdown[p.coinSymbol]) {
      coinBreakdown[p.coinSymbol] = { count: 0, volume: 0 };
    }
    coinBreakdown[p.coinSymbol].count++;
    coinBreakdown[p.coinSymbol].volume += Number(p.ngnAmount);
  });
  
  return {
    totalPayments,
    pendingPayments,
    confirmedPayments,
    totalVolume,
    coinBreakdown: Object.entries(coinBreakdown).map(([symbol, data]) => ({
      symbol,
      ...data,
    })),
  };
};

/**
 * ============================================
 * AGENT - CRYPTO PURCHASE
 * ============================================
 */

export const getAvailableCryptoCoins = async () => {
  const coins = await prisma.cryptoCoin.findMany({
    where: { isEnabled: true },
    orderBy: { symbol: 'asc' },
  });
  return coins;
};

export const initiateAgentCryptoPurchase = async (data: {
  agentId: string;
  agentName: string;
  coinAmount: number;
  cryptoCoinId: string;
}) => {
  const cryptoCoin = await prisma.cryptoCoin.findUnique({
    where: { id: data.cryptoCoinId },
  });
  
  if (!cryptoCoin || !cryptoCoin.isEnabled) {
    throw new Error('Crypto coin not available');
  }
  
  // Calculate NGN amount
  const ngnAmount = data.coinAmount * COIN_TO_NGN_RATE;
  
  // Validate min/max
  if (ngnAmount < Number(cryptoCoin.minAmount)) {
    throw new Error(`Minimum amount is ₦${cryptoCoin.minAmount}`);
  }
  if (ngnAmount > Number(cryptoCoin.maxAmount)) {
    throw new Error(`Maximum amount is ₦${cryptoCoin.maxAmount}`);
  }
  
  // Calculate crypto amount
  const exchangeRate = EXCHANGE_RATES[cryptoCoin.symbol] || 1;
  const cryptoAmount = (ngnAmount / exchangeRate).toFixed(8);
  
  // Calculate expiry (30 minutes from now)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  
  // Create payment record
  const payment = await prisma.cryptoPayment.create({
    data: {
      agentId: data.agentId,
      agentName: data.agentName,
      cryptoCoinId: data.cryptoCoinId,
      coinSymbol: cryptoCoin.symbol,
      coinAmount: data.coinAmount,
      ngnAmount,
      cryptoAmount,
      walletAddress: cryptoCoin.walletAddress,
      status: 'pending',
      expiresAt,
    },
  });
  
  // Create audit log
  await prisma.cryptoPaymentLog.create({
    data: {
      paymentId: payment.id,
      action: 'created',
      performedBy: data.agentId,
      details: JSON.stringify({
        coinAmount: data.coinAmount,
        ngnAmount,
        cryptoAmount,
      }),
    },
  });
  
  // TODO: Create BTCPay invoice (requires BTCPay integration)
  // const invoice = await createBTCPayInvoice({ ... });
  
  return {
    ...payment,
    paymentAddress: cryptoCoin.walletAddress,
    // qrCode: invoice.qrCode, // From BTCPay
  };
};

export const getAgentCryptoPayments = async (agentId: string) => {
  const payments = await prisma.cryptoPayment.findMany({
    where: { agentId },
    include: {
      cryptoCoin: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return payments;
};
