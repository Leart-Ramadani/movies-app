import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import GlassCard from './GlassCard';

const SearchBar = ({ value, onChangeText, placeholder }) => {
  const { theme } = useTheme();
  return (
    <GlassCard style={styles.card} intensity={50}>
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { color: theme.colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  input: {
    fontSize: 16,
    fontWeight: '600'
  }
});

export default SearchBar;