import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContent}>
            <Icon
              name="error-outline"
              size={64}
              color={colors.error}
              style={styles.errorIcon}
            />

            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>
              We encountered an unexpected error. Please try again.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
              >
                <Icon name="refresh" size={20} color={colors.white} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => {
                  // Implement error reporting to analytics service
                  const errorDetails = {
                    error: this.state.error?.toString(),
                    stack: this.state.errorInfo?.componentStack,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                  };

                  // Send to analytics service (would be implemented)
                  console.log('Error reported:', errorDetails);

                  // TODO: Integrate with actual error reporting service like Sentry
                  // import * as Sentry from '@sentry/react-native';
                  // Sentry.captureException(this.state.error, { extra: errorDetails });
                }}
              >
                <Icon name="bug-report" size={20} color={colors.text.secondary} />
                <Text style={styles.reportButtonText}>Report Issue</Text>
              </TouchableOpacity>
            </View>

            {this.props.showDetails && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details:</Text>
                <Text style={styles.errorDetailsText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorDetailsText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    ...shadows.card,
  },
  errorIcon: {
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  reportButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
  },
  errorDetailsTitle: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  errorDetailsText: {
    ...typography.caption,
    color: colors.error,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default ErrorBoundary;