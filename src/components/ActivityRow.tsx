import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens';
import type { CognitiveSession } from '../types';
import { MenteIcon } from './Icon';
import { StatusPill } from './StatusPill';

export function ActivityRow({ session }: { session: CognitiveSession }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: session.source === 'CALL' ? caregiverTheme.colors.surfaceMuted : '#EAF5F0' }]}>
        <MenteIcon name={session.source === 'CALL' ? 'call-outline' : 'sparkles-outline'} size={20} color={session.source === 'CALL' ? caregiverTheme.colors.primary : caregiverTheme.colors.stable} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{session.activityLabel}</Text>
          <StatusPill status={session.review} />
        </View>
        <Text style={styles.meta}>{session.dateLabel} · {session.timeLabel} · {session.durationLabel} · {session.statusLabel}</Text>
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  title: {
    color: caregiverTheme.colors.text,
    flex: 1,
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
