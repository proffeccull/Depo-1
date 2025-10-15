export interface CryptoGateway {
  id: string;
  name: 'btcpay' | 'coinbase' | 'cryptomus' | 'binance' | 'paypal';
  displayName: string;
  description?: string;
  supportedCurrencies: string[];
  supportedNetworks: string[];
  feeStructure: {
    percentage?: number;
    fixed?: number;
    currency: string;
  };
  isActive: boolean;
  testMode: boolean;
}

export interface CryptoPayment {
  id: string;
  userId: string;
  gateway: string;
  amount: number;
  currency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  exchangeRate: number;
  paymentAddress: string;
  qrCode?: string;
  status: 'pending' | 'received' | 'confirmed' | 'completed' | 'failed' | 'expired' | 'cancelled';
  transactionHash?: string;
  blockNumber?: number;
  confirmations: number;
  requiredConfirmations: number;
  expiresAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  gateway: string;
  type: 'donation' | 'coin_purchase' | 'merchant_payment';
  metadata?: Record<string, any>;
}

export interface PaymentStatus {
  paymentId: string;
  status: string;
  confirmations: number;
  requiredConfirmations: number;
  transactionHash?: string;
  estimatedCompletionTime?: string;
  lastUpdated: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: string;
  source: string;
}

export interface CryptoTransaction {
  id: string;
  paymentId: string;
  userId: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  currency: string;
  network: string;
  transactionHash: string;
  blockNumber?: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  fee?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SupportedCurrency {
  currency: string;
  network: string;
  minAmount: number;
  maxAmount: number;
  decimals: number;
  contractAddress?: string;
  isActive: boolean;
}

export interface CoinPurchaseEstimate {
  fiatAmount: number;
  fiatCurrency: string;
  coinAmount: number;
  exchangeRate: number;
  fee: number;
  totalCost: number;
  gateway: string;
  estimatedTime: string;
}

export interface CryptoGatewayStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalVolume: number;
  averagePaymentTime: number; // in minutes
  popularCurrencies: {
    currency: string;
    count: number;
    volume: number;
  }[];
  gatewayPerformance: {
    gateway: string;
    successRate: number;
    averageTime: number;
    totalVolume: number;
  }[];
}