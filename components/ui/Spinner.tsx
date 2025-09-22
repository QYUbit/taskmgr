import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/Theme";
import { ActivityIndicator, View } from "react-native";

export default function Spinner({ theme }: { theme?: Colors }) {
  const colors = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}