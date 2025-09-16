import { colors } from '@/constants/colors';
import { useColorScheme } from 'react-native';

export function useTheme() {
  const theme = useColorScheme() ?? 'light';
  return colors[theme]
}