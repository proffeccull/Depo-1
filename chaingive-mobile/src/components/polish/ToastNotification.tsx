import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ToastNotificationProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'custom';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  autoHide?: boolean;
  onHide?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: string;
  title?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  position = 'bottom',
  autoHide = true,
  onHide,
  onPress,
  style,
  icon,
  title,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : position === 'bottom' ? 100 : 0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          icon: 'check-circle',
          gradient: [colors.success, '#28A745'],
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          icon: 'error',
          gradient: [colors.error, '#DC3545'],
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          icon: 'warning',
          gradient: [colors.warning, '#FFC107'],
        };
      case 'info':
        return {
          backgroundColor: colors.info,
          icon: 'info',
          gradient: [colors.info, '#17A2B8'],
        };
      case 'custom':
        return {
          backgroundColor: colors.primary,
          icon: icon || 'notifications',
          gradient: [colors.primary, colors.secondary],
        };
      default:
        return {
          backgroundColor: colors.primary,
          icon: 'notifications',
          gradient: [colors.primary, colors.secondary],
        };
    }
  };

  const config = getTypeConfig();

  useEffect(() => {
    if (visible) {
      setIsVisible(true);

      // Haptic feedback
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
      ]).start();

      // Auto hide
      if (autoHide) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible, position, duration, autoHide]);

  const hideToast = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: position === 'top' ? -100 : position === 'bottom' ? 100 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onHide?.();
    });
  };

  const handlePress = () => {
    onPress?.();
    if (autoHide) {
      hideToast();
    }
  };

  const handleActionPress = () => {
    action?.onPress();
    if (autoHide) {
      hideToast();
    }
  };

  if (!isVisible) return null;

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      left: 16,
      right: 16,
      zIndex: 9999,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: 50,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: 50,
        };
      case 'center':
        return {
          ...baseStyle,
          top: '50%',
          marginTop: -40,
        };
      default:
        return {
          ...baseStyle,
          bottom: 50,
        };
    }
  };

  return (
    <Animated.View
      style={[
        getPositionStyle(),
        {
          opacity,
          transform: [
            { translateY },
            { scale },
          ],
        },
        style,
      ]}
    >
      <MotiView
        from={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              padding: 16,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
              {/* Icon */}
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Icon
                  name={icon || config.icon}
                  size={16}
                  color="white"
                />
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                {title && (
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: 4,
                  }}>
                    {title}
                  </Text>
                )}

                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 20,
                }}>
                  {message}
                </Text>

                {/* Action Button */}
                {action && (
                  <TouchableOpacity
                    onPress={handleActionPress}
                    style={{
                      marginTop: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 16,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: 'white',
                    }}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Close Button */}
              {!autoHide && (
                <TouchableOpacity
                  onPress={hideToast}
                  style={{
                    padding: 4,
                    marginLeft: 8,
                  }}
                >
                  <Icon
                    name="close"
                    size={16}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </Animated.View>
  );
};

export default ToastNotification;