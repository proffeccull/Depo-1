import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
  speed?: number;
  gradientColors?: string[];
  backgroundColor?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
  speed = 1000,
  gradientColors = ['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent'],
  backgroundColor = colors.gray[200],
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const startShimmer = () => {
        Animated.loop(
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: speed,
            useNativeDriver: true,
          })
        ).start();
      };
      startShimmer();
    }
  }, [animated, speed, shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const getWidth = () => {
    if (typeof width === 'number') return width;
    if (typeof width === 'string' && width.endsWith('%')) {
      return (parseFloat(width) / 100) * SCREEN_WIDTH;
    }
    return SCREEN_WIDTH;
  };

  return (
    <View
      style={[
        {
          width: getWidth(),
          height,
          backgroundColor,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {animated && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateX }],
          }}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flex: 1,
            }}
          />
        </Animated.View>
      )}
    </View>
  );
};

// Predefined skeleton components
export const SkeletonText: React.FC<Omit<SkeletonLoaderProps, 'height' | 'borderRadius'> & {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
}> = ({
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  ...props
}) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={lineHeight}
          borderRadius={4}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
          {...props}
        />
      ))}
    </View>
  );
};

export const SkeletonAvatar: React.FC<Omit<SkeletonLoaderProps, 'width' | 'height' | 'borderRadius'> & {
  size?: number;
}> = ({
  size = 40,
  ...props
}) => {
  return (
    <SkeletonLoader
      width={size}
      height={size}
      borderRadius={size / 2}
      {...props}
    />
  );
};

export const SkeletonCard: React.FC<{
  animated?: boolean;
  speed?: number;
  style?: ViewStyle;
}> = ({
  animated = true,
  speed = 1000,
  style,
}) => {
  return (
    <View
      style={[
        {
          padding: 16,
          backgroundColor: colors.background.secondary,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <SkeletonAvatar size={32} animated={animated} speed={speed} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <SkeletonLoader
            width="60%"
            height={14}
            animated={animated}
            speed={speed}
          />
          <SkeletonLoader
            width="40%"
            height={12}
            style={{ marginTop: 4 }}
            animated={animated}
            speed={speed}
          />
        </View>
      </View>

      {/* Content */}
      <SkeletonText
        lines={3}
        lineHeight={14}
        spacing={6}
        animated={animated}
        speed={speed}
      />

      {/* Footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <SkeletonLoader
          width="30%"
          height={12}
          animated={animated}
          speed={speed}
        />
        <SkeletonLoader
          width="20%"
          height={12}
          animated={animated}
          speed={speed}
        />
      </View>
    </View>
  );
};

export const SkeletonList: React.FC<{
  itemCount?: number;
  animated?: boolean;
  speed?: number;
  style?: ViewStyle;
}> = ({
  itemCount = 5,
  animated = true,
  speed = 1000,
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={{ marginBottom: index < itemCount - 1 ? 12 : 0 }}>
          <SkeletonCard animated={animated} speed={speed} />
        </View>
      ))}
    </View>
  );
};

export default SkeletonLoader;