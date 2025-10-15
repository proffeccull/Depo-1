import React, { useRef, useState } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeAction {
  key: string;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
  style,
  disabled = false,
  hapticFeedback = true,
}) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && !disabled;
      },
      onPanResponderGrant: () => {
        setIsSwiping(true);
        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (!disabled) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSwiping(false);

        const { dx, vx } = gestureState;
        const shouldTriggerLeft = dx < -swipeThreshold || (dx < -50 && vx < -0.5);
        const shouldTriggerRight = dx > swipeThreshold || (dx > 50 && vx > 0.5);

        if (shouldTriggerLeft && rightActions.length > 0) {
          Animated.spring(translateX, {
            toValue: -SCREEN_WIDTH,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start(() => {
            onSwipeLeft?.();
            // Reset position after action
            setTimeout(() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }).start();
            }, 200);
          });
        } else if (shouldTriggerRight && leftActions.length > 0) {
          Animated.spring(translateX, {
            toValue: SCREEN_WIDTH,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start(() => {
            onSwipeRight?.();
            // Reset position after action
            setTimeout(() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }).start();
            }, 200);
          });
        } else {
          // Return to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    const actionWidth = Math.min(80, SCREEN_WIDTH / actions.length);

    return (
      <View
        style={{
          position: 'absolute',
          [side]: 0,
          top: 0,
          bottom: 0,
          flexDirection: side === 'left' ? 'row' : 'row-reverse',
          width: actions.length * actionWidth,
        }}
      >
        {actions.map((action, index) => (
          <MotiView
            key={action.key}
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
              delay: index * 50,
            }}
            style={{
              width: actionWidth,
              backgroundColor: action.backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              name={action.icon}
              size={24}
              color={action.color}
            />
          </MotiView>
        ))}
      </View>
    );
  };

  return (
    <View style={[{ position: 'relative' }, style]}>
      {/* Left Actions */}
      {leftActions.length > 0 && renderActions(leftActions, 'left')}

      {/* Right Actions */}
      {rightActions.length > 0 && renderActions(rightActions, 'right')}

      {/* Main Card */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          zIndex: 10,
        }}
        {...panResponder.panHandlers}
      >
        <MotiView
          animate={{
            scale: isSwiping ? 1.02 : 1,
            shadowOpacity: isSwiping ? 0.3 : 0.1,
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
        >
          {children}
        </MotiView>
      </Animated.View>
    </View>
  );
};

export default SwipeableCard;
