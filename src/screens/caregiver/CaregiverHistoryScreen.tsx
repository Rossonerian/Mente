import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityRow } from '../../components/ActivityRow';
import { SurfaceCard } from '../../components/Card';
import { FocusablePressable } from '../../components/FocusablePressable';
import { MenteIcon } from '../../components/Icon';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusPill } from '../../components/StatusPill';
import { caregiverTheme, spacing } from '../../theme/tokens';
import { menteMockData } from '../../data/mockData';
import type { SessionSource } from '../../types';

type HistoryFilter = 'all' | SessionSource;

const filters: readonly { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: 'All activity' },
  { value: 'CALL', label: 'Calls' },
  { value: 'GAME', label: 'Play' },
];

export function CaregiverHistoryScreen() {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sessions = menteMockData.sessions.filter((session) => filter === 'all' || session.source === filter);

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader
        eyebrow="Patient history"
        title="Activity history"
        subtitle="Calls and play moments are shown together so the pattern stays human and clear."
        theme="caregiver"
      />

      <SurfaceCard theme="caregiver" style={styles.contextCard}>
        <View style={styles.contextIcon}>
          <MenteIcon name="information-circle-outline" size={22} color={caregiverTheme.colors.primary} />
        </View>
        <View style={styles.contextCopy}>
          <Text style={styles.contextTitle}>A signal, not a conclusion</Text>
          <Text style={styles.contextBody}>These are observed moments for caregiver review. They do not diagnose or predict a medical condition.</Text>
        </View>
      </SurfaceCard>

      <View accessibilityRole="tablist" style={styles.filterBar}>
        {filters.map((item) => {
          const selected = item.value === filter;
          return (
            <FocusablePressable
              key={item.value}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              onPress={() => setFilter(item.value)}
              style={({ pressed, focused }) => [
                styles.filter,
                {
                  backgroundColor: selected ? caregiverTheme.colors.primary : caregiverTheme.colors.surface,
                  borderColor: focused ? caregiverTheme.colors.text : selected ? caregiverTheme.colors.primary : caregiverTheme.colors.border,
                  borderWidth: focused ? 3 : 1,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.filterLabel, { color: selected ? caregiverTheme.colors.white : caregiverTheme.colors.textMuted }]}>{item.label}</Text>
            </FocusablePressable>
          );
        })}
      </View>

      <SectionHeader title={`${sessions.length} recent moments`} theme="caregiver" />
      {sessions.length === 0 ? (
        <SurfaceCard theme="caregiver" style={styles.emptyCard}>
          <MenteIcon name="albums-outline" size={28} color={caregiverTheme.colors.primary} />
          <Text style={styles.emptyTitle}>No moments in this view yet</Text>
          <Text style={styles.emptyBody}>Choose another filter to review Rosa’s recent activity.</Text>
        </SurfaceCard>
      ) : (
        sessions.map((session) => {
          const expanded = expandedId === session.id;
          return (
            <FocusablePressable
              key={session.id}
              accessibilityRole="button"
              accessibilityLabel={`${session.activityLabel}, ${session.dateLabel}. ${expanded ? 'Hide details' : 'Show details'}`}
              accessibilityHint="Shows the observed session details"
              onPress={() => setExpandedId(expanded ? null : session.id)}
              style={({ pressed, focused }) => [
                styles.sessionPressable,
                focused && { borderColor: caregiverTheme.colors.text, borderRadius: caregiverTheme.radii.card, borderWidth: 3 },
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <SurfaceCard theme="caregiver" style={styles.sessionCard}>
                <ActivityRow session={session} />
                {expanded ? (
                  <View style={styles.details}>
                    <View style={styles.detailDivider} />
                    <Text style={styles.detailText}>{session.detail}</Text>
                    <View style={styles.detailMeta}>
                      <StatusPill status={session.review} />
                      <Text style={styles.metricText}>{session.metricLabel}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.tapHint}>Tap to see what was observed</Text>
                )}
              </SurfaceCard>
            </FocusablePressable>
          );
        })
      )}

      <SectionHeader title="Current view" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.trendCard}>
        <View style={styles.trendTopRow}>
          <Text style={styles.trendTitle}>Observed pattern</Text>
          <StatusPill status={menteMockData.trend.status} label={menteMockData.trend.label} />
        </View>
        <Text style={styles.trendBody}>{menteMockData.trend.reason}</Text>
        <View style={styles.trendFootnote}>
          <Text style={styles.trendFootnoteText}>{menteMockData.trend.windowLabel}</Text>
          <Text style={styles.trendFootnoteText}>{menteMockData.trend.sufficiency}</Text>
        </View>
      </SurfaceCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  contextCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  contextIcon: {
    alignItems: 'center',
    backgroundColor: caregiverTheme.colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  contextCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  contextTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  contextBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  filter: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.xs,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  sessionPressable: {
    marginBottom: spacing.sm,
  },
  sessionCard: {
    paddingVertical: spacing.xs,
  },
  details: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  detailDivider: {
    backgroundColor: caregiverTheme.colors.border,
    height: 1,
  },
  detailText: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  detailMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricText: {
    color: caregiverTheme.colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  tapHint: {
    color: caregiverTheme.colors.textFaint,
    fontSize: 11,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  trendCard: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  trendTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  trendTitle: {
    color: caregiverTheme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  trendBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  trendFootnote: {
    backgroundColor: caregiverTheme.colors.background,
    borderRadius: caregiverTheme.radii.control,
    gap: spacing.xxs,
    padding: spacing.sm,
  },
  trendFootnoteText: {
    color: caregiverTheme.colors.textFaint,
    fontSize: 12,
    lineHeight: 17,
  },
});
