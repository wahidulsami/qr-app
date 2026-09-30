import '@/global.css';
import { Platform } from 'react-native';

export interface BadgeStyle {
  bg: string;
  text: string;
  border: string;
}

export interface AppTheme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceSubtle: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentContrast: string;
  danger: string;
  dangerBg: string;
  success: string;
  successBg: string;
  badgeUrl: BadgeStyle;
  badgeWifi: BadgeStyle;
  badgeContact: BadgeStyle;
  badgeEmail: BadgeStyle;
  badgeText: BadgeStyle;
}

export const ThemeTokens: { light: AppTheme; dark: AppTheme } = {
  light: {
    background: '#F9F8F6',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1EFEA',
    surfaceSubtle: '#F6F5F2',
    border: '#E6E4DD',
    borderSubtle: '#ECEAE4',
    text: '#141413',
    textSecondary: '#666560',
    textMuted: '#9B9990',
    accent: '#141413',
    accentContrast: '#FFFFFF',
    danger: '#D9383A',
    dangerBg: '#FDEBEC',
    success: '#2B7A4B',
    successBg: '#EDF5EE',

    // Badges & Pastels
    badgeUrl: { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB' },
    badgeWifi: { bg: '#EDF5EE', text: '#2B7A4B', border: '#C8E6C9' },
    badgeContact: { bg: '#FEF8E7', text: '#8D6B00', border: '#FFE082' },
    badgeEmail: { bg: '#FDEBEC', text: '#C62828', border: '#FFCDD2' },
    badgeText: { bg: '#EFEFEF', text: '#424242', border: '#E0E0E0' },
  },
  dark: {
    background: '#09090B',
    surface: '#121215',
    surfaceSecondary: '#18181C',
    surfaceSubtle: '#1C1C21',
    border: '#27272E',
    borderSubtle: '#1F1F24',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    accent: '#FAFAFA',
    accentContrast: '#09090B',
    danger: '#F87171',
    dangerBg: '#361517',
    success: '#4ADE80',
    successBg: '#102C1B',

    // Badges & Pastels
    badgeUrl: { bg: '#0D2947', text: '#70B8FF', border: '#17406E' },
    badgeWifi: { bg: '#102C1B', text: '#6EE7B7', border: '#1B472C' },
    badgeContact: { bg: '#2E2205', text: '#FCD34D', border: '#4E3A0B' },
    badgeEmail: { bg: '#361517', text: '#FCA5A5', border: '#5B1E22' },
    badgeText: { bg: '#222227', text: '#D4D4D8', border: '#33333A' },
  },
};

export const Colors = {
  light: {
    text: ThemeTokens.light.text,
    background: ThemeTokens.light.background,
    backgroundElement: ThemeTokens.light.surfaceSecondary,
    backgroundSelected: ThemeTokens.light.border,
    textSecondary: ThemeTokens.light.textSecondary,
  },
  dark: {
    text: ThemeTokens.dark.text,
    background: ThemeTokens.dark.background,
    backgroundElement: ThemeTokens.dark.surfaceSecondary,
    backgroundSelected: ThemeTokens.dark.border,
    textSecondary: ThemeTokens.dark.textSecondary,
  },
} as const;

export type ThemeColor = 'text' | 'background' | 'backgroundElement' | 'backgroundSelected' | 'textSecondary';

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Typography = {
  mono: Platform.select({
    ios: 'ui-monospace',
    android: 'monospace',
    default: 'monospace',
  }),
  sans: Platform.select({
    ios: 'system-ui',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 720;
