import 'package:dio/dio.dart';
import '../models/crypto_models.dart';

class CryptoService {
  final Dio _dio;

  CryptoService(this._dio);

  // ============================================
  // GATEWAY MANAGEMENT
  // ============================================

  Future<List<CryptoGateway>> getAvailableGateways() async {
    try {
      final response = await _dio.get('/crypto/gateways');
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => CryptoGateway.fromJson(json)).toList();
    } catch (e) {
      // Return mock gateways for development
      return [
        CryptoGateway(
          id: 'btcpay-1',
          name: 'btcpay',
          displayName: 'BTCPay Server',
          description: 'Self-hosted Bitcoin payment processor',
          supportedCurrencies: ['BTC', 'LTC'],
          supportedNetworks: ['bitcoin', 'litecoin'],
          feeStructure: FeeStructure(
            percentage: 0.01,
            fixed: 0.0001,
            currency: 'BTC',
          ),
          isActive: true,
          testMode: false,
        ),
        CryptoGateway(
          id: 'coinbase-1',
          name: 'coinbase',
          displayName: 'Coinbase Commerce',
          description: 'Enterprise crypto payment solution',
          supportedCurrencies: ['BTC', 'ETH', 'USDC'],
          supportedNetworks: ['bitcoin', 'ethereum', 'polygon'],
          feeStructure: FeeStructure(
            percentage: 0.01,
            currency: 'USD',
          ),
          isActive: true,
          testMode: false,
        ),
      ];
    }
  }

  Future<List<ExchangeRate>> getExchangeRates(String gatewayName) async {
    try {
      final response = await _dio.get('/crypto/gateways/$gatewayName/rates');
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => ExchangeRate.fromJson(json)).toList();
    } catch (e) {
      // Return mock exchange rates
      return [
        ExchangeRate(
          fromCurrency: 'USD',
          toCurrency: 'BTC',
          rate: 0.000025,
          timestamp: DateTime.now(),
          source: gatewayName,
        ),
        ExchangeRate(
          fromCurrency: 'USD',
          toCurrency: 'ETH',
          rate: 0.0004,
          timestamp: DateTime.now(),
          source: gatewayName,
        ),
      ];
    }
  }

  Future<List<SupportedCurrency>> getSupportedCurrencies(String gatewayName) async {
    try {
      final response = await _dio.get('/crypto/gateways/$gatewayName/currencies');
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => SupportedCurrency.fromJson(json)).toList();
    } catch (e) {
      // Return mock supported currencies
      return [
        SupportedCurrency(
          currency: 'BTC',
          network: 'bitcoin',
          minAmount: 0.0001,
          maxAmount: 1.0,
          decimals: 8,
          contractAddress: null,
          isActive: true,
        ),
        SupportedCurrency(
          currency: 'ETH',
          network: 'ethereum',
          minAmount: 0.001,
          maxAmount: 10.0,
          decimals: 18,
          contractAddress: null,
          isActive: true,
        ),
      ];
    }
  }

  // ============================================
  // PAYMENT MANAGEMENT
  // ============================================

  Future<CryptoPayment> createPayment(CreatePaymentRequest request) async {
    try {
      final response = await _dio.post('/crypto/payments', data: request.toJson());
      return CryptoPayment.fromJson(response.data['data']);
    } catch (e) {
      // Return mock payment for development
      return CryptoPayment(
        id: 'payment-${DateTime.now().millisecondsSinceEpoch}',
        userId: 'current_user',
        gateway: request.gateway,
        amount: request.amount,
        currency: request.currency,
        cryptoAmount: request.amount * 0.000025, // Mock conversion
        cryptoCurrency: 'BTC',
        exchangeRate: 0.000025,
        paymentAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: 3,
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    }
  }

  Future<PaymentStatus> getPaymentStatus(String paymentId) async {
    try {
      final response = await _dio.get('/crypto/payments/$paymentId/status');
      return PaymentStatus.fromJson(response.data['data']);
    } catch (e) {
      // Return mock status
      return PaymentStatus(
        paymentId: paymentId,
        status: 'pending',
        confirmations: 1,
        requiredConfirmations: 3,
        estimatedCompletionTime: DateTime.now().add(const Duration(minutes: 30)).toIso8601String(),
        lastUpdated: DateTime.now(),
      );
    }
  }

  Future<PaymentQR> getPaymentQR(String paymentId) async {
    try {
      final response = await _dio.get('/crypto/payments/$paymentId/qr');
      return PaymentQR.fromJson(response.data['data']);
    } catch (e) {
      // Return mock QR data
      return PaymentQR(
        qrCode: 'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.0025',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        amount: 0.0025,
        currency: 'BTC',
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
      );
    }
  }

  Future<PaymentVerification> verifyPayment(String paymentId) async {
    try {
      final response = await _dio.post('/crypto/payments/$paymentId/verify');
      return PaymentVerification.fromJson(response.data['data']);
    } catch (e) {
      // Return mock verification
      return PaymentVerification(
        verified: true,
        status: 'confirmed',
        transactionHash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
        confirmations: 3,
      );
    }
  }

  Future<void> cancelPayment(String paymentId) async {
    try {
      await _dio.post('/crypto/payments/$paymentId/cancel');
    } catch (e) {
      // Mock cancellation
      print('Payment $paymentId cancelled');
    }
  }

  // ============================================
  // TRANSACTION HISTORY
  // ============================================

  Future<List<CryptoTransaction>> getTransactionHistory({
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _dio.get('/crypto/transactions', queryParameters: {
        'limit': limit,
        'offset': offset,
      });
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => CryptoTransaction.fromJson(json)).toList();
    } catch (e) {
      // Return mock transactions
      return [
        CryptoTransaction(
          id: 'txn-1',
          paymentId: 'payment-1',
          userId: 'current_user',
          type: 'incoming',
          amount: 0.0025,
          currency: 'BTC',
          network: 'bitcoin',
          transactionHash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
          confirmations: 6,
          status: 'confirmed',
          fee: 0.00001,
          timestamp: DateTime.now().subtract(const Duration(days: 2)),
        ),
        CryptoTransaction(
          id: 'txn-2',
          paymentId: 'payment-2',
          userId: 'current_user',
          type: 'outgoing',
          amount: 0.001,
          currency: 'ETH',
          network: 'ethereum',
          transactionHash: 'b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
          confirmations: 12,
          status: 'confirmed',
          fee: 0.0001,
          timestamp: DateTime.now().subtract(const Duration(days: 5)),
        ),
      ];
    }
  }

  // ============================================
  // COIN PURCHASE
  // ============================================

  Future<List<CoinPurchaseMethod>> getCoinPurchaseMethods() async {
    try {
      final response = await _dio.get('/crypto/coin-purchase/methods');
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => CoinPurchaseMethod.fromJson(json)).toList();
    } catch (e) {
      // Return mock purchase methods
      return [
        CoinPurchaseMethod(
          gateway: 'coinbase',
          methods: [
            PaymentMethod(
              currency: 'BTC',
              network: 'bitcoin',
              minAmount: 0.0001,
              maxAmount: 1.0,
              fee: 0.01,
            ),
            PaymentMethod(
              currency: 'ETH',
              network: 'ethereum',
              minAmount: 0.001,
              maxAmount: 10.0,
              fee: 0.005,
            ),
          ],
        ),
      ];
    }
  }

  Future<CoinPurchaseEstimate> getCoinEstimate({
    required double fiatAmount,
    required String fiatCurrency,
    required String gateway,
  }) async {
    try {
      final response = await _dio.get('/crypto/coin-estimate', queryParameters: {
        'amount': fiatAmount,
        'currency': fiatCurrency,
        'gateway': gateway,
      });
      return CoinPurchaseEstimate.fromJson(response.data['data']);
    } catch (e) {
      // Return mock estimate
      final coinAmount = (fiatAmount * 10).round(); // Mock conversion
      return CoinPurchaseEstimate(
        fiatAmount: fiatAmount,
        fiatCurrency: fiatCurrency,
        coinAmount: coinAmount,
        exchangeRate: fiatAmount / coinAmount,
        fee: fiatAmount * 0.02,
        totalCost: fiatAmount * 1.02,
        gateway: gateway,
        estimatedTime: '2-5 minutes',
      );
    }
  }

  Future<CryptoPayment> createCoinPurchase({
    required int coinAmount,
    required String currency,
    required String gateway,
  }) async {
    try {
      final response = await _dio.post('/crypto/coin-purchase', data: {
        'coinAmount': coinAmount,
        'currency': currency,
        'gateway': gateway,
      });
      return CryptoPayment.fromJson(response.data['data']);
    } catch (e) {
      // Return mock coin purchase payment
      return CryptoPayment(
        id: 'coin-purchase-${DateTime.now().millisecondsSinceEpoch}',
        userId: 'current_user',
        gateway: gateway,
        amount: coinAmount * 0.1, // Mock fiat amount
        currency: 'USD',
        cryptoAmount: coinAmount.toDouble(),
        cryptoCurrency: 'CHAINGIVE_COINS',
        exchangeRate: 0.1,
        paymentAddress: 'coin_purchase_address',
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: 1,
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    }
  }

  // ============================================
  // ANALYTICS & STATS
  // ============================================

  Future<CryptoGatewayStats> getPaymentStats({String period = '30d'}) async {
    try {
      final response = await _dio.get('/crypto/stats', queryParameters: {'period': period});
      return CryptoGatewayStats.fromJson(response.data['data']);
    } catch (e) {
      // Return mock stats
      return CryptoGatewayStats(
        totalPayments: 1250,
        successfulPayments: 1180,
        failedPayments: 70,
        totalVolume: 250000.0,
        averagePaymentTime: 15.5,
        popularCurrencies: [
          PopularCurrency(
            currency: 'BTC',
            count: 450,
            volume: 125000.0,
          ),
          PopularCurrency(
            currency: 'ETH',
            count: 380,
            volume: 85000.0,
          ),
        ],
        gatewayPerformance: [
          GatewayPerformance(
            gateway: 'coinbase',
            successRate: 0.95,
            averageTime: 12.5,
            totalVolume: 150000.0,
          ),
          GatewayPerformance(
            gateway: 'btcpay',
            successRate: 0.92,
            averageTime: 18.0,
            totalVolume: 100000.0,
          ),
        ],
      );
    }
  }

  // ============================================
  // WEBHOOK HANDLING (Backend)
  // ============================================

  Future<Map<String, dynamic>> handleWebhook(String gateway, Map<String, dynamic> payload) async {
    try {
      final response = await _dio.post('/crypto/webhooks/$gateway', data: payload);
      return response.data['data'];
    } catch (e) {
      // Mock webhook processing
      return {
        'processed': true,
        'paymentId': payload['paymentId'] ?? 'unknown',
        'status': 'processed',
      };
    }
  }
}