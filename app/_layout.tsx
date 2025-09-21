import Spinner from "@/components/ui/Spinner";
import { useEventJobs } from "@/hooks/useEventJobs";
import { useTheme } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const { execute, loading } = useEventJobs();
  const theme = useTheme();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        execute();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    execute();

    return () => sub.remove();
  }, [execute]);

  if (loading) {
    return <Spinner theme={theme} />
  }

  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}