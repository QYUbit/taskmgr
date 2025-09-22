import { Colors, colors } from "@/constants/colors";
import React, { createContext, ReactNode, useContext } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext<Colors | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useColorScheme() ?? 'light';
  const themedColors = colors[theme];

  return (
    <ThemeContext value={themedColors}>
      {children}
    </ThemeContext>
  )
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
    if (!context) {
      throw new Error('useTheme must be used within an ThemeProvider');
    }
    return context;
};
