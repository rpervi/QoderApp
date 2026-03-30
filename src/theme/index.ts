import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    primaryContainer: '#DBEAFE',
    secondary: '#7C3AED',
    secondaryContainer: '#EDE9FE',
    tertiary: '#0891B2',
    tertiaryContainer: '#CFFAFE',
    error: '#DC2626',
    errorContainer: '#FEE2E2',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#0F172A',
    onSurface: '#0F172A',
    onSurfaceVariant: '#475569',
    outline: '#CBD5E1',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F8FAFC',
      level3: '#F1F5F9',
      level4: '#E2E8F0',
      level5: '#CBD5E1',
    },
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    primaryContainer: '#1E3A5F',
    secondary: '#A78BFA',
    secondaryContainer: '#4C1D95',
    tertiary: '#22D3EE',
    tertiaryContainer: '#164E63',
    error: '#F87171',
    errorContainer: '#7F1D1D',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    onPrimary: '#0F172A',
    onSecondary: '#0F172A',
    onBackground: '#F1F5F9',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#94A3B8',
    outline: '#475569',
    elevation: {
      level0: 'transparent',
      level1: '#1E293B',
      level2: '#334155',
      level3: '#475569',
      level4: '#64748B',
      level5: '#94A3B8',
    },
  },
  roundness: 12,
};

export const colors = {
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#0891B2',
  infoLight: '#CFFAFE',
  hired: '#7C3AED',
  hiredLight: '#EDE9FE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
