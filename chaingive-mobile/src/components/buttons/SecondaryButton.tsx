import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface Props {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

const SecondaryButton: React.FC<Props> = ({ title, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    ...typography.button,
    color: colors.primary,
  },
  disabled: {
    borderColor: colors.gray[500],
  },
  textDisabled: {
    color: colors.gray[500],
  },
});

export default SecondaryButton;
