import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Animated,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface FABAction {
  key: string;
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  icon?: string;
  onPress?: () => void;
  actions?: FABAction[];
  variant?: 'primary' | 'secondary' | 'premium' | 'mini';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  animated?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon = 'add',
  onPress,
  actions = [],
  variant = 'primary',
  position = 'bottom-right',
  size = 'medium',
  style,
  disabled = false,
  hapticFeedback = true,
  animated = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: isExpanded ? 1 : 1.1,
          useNativeDriver: true,
          tension: 300,
          friction: 3,
        }),
        Animated.spring(rotateAnim, {
          toValue: isExpanded ? 0 : 1,
          useNativeDriver: true,
          tension: 300,
          friction: 3,
        }),
      ]).start();
    } else {
      onPress?.();
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return 48;
      case 'medium':
        return 56;
      case 'large':
        return 64;
      default:
        return 56;
    }
  };

  const getPosition = () => {
    const fabSize = getSize();
    const margin = 16;

    switch (position) {
      case 'bottom-right':
        return {
          position: 'absolute' as const,
          bottom: margin,
          right: margin,
        };
      case 'bottom-left':
        return {
          position: 'absolute' as const,
          bottom: margin,
          left: margin,
        };
      case 'top-right':
        return {
          position: 'absolute' as const,
          top: margin,
          right: margin,
        };
      case 'top-left':
        return {
          position: 'absolute' as const,
          top: margin,
          left: margin,
        };
      default:
        return {
          position: 'absolute' as const,
          bottom: margin,
          right: margin,
        };
    }
  };

  const getVariantStyles = () => {
    const baseSize = getSize();

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          shadowColor: colors.secondary,
        };
      case 'premium':
        return {
          backgroundColor: 'transparent',
          shadowColor: colors.primary,
        };
      case 'mini':
        return {
          width: baseSize * 0.7,
          height: baseSize * 0.7,
          borderRadius: (baseSize * 0.7) / 2,
          backgroundColor: colors.gray[600],
          shadowColor: colors.gray[600],
        };
      default:
        return {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        };
    }
  };

  const renderMainButton = () => {
    const fabSize = getSize();
    const variantStyles = getVariantStyles();

    const buttonContent = (
      <View
        style={{
          width: variantStyles.width || fabSize,
          height: variantStyles.height || fabSize,
          borderRadius: fabSize / 2,
          backgroundColor: variantStyles.backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          }}
        >
          <Icon
            name={actions.length > 0 ? 'add' : icon}
            size={size === 'small' ? 20 : size === 'large' ? 28 : 24}
            color="white"
          />
        </Animated.View>
      </View>
    );

    if (variant === 'premium') {
      return (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: fabSize,
            height: fabSize,
            borderRadius: fabSize / 2,
            justifyContent: 'center',
            alignItems: 'center',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Animated.View
            style={{
              transform: [
                { scale: scaleAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <Icon
              name={actions.length > 0 ? 'add' : icon}
              size={size === 'small' ? 20 : size === 'large' ? 28 : 24}
              color="white"
            />
          </Animated.View>
        </LinearGradient>
      );
    }

    return buttonContent;
  };

  const renderActions = () => {
    if (!isExpanded || actions.length === 0) return null;

    return (
      <View
        style={{
          position: 'absolute',
          ...getPosition(),
          bottom: getSize() + 16,
          right: 16,
        }}
      >
        {actions.map((action, index) => (
          <MotiView
            key={action.key}
            from={{
              opacity: 0,
              scale: 0.8,
              translateY: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              translateY: 0,
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
              delay: index * 50,
            }}
            style={{
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* Action Label */}
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                {action.label}
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={() => {
                action.onPress();
                setIsExpanded(false);
                if (hapticFeedback) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: action.color || colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: action.color || colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Icon
                name={action.icon}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </MotiView>
        ))}
      </View>
    );
  };

  return (
    <>
      {renderActions()}

      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[getPosition(), style]}
        activeOpacity={0.8}
      >
        {renderMainButton()}
      </TouchableOpacity>
    </>
  );
};

export default FloatingActionButton;
