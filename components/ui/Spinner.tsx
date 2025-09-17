import { Colors } from "@/constants/colors";
import { ActivityIndicator, View } from "react-native";

export default function Spinner({ theme }: { theme: Colors }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}