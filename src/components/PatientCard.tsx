import type { JSX, ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens';
import type { ThemeName } from './Card';
import { SurfaceCard, Hairline } from './Card';

interface PatientCardProps {
  initials: string;
  name: string;
  subtitle?: string;
  avatar?: ReactNode;
  status?: ReactNode;
  trailing?: ReactNode;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function PatientCard({
  initials,
  name,
  subtitle,
  avatar,
  status,
  trailing,
  theme = 'caregiver',
  style,
  children,
}: PatientCardProps): JSX.Element {
  const tokens = theme === 'caregiver' ? caregiverTheme : caregiverTheme;

  return (
    <SurfaceCard theme={theme} style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {avatar && <View style={styles.avatar}>{avatar}</View>}
          <View style={styles.info}>
            <Text style={[styles.name, { color: tokens.colors.text }]}>{name}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: tokens.colors.textMuted }]}>{subtitle}</Text>}
            {status && <View style={styles.statusContainer}>{status}</View>}
          </View>
        </View>
        {trailing && <View style={styles.trailing}>{trailing}</View>}
      </View>

      {children && (
        <>
          <Hairline theme={theme} />
          <View style={styles.footer}>{children}</View>
        </>
      )}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  avatar: {
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 13,
  },
  statusContainer: {
    marginTop: spacing.xxs,
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
});