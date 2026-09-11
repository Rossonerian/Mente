import type { TrendStatus } from '../types';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const typeScale = {
  display: 32,
  title: 26,
  section: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
} as const;

export type TypeScale = typeof typeScale;

export const caregiverTheme = {
  colors: {
    primary: '#3448D8',
    primaryPressed: '#2638AF',
    background: '#F8FAFF',
    surface: '#FFFFFF',
    surfaceWarm: '#FFF7F2',
    surfaceMuted: '#EEF0FF',
    text: '#202443',
    textMuted: '#5D6480',
    textFaint: '#7A819A',
    border: '#E2E5F0',
    stable: '#18704A',
    stableBackground: '#E6F5ED',
    watch: '#8E5B08',
    watchBackground: '#FFF2D8',
    declining: '#A43A36',
    decliningBackground: '#FCE7E5',
    alert: '#B7442F',
    alertBackground: '#FFF0EC',
    coralSoft: '#FFF0EC',
    forestSoft: '#E6F5ED',
    white: '#FFFFFF',
  },
  radii: {
    card: 16,
    control: 12,
    pill: 999,
  },
  typography: {
    display: 32,
    title: 26,
    section: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
  },
} as const;

export const patientTheme = {
  colors: {
    primary: '#B7442F',
    primaryPressed: '#963625',
    background: '#FFFCF5',
    surface: '#FFFFFF',
    surfaceMuted: '#FFF0E5',
    surfaceWarm: '#FFF0E5',
    text: '#32251F',
    textMuted: '#6E5A51',
    textFaint: '#8B756B',
    border: '#EADDD2',
    focus: '#F5DDCC',
    forest: '#3D6A52',
    forestSoft: '#E7F0EA',
    coralSoft: '#FBE6DC',
    alert: '#B7442F',
    alertBackground: '#FBE6DC',
    white: '#FFFFFF',
  },
  radii: {
    card: 24,
    control: 16,
    pill: 999,
  },
  typography: {
    display: 34,
    title: 28,
    section: 20,
    body: 18,
    bodySmall: 16,
    caption: 14,
  },
} as const;

export type CaregiverTheme = typeof caregiverTheme;
export type PatientTheme = typeof patientTheme;

export function getTrendColors(status: TrendStatus) {
  if (status === 'stable') {
    return { foreground: caregiverTheme.colors.stable, background: caregiverTheme.colors.stableBackground };
  }

  if (status === 'declining') {
    return { foreground: caregiverTheme.colors.declining, background: caregiverTheme.colors.decliningBackground };
  }

  return { foreground: caregiverTheme.colors.watch, background: caregiverTheme.colors.watchBackground };
}
