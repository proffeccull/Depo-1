import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = spacing.xs;
        baseStyle.paddingHorizontal = spacing.sm;
        break;
      case 'large':
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.lg;
        break;
      default:
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
    }

    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary;
        break;
      case 'text':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'danger':
        baseStyle.backgroundColor = colors.error;
        break;
    }

    if (disabled || loading) {
      baseStyle.backgroundColor = colors.gray[400];
      if (variant === 'outline') {
        baseStyle.borderColor = colors.gray[400];
      }
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...typography.button,
      fontWeight: '600',
    };

    // Size
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = 12;
        break;
      case 'large':
        baseTextStyle.fontSize = 18;
        break;
      default:
        baseTextStyle.fontSize = 16;
    }

    // Variant
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        baseTextStyle.color = colors.white;
        break;
      case 'outline':
      case 'text':
        baseTextStyle.color = colors.primary;
        break;
    }

    if (disabled || loading) {
      baseTextStyle.color = colors.gray[600];
      if (variant === 'outline' || variant === 'text') {
        baseTextStyle.color = colors.gray[500];
      }
    }

    return baseTextStyle;
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconColor = getTextStyle().color as string;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={iconSize}
              color={iconColor}
              style={{ marginRight: spacing.xs }}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={iconSize}
              color={iconColor}
              style={{ marginLeft: spacing.xs }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
