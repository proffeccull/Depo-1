import React, { createContext, useContext, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HapticFeedbackContextType {
  light: () => void;
  medium: () => void;
  heavy: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
  selection: () => void;
  custom: (pattern: number[]) => void;
  notification: (type: 'success' | 'warning' | 'error') => void;
}

const HapticFeedbackContext = createContext<HapticFeedbackContextType | null>(null);

interface HapticFeedbackProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const HapticFeedbackProvider: React.FC<HapticFeedbackProviderProps> = ({
  children,
  enabled = true,
}) => {
  const light = useCallback(() => {
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [enabled]);

  const medium = useCallback(() => {
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [enabled]);

  const heavy = useCallback(() => {
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [enabled]);

  const success = useCallback(() => {
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [enabled]);

  const warning = useCallback(() => {
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [enabled]);

  const error = useCallback(() => {
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [enabled]);

  const selection = useCallback(() => {
    if (enabled) {
      Haptics.selectionAsync();
    }
  }, [enabled]);

  const custom = useCallback((pattern: number[]) => {
    if (enabled) {
      // Note: Expo Haptics doesn't support custom patterns directly
      // This would require native implementation
      console.warn('Custom haptic patterns not supported in Expo Haptics');
    }
  }, [enabled]);

  const notification = useCallback((type: 'success' | 'warning' | 'error') => {
    if (enabled) {
      const feedbackType = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
      }[type];

      Haptics.notificationAsync(feedbackType);
    }
  }, [enabled]);

  const value: HapticFeedbackContextType = {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    custom,
    notification,
  };

  return (
    <HapticFeedbackContext.Provider value={value}>
      {children}
    </HapticFeedbackContext.Provider>
  );
};

export const useHapticFeedback = (): HapticFeedbackContextType => {
  const context = useContext(HapticFeedbackContext);
  if (!context) {
    throw new Error('useHapticFeedback must be used within a HapticFeedbackProvider');
  }
  return context;
};

// Haptic Button Component
interface HapticButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';
  disabled?: boolean;
  style?: any;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  onPress,
  hapticType = 'medium',
  disabled = false,
  style,
}) => {
  const haptics = useHapticFeedback();

  const handlePress = () => {
    if (!disabled) {
      switch (hapticType) {
        case 'light':
          haptics.light();
          break;
        case 'medium':
          haptics.medium();
          break;
        case 'heavy':
          haptics.heavy();
          break;
        case 'success':
          haptics.success();
          break;
        case 'warning':
          haptics.warning();
          break;
        case 'error':
          haptics.error();
          break;
        case 'selection':
          haptics.selection();
          break;
      }
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={style}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

// Haptic Wrapper Component
interface HapticWrapperProps {
  children: React.ReactNode;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';
  trigger?: 'press' | 'longPress' | 'mount';
}

export const HapticWrapper: React.FC<HapticWrapperProps> = ({
  children,
  hapticType = 'medium',
  trigger = 'press',
}) => {
  const haptics = useHapticFeedback();

  const handleTrigger = () => {
    switch (hapticType) {
      case 'light':
        haptics.light();
        break;
      case 'medium':
        haptics.medium();
        break;
      case 'heavy':
        haptics.heavy();
        break;
      case 'success':
        haptics.success();
        break;
      case 'warning':
        haptics.warning();
        break;
      case 'error':
        haptics.error();
        break;
      case 'selection':
        haptics.selection();
        break;
    }
  };

  React.useEffect(() => {
    if (trigger === 'mount') {
      handleTrigger();
    }
  }, []);

  if (trigger === 'press') {
    return (
      <TouchableOpacity onPress={handleTrigger} activeOpacity={1}>
        {children}
      </TouchableOpacity>
    );
  }

  if (trigger === 'longPress') {
    return (
      <TouchableOpacity onLongPress={handleTrigger} activeOpacity={1}>
        {children}
      </TouchableOpacity>
    );
  }

  return <>{children}</>;
};

export default HapticFeedbackProvider;