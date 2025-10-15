import React from 'react';
import { View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { MotiView } from 'moti';
import { colors } from '../../theme/colors';

interface CustomIconProps {
  name: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  gradient?: boolean;
  gradientColors?: string[];
  rounded?: boolean;
  shadow?: boolean;
  animated?: boolean;
  animationType?: 'bounce' | 'pulse' | 'rotate' | 'scale';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 24,
  color = colors.primary,
  backgroundColor = 'transparent',
  gradient = false,
  gradientColors = [colors.primary, colors.secondary],
  rounded = false,
  shadow = false,
  animated = false,
  animationType = 'bounce',
  style,
  onPress,
  disabled = false,
}) => {
  const getAnimationProps = () => {
    if (!animated) return {};

    switch (animationType) {
      case 'bounce':
        return {
          from: { scale: 1 },
          animate: { scale: 1.1 },
          transition: {
            type: 'spring',
            damping: 10,
            stiffness: 100,
            loop: true,
          },
        };
      case 'pulse':
        return {
          from: { opacity: 1 },
          animate: { opacity: 0.7 },
          transition: {
            type: 'timing',
            duration: 1000,
            loop: true,
          },
        };
      case 'rotate':
        return {
          from: { rotate: '0deg' },
          animate: { rotate: '360deg' },
          transition: {
            type: 'timing',
            duration: 2000,
            loop: true,
          },
        };
      case 'scale':
        return {
          from: { scale: 0.8 },
          animate: { scale: 1.2 },
          transition: {
            type: 'timing',
            duration: 1500,
            loop: true,
          },
        };
      default:
        return {};
    }
  };

  const iconSize = size * 0.6; // Icon takes up 60% of the container
  const containerSize = size;

  const IconComponent = () => (
    <Icon
      name={name}
      size={iconSize}
      color={gradient ? 'white' : color}
    />
  );

  const ContainerComponent = () => (
    <View
      style={[
        {
          width: containerSize,
          height: containerSize,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: gradient ? 'transparent' : backgroundColor,
          borderRadius: rounded ? containerSize / 2 : 0,
          shadowColor: shadow ? '#000' : undefined,
          shadowOffset: shadow ? { width: 0, height: 2 } : undefined,
          shadowOpacity: shadow ? 0.25 : undefined,
          shadowRadius: shadow ? 4 : undefined,
          elevation: shadow ? 5 : undefined,
        },
        style,
      ]}
    >
      {gradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: rounded ? containerSize / 2 : 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconComponent />
        </LinearGradient>
      ) : (
        <IconComponent />
      )}
    </View>
  );

  if (animated) {
    return (
      <MotiView {...getAnimationProps()}>
        <ContainerComponent />
      </MotiView>
    );
  }

  return <ContainerComponent />;
};

export default CustomIcon;