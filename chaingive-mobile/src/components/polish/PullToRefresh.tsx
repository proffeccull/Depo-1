import React, { useRef, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  RefreshControl,
  RefreshControlProps,
  ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  pullDistance?: number;
  refreshThreshold?: number;
  style?: ViewStyle;
  customRefreshControl?: React.ReactNode;
  hapticFeedback?: boolean;
  showSpinner?: boolean;
  spinnerColor?: string;
  pullText?: string;
  releaseText?: string;
  refreshingText?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  pullDistance = 80,
  refreshThreshold = 60,
  style,
  customRefreshControl,
  hapticFeedback = true,
  showSpinner = true,
  spinnerColor = colors.primary,
  pullText = 'Pull to refresh',
  releaseText = 'Release to refresh',
  refreshingText = 'Refreshing...',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const pullAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullProgress(0);
      setCanRefresh(false);

      Animated.spring(pullAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [onRefresh, hapticFeedback, pullAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && scrollY._value === 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 && scrollY._value === 0) {
          const progress = Math.min(gestureState.dy / pullDistance, 1);
          setPullProgress(progress);
          setCanRefresh(gestureState.dy >= refreshThreshold);

          pullAnim.setValue(gestureState.dy);
          rotateAnim.setValue(progress * 360);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy >= refreshThreshold && !isRefreshing) {
          handleRefresh();
        } else {
          Animated.spring(pullAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start(() => {
            setPullProgress(0);
            setCanRefresh(false);
          });
        }
      },
    })
  ).current;

  const renderRefreshIndicator = () => {
    if (customRefreshControl) {
      return customRefreshControl;
    }

    return (
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{
          position: 'absolute',
          top: -60,
          left: 0,
          right: 0,
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Animated.View
            style={{
              transform: [{ rotate: rotateAnim.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }) }],
              marginRight: 8,
            }}
          >
            <Icon
              name={isRefreshing ? 'refresh' : canRefresh ? 'arrow-downward' : 'arrow-downward'}
              size={20}
              color={spinnerColor}
            />
          </Animated.View>

          <Text style={{
            fontSize: 14,
            color: colors.text.primary,
            fontWeight: '500',
          }}>
            {isRefreshing
              ? refreshingText
              : canRefresh
                ? releaseText
                : pullText
            }
          </Text>
        </View>
      </MotiView>
    );
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      {renderRefreshIndicator()}

      <Animated.ScrollView
        style={{
          transform: [{ translateY: pullAnim }],
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        {...panResponder.panHandlers}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[spinnerColor]}
            tintColor={spinnerColor}
            title={isRefreshing ? refreshingText : pullText}
          />
        }
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
};

export default PullToRefresh;