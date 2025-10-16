import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { colors, spacing } from '../../theme';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  disabled = false,
  ...touchableProps
}) => {
  const cardStyle = [
    styles.card,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;