import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CryptoGatewayApi } from '../../api/cryptoGateway';
import {
  CryptoGateway,
  CryptoPayment,
  CreatePaymentRequest,
  PaymentStatus,
  ExchangeRate,
  CryptoTransaction,
  SupportedCurrency
} from '../../types/cryptoGateway';

interface CryptoGatewayState {
  gateways: CryptoGateway[];
  payments: CryptoPayment[];
  transactions: CryptoTransaction[];
  currentPayment: CryptoPayment | null;
  exchangeRates: ExchangeRate[];
  supportedCurrencies: SupportedCurrency[];
  loading: boolean;
  error: string | null;
  paymentStats: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalVolume: number;
    averagePaymentTime: number;
  } | null;
}

const initialState: CryptoGatewayState = {
  gateways: [],
  payments: [],
  transactions: [],
  currentPayment: null,
  exchangeRates: [],
  supportedCurrencies: [],
  loading: false,
  error: null,
  paymentStats: null
};

// Async thunks
export const fetchAvailableGateways = createAsyncThunk(
  'cryptoGateway/fetchAvailableGateways',
  async () => {
    return await CryptoGatewayApi.getAvailableGateways();
  }
);

export const fetchExchangeRates = createAsyncThunk(
  'cryptoGateway/fetchExchangeRates',
  async (gatewayName: string) => {
    return await CryptoGatewayApi.getExchangeRates(gatewayName);
  }
);

