import { StyleSheet, Text, View } from 'react-native';
import { Avatar, AvatarStack } from '../../components/Avatar';
import { IconButton, MenteButton } from '../../components/Button';
import { SurfaceCard, SoftPanel } from '../../components/Card';
import { FamilyConstellation } from '../../components/FamilyConstellation';
import { ActivityRow } from '../../components/ActivityRow';
import { MetricTile } from '../../components/MetricTile';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusPill } from '../../components/StatusPill';
import { GlassSurface } from '../../components/glass/GlassSurface';
import { caregiverTheme, spacing } from '../../theme/tokens';
import type { CaregiverRoute } from '../../types';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useMemo, useState } from 'react';
import { useCaregiverOverview } from '../../features/caregiver/useCaregiverOverview';
import { CaregiverLoadingScreen, CaregiverProfileSetupScreen } from './CaregiverAccessScreen';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCaregiverClient } from '../../api/caregiverClient';
import { isDevelopmentMockMode } from '../../api/config';

export function CaregiverHomeScreen({ onNavigate, accessToken, caregiverId }: { onNavigate: (route: CaregiverRoute) => void; accessToken: string | null; caregiverId: string | null }) {
  const [checkInNoted, setCheckInNoted] = useState(false);
  const [acknowledgementError, setAcknowledgementError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const client = useMemo(() => {
    if (!accessToken || isDevelopmentMockMode) return null;
    try { return createCaregiverClient(accessToken); } catch { return null; }
  }, [accessToken]);
  const acknowledge = useMutation({
    mutationFn: ({ patientId, alertId }: { patientId: string; alertId: string }) => client!.acknowledgeAlert(patientId, alertId),
    onSuccess: (_data, variables) => { void queryClient.invalidateQueries({ queryKey: ['caregiver', caregiverId, 'patient', variables.patientId] }); },
  });
  const overview = useCaregiverOverview(accessToken, caregiverId);
  const { isWideWeb } = useResponsiveLayout();
  if (overview.kind === 'loading') return <CaregiverLoadingScreen />;
  if (overview.kind === 'profile-required' && accessToken) {
    return <CaregiverProfileSetupScreen accessToken={accessToken} onComplete={overview.retry} />;
  }
  if (overview.kind === 'empty') return <CaregiverEmptyState />;
  if (overview.kind === 'error') return <CaregiverErrorState error={overview.error.message} onRetry={overview.retry} hasStaleData={Boolean(overview.staleData)} />;
  const mockData = overview.kind === 'mock' ? overview.data : null;
  const data = overview.kind === 'ready' ? overview.data : mockData!;
  const livePatientId = overview.kind === 'ready' ? overview.data.patient.id : null;
  const patient = data.patient;
  const family = mockData?.family ?? [];
  const sessions = data.sessions;
  const alert = mockData?.alert ?? (overview.kind === 'ready' ? overview.data.alerts[0] : undefined);
  const trend = data.trend;
  const voiceCount = family.filter((member) => member.voiceAvailable).length;

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader
        eyebrow="Caregiver home"
        title="Good morning, Ana"
        subtitle="A clear view of Rosa’s recent moments, all in one place."
        theme="caregiver"
      />

      <GlassSurface theme="caregiver" variant="elevated" style={styles.patientCard}>
        <View style={styles.patientTopRow}>
          <View style={styles.patientIdentity}>
            <Avatar initials={patient.initials} name={patient.name} size="large" theme="caregiver" tone="primary" />
            <View style={styles.patientCopy}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientMeta}>Today’s companion view</Text>
              <StatusPill status={trend.status} label={trend.label} />
            </View>
          </View>
          <IconButton label="Open Rosa's activity" iconName="chevron-forward" onPress={() => onNavigate('history')} />
        </View>
        <View style={styles.patientDivider} />
        <View style={styles.patientFooter}>
          <View style={styles.footerLabel}>
            <FamilyConstellation theme="caregiver" />
            <Text style={styles.footerText}>Familiar people and memories are ready.</Text>
          </View>
          <Text style={styles.timeText}>{patient.callTime} call</Text>
        </View>
      </GlassSurface>

      <View style={[styles.dashboardGrid, isWideWeb && styles.dashboardGridWide]}>
        <View style={styles.dashboardColumn}>
          {alert ? <GlassSurface theme="caregiver" variant="elevated" style={styles.alertCard}>
            <View accessible accessibilityRole="text" accessibilityLabel={`${alert.title}. ${alert.body}`}>
              <View style={styles.alertHeading}>
                <SoftPanel theme="caregiver" style={styles.alertIconPanel}>
                  <Text style={styles.alertIcon}>!</Text>
                </SoftPanel>
                <View style={styles.alertCopy}>
                  <Text style={styles.alertEyebrow}>Same-day attention</Text>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                </View>
              </View>
              <Text style={styles.alertBody}>{alert.body}</Text>
            </View>
            {checkInNoted ? (
              <SoftPanel theme="caregiver" style={styles.notedPanel}>
                <Text style={styles.notedText}>Check-in planned. This note is local to the preview.</Text>
              </SoftPanel>
            ) : null}
            {acknowledgementError ? <SoftPanel theme="caregiver" style={styles.acknowledgementError}><Text accessibilityLiveRegion="polite" style={styles.acknowledgementErrorText}>{acknowledgementError}</Text></SoftPanel> : null}
            <View style={styles.alertActions}>
              <MenteButton label={alert.actionLabel} onPress={() => onNavigate('history')} theme="caregiver" variant="primary" style={styles.actionButton} />
              <MenteButton
                label={checkInNoted ? 'Check-in noted' : acknowledge.isPending ? 'Saving review…' : 'Mark reviewed'}
                onPress={() => {
                  setAcknowledgementError(null);
                  if (mockData || !client || !livePatientId) { setCheckInNoted((current) => !current); return; }
                  void acknowledge.mutateAsync({ patientId: livePatientId, alertId: alert.id }).then(() => setCheckInNoted(true)).catch(() => setAcknowledgementError('Mente could not save this review. The alert is still visible.'));
                }}
                theme="caregiver"
                variant="secondary"
                disabled={acknowledge.isPending}
                style={styles.actionButton}
              />
            </View>
            <Text style={styles.createdLabel}>{alert.createdLabel} · Review with care</Text>
          </GlassSurface> : null}

          <SectionHeader title="Today’s snapshot" theme="caregiver" />
          <GlassSurface theme="caregiver" variant="subtle" style={styles.snapshotCard}>
            <View style={styles.metricsRow}>
              <MetricTile value="3" label="moments this week" />
              <MetricTile value="18 min" label="time together" />
              <MetricTile value={`${voiceCount}`} label="family voices" />
            </View>
            <View style={styles.snapshotNote}>
              <Text style={styles.snapshotNoteTitle}>What changed</Text>
              <Text style={styles.snapshotNoteBody}>{trend.reason}</Text>
            </View>
          </GlassSurface>
        </View>

        <View style={styles.dashboardColumn}>
          <SectionHeader title="Recent activity" actionLabel="View history" onActionPress={() => onNavigate('history')} theme="caregiver" />
          <SurfaceCard theme="caregiver" style={styles.activityCard}>
            {sessions.slice(0, 3).map((session, index) => (
              <View key={session.id}>
                <ActivityRow session={session} />
                {index < 2 ? <View style={styles.activityDivider} /> : null}
              </View>
            ))}
          </SurfaceCard>

          <SectionHeader title="Rosa’s family" actionLabel="Open family" onActionPress={() => onNavigate('family')} theme="caregiver" />
          <SurfaceCard theme="caregiver" style={styles.familyCard}>
            <View style={styles.familyTopRow}>
              {family.length ? <AvatarStack people={family.map(({ initials, name }) => ({ initials, name }))} theme="caregiver" /> : <FamilyConstellation theme="caregiver" />}
              <Text style={styles.familyCount}>{family.length ? `${family.length} familiar people` : 'Family memories'}</Text>
            </View>
            <Text style={styles.familyBody}>{family.length ? 'Familiar people and memories are ready for gentle moments.' : 'Family memories will appear here when they are added.'}</Text>
          </SurfaceCard>
        </View>
      </View>
    </ScreenScroll>
  );
}

