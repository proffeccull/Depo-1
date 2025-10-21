import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/architecture/app.dart';
import 'core/network/api_client.dart';

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
      child: const ChainGiveApp(),
    ),
  );
}