import type { JSX, ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens';
import type { ThemeName } from './Card';
import { SoftPanel } from './Card';

interface StatBoxProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
}

export function StatBox({
  value,
  label,
  icon,
  theme = 'caregiver',
  style,
  highlight = false,
}: StatBoxProps): JSX.Element {
  const tokens = theme === 'caregiver' ? caregiverTheme : caregiverTheme;

  return (
    <SoftPanel
      theme={theme}
      style={[
        styles.container,
        highlight && {
          backgroundColor: caregiverTheme.colors.surfaceMuted,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.content}>
        <Text
          style={[
            styles.value,
            {
              color: highlight ? tokens.colors.primary : tokens.colors.text,
            },
          ]}
        >
          {value}
        </Text>
        <Text style={[styles.label, { color: tokens.colors.textMuted }]}>{label}</Text>
      </View>
    </SoftPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.sm,
    minHeight: 100,
    justifyContent: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  content: {
    gap: spacing.xxs,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});