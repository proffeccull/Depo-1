import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface Props {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

const TextButton: React.FC<Props> = ({ title, onPress, disabled = false }) => (
  <TouchableOpacity style={styles.button} onPress={onPress} disabled={disabled} activeOpacity={0.7}>
    <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    ...typography.bodySmall,
    color: colors.secondary,
  },
  textDisabled: {
    color: colors.gray[500],
  },
});

export default TextButton;
