import { ThemeProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
