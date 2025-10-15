import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

interface GradientCardProps {
  children: React.ReactNode;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  shadow?: boolean;
}

const GradientCard: React.FC<GradientCardProps> = ({
  children,
  colors: gradientColors = [colors.primary, colors.primaryDark || colors.secondary],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  shadow = true,
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={start}
      end={end}
      style={[
        styles.gradient,
        shadow && shadows.medium,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    padding: spacing.lg,
    overflow: 'hidden',
  },
});

export default GradientCard;
