const shared = {
  primary: '#4A55A2',
  secondary: '#A0BFE0',
  accent: '#C5DFF8',
  success: '#48BB78',
  danger: '#F56565',
  heatmapLevel1: '#C5DFF8',
  heatmapLevel2: '#A0BFE0',
  heatmapLevel3: '#7895CB',
  heatmapLevel4: '#4A55A2',
};

export const Theme = {
  colors: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#2D3748',
    textMuted: '#A0AEC0',
    border: '#E2E8F0',
    heatmapBase: '#E2E8F0',
    ...shared
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    sizes: {
      xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32,
    }
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40,
  },
  radius: {
    sm: 8, md: 12, lg: 16, xl: 24, full: 9999,
  }
};

export const Colors = {
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#2D3748',
    textMuted: '#A0AEC0',
    border: '#E2E8F0',
    tint: shared.primary,
    icon: '#A0AEC0',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: shared.primary,
    heatmapBase: '#E2E8F0',
    ...shared
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#334155',
    tint: shared.primary,
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: shared.primary,
    heatmapBase: '#1E293B',
    ...shared,
    heatmapLevel1: '#1E3A8A',
    heatmapLevel2: '#2563EB',
    heatmapLevel3: '#3B82F6',
    heatmapLevel4: '#60A5FA',
  },
};
