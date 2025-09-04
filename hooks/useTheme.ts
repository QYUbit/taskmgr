import { ThemeContext } from "@react-navigation/native";
import { useContext } from "react";

export const useTheme = () => useContext(ThemeContext);