import 'package:flutter/material.dart';

class AppLocalizations {
  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const List<Locale> supportedLocales = [
    Locale('en', ''),
  ];

  static Locale? currentLocale;

  // Placeholder for actual localized strings
  String get appTitle => "ChainGive";
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async => AppLocalizations();

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
