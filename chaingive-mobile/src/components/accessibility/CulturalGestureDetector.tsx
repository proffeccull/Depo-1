import React, { useRef, useCallback } from 'react';
import {
  View,
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { Vibration, Platform } from 'react-native';

// Types for gesture patterns
export type GesturePattern = 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'rotate';

interface CulturalGestureDetectorProps {
  children: React.ReactNode;
  onCulturalGesture?: (pattern: GesturePattern, context?: any) => void;
  enabled?: boolean;
  vibrationEnabled?: boolean;
  hapticFeedback?: boolean;
  style?: any;
}

const CulturalGestureDetector: React.FC<CulturalGestureDetectorProps> = ({
  children,
  onCulturalGesture,
  enabled = true,
  vibrationEnabled = true,
  hapticFeedback = true,
  style,
}) => {
  const lastTapRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Haptic feedback function
  const provideHapticFeedback = useCallback(() => {
    if (!hapticFeedback) return;

    if (Platform.OS === 'ios') {
      // iOS specific haptic feedback
      // Note: In real implementation, use react-native-haptic-feedback
      Vibration.vibrate(50);
    } else {
      // Android vibration patterns
      Vibration.vibrate([0, 50]);
    }
  }, [hapticFeedback]);

  // Handle tap gestures with cultural context
  const handleTap = useCallback((event: any) => {
    if (!enabled || !onCulturalGesture) return;

    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    // Double tap detection (cultural significance in some African traditions)
    if (timeDiff < 300) {
      tapCountRef.current += 1;

      if (tapCountRef.current === 2) {
        provideHapticFeedback();
        onCulturalGesture('double-tap', {
          significance: 'respect',
          tradition: 'african_greeting',
          context: 'acknowledgment'
        });
        tapCountRef.current = 0;
      }
    } else {
      tapCountRef.current = 1;

      // Single tap with timeout for potential double tap
      setTimeout(() => {
        if (tapCountRef.current === 1) {
          onCulturalGesture('tap', {
            significance: 'selection',
            context: 'standard_interaction'
          });
        }
      }, 300);
    }

    lastTapRef.current = now;
  }, [enabled, onCulturalGesture, provideHapticFeedback]);

  // Handle long press (cultural significance - contemplation, respect)
  const handleLongPressStart = useCallback(() => {
    if (!enabled || !onCulturalGesture) return;

    longPressTimeoutRef.current = setTimeout(() => {
      provideHapticFeedback();
      onCulturalGesture('long-press', {
        significance: 'contemplation',
        tradition: 'african_respect',
        duration: 'extended',
        context: 'deep_engagement'
      });
    }, 500); // 500ms for long press
  }, [enabled, onCulturalGesture, provideHapticFeedback]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  // Handle swipe gestures (cultural navigation patterns)
  const handleSwipe = useCallback((
    event: PanGestureHandlerGestureEvent,
    context: any
  ) => {
    if (!enabled || !onCulturalGesture) return;

    const { translationX, translationY } = event.nativeEvent;
    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);

    // Determine swipe direction
    let direction = '';
    if (absX > absY) {
      direction = translationX > 0 ? 'right' : 'left';
    } else {
      direction = translationY > 0 ? 'down' : 'up';
    }

    provideHapticFeedback();
    onCulturalGesture('swipe', {
      direction,
      significance: 'navigation',
      tradition: 'african_directional',
      context: context,
      velocity: Math.sqrt(translationX ** 2 + translationY ** 2)
    });
  }, [enabled, onCulturalGesture, provideHapticFeedback]);

  // Pan gesture handler for swipe detection
  const onGestureEvent = useCallback((event: PanGestureHandlerGestureEvent) => {
    // Track gesture for potential swipe
  }, []);

  const onHandlerStateChange = useCallback((event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;

      // Check if it's a significant swipe
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);
      const velocity = Math.sqrt(velocityX ** 2 + velocityY ** 2);

      if ((absX > 50 || absY > 50) && velocity > 500) {
        handleSwipe(event, {
          distance: Math.sqrt(absX ** 2 + absY ** 2),
          velocity
        });
      }
    }
  }, [handleSwipe]);

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      enabled={enabled}
    >
      <View
        style={style}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
      >
        {React.cloneElement(children as React.ReactElement, {
          onPress: handleTap,
        })}
      </View>
    </PanGestureHandler>
  );
};

export default CulturalGestureDetector;