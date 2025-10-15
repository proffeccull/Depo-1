import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface LoadingSpinnerProps {
  visible: boolean;
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  text = 'Loading...',
  size = 'large',
  color = colors.primary,
  overlay = true,
  fullScreen = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return null;

  const spinner = (
    <Animated.View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { opacity: fadeAnim },
      ]}
    >
      <View style={styles.spinnerContent}>
        <ActivityIndicator
          size={size}
          color={color}
          style={styles.spinner}
        />
        {text && (
          <Text style={[styles.text, { color }]}>{text}</Text>
        )}
      </View>
    </Animated.View>
  );

  if (overlay) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          {spinner}
        </View>
      </Modal>
    );
  }

  return spinner;
};

// Skeleton loader for content
interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Loading state wrapper for async operations
interface LoadingStateProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingText?: string;
  errorText?: string;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  onRetry,
  loadingText = 'Loading...',
  errorText = 'Something went wrong',
  children,
}) => {
  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <LoadingSpinner visible={true} text={loadingText} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>{errorText}</Text>
          <Text style={styles.errorDetails}>{error}</Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

// Hook for managing loading states
export const useLoadingState = (initialLoading = false) => {
  const [loading, setLoading] = React.useState(initialLoading);
  const [error, setError] = React.useState<string | null>(null);

  const startLoading = React.useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = React.useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingError = React.useCallback((errorMessage: string) => {
    setLoading(false);
    setError(errorMessage);
  }, []);

  const reset = React.useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset,
  };
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  spinnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: spacing.md,
  },
  text: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeleton: {
    backgroundColor: colors.gray[200],
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorDetails: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});