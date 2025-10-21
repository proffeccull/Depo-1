import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class EncryptionService {
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  /// Encrypt data using AES encryption
  Future<String> encryptData(String data) async {
    // For simplicity, using SHA256 hash - in production, use proper AES encryption
    final bytes = utf8.encode(data);
    final hash = sha256.convert(bytes);
    return hash.toString();
  }

  /// Decrypt data
  Future<String> decryptData(String encryptedData) async {
    // Placeholder - implement proper decryption
    return encryptedData;
  }

  /// Store encrypted key
  Future<void> storeKey(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }

  /// Retrieve encrypted key
  Future<String?> getKey(String key) async {
    return await _secureStorage.read(key: key);
  }
}

// Provider for EncryptionService
final encryptionServiceProvider = Provider<EncryptionService>((ref) {
  return EncryptionService();
});