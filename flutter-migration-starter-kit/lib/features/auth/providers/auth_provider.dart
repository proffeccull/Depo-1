import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

// Auth state provider
final authStateProvider = StreamProvider<UserModel?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges;
});

// Current user provider
final currentUserProvider = Provider<UserModel?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.maybeWhen(
    data: (user) => user,
    orElse: () => null,
  );
});

// Authentication status provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  return user != null;
});

// Biometric availability provider
final biometricAvailableProvider = FutureProvider<bool>((ref) async {
  final authService = ref.watch(authServiceProvider);
  return await authService.isBiometricEnabled();
});

// Auth actions provider
final authActionsProvider = Provider<AuthActions>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthActions(authService);
});

class AuthActions {
  final AuthService _authService;

  AuthActions(this._authService);

  Future<bool> signInWithEmailAndPassword(String email, String password) {
    return _authService.signInWithEmailAndPassword(email, password);
  }

  Future<bool> signUpWithEmailAndPassword(
    String email,
    String password,
    String firstName,
    String lastName,
  ) {
    return _authService.signUpWithEmailAndPassword(email, password, firstName, lastName);
  }

  Future<bool> signInWithGoogle() {
    return _authService.signInWithGoogle();
  }

  Future<bool> signInWithBiometrics() {
    return _authService.signInWithBiometrics();
  }

  Future<void> enableBiometricAuth(String email, String password) {
    return _authService.enableBiometricAuth(email, password);
  }

  Future<void> disableBiometricAuth() {
    return _authService.disableBiometricAuth();
  }

  Future<void> sendPasswordResetEmail(String email) {
    return _authService.sendPasswordResetEmail(email);
  }

  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? phoneNumber,
  }) {
    return _authService.updateProfile(
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
    );
  }

  Future<void> deleteAccount() {
    return _authService.deleteAccount();
  }

  Future<void> signOut() {
    return _authService.signOut();
  }
}