function CaregiverEmptyState() {
  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="Caregiver home" title="Your family view is ready" subtitle="Add a family and a person in companion setup before Mente can show an overview." theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.stateCard}>
        <Text style={styles.stateTitle}>Nothing to review yet</Text>
        <Text style={styles.stateBody}>No patient information is available for this caregiver profile. Mente will not substitute preview data.</Text>
      </SurfaceCard>
    </ScreenScroll>
  );
}

function CaregiverErrorState({ error, onRetry, hasStaleData }: { error: string; onRetry: () => void; hasStaleData: boolean }) {
  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="Caregiver home" title="We could not refresh the family view" subtitle={hasStaleData ? 'The last saved view may be out of date.' : 'No family information was changed.'} theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.stateCard}>
        <Text style={styles.stateTitle}>Please try again</Text>
        <Text accessibilityLiveRegion="polite" style={styles.stateBody}>{error}</Text>
        <MenteButton label="Retry" onPress={onRetry} theme="caregiver" />
      </SurfaceCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  dashboardGrid: {
    gap: 0,
  },
  dashboardGridWide: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  dashboardColumn: {
    flex: 1,
    minWidth: 0,
  },
  patientCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  patientTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  patientIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  patientCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  patientName: {
    color: caregiverTheme.colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  patientMeta: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
  },
  patientDivider: {
    backgroundColor: caregiverTheme.colors.border,
    height: 1,
  },
  patientFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  footerLabel: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  footerText: {
    color: caregiverTheme.colors.textMuted,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  timeText: {
    color: caregiverTheme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  alertCard: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  alertHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  alertIconPanel: {
    alignItems: 'center',
    backgroundColor: caregiverTheme.colors.alertBackground,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    padding: 0,
    width: 48,
  },
  alertIcon: {
    color: caregiverTheme.colors.alert,
    fontSize: 20,
    fontWeight: '900',
  },
  alertCopy: {
    flex: 1,
    gap: 3,
  },
  alertEyebrow: {
    color: caregiverTheme.colors.alert,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  alertTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  alertBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  notedPanel: {
    backgroundColor: caregiverTheme.colors.stableBackground,
    paddingVertical: spacing.sm,
  },
  notedText: {
    color: caregiverTheme.colors.stable,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  acknowledgementError: {
    backgroundColor: caregiverTheme.colors.alertBackground,
    paddingVertical: spacing.sm,
  },
  acknowledgementErrorText: {
    color: caregiverTheme.colors.alert,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  alertActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
  },
  createdLabel: {
    color: caregiverTheme.colors.textFaint,
    fontSize: 11,
  },
  snapshotCard: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  snapshotNote: {
    backgroundColor: caregiverTheme.colors.background,
    borderRadius: caregiverTheme.radii.control,
    gap: spacing.xxs,
    padding: spacing.sm,
  },
  snapshotNoteTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  snapshotNoteBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  activityCard: {
    marginBottom: spacing.xl,
    paddingVertical: spacing.xs,
  },
  activityDivider: {
    backgroundColor: caregiverTheme.colors.border,
    height: 1,
    marginLeft: 56,
  },
  familyCard: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  familyTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  familyCount: {
    color: caregiverTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  familyBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  stateCard: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  stateTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  stateBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
