import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../models/donation_models.dart';
import '../services/donation_service.dart';

// ============================================
// PROVIDERS
// ============================================

// Donation service provider
final donationServiceProvider = Provider<DonationService>((ref) {
  final dio = ref.watch(apiClientProvider);
  return DonationService(dio);
});

// ============================================
// DONATION CYCLES
// ============================================

// Donation cycles provider
final donationCyclesProvider = StateNotifierProvider<DonationCyclesNotifier, AsyncValue<List<DonationCycle>>>((ref) {
  final donationService = ref.watch(donationServiceProvider);
  return DonationCyclesNotifier(donationService);
});

// Single donation cycle provider
final donationCycleProvider = FutureProvider.family<DonationCycle?, String>((ref, cycleId) async {
  final donationService = ref.watch(donationServiceProvider);
  return donationService.getCycle(cycleId);
});

// ============================================
// DONATION HISTORY
// ============================================

// Donation history provider
final donationHistoryProvider = StateNotifierProvider<DonationHistoryNotifier, AsyncValue<DonationHistory>>((ref) {
  final donationService = ref.watch(donationServiceProvider);
  return DonationHistoryNotifier(donationService);
});

// ============================================
// DONATION STATS
// ============================================

// Donation stats provider
final donationStatsProvider = FutureProvider<DonationStats>((ref) {
  final donationService = ref.watch(donationServiceProvider);
  return donationService.getDonationStats();
});

// ============================================
// DONATION FLOW STATE
// ============================================

// Donation flow state provider
final donationFlowProvider = StateNotifierProvider<DonationFlowNotifier, DonationFlowState>((ref) {
  final donationService = ref.watch(donationServiceProvider);
  return DonationFlowNotifier(donationService);
});

// ============================================
// SUPPORTING DATA
// ============================================

// Supported currencies provider
final supportedCurrenciesProvider = FutureProvider<List<String>>((ref) {
  final donationService = ref.watch(donationServiceProvider);
  return donationService.getSupportedCurrencies();
});

// Donation preferences provider
final donationPreferencesProvider = FutureProvider<Map<String, dynamic>>((ref) {
  final donationService = ref.watch(donationServiceProvider);
  return donationService.getDonationPreferences();
});

// ============================================
// NOTIFIERS
// ============================================

class DonationCyclesNotifier extends StateNotifier<AsyncValue<List<DonationCycle>>> {
  final DonationService _donationService;

  DonationCyclesNotifier(this._donationService) : super(const AsyncValue.loading()) {
    fetchDonationCycles();
  }

  Future<void> fetchDonationCycles({
    String? status,
    int? page,
    int? limit,
    String? search,
  }) async {
    state = const AsyncValue.loading();
    try {
      final cycles = await _donationService.getCycles(
        status: status,
        page: page,
        limit: limit,
        search: search,
      );
      state = AsyncValue.data(cycles);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> refresh() async {
    await fetchDonationCycles();
  }
}

class DonationHistoryNotifier extends StateNotifier<AsyncValue<DonationHistory>> {
  final DonationService _donationService;

  DonationHistoryNotifier(this._donationService) : super(const AsyncValue.loading()) {
    fetchHistory();
  }

  Future<void> fetchHistory({int page = 1, int limit = 20}) async {
    state = const AsyncValue.loading();
    try {
      final history = await _donationService.getDonationHistory(
        page: page,
        limit: limit,
      );
      state = AsyncValue.data(history);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> loadMore() async {
    final currentState = state;
    if (currentState is AsyncData<DonationHistory>) {
      final currentHistory = currentState.value;
      if (!currentHistory.hasMore) return;

      try {
        final nextPage = currentHistory.page + 1;
        final newHistory = await _donationService.getDonationHistory(
          page: nextPage,
          limit: currentHistory.limit,
        );

        final combinedCycles = [...currentHistory.cycles, ...newHistory.cycles];
        final updatedHistory = DonationHistory(
          cycles: combinedCycles,
          totalCount: newHistory.totalCount,
          page: nextPage,
          limit: currentHistory.limit,
          hasMore: newHistory.hasMore,
        );

        state = AsyncValue.data(updatedHistory);
      } catch (e, stack) {
        state = AsyncValue.error(e, stack);
      }
    }
  }

  Future<void> refresh() async {
    await fetchHistory();
  }
}

class DonationFlowState {
  final int currentStep;
  final DonationRequest? donationRequest;
  final DonationResult? donationResult;
  final String? errorMessage;
  final bool isProcessing;

  const DonationFlowState({
    this.currentStep = 0,
    this.donationRequest,
    this.donationResult,
    this.errorMessage,
    this.isProcessing = false,
  });

  DonationFlowState copyWith({
    int? currentStep,
    DonationRequest? donationRequest,
    DonationResult? donationResult,
    String? errorMessage,
    bool? isProcessing,
  }) {
    return DonationFlowState(
      currentStep: currentStep ?? this.currentStep,
      donationRequest: donationRequest ?? this.donationRequest,
      donationResult: donationResult ?? this.donationResult,
      errorMessage: errorMessage ?? this.errorMessage,
      isProcessing: isProcessing ?? this.isProcessing,
    );
  }
}

class DonationFlowNotifier extends StateNotifier<DonationFlowState> {
  final DonationService _donationService;

  DonationFlowNotifier(this._donationService) : super(const DonationFlowState());

  void setAmount(int amount, String currency) {
    final request = (state.donationRequest ?? const DonationRequest(amount: 0, currency: 'NGN')).copyWith(
      amount: amount,
      currency: currency,
    );
    state = state.copyWith(donationRequest: request);
  }

  void setRecipientPreference(String preference, {String? recipientId}) {
    final request = (state.donationRequest ?? const DonationRequest(amount: 0, currency: 'NGN')).copyWith(
      recipientPreference: preference,
      recipientId: recipientId,
    );
    state = state.copyWith(donationRequest: request);
  }

  void setAdditionalDetails({
    String? location,
    String? faith,
    String? message,
    bool? anonymous,
  }) {
    final request = (state.donationRequest ?? const DonationRequest(amount: 0, currency: 'NGN')).copyWith(
      location: location,
      faith: faith,
      message: message,
      anonymous: anonymous,
    );
    state = state.copyWith(donationRequest: request);
  }

  Future<void> submitDonation() async {
    if (state.donationRequest == null) return;

    state = state.copyWith(isProcessing: true, errorMessage: null);

    try {
      final result = await _donationService.makeDonation(state.donationRequest!);
      state = state.copyWith(
        donationResult: result,
        isProcessing: false,
        currentStep: state.currentStep + 1,
      );
    } catch (e) {
      state = state.copyWith(
        errorMessage: e.toString(),
        isProcessing: false,
      );
    }
  }

  void nextStep() {
    state = state.copyWith(currentStep: state.currentStep + 1);
  }

  void previousStep() {
    state = state.copyWith(currentStep: state.currentStep - 1);
  }

  void reset() {
    state = const DonationFlowState();
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}