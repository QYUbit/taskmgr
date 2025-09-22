import { ConfigProvider } from "@/context/Config";
import { ThemeProvider } from "@/context/Theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  //const { execute, loading } = useEventJobs();
//
  //useEffect(() => {
  //  const handleAppStateChange = (nextAppState: AppStateStatus) => {
  //    if (nextAppState === 'active') {
  //      console.log('execute')
  //      execute();
  //    }
  //  };
//
  //  const sub = AppState.addEventListener('change', handleAppStateChange);
//
  //  return () => sub.remove();
  //}, [execute]);
//
  //if (loading) {
  //  return <Spinner />
  //}

  return (
    <ThemeProvider>
      <ConfigProvider>
        <GestureHandlerRootView>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      </ConfigProvider>
    </ThemeProvider>
  );
}