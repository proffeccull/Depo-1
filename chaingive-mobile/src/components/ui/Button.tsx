import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-2xl shadow-lg transition-all duration-300',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500',
        secondary: 'bg-secondary-500',
        outline: 'bg-transparent border-2 border-primary-500',
        ghost: 'bg-transparent',
        premium: 'bg-gradient-to-r from-primary-400 to-primary-600',
      },
      size: {
        small: 'px-4 py-2 h-10',
        medium: 'px-6 py-3 h-12',
        large: 'px-8 py-4 h-14',
      },
      disabled: {
        true: 'opacity-50',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
);

const textVariants = cva('font-bold tracking-wide', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary-500',
      ghost: 'text-primary-500',
      premium: 'text-white',
    },
    size: {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  label: string;
  onPress: () => void;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  haptic?: 'light' | 'medium' | 'heavy';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant,
  size,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  haptic = 'medium',
  className,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;

    const hapticMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    Haptics.impactAsync(hapticMap[haptic]);

    onPress();
  };

  const iconSize = size === 'small' ? 18 : size === 'medium' ? 20 : 24;
  const iconColor =
    variant === 'primary' || variant === 'secondary' || variant === 'premium'
      ? 'white'
      : 'rgb(var(--color-primary-500))';

  return (
    <MotiView
      from={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <StyledTouchableOpacity
        className={buttonVariants({ variant, size, disabled, className })}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
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
            <StyledText className={textVariants({ variant, size })}>
              {label}
            </StyledText>
            {icon && iconPosition === 'right' && (
              <Icon
                name={icon}
                size={iconSize}
                color={iconColor}
                style={{ marginLeft: 8 }}
              />
            )}
          </>
        )}
      </StyledTouchableOpacity>
    </MotiView>
  );
};

export default Button;