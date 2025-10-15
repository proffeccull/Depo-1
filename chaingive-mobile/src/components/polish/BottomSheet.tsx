import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ViewStyle,
  Text,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: number | 'auto' | 'full';
  snapPoints?: number[];
  showHandle?: boolean;
  showCloseButton?: boolean;
  backdropOpacity?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  draggable?: boolean;
  hapticFeedback?: boolean;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  height = 'auto',
  snapPoints = [],
  showHandle = true,
  showCloseButton = true,
  backdropOpacity = 0.5,
  style,
  contentStyle,
  draggable = true,
  hapticFeedback = true,
}) => {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(0);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;

  const getSheetHeight = () => {
    if (height === 'full') return SCREEN_HEIGHT * 0.9;
    if (height === 'auto') return 'auto';
    return height;
  };

  const getSnapPoints = () => {
    if (snapPoints.length > 0) return snapPoints;
    const sheetHeight = getSheetHeight();
    if (typeof sheetHeight === 'number') {
      return [sheetHeight * 0.3, sheetHeight * 0.6, sheetHeight];
    }
    return [200, 400, 600];
  };

  useEffect(() => {
    if (visible) {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const targetHeight = getSnapPoints()[currentSnapPoint] || 400;

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - targetHeight,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: backdropOpacity,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentSnapPoint]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => draggable,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return draggable && Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(SCREEN_HEIGHT - getSnapPoints()[currentSnapPoint] + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const snapPointsList = getSnapPoints();
        const currentY = SCREEN_HEIGHT - getSnapPoints()[currentSnapPoint] + gestureState.dy;
        const velocity = gestureState.vy;

        // Close if swiped down with enough velocity or distance
        if (velocity > 0.5 || gestureState.dy > 100) {
          onClose();
          return;
        }

        // Find closest snap point
        let closestIndex = 0;
        let minDistance = Math.abs(currentY - (SCREEN_HEIGHT - snapPointsList[0]));

        snapPointsList.forEach((point, index) => {
          const distance = Math.abs(currentY - (SCREEN_HEIGHT - point));
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        setCurrentSnapPoint(closestIndex);

        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - snapPointsList[closestIndex],
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      {/* Backdrop */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: backdropOpacityAnim,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 16,
            transform: [{ translateY }],
          },
          style,
        ]}
      >
        {/* Handle */}
        {showHandle && (
          <View
            style={{
              alignItems: 'center',
              paddingTop: 12,
              paddingBottom: 8,
            }}
            {...panResponder.panHandlers}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.gray[300],
                borderRadius: 2,
              }}
            />
          </View>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.gray[100],
            }}
          >
            {title ? (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text.primary,
                  flex: 1,
                }}
              >
                {title}
              </Text>
            ) : (
              <View />
            )}

            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: colors.gray[100],
                }}
              >
                <Icon
                  name="close"
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content */}
        <View
          style={[
            {
              padding: 20,
              maxHeight: SCREEN_HEIGHT * 0.8,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

export default BottomSheet;