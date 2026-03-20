import { useColorScheme } from 'react-native';
import { useTaskStore } from '@/store/useTaskStore';
import { Colors } from '@/constants/theme';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const themeOverride = useTaskStore(state => state.themeOverride);
  const activeScheme = themeOverride === 'system' ? (systemColorScheme ?? 'light') : themeOverride;
  return { colors: Colors[activeScheme], scheme: activeScheme };
}
