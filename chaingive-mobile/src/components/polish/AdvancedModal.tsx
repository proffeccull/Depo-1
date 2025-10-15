import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AdvancedModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'fullscreen' | 'bottomSheet' | 'center' | 'premium';
  animationType?: 'fade' | 'slide' | 'scale' | 'bounce';
  closeOnBackdropPress?: boolean;
  closeOnSwipe?: boolean;
  showCloseButton?: boolean;
  backdropOpacity?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
}

const AdvancedModal: React.FC<AdvancedModalProps> = ({
  visible,
  onClose,
  title,
  children,
  variant = 'default',
  animationType = 'fade',
  closeOnBackdropPress = true,
  closeOnSwipe = false,
  showCloseButton = true,
  backdropOpacity = 0.5,
  style,
  contentStyle,
  titleStyle,
  haptic = 'medium',
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (haptic !== 'none') {
        const hapticMap = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        };
        Haptics.impactAsync(hapticMap[haptic as keyof typeof hapticMap]);
      }

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        variant === 'bottomSheet'
          ? Animated.spring(slideAnim, {
              toValue: 0,
              tension: 65,
              friction: 8,
              useNativeDriver: true,
            })
          : Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 65,
              friction: 8,
              useNativeDriver: true,
            }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        variant === 'bottomSheet'
          ? Animated.spring(slideAnim, {
              toValue: SCREEN_HEIGHT,
              tension: 65,
              friction: 8,
              useNativeDriver: true,
            })
          : Animated.spring(scaleAnim, {
              toValue: 0.8,
              tension: 65,
              friction: 8,
              useNativeDriver: true,
            }),
      ]).start();
    }
  }, [visible, variant, opacityAnim, slideAnim, scaleAnim, haptic]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => closeOnSwipe,
      onMoveShouldSetPanResponder: () => closeOnSwipe,
      onPanResponderMove: (_, gestureState) => {
        if (variant === 'bottomSheet' && gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (variant === 'bottomSheet' && gestureState.dy > 100) {
          onClose();
        } else if (variant === 'bottomSheet') {
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 65,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getModalStyle = () => {
    const baseStyle = {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
    };

    switch (variant) {
      case 'fullscreen':
        return {
          ...baseStyle,
          justifyContent: 'flex-start' as const,
          alignItems: 'stretch' as const,
        };
      case 'bottomSheet':
        return {
          ...baseStyle,
          justifyContent: 'flex-end' as const,
          alignItems: 'stretch' as const,
        };
      case 'center':
        return baseStyle;
      case 'premium':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(46, 139, 87, 0.1)',
        };
      default:
        return baseStyle;
    }
  };

  const getContentStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: 'white',
      borderRadius: variant === 'bottomSheet' ? 20 : 16,
      padding: 20,
      margin: 20,
      maxHeight: variant === 'fullscreen' ? '100%' : '80%',
      width: variant === 'fullscreen' ? '100%' : '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    };

    if (variant === 'bottomSheet') {
      return {
        ...baseStyle,
        margin: 0,
        marginTop: 100,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        transform: [{ translateY: slideAnim }],
      };
    }

    if (variant === 'fullscreen') {
      return {
        ...baseStyle,
        margin: 0,
        borderRadius: 0,
        flex: 1,
      };
    }

    if (variant === 'premium') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
      };
    }

    return {
      ...baseStyle,
      transform: [{ scale: scaleAnim }],
    };
  };

  const renderContent = () => {
    const content = (
      <View style={[getContentStyle(), contentStyle]}>
        {variant === 'premium' ? (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 16,
            }}
          />
        ) : null}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: title ? 20 : 0 }}>
          {title ? (
            <Text
              style={[
                {
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: variant === 'premium' ? 'white' : colors.text.primary,
                  flex: 1,
                },
                titleStyle,
              ]}
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
                backgroundColor: variant === 'premium' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <Icon
                name="close"
                size={24}
                color={variant === 'premium' ? 'white' : colors.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flex: 1 }}>
          {children}
        </View>
      </View>
    );

    if (variant === 'bottomSheet') {
      return (
        <View {...panResponder.panHandlers}>
          {content}
        </View>
      );
    }

    return content;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[getModalStyle(), { opacity: opacityAnim }, style]}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={closeOnBackdropPress ? onClose : undefined}
          activeOpacity={1}
        />
        {renderContent()}
      </Animated.View>
    </Modal>
  );
};

export default AdvancedModal;