import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, getTrendColors, spacing } from '../theme/tokens';
import type { SessionReview, TrendStatus } from '../types';

type PillStatus = TrendStatus | SessionReview;

interface StatusPillProps {
  status: PillStatus;
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const colors = status === 'same-day'
    ? { foreground: caregiverTheme.colors.alert, background: caregiverTheme.colors.alertBackground }
    : status === 'routine'
      ? { foreground: caregiverTheme.colors.stable, background: caregiverTheme.colors.stableBackground }
      : getTrendColors(status);

  const displayLabel = label ?? (status === 'same-day' ? 'Same-day attention' : status === 'routine' ? 'Routine' : status[0].toUpperCase() + status.slice(1));

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Status: ${displayLabel}`}
      style={[styles.pill, { backgroundColor: colors.background }]}
    >
      <View style={[styles.dot, { backgroundColor: colors.foreground }]} />
      <Text style={[styles.label, { color: colors.foreground }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    borderRadius: caregiverTheme.radii.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 30,
    paddingHorizontal: spacing.sm,
  },
  dot: {
    borderRadius: caregiverTheme.radii.pill,
    height: 7,
    width: 7,
  },
  label: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
