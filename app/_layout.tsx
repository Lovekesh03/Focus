import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { syncNotificationsWithTasks } from '@/lib/notifications';

LogBox.ignoreAllLogs(true);
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTaskStore } from '@/store/useTaskStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const themeOverride = useTaskStore(state => state.themeOverride);
  const colorScheme = themeOverride === 'system' ? (systemColorScheme ?? 'light') : themeOverride;
  
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // On app launch, cancel any stale scheduled notifications that no longer
  // belong to a real incomplete task (e.g. tasks deleted while app was closed)
  // On app launch and task changes, sync scheduled notifications
  const tasks = useTaskStore(state => state.tasks);
  const hasHydrated = useTaskStore(state => state.hasHydrated);
  
  useEffect(() => {
    if (!hasHydrated) return;

    const incompletedIds = tasks
      .filter(t => !t.completed)
      .map(t => t.id);
      
    syncNotificationsWithTasks(incompletedIds);
  }, [hasHydrated, tasks.filter(t => !t.completed).map(t => t.id).join(',')]);

  if (!loaded && !error) {
    return null;
  }

  const CustomTheme = colorScheme === 'dark' ? 
    { ...DarkTheme, colors: { ...DarkTheme.colors, ...Colors.dark } } : 
    { ...DefaultTheme, colors: { ...DefaultTheme.colors, ...Colors.light } };

  return (
    <ThemeProvider value={CustomTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="task/[id]" options={{ presentation: 'modal', title: 'Task Details' }} />
        <Stack.Screen name="focus" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
