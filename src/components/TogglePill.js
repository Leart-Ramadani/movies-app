import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const TogglePill = ({ options, value, onChange }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.pill,
              { backgroundColor: active ? theme.colors.surfaceStrong : 'transparent' }
            ]}
          >
            <Text style={[styles.label, { color: active ? theme.colors.text : theme.colors.textMuted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 999,
    padding: 4
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999
  },
  label: {
    fontSize: 12,
    fontWeight: '700'
  }
});

export default TogglePill;