export const createCryptoPayment = createAsyncThunk(
  'cryptoGateway/createCryptoPayment',
  async (request: CreatePaymentRequest) => {
    return await CryptoGatewayApi.createPayment(request);
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  'cryptoGateway/fetchPaymentStatus',
  async (paymentId: string) => {
    return await CryptoGatewayApi.getPaymentStatus(paymentId);
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'cryptoGateway/fetchTransactionHistory',
  async ({ limit, offset }: { limit?: number; offset?: number } = {}) => {
    return await CryptoGatewayApi.getTransactionHistory(limit, offset);
  }
);

export const verifyCryptoPayment = createAsyncThunk(
  'cryptoGateway/verifyCryptoPayment',
  async (paymentId: string) => {
    return await CryptoGatewayApi.verifyPayment(paymentId);
  }
);

export const fetchSupportedCurrencies = createAsyncThunk(
  'cryptoGateway/fetchSupportedCurrencies',
  async (gatewayName: string) => {
    return await CryptoGatewayApi.getSupportedCurrencies(gatewayName);
  }
);

export const getPaymentQR = createAsyncThunk(
  'cryptoGateway/getPaymentQR',
  async (paymentId: string) => {
    return await CryptoGatewayApi.getPaymentQR(paymentId);
  }
);

export const cancelPayment = createAsyncThunk(
  'cryptoGateway/cancelPayment',
  async (paymentId: string) => {
    await CryptoGatewayApi.cancelPayment(paymentId);
    return paymentId;
  }
);

export const getCoinPurchaseMethods = createAsyncThunk(
  'cryptoGateway/getCoinPurchaseMethods',
  async () => {
    return await CryptoGatewayApi.getCoinPurchaseMethods();
  }
);

export const createCoinPurchase = createAsyncThunk(
  'cryptoGateway/createCoinPurchase',
  async ({
    amount,
    currency,
    gateway,
    coinAmount
  }: {
    amount: number;
    currency: string;
    gateway: string;
    coinAmount: number;
  }) => {
    return await CryptoGatewayApi.createCoinPurchase(amount, currency, gateway, coinAmount);
  }
);

export const getCoinEstimate = createAsyncThunk(
  'cryptoGateway/getCoinEstimate',
  async ({
    fiatAmount,
    fiatCurrency,
    gateway
  }: {
    fiatAmount: number;
    fiatCurrency: string;
    gateway: string;
  }) => {
    return await CryptoGatewayApi.getCoinEstimate(fiatAmount, fiatCurrency, gateway);
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'cryptoGateway/fetchPaymentStats',
  async (period: '7d' | '30d' | '90d' = '30d') => {
    return await CryptoGatewayApi.getPaymentStats(period);
  }
);

// Slice
const cryptoGatewaySlice = createSlice({
  name: 'cryptoGateway',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    updatePaymentLocally: (state, action: PayloadAction<{ id: string; updates: Partial<CryptoPayment> }>) => {
      const { id, updates } = action.payload;
      const index = state.payments.findIndex(payment => payment.id === id);
      if (index !== -1) {
        state.payments[index] = { ...state.payments[index], ...updates };
      }
      if (state.currentPayment?.id === id) {
        state.currentPayment = { ...state.currentPayment, ...updates };
      }
    },
    addNewPayment: (state, action: PayloadAction<CryptoPayment>) => {
      state.payments.unshift(action.payload);
      state.currentPayment = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch available gateways
    builder
      .addCase(fetchAvailableGateways.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableGateways.fulfilled, (state, action) => {
        state.loading = false;
        state.gateways = action.payload;
      })
      .addCase(fetchAvailableGateways.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch available gateways';
      })

      // Fetch exchange rates
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeRates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exchange rates';
      })

      // Create crypto payment
      .addCase(createCryptoPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCryptoPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.payments.unshift(action.payload);
      })
      .addCase(createCryptoPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create crypto payment';
      })

      // Fetch payment status
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update payment status in the list
        const index = state.payments.findIndex(p => p.id === action.payload.paymentId);
        if (index !== -1) {
          state.payments[index].status = action.payload.status;
          if (action.payload.transactionHash) {
            state.payments[index].transactionHash = action.payload.transactionHash;
          }
          if (action.payload.confirmations !== undefined) {
            state.payments[index].confirmations = action.payload.confirmations;
          }
        }
        if (state.currentPayment && state.currentPayment.id === action.payload.paymentId) {
          state.currentPayment.status = action.payload.status;
          if (action.payload.transactionHash) {
            state.currentPayment.transactionHash = action.payload.transactionHash;
          }
          if (action.payload.confirmations !== undefined) {
            state.currentPayment.confirmations = action.payload.confirmations;
          }
        }
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment status';
      })

      // Fetch transaction history
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transaction history';
      })

      // Verify crypto payment
      .addCase(verifyCryptoPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCryptoPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Update payment verification status
        const index = state.payments.findIndex(p => p.id === action.meta.arg);
        if (index !== -1) {
          state.payments[index].status = action.payload.status as any;
          if (action.payload.transactionHash) {
            state.payments[index].transactionHash = action.payload.transactionHash;
          }
        }
        if (state.currentPayment?.id === action.meta.arg) {
          state.currentPayment.status = action.payload.status as any;
          if (action.payload.transactionHash) {
            state.currentPayment.transactionHash = action.payload.transactionHash;
          }
        }
      })
      .addCase(verifyCryptoPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to verify crypto payment';
      })

      // Fetch supported currencies
      .addCase(fetchSupportedCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportedCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        state.supportedCurrencies = action.payload;
      })
      .addCase(fetchSupportedCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch supported currencies';
      })

      // Get payment QR
      .addCase(getPaymentQR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentQR.fulfilled, (state, action) => {
        state.loading = false;
        // QR data is handled by the component
      })
      .addCase(getPaymentQR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get payment QR';
      })

      // Cancel payment
      .addCase(cancelPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex(p => p.id === action.payload);
        if (index !== -1) {
          state.payments[index].status = 'cancelled';
        }
        if (state.currentPayment?.id === action.payload) {
          state.currentPayment.status = 'cancelled';
        }
      })
      .addCase(cancelPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel payment';
      })

      // Create coin purchase
      .addCase(createCoinPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoinPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
        state.payments.unshift(action.payload);
      })
      .addCase(createCoinPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create coin purchase';
      })

      // Get coin estimate
      .addCase(getCoinEstimate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoinEstimate.fulfilled, (state, action) => {
        state.loading = false;
        // Estimate data is handled by the component
      })
      .addCase(getCoinEstimate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get coin estimate';
      })

      // Fetch payment stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStats = action.payload;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment stats';
      });
  }
});

export const {
  clearError,
  clearCurrentPayment,
  updatePaymentLocally,
  addNewPayment
} = cryptoGatewaySlice.actions;

export default cryptoGatewaySlice.reducer;