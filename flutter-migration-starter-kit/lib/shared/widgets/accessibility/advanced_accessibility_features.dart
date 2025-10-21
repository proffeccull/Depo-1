import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:vibration/vibration.dart';
import '../../../core/config/theme.dart';

/// Advanced accessibility features for enhanced user experience
class AdvancedAccessibilityFeatures {
  static final FlutterTts _tts = FlutterTts();

  /// Initialize accessibility features
  static Future<void> initialize() async {
    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.6);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
  }

  /// Announce screen changes with cultural context
  static Future<void> announceScreenChange(
    String screenName, {
    String? culturalContext,
    String? additionalInfo,
  }) async {
    String announcement = 'Navigated to $screenName';

    if (culturalContext != null) {
      announcement += ', $culturalContext';
    }

    if (additionalInfo != null) {
      announcement += '. $additionalInfo';
    }

    await _tts.speak(announcement);
  }

  /// Provide haptic feedback for different actions
  static Future<void> provideHapticFeedback(String actionType) async {
    final hasVibrator = await Vibration.hasVibrator() ?? false;
    if (!hasVibrator) return;

    switch (actionType) {
      case 'success':
        await Vibration.vibrate(pattern: [0, 50, 50, 50]);
        break;
      case 'error':
        await Vibration.vibrate(pattern: [0, 100, 50, 100]);
        break;
      case 'achievement':
        await Vibration.vibrate(pattern: [0, 100, 50, 100, 50, 200]);
        break;
      case 'donation':
        await Vibration.vibrate(pattern: [0, 80, 40, 80, 40, 150]);
        break;
      case 'navigation':
        await Vibration.vibrate(duration: 30);
        break;
      default:
        await Vibration.vibrate(duration: 50);
    }
  }

  /// High contrast mode support
  static ThemeData getHighContrastTheme(ThemeData baseTheme) {
    return baseTheme.copyWith(
      primaryColor: Colors.black,
      scaffoldBackgroundColor: Colors.white,
      textTheme: baseTheme.textTheme.copyWith(
        bodyLarge: baseTheme.textTheme.bodyLarge?.copyWith(
          color: Colors.black,
          fontWeight: FontWeight.bold,
        ),
        bodyMedium: baseTheme.textTheme.bodyMedium?.copyWith(
          color: Colors.black,
          fontWeight: FontWeight.bold,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          side: const BorderSide(color: Colors.white, width: 2),
        ),
      ),
    );
  }

  /// Large text mode support
  static ThemeData getLargeTextTheme(ThemeData baseTheme) {
    return baseTheme.copyWith(
      textTheme: baseTheme.textTheme.copyWith(
        displayLarge: baseTheme.textTheme.displayLarge?.copyWith(fontSize: 48),
        displayMedium: baseTheme.textTheme.displayMedium?.copyWith(fontSize: 40),
        displaySmall: baseTheme.textTheme.displaySmall?.copyWith(fontSize: 32),
        headlineLarge: baseTheme.textTheme.headlineLarge?.copyWith(fontSize: 28),
        headlineMedium: baseTheme.textTheme.headlineMedium?.copyWith(fontSize: 24),
        headlineSmall: baseTheme.textTheme.headlineSmall?.copyWith(fontSize: 20),
        titleLarge: baseTheme.textTheme.titleLarge?.copyWith(fontSize: 18),
        titleMedium: baseTheme.textTheme.titleMedium?.copyWith(fontSize: 16),
        titleSmall: baseTheme.textTheme.titleSmall?.copyWith(fontSize: 14),
        bodyLarge: baseTheme.textTheme.bodyLarge?.copyWith(fontSize: 16),
        bodyMedium: baseTheme.textTheme.bodyMedium?.copyWith(fontSize: 14),
        bodySmall: baseTheme.textTheme.bodySmall?.copyWith(fontSize: 12),
      ),
    );
  }

  /// Screen reader friendly focus management
  static void announceFocusChange(String elementName, {String? context}) {
    String announcement = 'Focused on $elementName';
    if (context != null) {
      announcement += ' in $context';
    }
    _tts.speak(announcement);
  }

  /// Cultural context announcements
  static Future<void> announceCulturalContext(String context) async {
    final culturalMessages = {
      'ubuntu': 'Ubuntu - I am because we are. This represents African philosophy of community.',
      'sankofa': 'Sankofa - Learn from the past. This symbolizes wisdom and reflection.',
      'donation': 'Donation completed. Your contribution supports community development.',
      'achievement': 'Achievement unlocked! Celebrating your progress in community giving.',
      'community': 'Community feature. Connecting people through shared giving experiences.',
    };

    final message = culturalMessages[context.toLowerCase()] ?? 'Cultural element: $context';
    await _tts.speak(message);
  }
}

