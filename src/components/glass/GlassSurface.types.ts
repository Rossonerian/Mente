import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type GlassTheme = 'caregiver' | 'patient';
export type GlassVariant = 'chrome' | 'elevated' | 'focus' | 'subtle';

export interface GlassSurfaceProps {
  children: ReactNode;
  theme?: GlassTheme;
  variant?: GlassVariant;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}

export interface GlassBackdropProps {
  children: ReactNode;
  theme: GlassTheme;
  style?: StyleProp<ViewStyle>;
}
