import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const Chip = ({ label, active, onPress }) => {
  const { theme } = useTheme();
  const color = active ? theme.colors.text : theme.colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: theme.colors.border, backgroundColor: active ? theme.colors.surfaceStrong : 'transparent' }
      ]}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  label: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export default Chip;