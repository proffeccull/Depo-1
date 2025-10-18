import 'package:flutter/material.dart';
import 'package:vibration/vibration.dart';

/// Cultural gesture detector with haptic feedback for African interactions
class CulturalGestureDetector extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onDoubleTap;
  final VoidCallback? onLongPress;
  final GestureDragUpdateCallback? onPanUpdate;
  final GestureDragEndCallback? onPanEnd;
  final VoidCallback? onSwipeUp;
  final VoidCallback? onSwipeDown;
  final VoidCallback? onSwipeLeft;
  final VoidCallback? onSwipeRight;
  final bool enableHaptics;
  final bool enableCulturalFeedback;

  const CulturalGestureDetector({
    Key? key,
    required this.child,
    this.onTap,
    this.onDoubleTap,
    this.onLongPress,
    this.onPanUpdate,
    this.onPanEnd,
    this.onSwipeUp,
    this.onSwipeDown,
    this.onSwipeLeft,
    this.onSwipeRight,
    this.enableHaptics = true,
    this.enableCulturalFeedback = true,
  }) : super(key: key);

  @override
  State<CulturalGestureDetector> createState() => _CulturalGestureDetectorState();
}

class _CulturalGestureDetectorState extends State<CulturalGestureDetector> {
  Offset? _startPosition;
  static const double _swipeThreshold = 50.0;

  Future<void> _provideHapticFeedback(String gestureType) async {
    if (!widget.enableHaptics) return;

    final hasVibrator = await Vibration.hasVibrator() ?? false;
    if (!hasVibrator) return;

    // Different vibration patterns for different gestures
    switch (gestureType) {
      case 'tap':
        await Vibration.vibrate(duration: 50);
        break;
      case 'double_tap':
        await Vibration.vibrate(pattern: [0, 50, 50, 50]);
        break;
      case 'long_press':
        await Vibration.vibrate(duration: 100);
        break;
      case 'swipe':
        await Vibration.vibrate(pattern: [0, 30, 30, 30]);
        break;
      case 'donation':
        // Special pattern for donation gestures (cultural celebration)
        await Vibration.vibrate(pattern: [0, 100, 50, 100, 50, 200]);
        break;
      case 'community':
        // Special pattern for community interactions
        await Vibration.vibrate(pattern: [0, 80, 40, 80, 40, 80]);
        break;
    }
  }

  void _handleSwipe(Offset delta) {
    if (delta.dy.abs() > delta.dx.abs()) {
      // Vertical swipe
      if (delta.dy > _swipeThreshold) {
        widget.onSwipeDown?.call();
        _provideHapticFeedback('swipe');
      } else if (delta.dy < -_swipeThreshold) {
        widget.onSwipeUp?.call();
        _provideHapticFeedback('swipe');
      }
    } else {
      // Horizontal swipe
      if (delta.dx > _swipeThreshold) {
        widget.onSwipeRight?.call();
        _provideHapticFeedback('swipe');
      } else if (delta.dx < -_swipeThreshold) {
        widget.onSwipeLeft?.call();
        _provideHapticFeedback('swipe');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap != null ? () {
        widget.onTap!();
        _provideHapticFeedback('tap');
      } : null,

      onDoubleTap: widget.onDoubleTap != null ? () {
        widget.onDoubleTap!();
        _provideHapticFeedback('double_tap');
      } : null,

      onLongPress: widget.onLongPress != null ? () {
        widget.onLongPress!();
        _provideHapticFeedback('long_press');
      } : null,

      onPanStart: (details) {
        _startPosition = details.localPosition;
      },

      onPanUpdate: (details) {
        widget.onPanUpdate?.call(details);
      },

      onPanEnd: (details) {
        if (_startPosition != null) {
          final delta = details.localPosition - _startPosition!;
          _handleSwipe(delta);
        }
        widget.onPanEnd?.call(details);
        _startPosition = null;
      },

      child: widget.child,
    );
  }
}

/// Cultural gesture patterns commonly used in African interactions
class CulturalGestures {
  /// Ubuntu greeting gesture (nod with both hands)
  static const String ubuntuGreeting = 'ubuntu_greeting';

