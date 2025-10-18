import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import '../../../lib/features/auth/services/auth_service.dart';
import '../../../lib/core/network/api_client.dart';

// Mock classes
class MockFirebaseAuth extends Mock implements FirebaseAuth {}
class MockGoogleSignIn extends Mock implements GoogleSignIn {}
class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}
class MockLocalAuthentication extends Mock implements LocalAuthentication {}
class MockApiClient extends Mock implements ApiClient {}
class MockUser extends Mock implements User {}
class MockUserCredential extends Mock implements UserCredential {}

void main() {
  late AuthService authService;
  late MockFirebaseAuth mockFirebaseAuth;
  late MockGoogleSignIn mockGoogleSignIn;
  late MockFlutterSecureStorage mockSecureStorage;
  late MockLocalAuthentication mockLocalAuth;
  late MockApiClient mockApiClient;
  late MockUser mockUser;

  setUp(() {
    mockFirebaseAuth = MockFirebaseAuth();
    mockGoogleSignIn = MockGoogleSignIn();
    mockSecureStorage = MockFlutterSecureStorage();
    mockLocalAuth = MockLocalAuthentication();
    mockApiClient = MockApiClient();
    mockUser = MockUser();

    authService = AuthService(mockApiClient);
  });

  group('AuthService', () {
    group('signInWithEmailAndPassword', () {
      test('should sign in successfully and store auth token', () async {
        // Arrange
        const email = 'test@example.com';
        const password = 'password123';
        final mockCredential = MockUserCredential();

        when(mockFirebaseAuth.signInWithEmailAndPassword(
          email: email,
          password: password,
        )).thenAnswer((_) async => mockCredential);

        when(mockCredential.user).thenReturn(mockUser);
        when(mockUser.uid).thenReturn('user123');
        when(mockUser.email).thenReturn(email);
        when(mockUser.emailVerified).thenReturn(true);

        // Act
        final result = await authService.signInWithEmailAndPassword(email, password);

        // Assert
        expect(result, true);
        verify(mockFirebaseAuth.signInWithEmailAndPassword(
          email: email,
          password: password,
        )).called(1);
      });

      test('should throw exception for invalid credentials', () async {
        // Arrange
        const email = 'test@example.com';
        const password = 'wrongpassword';

        when(mockFirebaseAuth.signInWithEmailAndPassword(
          email: email,
          password: password,
        )).thenThrow(FirebaseAuthException(code: 'wrong-password'));

        // Act & Assert
        expect(
          () => authService.signInWithEmailAndPassword(email, password),
          throwsA(isA<Exception>()),
        );
      });
    });

    group('signUpWithEmailAndPassword', () {
      test('should create account and sync with backend', () async {
        // Arrange
        const email = 'newuser@example.com';
        const password = 'password123';
        const firstName = 'John';
        const lastName = 'Doe';
        final mockCredential = MockUserCredential();

        when(mockFirebaseAuth.createUserWithEmailAndPassword(
          email: email,
          password: password,
        )).thenAnswer((_) async => mockCredential);

        when(mockCredential.user).thenReturn(mockUser);
        when(mockUser.uid).thenReturn('user456');
        when(mockUser.email).thenReturn(email);
        when(mockUser.updateDisplayName(any)).thenAnswer((_) async => {});
        when(mockUser.emailVerified).thenReturn(false);

        // Act
        final result = await authService.signUpWithEmailAndPassword(
          email,
          password,
          firstName,
          lastName,
        );

        // Assert
        expect(result, true);
        verify(mockFirebaseAuth.createUserWithEmailAndPassword(
          email: email,
          password: password,
        )).called(1);
        verify(mockUser.updateDisplayName('$firstName $lastName')).called(1);
      });
    });

    group('signInWithGoogle', () {
      test('should sign in with Google successfully', () async {
        // Arrange
        final mockGoogleUser = MockGoogleSignInAccount();
        final mockGoogleAuth = MockGoogleSignInAuthentication();

        when(mockGoogleSignIn.signIn()).thenAnswer((_) async => mockGoogleUser);
        when(mockGoogleUser.authentication).thenAnswer((_) async => mockGoogleAuth);
        when(mockGoogleAuth.accessToken).thenReturn('google_access_token');
        when(mockGoogleAuth.idToken).thenReturn('google_id_token');

        final mockCredential = MockUserCredential();
        when(mockFirebaseAuth.signInWithCredential(any))
            .thenAnswer((_) async => mockCredential);

        when(mockCredential.user).thenReturn(mockUser);
        when(mockUser.uid).thenReturn('google_user_123');

        // Act
        final result = await authService.signInWithGoogle();

        // Assert
        expect(result, true);
        verify(mockGoogleSignIn.signIn()).called(1);
      });

      test('should return false when user cancels Google sign in', () async {
        // Arrange
        when(mockGoogleSignIn.signIn()).thenAnswer((_) async => null);

        // Act
        final result = await authService.signInWithGoogle();

        // Assert
        expect(result, false);
      });
    });

    group('biometric authentication', () {
      test('should authenticate with biometrics successfully', () async {
        // Arrange
        when(mockLocalAuth.canCheckBiometrics).thenAnswer((_) async => true);
        when(mockLocalAuth.isDeviceSupported()).thenAnswer((_) async => true);
        when(mockLocalAuth.authenticate(
          localizedReason: anyNamed('localizedReason'),
          options: anyNamed('options'),
        )).thenAnswer((_) async => true);

        // Act
        final result = await authService.authenticateWithBiometrics();

        // Assert
        expect(result, true);
        verify(mockLocalAuth.authenticate(
          localizedReason: 'Authenticate to access ChainGive',
          options: anyNamed('options'),
        )).called(1);
      });

      test('should return false when biometric authentication fails', () async {
        // Arrange
        when(mockLocalAuth.canCheckBiometrics).thenAnswer((_) async => true);
        when(mockLocalAuth.isDeviceSupported()).thenAnswer((_) async => true);
        when(mockLocalAuth.authenticate(
          localizedReason: anyNamed('localizedReason'),
          options: anyNamed('options'),
        )).thenAnswer((_) async => false);

        // Act
        final result = await authService.authenticateWithBiometrics();

        // Assert
        expect(result, false);
      });
    });

    group('signOut', () {
      test('should sign out from all services', () async {
        // Arrange
        when(mockFirebaseAuth.signOut()).thenAnswer((_) async => {});
        when(mockGoogleSignIn.signOut()).thenAnswer((_) async => null);
        when(mockSecureStorage.deleteAll()).thenAnswer((_) async => {});

        // Act
        await authService.signOut();

        // Assert
        verify(mockFirebaseAuth.signOut()).called(1);
        verify(mockGoogleSignIn.signOut()).called(1);
        verify(mockSecureStorage.deleteAll()).called(1);
      });
    });

    group('password reset', () {
      test('should send password reset email successfully', () async {
        // Arrange
        const email = 'user@example.com';
        when(mockFirebaseAuth.sendPasswordResetEmail(email: email))
            .thenAnswer((_) async => {});

        // Act
        final result = await authService.sendPasswordResetEmail(email);

        // Assert
        expect(result, true);
        verify(mockFirebaseAuth.sendPasswordResetEmail(email: email)).called(1);
      });

      test('should throw exception for invalid email', () async {
        // Arrange
        const email = 'invalid-email';
        when(mockFirebaseAuth.sendPasswordResetEmail(email: email))
            .thenThrow(FirebaseAuthException(code: 'invalid-email'));

        // Act & Assert
        expect(
          () => authService.sendPasswordResetEmail(email),
          throwsA(isA<Exception>()),
        );
      });
    });

    group('auth state changes', () {
      test('should emit user model when authenticated', () async {
        // Arrange
        when(mockFirebaseAuth.authStateChanges())
            .thenAnswer((_) => Stream.fromIterable([mockUser]));

        when(mockUser.uid).thenReturn('user123');
        when(mockUser.email).thenReturn('user@example.com');
        when(mockUser.displayName).thenReturn('John Doe');
        when(mockUser.emailVerified).thenReturn(true);

        // Act
        final stream = authService.authStateChanges();

        // Assert
        expect(
          stream,
          emits(isA<UserModel>()),
        );
      });

      test('should emit null when not authenticated', () async {
        // Arrange
        when(mockFirebaseAuth.authStateChanges())
            .thenAnswer((_) => Stream.fromIterable([null]));

        // Act
        final stream = authService.authStateChanges();

        // Assert
        expect(
          stream,
          emits(null),
        );
      });
    });

    group('current user', () {
      test('should return user model when authenticated', () {
        // Arrange
        when(mockFirebaseAuth.currentUser).thenReturn(mockUser);
        when(mockUser.uid).thenReturn('user123');
        when(mockUser.email).thenReturn('user@example.com');

        // Act
        final currentUser = authService.currentUser;

        // Assert
        expect(currentUser, isA<UserModel>());
        expect(currentUser?.id, 'user123');
        expect(currentUser?.email, 'user@example.com');
      });

      test('should return null when not authenticated', () {
        // Arrange
        when(mockFirebaseAuth.currentUser).thenReturn(null);

        // Act
        final currentUser = authService.currentUser;

        // Assert
        expect(currentUser, null);
      });
    });
  });
}

// Additional mock classes for Google Sign In
class MockGoogleSignInAccount extends Mock implements GoogleSignInAccount {}
class MockGoogleSignInAuthentication extends Mock implements GoogleSignInAuthentication {}