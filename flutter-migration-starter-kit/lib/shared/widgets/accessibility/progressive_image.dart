import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_tts/flutter_tts.dart';

/// Progressive image loading with accessibility features for African users
class ProgressiveImage extends StatefulWidget {
  final String imageUrl;
  final String altText;
  final double? width;
  final double? height;
  final BoxFit fit;
  final bool enableTTS;
  final String? description;
  final String? culturalContext; // e.g., 'donation_story', 'community_event', 'user_profile'
  final List<String>? supportedLanguages; // African languages for TTS

  const ProgressiveImage({
    Key? key,
    required this.imageUrl,
    required this.altText,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.enableTTS = true,
    this.description,
    this.culturalContext,
    this.supportedLanguages,
  }) : super(key: key);

  @override
  State<ProgressiveImage> createState() => _ProgressiveImageState();
}

class _ProgressiveImageState extends State<ProgressiveImage> {
  final FlutterTts _tts = FlutterTts();
  bool _isLoading = true;
  bool _hasError = false;
  double _loadingProgress = 0.0;

  @override
  void initState() {
    super.initState();
    _initializeTTS();
  }

  Future<void> _initializeTTS() async {
    // Configure TTS for African languages
    final languages = widget.supportedLanguages ?? ['en-US', 'sw-TZ', 'ha-NG', 'yo-NG'];

    for (final lang in languages) {
      final isLanguageAvailable = await _tts.isLanguageAvailable(lang);
      if (isLanguageAvailable) {
        await _tts.setLanguage(lang);
        break;
      }
    }

    await _tts.setSpeechRate(0.5);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);

