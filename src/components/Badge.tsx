import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens-enhanced';
import type { ThemeName } from './Card';
import type { JSX } from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'neutral';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
  size?: BadgeSize;
}

export function Badge({
  label,
  variant = 'neutral',
  theme = 'caregiver',
  style,
  size = 'sm',
}: BadgeProps): JSX.Element {
  const colorMap: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: {
      bg: caregiverTheme.colors.surfaceMuted,
      text: caregiverTheme.colors.primary,
    },
    success: {
      bg: caregiverTheme.colors.stableBackground,
      text: caregiverTheme.colors.stable,
    },
    warning: {
      bg: caregiverTheme.colors.alertBackground,
      text: caregiverTheme.colors.alert,
    },
    neutral: {
      bg: caregiverTheme.colors.background,
      text: caregiverTheme.colors.textMuted,
    },
  };

  const colors = colorMap[variant];
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: isSm ? spacing.xs : spacing.sm,
          paddingVertical: isSm ? 4 : 6,
          borderRadius: isSm ? 12 : 16,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: colors.text,
            fontSize: isSm ? 12 : 13,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
    lineHeight: 16,
  },
});
