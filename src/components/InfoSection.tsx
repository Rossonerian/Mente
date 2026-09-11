import type { JSX, ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens-enhanced';
import type { ThemeName } from './Card';
import { SurfaceCard, Hairline } from './Card';

interface InfoSectionProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  action?: ReactNode;
  theme?: ThemeName;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export function InfoSection({
  icon,
  title,
  description,
  children,
  action,
  theme = 'caregiver',
  style,
  compact = false,
}: InfoSectionProps): JSX.Element {
  const tokens = theme === 'caregiver' ? caregiverTheme : caregiverTheme;

  return (
    <SurfaceCard theme={theme} style={[compact && styles.compact, style]}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <View style={styles.titleContent}>
            <Text style={[styles.title, { color: tokens.colors.text }]}>{title}</Text>
            {description && <Text style={[styles.description, { color: tokens.colors.textMuted }]}>{description}</Text>}
          </View>
        </View>
        {action && <View style={styles.action}>{action}</View>}
      </View>

      {children && (
        <>
          <Hairline theme={theme} />
          <View style={styles.content}>{children}</View>
        </>
      )}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  compact: {
    paddingVertical: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  titleGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleContent: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    gap: spacing.sm,
  },
});
