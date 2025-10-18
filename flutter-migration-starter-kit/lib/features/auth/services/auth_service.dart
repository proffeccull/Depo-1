import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import '../../../core/network/api_client.dart';
import '../models/user_model.dart';

class AuthService {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  final LocalAuthentication _localAuth = LocalAuthentication();

  AuthService() {
    // Listen to auth state changes
    _firebaseAuth.authStateChanges().listen(_onAuthStateChanged);
  }

  // Auth state stream
  Stream<UserModel?> get authStateChanges {
    return _firebaseAuth.authStateChanges().map(_userFromFirebase);
  }

  // Current user
  UserModel? get currentUser {
    final user = _firebaseAuth.currentUser;
    return user != null ? _userFromFirebase(user) : null;
  }

  // Sign in with email and password
  Future<bool> signInWithEmailAndPassword(String email, String password) async {
    try {
      final result = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (result.user != null) {
        await _storeAuthToken(result.user!);
        await _syncUserWithBackend(result.user!);
        return true;
      }
      return false;
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Sign up with email and password
  Future<bool> signUpWithEmailAndPassword(
    String email,
    String password,
    String firstName,
    String lastName,
  ) async {
    try {
      final result = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (result.user != null) {
        // Update display name
        await result.user!.updateDisplayName('$firstName $lastName');

        // Create user profile in backend
        await _createUserProfile(result.user!, firstName, lastName);

        await _storeAuthToken(result.user!);
        return true;
      }
      return false;
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Sign in with Google
  Future<bool> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return false;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final result = await _firebaseAuth.signInWithCredential(credential);

      if (result.user != null) {
        await _storeAuthToken(result.user!);
        await _syncUserWithBackend(result.user!);
        return true;
      }
      return false;
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Sign in with biometrics
  Future<bool> signInWithBiometrics() async {
    try {
      // Check if biometric authentication is available
      final canAuthenticate = await _localAuth.canCheckBiometrics;
      if (!canAuthenticate) {
        throw Exception('Biometric authentication not available');
      }

      // Get available biometrics
      final availableBiometrics = await _localAuth.getAvailableBiometrics();
      if (availableBiometrics.isEmpty) {
        throw Exception('No biometric options available');
      }

      // Authenticate
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Authenticate to access ChainGive',
        options: const AuthenticationOptions(
          biometricOnly: true,
          useErrorDialogs: true,
          stickyAuth: true,
        ),
      );

      if (authenticated) {
        // Retrieve stored credentials and sign in
        final email = await _secureStorage.read(key: 'biometric_email');
        final password = await _secureStorage.read(key: 'biometric_password');

        if (email != null && password != null) {
          return await signInWithEmailAndPassword(email, password);
        } else {
          throw Exception('No stored credentials for biometric login');
        }
      }

      return false;
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Enable biometric authentication
  Future<void> enableBiometricAuth(String email, String password) async {
    await _secureStorage.write(key: 'biometric_email', value: email);
    await _secureStorage.write(key: 'biometric_password', value: password);
  }

  // Disable biometric authentication
  Future<void> disableBiometricAuth() async {
    await _secureStorage.delete(key: 'biometric_email');
    await _secureStorage.delete(key: 'biometric_password');
  }

  // Check if biometric auth is enabled
  Future<bool> isBiometricEnabled() async {
    final email = await _secureStorage.read(key: 'biometric_email');
    return email != null;
  }

  // Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
      await _firebaseAuth.signOut();
      await _clearStoredData();
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Update user profile
  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? phoneNumber,
  }) async {
    try {
      final user = _firebaseAuth.currentUser;
      if (user == null) throw Exception('No authenticated user');

      // Update Firebase Auth display name
      if (firstName != null || lastName != null) {
        final currentDisplayName = user.displayName ?? '';
        final nameParts = currentDisplayName.split(' ');
        final newFirstName = firstName ?? (nameParts.isNotEmpty ? nameParts[0] : '');
        final newLastName = lastName ?? (nameParts.length > 1 ? nameParts[1] : '');
        await user.updateDisplayName('$newFirstName $newLastName');
      }

      // Update backend profile
      await _updateUserProfile(user, firstName, lastName, phoneNumber);
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Delete account
  Future<void> deleteAccount() async {
    try {
      final user = _firebaseAuth.currentUser;
      if (user == null) throw Exception('No authenticated user');

      // Delete from backend first
      await _deleteUserProfile(user);

      // Delete from Firebase Auth
      await user.delete();

      await _clearStoredData();
    } catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Helper methods
  UserModel? _userFromFirebase(User? user) {
    if (user == null) return null;

    final nameParts = (user.displayName ?? '').split(' ');
    return UserModel(
      id: user.uid,
      email: user.email,
      firstName: nameParts.isNotEmpty ? nameParts[0] : null,
      lastName: nameParts.length > 1 ? nameParts[1] : null,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      profileImageUrl: user.photoURL,
      createdAt: user.metadata.creationTime,
      lastSignInAt: user.metadata.lastSignInTime,
    );
  }

  Future<void> _storeAuthToken(User user) async {
    final idToken = await user.getIdToken();
    await _secureStorage.write(key: 'auth_token', value: idToken);
  }

  Future<void> _syncUserWithBackend(User user) async {
    try {
      final userModel = _userFromFirebase(user);
      if (userModel != null) {
        await _apiClient.post('/auth/sync', data: userModel.toJson());
      }
    } catch (e) {
      // Log error but don't throw - auth should still work
      print('Failed to sync user with backend: $e');
    }
  }

  Future<void> _createUserProfile(User user, String firstName, String lastName) async {
    final userData = {
      'firebaseUid': user.uid,
      'email': user.email,
      'firstName': firstName,
      'lastName': lastName,
      'emailVerified': user.emailVerified,
      'createdAt': user.metadata.creationTime?.toIso8601String(),
    };

    await _apiClient.post('/users', data: userData);
  }

  Future<void> _updateUserProfile(User user, String? firstName, String? lastName, String? phoneNumber) async {
    final updateData = <String, dynamic>{};
    if (firstName != null) updateData['firstName'] = firstName;
    if (lastName != null) updateData['lastName'] = lastName;
    if (phoneNumber != null) updateData['phoneNumber'] = phoneNumber;

    if (updateData.isNotEmpty) {
      await _apiClient.put('/users/${user.uid}', data: updateData);
    }
  }

  Future<void> _deleteUserProfile(User user) async {
    await _apiClient.delete('/users/${user.uid}');
  }

  Future<void> _clearStoredData() async {
    await _secureStorage.deleteAll();
  }

  void _onAuthStateChanged(User? user) {
    if (user == null) {
      _clearStoredData();
    } else {
      _storeAuthToken(user);
    }
  }

  Exception _handleAuthError(dynamic error) {
    if (error is FirebaseAuthException) {
      switch (error.code) {
        case 'user-not-found':
          return Exception('No account found with this email address.');
        case 'wrong-password':
          return Exception('Incorrect password. Please try again.');
        case 'email-already-in-use':
          return Exception('An account already exists with this email.');
        case 'weak-password':
          return Exception('Password is too weak. Please choose a stronger password.');
        case 'invalid-email':
          return Exception('Please enter a valid email address.');
        case 'user-disabled':
          return Exception('This account has been disabled.');
        case 'too-many-requests':
          return Exception('Too many login attempts. Please try again later.');
        case 'network-request-failed':
          return Exception('Network connection failed. Please check your internet.');
        default:
          return Exception('Authentication failed: ${error.message}');
      }
    }
    return Exception('An unexpected error occurred: $error');
  }
}