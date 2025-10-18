import 'package:freezed_annotation/freezed_annotation.dart';

part 'crypto_models.freezed.dart';
part 'crypto_models.g.dart';

@freezed
class CryptoGateway with _$CryptoGateway {
  const factory CryptoGateway({
    required String id,
    required String name, // 'btcpay', 'coinbase', 'cryptomus', 'binance', 'paypal'
    required String displayName,
    String? description,
    required List<String> supportedCurrencies,
    required List<String> supportedNetworks,
    required FeeStructure feeStructure,
    required bool isActive,
    required bool testMode,
  }) = _CryptoGateway;

  factory CryptoGateway.fromJson(Map<String, dynamic> json) =>
      _$CryptoGatewayFromJson(json);
}

@freezed
class FeeStructure with _$FeeStructure {
  const factory FeeStructure({
    double? percentage,
    double? fixed,
    required String currency,
  }) = _FeeStructure;

  factory FeeStructure.fromJson(Map<String, dynamic> json) =>
      _$FeeStructureFromJson(json);
}

@freezed
class CryptoPayment with _$CryptoPayment {
  const factory CryptoPayment({
    required String id,
    required String userId,
    required String gateway,
    required double amount,
    required String currency,
    required double cryptoAmount,
    required String cryptoCurrency,
    required double exchangeRate,
    required String paymentAddress,
    String? qrCode,
    required String status, // 'pending', 'received', 'confirmed', 'completed', 'failed', 'expired', 'cancelled'
    String? transactionHash,
    int? blockNumber,
    required int confirmations,
    required int requiredConfirmations,
    required DateTime expiresAt,
    DateTime? completedAt,
    Map<String, dynamic>? metadata,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _CryptoPayment;

  factory CryptoPayment.fromJson(Map<String, dynamic> json) =>
      _$CryptoPaymentFromJson(json);
}

@freezed
class CreatePaymentRequest with _$CreatePaymentRequest {
  const factory CreatePaymentRequest({
    required double amount,
    required String currency,
    required String gateway,
    required String type, // 'donation', 'coin_purchase', 'merchant_payment'
    Map<String, dynamic>? metadata,
  }) = _CreatePaymentRequest;

  factory CreatePaymentRequest.fromJson(Map<String, dynamic> json) =>
      _$CreatePaymentRequestFromJson(json);
}

@freezed
class PaymentStatus with _$PaymentStatus {
  const factory PaymentStatus({
    required String paymentId,
    required String status,
    required int confirmations,
    required int requiredConfirmations,
    String? transactionHash,
    String? estimatedCompletionTime,
    required DateTime lastUpdated,
  }) = _PaymentStatus;

  factory PaymentStatus.fromJson(Map<String, dynamic> json) =>
      _$PaymentStatusFromJson(json);
}

@freezed
class ExchangeRate with _$ExchangeRate {
  const factory ExchangeRate({
    required String fromCurrency,
    required String toCurrency,
    required double rate,
    required DateTime timestamp,
    required String source,
  }) = _ExchangeRate;

  factory ExchangeRate.fromJson(Map<String, dynamic> json) =>
      _$ExchangeRateFromJson(json);
}

@freezed
class CryptoTransaction with _$CryptoTransaction {
  const factory CryptoTransaction({
    required String id,
    required String paymentId,
    required String userId,
    required String type, // 'incoming', 'outgoing'
    required double amount,
    required String currency,
    required String network,
    required String transactionHash,
    int? blockNumber,
    required int confirmations,
    required String status, // 'pending', 'confirmed', 'failed'
    double? fee,
    required DateTime timestamp,
    Map<String, dynamic>? metadata,
  }) = _CryptoTransaction;

  factory CryptoTransaction.fromJson(Map<String, dynamic> json) =>
      _$CryptoTransactionFromJson(json);
}

@freezed
class SupportedCurrency with _$SupportedCurrency {
  const factory SupportedCurrency({
    required String currency,
    required String network,
    required double minAmount,
    required double maxAmount,
    required int decimals,
    String? contractAddress,
    required bool isActive,
  }) = _SupportedCurrency;

  factory SupportedCurrency.fromJson(Map<String, dynamic> json) =>
      _$SupportedCurrencyFromJson(json);
}

@freezed
class CoinPurchaseEstimate with _$CoinPurchaseEstimate {
  const factory CoinPurchaseEstimate({
    required double fiatAmount,
    required String fiatCurrency,
    required int coinAmount,
    required double exchangeRate,
    required double fee,
    required double totalCost,
    required String gateway,
    required String estimatedTime,
  }) = _CoinPurchaseEstimate;

  factory CoinPurchaseEstimate.fromJson(Map<String, dynamic> json) =>
      _$CoinPurchaseEstimateFromJson(json);
}

@freezed
class CryptoGatewayStats with _$CryptoGatewayStats {
  const factory CryptoGatewayStats({
    required int totalPayments,
    required int successfulPayments,
    required int failedPayments,
    required double totalVolume,
    required double averagePaymentTime, // in minutes
    required List<PopularCurrency> popularCurrencies,
    required List<GatewayPerformance> gatewayPerformance,
  }) = _CryptoGatewayStats;

  factory CryptoGatewayStats.fromJson(Map<String, dynamic> json) =>
      _$CryptoGatewayStatsFromJson(json);
}

@freezed
class PopularCurrency with _$PopularCurrency {
  const factory PopularCurrency({
    required String currency,
    required int count,
    required double volume,
  }) = _PopularCurrency;

  factory PopularCurrency.fromJson(Map<String, dynamic> json) =>
      _$PopularCurrencyFromJson(json);
}

@freezed
class GatewayPerformance with _$GatewayPerformance {
  const factory GatewayPerformance({
    required String gateway,
    required double successRate,
    required double averageTime,
    required double totalVolume,
  }) = _GatewayPerformance;

  factory GatewayPerformance.fromJson(Map<String, dynamic> json) =>
      _$GatewayPerformanceFromJson(json);
}

@freezed
class PaymentQR with _$PaymentQR {
  const factory PaymentQR({
    required String qrCode,
    required String address,
    required double amount,
    required String currency,
    required DateTime expiresAt,
  }) = _PaymentQR;

  factory PaymentQR.fromJson(Map<String, dynamic> json) =>
      _$PaymentQRFromJson(json);
}

@freezed
class PaymentVerification with _$PaymentVerification {
  const factory PaymentVerification({
    required bool verified,
    required String status,
    String? transactionHash,
    int? confirmations,
  }) = _PaymentVerification;

  factory PaymentVerification.fromJson(Map<String, dynamic> json) =>
      _$PaymentVerificationFromJson(json);
}

@freezed
class CoinPurchaseMethod with _$CoinPurchaseMethod {
  const factory CoinPurchaseMethod({
    required String gateway,
    required List<PaymentMethod> methods,
  }) = _CoinPurchaseMethod;

  factory CoinPurchaseMethod.fromJson(Map<String, dynamic> json) =>
      _$CoinPurchaseMethodFromJson(json);
}

@freezed
class PaymentMethod with _$PaymentMethod {
  const factory PaymentMethod({
    required String currency,
    required String network,
    required double minAmount,
    required double maxAmount,
    required double fee,
  }) = _PaymentMethod;

  factory PaymentMethod.fromJson(Map<String, dynamic> json) =>
      _$PaymentMethodFromJson(json);
}