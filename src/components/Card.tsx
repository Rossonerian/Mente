import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens-enhanced';

const cardShadow = Platform.select({
  web: { boxShadow: '0 2px 8px rgba(27, 34, 69, 0.04)' },
  default: {
    elevation: 1,
    shadowColor: '#1B2245',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
});

export type ThemeName = 'caregiver' | 'patient';

interface CardProps {
  children: ReactNode;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export function SurfaceCard({ children, theme = 'caregiver', style, accessible, accessibilityLabel }: CardProps) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;

  return (
    <View
      style={[
        styles.card,
        cardShadow,
        {
          backgroundColor: tokens.colors.surface,
          borderColor: theme === 'patient' ? tokens.colors.border : 'transparent',
          borderRadius: tokens.radii.card,
        },
        style,
      ]}
      accessible={accessible ?? Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

export function SoftPanel({ children, theme = 'caregiver', style }: Omit<CardProps, 'accessible' | 'accessibilityLabel'>) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;

  return (
    <View
      style={[
        styles.softPanel,
        {
          backgroundColor: theme === 'caregiver' ? tokens.colors.surfaceMuted : tokens.colors.surfaceWarm,
          borderRadius: tokens.radii.control,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Hairline({ theme = 'caregiver' }: { theme?: ThemeName }) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  return <View style={[styles.hairline, { backgroundColor: tokens.colors.border }]} />;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: spacing.md,
  },
  softPanel: {
    padding: spacing.md,
  },
  hairline: {
    height: 1,
    width: '100%',
  },
});
