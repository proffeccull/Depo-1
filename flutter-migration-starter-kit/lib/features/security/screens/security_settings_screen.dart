import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/theme.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../shared/widgets/accessibility/cultural_gesture_detector.dart';
import '../../../shared/widgets/accessibility/advanced_accessibility_features.dart';
import '../../../features/settings/widgets/security_settings_widget.dart';

class SecuritySettingsScreen extends ConsumerStatefulWidget {
  const SecuritySettingsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends ConsumerState<SecuritySettingsScreen> {
  @override
  void initState() {
    super.initState();
    // Announce screen for accessibility
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AdvancedAccessibilityFeatures.announceScreenChange(
        'Security Settings',
        culturalContext: 'Protect your account with advanced security features',
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            AfricanMotifs.sankofaSymbol(size: 24, color: ChainGiveTheme.savannaGold),
            const SizedBox(width: 8),
            const Text('Security Settings'),
          ],
        ),
        backgroundColor: ChainGiveTheme.savannaGold,
        elevation: 0,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              ChainGiveTheme.savannaGold.withAlpha(25),
              Colors.white,
              ChainGiveTheme.clayBeige.withAlpha(51),
            ],
          ),
        ),
        child: const SecuritySettingsWidget(),
      ),
    );
  }
}