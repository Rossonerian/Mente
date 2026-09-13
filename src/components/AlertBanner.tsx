import type { JSX, ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens-enhanced';
import { MenteIcon } from './Icon';
import type { ThemeName } from './Card';

export type AlertLevel = 'warning' | 'success' | 'info';

interface AlertBannerProps {
  title: string;
  message: string;
  level?: AlertLevel;
  icon?: string;
  children?: ReactNode;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
}

export function AlertBanner({
  title,
  message,
  level = 'warning',
  icon,
  children,
  theme = 'caregiver',
  style,
}: AlertBannerProps): JSX.Element {
  const colorMap: Record<AlertLevel, { bg: string; border: string; icon: string; eyebrow: string; text: string }> = {
    warning: {
      bg: caregiverTheme.colors.alertBackground,
      border: '#F3D5CC',
      icon: caregiverTheme.colors.alert,
      eyebrow: caregiverTheme.colors.alert,
      text: caregiverTheme.colors.text,
    },
    success: {
      bg: caregiverTheme.colors.stableBackground,
      border: caregiverTheme.colors.stable,
      icon: caregiverTheme.colors.stable,
      eyebrow: caregiverTheme.colors.stable,
      text: caregiverTheme.colors.text,
    },
    info: {
      bg: '#E3F2FD',
      border: '#90CAF9',
      icon: caregiverTheme.colors.primary,
      eyebrow: caregiverTheme.colors.primary,
      text: caregiverTheme.colors.text,
    },
  };

  const colors = colorMap[level];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderLeftColor: colors.icon,
          borderLeftWidth: 5,
        },
        style,
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`${level}: ${title}. ${message}`}
    >
      <View style={styles.header}>
        {icon && (
          <View
            accessible={false}
            accessibilityElementsHidden
            style={[styles.iconBox, { borderColor: colors.icon }]}
          >
            <MenteIcon name={icon} size={18} color={colors.icon} />
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={[styles.eyebrow, { color: colors.eyebrow }]}>
            {level === 'warning' ? 'Same-day attention' : level === 'success' ? 'All clear' : 'Heads up'}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      </View>

      <Text style={[styles.message, { color: caregiverTheme.colors.textMuted }]}>{message}</Text>

      {children && <View style={styles.footer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: caregiverTheme.radii.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    height: 40,
    justifyContent: 'center',
    width: 40,
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: spacing.xs,
  },
  footer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
