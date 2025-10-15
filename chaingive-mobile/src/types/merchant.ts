export interface MerchantAccount {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'retail' | 'service' | 'food' | 'other';
  description?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  qrCodeUrl?: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMerchantRequest {
  businessName: string;
  businessType: 'retail' | 'service' | 'food' | 'other';
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface UpdateMerchantRequest {
  businessName?: string;
  businessType?: 'retail' | 'service' | 'food' | 'other';
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface MerchantPayment {
  id: string;
  merchantId: string;
  userId: string;
  amount: number;
  currency: 'NGN' | 'USD' | 'EUR';
  paymentMethod: 'wallet' | 'card' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionRef: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ProcessPaymentRequest {
  amount: number;
  currency: 'NGN' | 'USD' | 'EUR';
  paymentMethod: 'wallet' | 'card' | 'bank_transfer';
  description?: string;
}

export interface MerchantAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  topPaymentMethods: {
    method: string;
    count: number;
    percentage: number;
  }[];
  revenueByPeriod: {
    period: string;
    revenue: number;
    transactions: number;
  }[];
  customerRetention: {
    newCustomers: number;
    returningCustomers: number;
    retentionRate: number;
  };
  geographicInsights: {
    topLocations: {
      location: string;
      transactions: number;
      revenue: number;
    }[];
  };
}

export interface MerchantSearchFilters {
  query?: string;
  category?: 'retail' | 'service' | 'food' | 'other';
  limit?: number;
  offset?: number;
}

export interface MerchantLocation {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
}