  /// Maasai jumping gesture (celebration)
  static const String maasaiJump = 'maasai_jump';

  /// Kente cloth folding gesture (respect/tradition)
  static const String kenteFold = 'kente_fold';

  /// Baobab sharing gesture (community giving)
  static const String baobabShare = 'baobab_share';

  /// Sankofa reflection gesture (learning from past)
  static const String sankofaReflect = 'sankofa_reflect';
}

/// Enhanced gesture detector for donation interactions
class DonationGestureDetector extends CulturalGestureDetector {
  final VoidCallback? onDonationGesture;
  final VoidCallback? onCommunityGesture;

  const DonationGestureDetector({
    Key? key,
    required Widget child,
    VoidCallback? onTap,
    VoidCallback? onDoubleTap,
    VoidCallback? onLongPress,
    GestureDragUpdateCallback? onPanUpdate,
    GestureDragEndCallback? onPanEnd,
    VoidCallback? onSwipeUp,
    VoidCallback? onSwipeDown,
    VoidCallback? onSwipeLeft,
    VoidCallback? onSwipeRight,
    bool enableHaptics = true,
    bool enableCulturalFeedback = true,
    this.onDonationGesture,
    this.onCommunityGesture,
  }) : super(
          key: key,
          child: child,
          onTap: onTap,
          onDoubleTap: onDoubleTap,
          onLongPress: onLongPress,
          onPanUpdate: onPanUpdate,
          onPanEnd: onPanEnd,
          onSwipeUp: onSwipeUp,
          onSwipeDown: onSwipeDown,
          onSwipeLeft: onSwipeLeft,
          onSwipeRight: onSwipeRight,
          enableHaptics: enableHaptics,
          enableCulturalFeedback: enableCulturalFeedback,
        );

  @override
  State<CulturalGestureDetector> createState() => _DonationGestureDetectorState();
}

class _DonationGestureDetectorState extends _CulturalGestureDetectorState {
  @override
  void _handleSwipe(Offset delta) {
    super._handleSwipe(delta);

    // Additional donation-specific gesture recognition
    if (delta.dx.abs() > 100 && delta.dy.abs() < 50) {
      // Horizontal swipe - community gesture
      (widget as DonationGestureDetector).onCommunityGesture?.call();
      _provideHapticFeedback('community');
    } else if (delta.dy > 100 && delta.dx.abs() < 50) {
      // Downward swipe - donation gesture
      (widget as DonationGestureDetector).onDonationGesture?.call();
      _provideHapticFeedback('donation');
    }
  }
}

/// Gesture patterns for different African cultural contexts
class GesturePatterns {
  static const Map<String, List<String>> nigerianPatterns = {
    'yoruba': ['tap', 'double_tap', 'swipe_right'],
    'hausa': ['long_press', 'swipe_up', 'double_tap'],
    'igbo': ['swipe_left', 'tap', 'long_press'],
  };

  static const Map<String, List<String>> kenyanPatterns = {
    'maasai': ['swipe_up', 'double_tap', 'long_press'],
    'kikuyu': ['tap', 'swipe_right', 'swipe_left'],
    'luo': ['long_press', 'tap', 'swipe_up'],
  };

  static const Map<String, List<String>> southAfricanPatterns = {
    'zulu': ['double_tap', 'swipe_left', 'tap'],
    'xhosa': ['swipe_right', 'long_press', 'tap'],
    'afrikaans': ['tap', 'swipe_up', 'double_tap'],
  };

  static List<String> getPatternsForRegion(String country, String? ethnicGroup) {
    switch (country.toLowerCase()) {
      case 'nigeria':
        return nigerianPatterns[ethnicGroup?.toLowerCase()] ?? ['tap', 'swipe_right'];
      case 'kenya':
        return kenyanPatterns[ethnicGroup?.toLowerCase()] ?? ['tap', 'swipe_up'];
      case 'south africa':
        return southAfricanPatterns[ethnicGroup?.toLowerCase()] ?? ['tap', 'double_tap'];
      default:
        return ['tap', 'long_press'];
    }
  }
}