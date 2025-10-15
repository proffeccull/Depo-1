import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

interface AdvancedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'premium' | 'ghost' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  ripple?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

const AdvancedButton: React.FC<AdvancedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  gradient = false,
  ripple = true,
  haptic = 'medium',
  style,
  textStyle,
  children,
}) => {
  const [pressed, setPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 3,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;

    if (haptic !== 'none') {
      const hapticMap = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      Haptics.impactAsync(hapticMap[haptic as keyof typeof hapticMap]);
    }

    onPress();
  };

  const getVariantStyles = () => {
    const baseStyles = 'flex-row items-center justify-center rounded-2xl shadow-lg transition-all duration-300';

    switch (variant) {
      case 'primary':
        return gradient
          ? 'bg-transparent'
          : `${baseStyles} bg-primary-500`;
      case 'secondary':
        return `${baseStyles} bg-secondary-500`;
      case 'premium':
        return gradient
          ? 'bg-transparent'
          : `${baseStyles} bg-gradient-to-r from-primary-400 to-primary-600`;
      case 'ghost':
        return `${baseStyles} bg-transparent border border-primary-500`;
      case 'outline':
        return `${baseStyles} bg-transparent border-2 border-primary-500`;
      case 'danger':
        return `${baseStyles} bg-red-500`;
      default:
        return `${baseStyles} bg-primary-500`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 h-10';
      case 'medium':
        return 'px-6 py-3 h-12';
      case 'large':
        return 'px-8 py-4 h-14';
      default:
        return 'px-6 py-3 h-12';
    }
  };

  const getTextStyles = () => {
    const baseText = 'font-bold tracking-wide';

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'premium':
      case 'danger':
        return `${baseText} text-white`;
      case 'ghost':
      case 'outline':
        return `${baseText} text-primary-500`;
      default:
        return `${baseText} text-white`;
    }
  };

  const getSizeTextStyles = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const iconSize = size === 'small' ? 18 : size === 'medium' ? 20 : 24;
  const iconColor = ['primary', 'secondary', 'premium', 'danger'].includes(variant) ? 'white' : colors.primary;

  const gradientColors = variant === 'premium'
    ? [colors.primary, colors.secondary]
    : variant === 'primary'
    ? [colors.primary, colors.primaryDark]
    : [colors.primary, colors.primary];

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={iconSize}
              color={iconColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              {
                fontWeight: 'bold',
                letterSpacing: 0.5,
                color: ['primary', 'secondary', 'premium', 'danger'].includes(variant) ? 'white' : colors.primary,
                fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={iconSize}
              color={iconColor}
              style={{ marginLeft: 8 }}
            />
          )}
          {children}
        </>
      )}
    </>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <MotiView
        from={{ opacity: 1 }}
        animate={{ opacity: disabled ? 0.5 : 1 }}
        transition={{ type: 'timing', duration: 200 }}
      >
        {gradient && ['primary', 'premium'].includes(variant) ? (
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={ripple ? 0.8 : 1}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                overflow: 'hidden',
                paddingHorizontal: size === 'small' ? 16 : size === 'medium' ? 24 : 32,
                paddingVertical: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
                height: size === 'small' ? 40 : size === 'medium' ? 48 : 56,
              },
              style,
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                borderRadius: 16,
              }}
            />
            <ButtonContent />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={ripple ? 0.8 : 1}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                backgroundColor:
                  variant === 'primary'
                    ? colors.primary
                    : variant === 'secondary'
                    ? colors.secondary
                    : variant === 'premium'
                    ? colors.primary
                    : variant === 'danger'
                    ? colors.error
                    : 'transparent',
                borderWidth: variant === 'outline' || variant === 'ghost' ? 2 : 0,
                borderColor: colors.primary,
                paddingHorizontal: size === 'small' ? 16 : size === 'medium' ? 24 : 32,
                paddingVertical: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
                height: size === 'small' ? 40 : size === 'medium' ? 48 : 56,
              },
              style,
            ]}
          >
            <ButtonContent />
          </TouchableOpacity>
        )}
      </MotiView>
    </Animated.View>
  );
};

export default AdvancedButton;