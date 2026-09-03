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
import { menteMockData } from '../../data/mockData';
import type { CaregiverRoute } from '../../types';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useState } from 'react';

export function CaregiverHomeScreen({ onNavigate }: { onNavigate: (route: CaregiverRoute) => void }) {
  const [checkInNoted, setCheckInNoted] = useState(false);
  const { patient, family, sessions, alert, trend } = menteMockData;
  const { isWideWeb } = useResponsiveLayout();
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
          <GlassSurface theme="caregiver" variant="elevated" style={styles.alertCard}>
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
            <View style={styles.alertActions}>
              <MenteButton label={alert.actionLabel} onPress={() => onNavigate('history')} theme="caregiver" variant="primary" style={styles.actionButton} />
              <MenteButton
                label={checkInNoted ? 'Check-in noted' : 'Plan a check-in'}
                onPress={() => setCheckInNoted((current) => !current)}
                theme="caregiver"
                variant="secondary"
                style={styles.actionButton}
              />
            </View>
            <Text style={styles.createdLabel}>{alert.createdLabel} · Review with care</Text>
          </GlassSurface>

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
              <AvatarStack people={family.map(({ initials, name }) => ({ initials, name }))} theme="caregiver" />
              <Text style={styles.familyCount}>3 familiar people</Text>
            </View>
            <Text style={styles.familyBody}>Ana, Miguel, and Sofia’s memories are available for gentle moments.</Text>
          </SurfaceCard>
        </View>
      </View>
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
});
