import React, { useRef, useState } from 'react';
import {
  View,
  PanResponder,
  Animated,
  Dimensions,
  ViewStyle,
  Text,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  trackColor?: string;
  thumbColor?: string;
  activeTrackColor?: string;
  gradient?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  style?: ViewStyle;
  trackHeight?: number;
  thumbSize?: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  initialValue = min,
  onValueChange,
  onSlidingComplete,
  disabled = false,
  showValue = true,
  valueFormatter,
  trackColor = colors.gray[300],
  thumbColor = colors.primary,
  activeTrackColor = colors.primary,
  gradient = false,
  haptic = 'light',
  style,
  trackHeight = 4,
  thumbSize = 24,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isSliding, setIsSliding] = useState(false);
  const sliderWidth = useRef(SCREEN_WIDTH - 80).current; // Account for padding
  const thumbPosition = useRef(new Animated.Value(0)).current;

  const valueToPosition = (val: number) => {
    return ((val - min) / (max - min)) * sliderWidth;
  };

  const positionToValue = (position: number) => {
    const ratio = Math.max(0, Math.min(1, position / sliderWidth));
    const rawValue = min + ratio * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  React.useEffect(() => {
    const position = valueToPosition(value);
    Animated.spring(thumbPosition, {
      toValue: position,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [value]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        setIsSliding(true);
        if (haptic !== 'none') {
          const hapticMap = {
            light: Haptics.ImpactFeedbackStyle.Light,
            medium: Haptics.ImpactFeedbackStyle.Medium,
            heavy: Haptics.ImpactFeedbackStyle.Heavy,
          };
          Haptics.impactAsync(hapticMap[haptic as keyof typeof hapticMap]);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 40)); // 40 is left padding
        const newValue = positionToValue(newPosition);
        setValue(newValue);
        onValueChange?.(newValue);
      },
      onPanResponderRelease: () => {
        setIsSliding(false);
        onSlidingComplete?.(value);
      },
    })
  ).current;

  const progressWidth = thumbPosition.interpolate({
    inputRange: [0, sliderWidth],
    outputRange: [0, sliderWidth],
    extrapolate: 'clamp',
  });

  const displayValue = valueFormatter ? valueFormatter(value) : value.toString();

  return (
    <View style={[{ paddingHorizontal: 20 }, style]}>
      {showValue && (
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text.primary,
          }}>
            {displayValue}
          </Text>
        </View>
      )}

      <View style={{ height: thumbSize + 20, justifyContent: 'center' }}>
        {/* Track */}
        <View
          style={{
            height: trackHeight,
            backgroundColor: trackColor,
            borderRadius: trackHeight / 2,
            position: 'relative',
          }}
        >
          {/* Active Track */}
          {gradient ? (
            <Animated.View
              style={{
                height: trackHeight,
                borderRadius: trackHeight / 2,
                overflow: 'hidden',
                width: progressWidth,
              }}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          ) : (
            <Animated.View
              style={{
                height: trackHeight,
                backgroundColor: activeTrackColor,
                borderRadius: trackHeight / 2,
                width: progressWidth,
              }}
            />
          )}
        </View>

        {/* Thumb */}
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: isSliding ? 1.2 : 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'absolute',
            left: thumbPosition,
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: thumbColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          {...panResponder.panHandlers}
        >
          {gradient && (
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                borderRadius: thumbSize / 2,
              }}
            />
          )}

          {/* Thumb indicator */}
          <View
            style={{
              width: thumbSize * 0.4,
              height: thumbSize * 0.4,
              borderRadius: thumbSize * 0.2,
              backgroundColor: 'white',
              opacity: 0.8,
            }}
          />
        </MotiView>
      </View>

      {/* Min/Max Labels */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
      }}>
        <Text style={{
          fontSize: 12,
          color: colors.text.secondary,
        }}>
          {valueFormatter ? valueFormatter(min) : min}
        </Text>
        <Text style={{
          fontSize: 12,
          color: colors.text.secondary,
        }}>
          {valueFormatter ? valueFormatter(max) : max}
        </Text>
      </View>
    </View>
  );
};

export default RangeSlider;