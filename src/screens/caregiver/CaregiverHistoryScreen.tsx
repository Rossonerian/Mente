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
import { caregiverTheme, spacing } from '../../theme/tokens-enhanced';
import type { CognitiveSession, SessionSource, TrendAssessment } from '../../types';
import { useCaregiverPatientContext } from '../../features/caregiver/useCaregiverContext';
import { useQuery } from '@tanstack/react-query';
import { adaptCaregiverSession, adaptCaregiverOverview } from '../../api/adapters/caregiverOverview';
import { isDevelopmentMockMode } from '../../api/config';
import { menteMockData } from '../../data/mockData';

type HistoryFilter = 'all' | SessionSource;

const filters: readonly { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: 'All activity' },
  { value: 'CALL', label: 'Calls' },
  { value: 'GAME', label: 'Play' },
];

export function CaregiverHistoryScreen({ accessToken, caregiverId }: { accessToken: string | null; caregiverId: string | null }) {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const context = useCaregiverPatientContext(accessToken, caregiverId);
  if (isDevelopmentMockMode) return <HistoryContent sessions={menteMockData.sessions.filter((session) => filter === 'all' || session.source === filter)} trend={menteMockData.trend} filter={filter} setFilter={setFilter} expandedId={expandedId} setExpandedId={setExpandedId} />;
  if (context.kind === 'loading') return <HistoryState title="Loading activity" body="Loading saved family activity…" />;
  if (context.kind === 'empty') return <HistoryState title="No activity yet" body="Add a family and a person before reviewing activity." actionLabel="Try again" onAction={context.retry} />;
  if (context.kind === 'error') return <HistoryState title="Activity is unavailable" body={context.error.message} actionLabel="Retry" onAction={context.retry} />;
  return <ConnectedHistory caregiverId={caregiverId!} context={context.data} />;
}

function ConnectedHistory({ caregiverId, context }: { caregiverId: string; context: { patient: { id: string }; client: { listSessions: (patientId: string, source?: 'CALL' | 'GAME', signal?: AbortSignal) => Promise<import('../../api/contracts/caregiver').SessionDto[]>; getOverview: (patientId: string, signal?: AbortSignal) => Promise<import('../../api/contracts/caregiver').PatientOverviewDto> } } }) {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sessionsQuery = useQuery({ queryKey: ['caregiver', caregiverId, 'patient', context.patient.id, 'sessions', filter], queryFn: ({ signal }) => context.client.listSessions(context.patient.id, filter === 'all' ? undefined : filter, signal), staleTime: 60_000 });
  const overviewQuery = useQuery({ queryKey: ['caregiver', caregiverId, 'patient', context.patient.id, 'overview'], queryFn: ({ signal }) => context.client.getOverview(context.patient.id, signal), staleTime: 60_000 });
  if (sessionsQuery.isPending || overviewQuery.isPending) return <HistoryState title="Loading activity" body="Loading saved family activity…" />;
  if (sessionsQuery.error instanceof Error || overviewQuery.error instanceof Error) return <HistoryState title="Activity is unavailable" body="Mente could not load activity right now." actionLabel="Retry" onAction={() => { void sessionsQuery.refetch(); void overviewQuery.refetch(); }} />;
  return <HistoryContent sessions={(sessionsQuery.data ?? []).map(adaptCaregiverSession)} trend={adaptCaregiverOverview(overviewQuery.data!, new Date(overviewQuery.dataUpdatedAt)).trend} filter={filter} setFilter={setFilter} expandedId={expandedId} setExpandedId={setExpandedId} />;
}

function HistoryContent({ sessions, trend, filter, setFilter, expandedId, setExpandedId }: { sessions: CognitiveSession[]; trend: TrendAssessment; filter: HistoryFilter; setFilter: (filter: HistoryFilter) => void; expandedId: string | null; setExpandedId: (id: string | null) => void }) {

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
          <StatusPill status={trend.status} label={trend.label} />
        </View>
        <Text style={styles.trendBody}>{trend.reason}</Text>
        <View style={styles.trendFootnote}>
          <Text style={styles.trendFootnoteText}>{trend.windowLabel}</Text>
          <Text style={styles.trendFootnoteText}>{trend.sufficiency}</Text>
        </View>
      </SurfaceCard>
    </ScreenScroll>
  );
}

function HistoryState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return <ScreenScroll theme="caregiver"><PageHeader eyebrow="Patient history" title={title} subtitle={body} theme="caregiver" /><SurfaceCard theme="caregiver" style={styles.emptyCard}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text>{actionLabel && onAction ? <FocusablePressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={styles.filter}><Text style={styles.filterLabel}>{actionLabel}</Text></FocusablePressable> : null}</SurfaceCard></ScreenScroll>;
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