    // Set voice for better accessibility
    await _tts.setVoice({"name": "en-us-x-tpf-local", "locale": "en-US"});
  }

  Future<void> _speakAltText() async {
    if (!widget.enableTTS) return;

    String textToSpeak = widget.altText;

    // Add cultural context
    if (widget.culturalContext != null) {
      switch (widget.culturalContext) {
        case 'donation_story':
          textToSpeak = 'Donation story image: $textToSpeak';
          break;
        case 'community_event':
          textToSpeak = 'Community event image: $textToSpeak';
          break;
        case 'user_profile':
          textToSpeak = 'Profile picture: $textToSpeak';
          break;
        case 'achievement':
          textToSpeak = 'Achievement badge: $textToSpeak';
          break;
      }
    }

    if (widget.description != null) {
      textToSpeak += '. ${widget.description}';
    }

    await _tts.speak(textToSpeak);
  }

  Future<void> _speakDetailedDescription() async {
    if (!widget.enableTTS || widget.description == null) return;

    String detailedText = 'Detailed description: ${widget.description}';

    // Add cultural significance if available
    if (widget.culturalContext == 'donation_story') {
      detailedText += '. This represents the impact of community giving in African traditions.';
    } else if (widget.culturalContext == 'community_event') {
      detailedText += '. Celebrating Ubuntu - the spirit of togetherness in African culture.';
    }

    await _tts.speak(detailedText);
  }

  void _showAccessibilityMessage(String message) {
    // For now, show as a snackbar - will be replaced with TTS when available
    if (mounted && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          duration: const Duration(seconds: 3),
          backgroundColor: const Color(0xFF4B0082), // indigoBlue
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: widget.altText,
      hint: widget.description,
      image: true,
      child: GestureDetector(
        onTap: _speakAltText,
        onLongPress: _speakDetailedDescription,
        onDoubleTap: () {
          // Zoom functionality for accessibility
          _showImageDialog(context);
        },
        child: Container(
          width: widget.width,
          height: widget.height,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Low quality placeholder with cultural pattern
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFFD4AF37).withAlpha(26),
                      const Color(0xFF228B22).withAlpha(26),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Center(
                  child: _buildPlaceholder(),
                ),
              ),

              // Progressive loading with progress indicator
              CachedNetworkImage(
                imageUrl: widget.imageUrl,
                fit: widget.fit,
                placeholder: (context, url) => Container(
                  color: Colors.transparent,
                  child: Center(
                    child: CircularProgressIndicator(
                      value: _loadingProgress > 0 ? _loadingProgress : null,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        const Color(0xFFD4AF37), // savannaGold
                      ),
                      backgroundColor: const Color(0xFF228B22).withAlpha(51), // acaciaGreen
                    ),
                  ),
                ),
                progressIndicatorBuilder: (context, url, downloadProgress) {
                  _loadingProgress = downloadProgress.progress ?? 0.0;
                  return Container(
                    color: Colors.transparent,
                    child: Center(
                      child: CircularProgressIndicator(
                        value: downloadProgress.progress,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          const Color(0xFFD4AF37),
                        ),
                        backgroundColor: const Color(0xFF228B22).withAlpha(51),
                      ),
                    ),
                  );
                },
                errorWidget: (context, url, error) {
                  _hasError = true;
                  return Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFFDC143C).withAlpha(26), // kenteRed
                          const Color(0xFF36454F).withAlpha(26), // charcoal
                        ],
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.broken_image,
                          color: const Color(0xFF36454F).withAlpha(128),
                          size: 48,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Image unavailable',
                          style: TextStyle(
                            color: const Color(0xFF36454F).withAlpha(179),
                            fontSize: 14,
                          ),
                        ),
                        if (widget.enableTTS) ...[
                          const SizedBox(height: 8),
                          ElevatedButton.icon(
                            onPressed: _speakAltText,
                            icon: const Icon(Icons.volume_up),
                            label: const Text('Describe'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF4B0082), // indigoBlue
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                },
                fadeInDuration: const Duration(milliseconds: 300),
                fadeOutDuration: const Duration(milliseconds: 300),
              ),

              // Accessibility overlay
              if (widget.enableTTS)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.black.withAlpha(153),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(
                      Icons.volume_up,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                ),

              // Cultural context indicator
              if (widget.culturalContext != null)
                Positioned(
                  bottom: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withAlpha(153),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _getCulturalContextLabel(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    // Cultural placeholder based on context
    switch (widget.culturalContext) {
      case 'donation_story':
        return Icon(
          Icons.volunteer_activism,
          color: const Color(0xFFD4AF37).withAlpha(128),
          size: 48,
        );
      case 'community_event':
        return Icon(
          Icons.people,
          color: const Color(0xFF228B22).withAlpha(128),
          size: 48,
        );
      case 'user_profile':
        return Icon(
          Icons.person,
          color: const Color(0xFF4B0082).withAlpha(128),
          size: 48,
        );
      default:
        return Icon(
          Icons.image,
          color: const Color(0xFF36454F).withAlpha(128),
          size: 48,
        );
    }
  }

  String _getCulturalContextLabel() {
    switch (widget.culturalContext) {
      case 'donation_story':
        return 'Ubuntu';
      case 'community_event':
        return 'Together';
      case 'user_profile':
        return 'Individual';
      case 'achievement':
        return 'Success';
      default:
        return 'Image';
    }
  }

  void _showImageDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: InteractiveViewer(
          child: CachedNetworkImage(
            imageUrl: widget.imageUrl,
            fit: BoxFit.contain,
            placeholder: (context, url) => const Center(
              child: CircularProgressIndicator(),
            ),
            errorWidget: (context, url, error) => const Center(
              child: Icon(Icons.broken_image, size: 64),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }
}

/// Screen reader utility for comprehensive accessibility
class ScreenReader {
  static final FlutterTts _tts = FlutterTts();

  static Future<void> initialize() async {
    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.6);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
  }

  static Future<void> announceScreen(String screenName, {String? description}) async {
    String announcement = 'Navigated to $screenName screen';
    if (description != null) {
      announcement += '. $description';
    }
    await _tts.speak(announcement);
  }

  static Future<void> announceAction(String action, {String? context}) async {
    String announcement = action;
    if (context != null) {
      announcement += ' for $context';
    }
    await _tts.speak(announcement);
  }

  static Future<void> announceError(String error) async {
    await _tts.speak('Error: $error');
  }

  static Future<void> announceSuccess(String message) async {
    await _tts.speak('Success: $message');
  }
}