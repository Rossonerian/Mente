import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens';
import type { CognitiveSession } from '../types';
import { MenteIcon } from './Icon';
import { StatusPill } from './StatusPill';

export function ActivityRow({ session }: { session: CognitiveSession }) {
  const iconBgColor = session.source === 'CALL' ? caregiverTheme.colors.surfaceMuted : caregiverTheme.colors.forestSoft;
  const iconColor = session.source === 'CALL' ? caregiverTheme.colors.primary : caregiverTheme.colors.stable;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${session.activityLabel}, ${session.dateLabel} at ${session.timeLabel}, ${session.durationLabel}, ${session.statusLabel}. ${session.summary}`}
      style={styles.row}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        aria-hidden={true}
        style={[styles.iconWrap, { backgroundColor: iconBgColor }]}
      >
        <MenteIcon
          name={session.source === 'CALL' ? 'call-outline' : 'sparkles-outline'}
          size={20}
          color={iconColor}
        />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{session.activityLabel}</Text>
          <StatusPill status={session.review} />
        </View>
        <Text style={styles.meta}>
          {session.dateLabel} · {session.timeLabel} · {session.durationLabel} · {session.statusLabel}
        </Text>
        <Text style={styles.summary}>{session.summary}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  title: {
    color: caregiverTheme.colors.text,
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  meta: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});

