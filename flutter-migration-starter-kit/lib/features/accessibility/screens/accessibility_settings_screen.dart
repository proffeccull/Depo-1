import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/theme.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../shared/widgets/accessibility/cultural_gesture_detector.dart';
import '../../../shared/widgets/accessibility/advanced_accessibility_features.dart';

class AccessibilitySettingsScreen extends ConsumerStatefulWidget {
  const AccessibilitySettingsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AccessibilitySettingsScreen> createState() => _AccessibilitySettingsScreenState();
}

class _AccessibilitySettingsScreenState extends ConsumerState<AccessibilitySettingsScreen> {
  bool _highContrastEnabled = false;
  bool _largeTextEnabled = false;
  bool _voiceGuidanceEnabled = true;
  bool _hapticFeedbackEnabled = true;
  String _preferredLanguage = 'en-US';
  double _speechRate = 0.6;
  double _speechVolume = 1.0;

  @override
  void initState() {
    super.initState();
    // Announce screen for accessibility
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AdvancedAccessibilityFeatures.announceScreenChange(
        'Accessibility Settings',
        culturalContext: 'Customize your experience for better accessibility',
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
            const Text('Accessibility'),
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              _buildVisualSettings(),
              const SizedBox(height: 24),
              _buildAudioSettings(),
              const SizedBox(height: 24),
              _buildInteractionSettings(),
              const SizedBox(height: 24),
              _buildCulturalSettings(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ChainGiveTheme.indigoBlue.withAlpha(25),
            ChainGiveTheme.acaciaGreen.withAlpha(25),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: ChainGiveTheme.indigoBlue.withAlpha(51),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          AfricanMotifs.sankofaSymbol(size: 32, color: ChainGiveTheme.indigoBlue),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Accessibility Settings',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: ChainGiveTheme.charcoal,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Customize your experience for better accessibility and usability.',
                  style: TextStyle(
                    color: ChainGiveTheme.charcoal.withAlpha(179),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVisualSettings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Visual Settings',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildSettingToggle(
          'High Contrast Mode',
          'Increase contrast for better visibility',
          Icons.visibility,
          ChainGiveTheme.indigoBlue,
          _highContrastEnabled,
          (value) => setState(() => _highContrastEnabled = value),
        ),
        const SizedBox(height: 12),
        _buildSettingToggle(
          'Large Text',
          'Increase text size throughout the app',
          Icons.text_fields,
          ChainGiveTheme.acaciaGreen,
          _largeTextEnabled,
          (value) => setState(() => _largeTextEnabled = value),
        ),
      ],
    );
  }

  Widget _buildAudioSettings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Audio Settings',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildSettingToggle(
          'Voice Guidance',
          'Enable spoken feedback for navigation and actions',
          Icons.volume_up,
          ChainGiveTheme.savannaGold,
          _voiceGuidanceEnabled,
          (value) => setState(() => _voiceGuidanceEnabled = value),
        ),
        if (_voiceGuidanceEnabled) ...[
          const SizedBox(height: 16),
          _buildSliderSetting(
            'Speech Rate',
            'Adjust how fast the voice speaks',
            _speechRate,
            0.3,
            1.0,
            (value) => setState(() => _speechRate = value),
          ),
          const SizedBox(height: 16),
          _buildSliderSetting(
            'Speech Volume',
            'Adjust the volume of voice guidance',
            _speechVolume,
            0.1,
            1.0,
            (value) => setState(() => _speechVolume = value),
          ),
        ],
      ],
    );
  }

  Widget _buildInteractionSettings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Interaction Settings',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildSettingToggle(
          'Haptic Feedback',
          'Enable vibration feedback for interactions',
          Icons.vibration,
          ChainGiveTheme.kenteRed,
          _hapticFeedbackEnabled,
          (value) => setState(() => _hapticFeedbackEnabled = value),
        ),
      ],
    );
  }

  Widget _buildCulturalSettings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Cultural Settings',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Language',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: ChainGiveTheme.charcoal,
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _preferredLanguage,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                items: const [
                  DropdownMenuItem(value: 'en-US', child: Text('English (US)')),
                  DropdownMenuItem(value: 'en-GB', child: Text('English (UK)')),
                  DropdownMenuItem(value: 'fr-FR', child: Text('Français')),
                  DropdownMenuItem(value: 'es-ES', child: Text('Español')),
                  DropdownMenuItem(value: 'sw-KE', child: Text('Kiswahili')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _preferredLanguage = value);
                  }
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSettingToggle(
    String title,
    String subtitle,
    IconData icon,
    Color color,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withAlpha(25),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: ChainGiveTheme.charcoal,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: ChainGiveTheme.charcoal.withAlpha(128),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: color,
          ),
        ],
      ),
    );
  }

  Widget _buildSliderSetting(
    String title,
    String subtitle,
    double value,
    double min,
    double max,
    ValueChanged<double> onChanged,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: ChainGiveTheme.charcoal,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(
              color: ChainGiveTheme.charcoal.withAlpha(128),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Text(
                value.toStringAsFixed(1),
                style: TextStyle(
                  color: ChainGiveTheme.charcoal.withAlpha(179),
                  fontSize: 14,
                ),
              ),
              Expanded(
                child: Slider(
                  value: value,
                  min: min,
                  max: max,
                  onChanged: onChanged,
                  activeColor: ChainGiveTheme.acaciaGreen,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}