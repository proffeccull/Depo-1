/**
 * Logger Utility
 * Centralized logging with environment-aware output
 * Integrates with error tracking services in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  screen?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDev: boolean;

  constructor() {
    this.isDev = __DEV__;
  }

  /**
   * Debug logs - Only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logs - General information
   */
  info(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, context || '');
    }
    // In production, send to analytics service
    this.sendToAnalytics('info', message, context);
  }

  /**
   * Warning logs - Non-critical issues
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    // In production, send to monitoring service
    this.sendToMonitoring('warn', message, context);
  }

  /**
   * Error logs - Critical issues
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorInfo = {
      message,
      error: error?.message,
      stack: error?.stack,
      ...context,
    };

    if (this.isDev) {
      console.error(`[ERROR] ${message}`, errorInfo);
    }

    // In production, send to error tracking service (Sentry, etc.)
    this.sendToErrorTracking(error, errorInfo);
  }

  /**
   * Send to analytics service
   */
  private sendToAnalytics(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.isDev) {
      // TODO: Integrate with analytics service (Firebase, Mixpanel, etc.)
      // Example: Firebase Analytics integration
      // import analytics from '@react-native-firebase/analytics';
      // await analytics().logEvent('custom_log', { message, ...context });
    }
  }

  /**
   * Send to monitoring service
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.isDev) {
      // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
      // Example: Sentry integration
      // import * as Sentry from '@sentry/react-native';
      // Sentry.captureMessage(message, { level: this.getSentryLevel(level), extra: context });
    }
  }

  /**
   * Send to error tracking service
   */
  private sendToErrorTracking(error?: Error, context?: any): void {
    if (!this.isDev && error) {
      // TODO: Integrate with error tracking service (Sentry)
      // Example: Sentry integration
      // import * as Sentry from '@sentry/react-native';
      // Sentry.captureException(error, { extra: context });
    }
  }

  /**
   * Log API request
   */
  logApiRequest(method: string, url: string, duration?: number): void {
    if (this.isDev) {
      const durationStr = duration ? ` (${duration}ms)` : '';
      console.log(`[API] ${method} ${url}${durationStr}`);
    }
  }

  /**
   * Log API error
   */
  logApiError(method: string, url: string, status: number, error: string): void {
    const message = `API Error: ${method} ${url} - ${status}`;
    this.error(message, new Error(error), { method, url, status });
  }

  /**
   * Log user action
   */
  logUserAction(action: string, screen: string, data?: any): void {
    this.info(`User Action: ${action}`, { screen, action, ...data });
  }

  /**
   * Log navigation
   */
  logNavigation(from: string, to: string): void {
    this.debug(`Navigation: ${from} → ${to}`, { from, to });
  }
}

// Export singleton instance
export default new Logger();
