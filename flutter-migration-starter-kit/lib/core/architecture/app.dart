import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../config/theme.dart';
import '../config/routes.dart';
import '../services/localization_service.dart';
import '../services/connectivity_service.dart';
import '../widgets/connectivity_banner.dart';

class ChainGiveApp extends ConsumerStatefulWidget {
  const ChainGiveApp({super.key});

  @override
  ConsumerState<ChainGiveApp> createState() => _ChainGiveAppState();
}

class _ChainGiveAppState extends ConsumerState<ChainGiveApp> {
  late GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = createRouter(ref);
  }

  @override
  Widget build(BuildContext context) {
    final connectivityService = ref.watch(connectivityProvider);
    final isOnlineAsync = ref.watch(connectivityStatusProvider);

    return MaterialApp.router(
      title: 'ChainGive',
      theme: ChainGiveTheme.lightTheme,
      darkTheme: ChainGiveTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: _router,

      // Localization
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: AppLocalizations.supportedLocales,
      locale: AppLocalizations.currentLocale,

      // Error handling
      builder: (context, child) {
        return isOnlineAsync.when(
          data: (isOnline) => Stack(
            children: [
              child ?? const SizedBox.shrink(),
              // Connectivity banner
              if (!isOnline)
                const Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: ConnectivityBanner(),
                ),
            ],
          ),
          loading: () => child ?? const SizedBox.shrink(),
          error: (error, stack) => child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
