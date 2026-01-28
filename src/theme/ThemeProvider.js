import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from './colors';

const STORAGE_KEY = 'theme.preference';

const ThemeContext = createContext({
  theme: darkTheme,
  mode: 'dark',
  setMode: () => {},
  isReady: false
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setModeState(stored);
      } finally {
        setIsReady(true);
      }
    };
    load();
  }, []);

  const setMode = async (value) => {
    setModeState(value);
    await AsyncStorage.setItem(STORAGE_KEY, value);
  };

  const resolvedMode = mode === 'system' ? systemScheme || 'dark' : mode;
  const theme = resolvedMode === 'light' ? lightTheme : darkTheme;

  const contextValue = useMemo(
    () => ({ theme, mode, setMode, isReady }),
    [theme, mode, isReady]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);