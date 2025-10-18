import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/architecture/app.dart';
import 'core/providers/api_client_provider.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/donation_provider.dart';
import 'core/providers/coin_provider.dart';
import 'core/providers/ai_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive for local storage
  await Hive.initFlutter();

  // Register Hive adapters (implement these based on your models)
  // Hive.registerAdapter(UserModelAdapter());
  // Hive.registerAdapter(DonationModelAdapter());
  // etc.

  runApp(
    ProviderScope(
      overrides: [
        // Override providers with actual implementations
        apiClientProvider.overrideWith((ref) => ApiClient()),
        // Add other provider overrides as needed
      ],
      child: const ChainGiveApp(),
    ),
  );
}