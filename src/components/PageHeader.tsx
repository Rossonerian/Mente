import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens-enhanced';
import type { ThemeName } from './Card';
import { FamilyConstellation } from './FamilyConstellation';
import { IconButton } from './Button';

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  theme = 'caregiver',
  onBack,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  theme?: ThemeName;
  onBack?: () => void;
}) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {onBack ? <IconButton label="Go back" iconName="arrow-back" onPress={onBack} theme={theme} /> : <FamilyConstellation theme={theme} />}
        {!onBack ? <Text style={[styles.brand, { color: tokens.colors.text }]}>mente</Text> : null}
      </View>
      <View style={styles.copy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: tokens.colors.primary }]}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={[styles.title, { color: tokens.colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: tokens.colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
  },
  brand: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  copy: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    flexShrink: 1,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});
