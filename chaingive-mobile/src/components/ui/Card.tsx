import React from 'react';
import { View, Platform } from 'react-native';
import { styled } from 'nativewind';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';

const StyledView = styled(View);
const StyledLinearGradient = styled(LinearGradient);
const StyledBlurView = styled(BlurView);

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'ghost' | 'glass' | 'frosted';
  className?: string;
  gradientColors?: string[];
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  gradientColors,
}) => {
  const baseClasses = 'rounded-2xl overflow-hidden';

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg dark:shadow-dark-lg',
    ghost: 'bg-transparent',
    glass: '', // Special handling for glass
    frosted: 'bg-white/30 dark:bg-gray-900/30',
  };

  const containerClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (variant === 'glass') {
    return (
      <StyledView className={`${baseClasses} ${className}`}>
        <StyledBlurView
          intensity={80}
          tint="light"
          className="absolute inset-0"
        />
        <StyledView className="p-6">{children}</StyledView>
      </StyledView>
    );
  }

  if (gradientColors && gradientColors.length > 0) {
    return (
      <StyledLinearGradient
        colors={gradientColors}
        className={`${baseClasses} p-6 ${className}`}
      >
        {children}
      </StyledLinearGradient>
    );
  }

  return (
    <StyledView className={`${containerClasses} p-6`}>
      {children}
    </StyledView>
  );
};

export default Card;