import React from 'react';
import {
  Text,
  TextProps,
  AccessibilityInfo,
  Platform,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

interface AccessibleTextProps extends TextProps {
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'header' | 'text' | 'button' | 'link' | 'summary';
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'normal' | 'bold' | 'semibold' | 'light';
  color?: string;
  highContrast?: boolean;
  selectable?: boolean;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  style?: ViewStyle;
}

const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'text',
  importantForAccessibility = 'auto',
  size = 'medium',
  weight = 'normal',
  color = colors.text.primary,
  highContrast = false,
  selectable = false,
  numberOfLines,
  ellipsizeMode,
  style,
  ...props
}) => {
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      case 'xlarge':
        return 20;
      default:
        return 16;
    }
  };

  const getFontWeight = (): 'normal' | 'bold' | '300' | '400' | '600' | '700' => {
    switch (weight) {
      case 'light':
        return '300';
      case 'normal':
        return 'normal';
      case 'semibold':
        return '600';
      case 'bold':
        return 'bold';
      default:
        return 'normal';
    }
  };

  const getAccessibilityRole = () => {
    switch (accessibilityRole) {
      case 'header':
        return 'header';
      case 'button':
        return 'button';
      case 'link':
        return 'link';
      case 'summary':
        return 'summary';
      default:
        return undefined;
    }
  };

  const getAccessibilityLabel = () => {
    if (accessibilityLabel) {
      return accessibilityLabel;
    }

    // Auto-generate accessibility label from children if it's a string
    if (typeof children === 'string') {
      return children;
    }

    return undefined;
  };

  const textStyle = {
    fontSize: getFontSize(),
    fontWeight: getFontWeight(),
    color: highContrast ? '#000000' : color,
    backgroundColor: highContrast ? '#FFFFFF' : 'transparent',
    ...style,
  };

  return (
    <Text
      style={textStyle}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={accessibilityHint}
      accessibilityRole={getAccessibilityRole()}
      importantForAccessibility={importantForAccessibility}
      selectable={selectable}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      allowFontScaling={true}
      maxFontSizeMultiplier={2}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AccessibleText;