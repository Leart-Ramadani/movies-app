import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';

const GlassCard = ({ children, style, intensity = 55 }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrapper, { borderColor: theme.colors.border, shadowColor: theme.colors.shadow }, style]}>
      <BlurView intensity={intensity} tint={theme.mode} style={styles.blur}>
        <View style={[styles.inner, { backgroundColor: theme.colors.surface }]}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6
  },
  blur: {
    flex: 1
  },
  inner: {
    padding: 16
  }
});

export default GlassCard;