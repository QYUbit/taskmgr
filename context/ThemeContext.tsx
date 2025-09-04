import { colors } from '@/constants/colors';
import React from 'react';
import { useColorScheme } from 'react-native';

type Context = typeof colors.light | typeof colors.dark;

const ThemeContext = React.createContext<Context>(colors.dark);

interface Props {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
  const theme = useColorScheme() ?? 'light';
  const themeColors = colors[theme];

  return (
    <ThemeContext.Provider value={themeColors}>
      {children}
    </ThemeContext.Provider>
  );
};
