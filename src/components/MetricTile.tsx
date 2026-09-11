import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens-enhanced';
import type { ThemeName } from './Card';

export function MetricTile({
  value,
  label,
  note,
  theme = 'caregiver',
}: {
  value: string;
  label: string;
  note?: string;
  theme?: ThemeName;
}) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={`${value}. ${label}${note ? `. ${note}` : ''}`} style={styles.tile}>
      <Text style={[styles.value, { color: tokens.colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: tokens.colors.textMuted }]}>{label}</Text>
      {note ? <Text style={[styles.note, { color: tokens.colors.primary }]}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  label: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  note: {
    fontSize: 12,
    fontWeight: '800',
  },
});
