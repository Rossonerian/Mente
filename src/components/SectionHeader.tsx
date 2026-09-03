import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens';
import type { ThemeName } from './Card';
import { TextButton } from './Button';

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  theme?: ThemeName;
}

export function SectionHeader({ title, eyebrow, actionLabel, onActionPress, theme = 'caregiver' }: SectionHeaderProps) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: tokens.colors.primary }]}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={[styles.title, { color: tokens.colors.text }]}>{title}</Text>
      </View>
      {actionLabel && onActionPress ? <TextButton label={actionLabel} onPress={onActionPress} theme={theme} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