/// Enhanced accessibility widget wrapper
class AccessibleWrapper extends StatelessWidget {
  final Widget child;
  final String semanticLabel;
  final String? hint;
  final bool enableTTS;
  final bool enableHaptics;
  final VoidCallback? onFocus;
  final String? culturalContext;

  const AccessibleWrapper({
    Key? key,
    required this.child,
    required this.semanticLabel,
    this.hint,
    this.enableTTS = true,
    this.enableHaptics = true,
    this.onFocus,
    this.culturalContext,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: semanticLabel,
      hint: hint,
      child: Focus(
        onFocusChange: (hasFocus) {
          if (hasFocus && enableTTS) {
            AdvancedAccessibilityFeatures.announceFocusChange(
              semanticLabel,
              context: culturalContext,
            );
          }
          onFocus?.call();
        },
        child: child,
      ),
    );
  }
}

/// Voice guidance system for complex interactions
class VoiceGuidance {
  static Future<void> guideUserThroughProcess(
    List<String> steps, {
    Duration delayBetweenSteps = const Duration(seconds: 2),
  }) async {
    for (final step in steps) {
      await AdvancedAccessibilityFeatures._tts.speak(step);
      await Future.delayed(delayBetweenSteps);
    }
  }

  static Future<void> provideContextualHelp(String context) async {
    final helpMessages = {
      'donation_process': [
        'Welcome to the donation process.',
        'First, select the recipient you want to help.',
        'Then choose the amount you wish to donate.',
        'Add a personal message if you like.',
        'Finally, confirm your donation.',
      ],
      'gamification': [
        'Welcome to gamification features.',
        'Earn coins by completing daily missions.',
        'Unlock achievements by reaching milestones.',
        'Level up by gaining experience points.',
        'Join community challenges for bonus rewards.',
      ],
      'settings': [
        'Settings menu.',
        'Configure notifications, security, and accessibility options.',
        'Enable biometric authentication for quick access.',
        'Set up push notifications for important updates.',
        'Customize your experience with accessibility features.',
      ],
    };

    final messages = helpMessages[context];
    if (messages != null) {
      await guideUserThroughProcess(messages);
    }
  }
}

/// Accessibility preferences manager
class AccessibilityPreferences {
  static bool highContrastEnabled = false;
  static bool largeTextEnabled = false;
  static bool voiceGuidanceEnabled = true;
  static bool hapticFeedbackEnabled = true;
  static String preferredLanguage = 'en-US';
  static double speechRate = 0.6;
  static double speechVolume = 1.0;

  static ThemeData applyPreferences(ThemeData baseTheme) {
    ThemeData theme = baseTheme;

    if (highContrastEnabled) {
      theme = AdvancedAccessibilityFeatures.getHighContrastTheme(theme);
    }

    if (largeTextEnabled) {
      theme = AdvancedAccessibilityFeatures.getLargeTextTheme(theme);
    }

    return theme;
  }

  static Future<void> configureTTS() async {
    await AdvancedAccessibilityFeatures._tts.setLanguage(preferredLanguage);
    await AdvancedAccessibilityFeatures._tts.setSpeechRate(speechRate);
    await AdvancedAccessibilityFeatures._tts.setVolume(speechVolume);
  }
}

/// Cultural accessibility overlay
class CulturalAccessibilityOverlay extends StatelessWidget {
  final Widget child;
  final bool showCulturalHints;
  final String? currentContext;

  const CulturalAccessibilityOverlay({
    Key? key,
    required this.child,
    this.showCulturalHints = false,
    this.currentContext,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (showCulturalHints && currentContext != null)
          Positioned(
            top: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: ChainGiveTheme.savannaGold.withAlpha(230),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: ChainGiveTheme.charcoal.withAlpha(51),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.info_outline,
                    color: ChainGiveTheme.charcoal,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _getCulturalHint(),
                    style: TextStyle(
                      color: ChainGiveTheme.charcoal,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  String _getCulturalHint() {
    switch (currentContext) {
      case 'donation':
        return 'Ubuntu: Your gift strengthens community';
      case 'achievement':
        return 'Sankofa: Celebrate your growth';
      case 'community':
        return 'Together we achieve more';
      case 'gamification':
        return 'Earn coins, create impact';
      default:
        return 'Cultural context available';
    }
  }
}