import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AvatarStack } from '../../components/Avatar';
import { MenteButton } from '../../components/Button';
import { MenteIcon } from '../../components/Icon';
import { SurfaceCard, Hairline, SoftPanel } from '../../components/Card';
import { MemberCard } from '../../components/MemberCard';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { caregiverTheme, spacing } from '../../theme/tokens-enhanced';
import { menteMockData } from '../../data/mockData';
import { GlassSurface } from '../../components/glass/GlassSurface';
import { useCaregiverPatientContext } from '../../features/caregiver/useCaregiverContext';
import { useQuery } from '@tanstack/react-query';
import { adaptMemoryToFamilyMember } from '../../api/adapters/caregiverFamily';
import { isDevelopmentMockMode } from '../../api/config';
import type { FamilyMember } from '../../types';
import type { CaregiverClient } from '../../api/caregiverClient';
import type { DevelopmentAccessCodeDto } from '../../api/contracts/caregiver';
import type { CaregiverContextData } from '../../features/caregiver/loadCaregiverContext';

export function CaregiverFamilyScreen({ onOpenSetup, accessToken, caregiverId }: { onOpenSetup: () => void; accessToken: string | null; caregiverId: string | null }) {
  if (isDevelopmentMockMode) return <FamilyContent onOpenSetup={onOpenSetup} family={menteMockData.family} patientName={menteMockData.patient.preferredName} live={false} />;
  return <ConnectedFamily onOpenSetup={onOpenSetup} accessToken={accessToken} caregiverId={caregiverId} />;
}

function ConnectedFamily({ onOpenSetup, accessToken, caregiverId }: { onOpenSetup: () => void; accessToken: string | null; caregiverId: string | null }) {
  const context = useCaregiverPatientContext(accessToken, caregiverId);
  if (context.kind === 'loading') return <FamilyState title="Loading family" body="Loading saved family memories…" />;
  if (context.kind === 'empty') return <FamilyState title="No family memories yet" body="Set up a family and add familiar memories before this view can be shown." actionLabel="Open setup" onAction={onOpenSetup} />;
  if (context.kind === 'error') return <FamilyState title="Family is unavailable" body={context.error.message} actionLabel="Retry" onAction={context.retry} />;
  return <ConnectedFamilyContent onOpenSetup={onOpenSetup} caregiverId={caregiverId!} context={context.data} />;
}

function ConnectedFamilyContent({ onOpenSetup, caregiverId, context }: { onOpenSetup: () => void; caregiverId: string; context: CaregiverContextData & { client: CaregiverClient } }) {
  const memories = useQuery({ queryKey: ['caregiver', caregiverId, 'patient', context.patient.id, 'memories'], queryFn: ({ signal }) => context.client.listMemories(context.patient.id, signal), staleTime: 60_000 });
  const developmentAccess = useQuery({
    queryKey: ['caregiver', caregiverId, 'patient', context.patient.id, 'development-access-code'],
    queryFn: ({ signal }) => context.client.getDevelopmentAccessCode(context.patient.id, signal),
    staleTime: 60_000,
  });
  if (memories.isPending) return <FamilyState title="Loading family" body="Loading saved family memories…" />;
  if (memories.error instanceof Error) return <FamilyState title="Family is unavailable" body="Mente could not load family memories right now." actionLabel="Retry" onAction={() => void memories.refetch()} />;
  return <FamilyContent onOpenSetup={onOpenSetup} family={(memories.data ?? []).map(adaptMemoryToFamilyMember)} patientName={context.patient.preferred_name} live profile={context} developmentAccess={developmentAccess.data?.enabled ? developmentAccess.data : null} />;
}

function FamilyContent({ onOpenSetup, family, patientName, live, profile, developmentAccess }: { onOpenSetup: () => void; family: FamilyMember[]; patientName: string; live: boolean; profile?: CaregiverContextData; developmentAccess?: DevelopmentAccessCodeDto | null }) {
  const [editPreview, setEditPreview] = useState(false);
  const voiceCount = family.filter((member) => member.voiceAvailable).length;

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader
        eyebrow={`${patientName}’s circle`}
        title="Family"
        subtitle="Keep the people, voices, and memories that make each moment feel familiar."
        theme="caregiver"
      />

      {profile ? <SurfaceCard theme="caregiver" style={styles.profileCard}>
        <Text style={styles.overviewTitle}>Saved family and patient details</Text>
        <Text style={styles.overviewBody}>Family: {profile.family.name}</Text>
        <Text style={styles.overviewBody}>Preferred name: {profile.patient.preferred_name}</Text>
        <Text style={styles.overviewBody}>Legal name: {profile.patient.legal_name || 'Not provided'}</Text>
        <Text style={styles.overviewBody}>Patient phone: {profile.patient.phone_e164 || 'Not provided'}</Text>
        <Text style={styles.overviewBody}>Time zone: {profile.patient.timezone}</Text>
        <Text style={styles.overviewBody}>Language: {profile.patient.preferred_language}</Text>
      </SurfaceCard> : null}

      <GlassSurface theme="caregiver" variant="elevated" style={styles.overviewCard}>
        <View style={styles.overviewTopRow}>
          <View style={styles.overviewCopy}>
            <Text style={styles.overviewEyebrow}>Familiar circle</Text>
            <Text style={styles.overviewTitle}>{patientName}’s people</Text>
            <Text style={styles.overviewBody}>{live ? 'These familiar details are saved for gentle family moments.' : 'These details are shown as local preview data for the family view.'}</Text>
          </View>
          <AvatarStack people={family.map(({ initials, name }) => ({ initials, name }))} theme="caregiver" />
        </View>
        <View style={styles.coverageRow}>
          <View style={styles.coverageDot} />
          <Text style={styles.coverageText}>{voiceCount} voice memories marked for gentle prompts</Text>
        </View>
      </GlassSurface>

      {developmentAccess?.code ? (
        <GlassSurface theme="caregiver" variant="subtle" style={styles.developmentCodeCard}>
          <View style={styles.developmentCodeHeading}>
            <MenteIcon name="flask-outline" size={20} color={caregiverTheme.colors.primary} />
            <View style={styles.developmentCodeCopy}>
              <Text style={styles.developmentCodeTitle}>Local patient connection</Text>
              <Text style={styles.developmentCodeBody}>For development and test builds only. Enter this six-digit code on the patient device.</Text>
            </View>
          </View>
          <Text selectable accessibilityLabel={`Development connection code ${developmentAccess.code}`} style={styles.developmentCode}>{developmentAccess.code}</Text>
        </GlassSurface>
      ) : null}

      <SectionHeader title={`People ${patientName} recognizes`} theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.membersCard}>
        {family.map((member, index) => (
          <View key={member.id}>
            <MemberCard member={member} theme="caregiver" />
            {index < family.length - 1 ? <Hairline theme="caregiver" /> : null}
          </View>
        ))}
      </SurfaceCard>

      <SectionHeader title="Memory coverage" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.coverageCard}>
        <View style={styles.coverageMetric}>
          <Text style={styles.coverageMetricValue}>{family.length}</Text>
          <View style={styles.coverageMetricCopy}>
            <Text style={styles.coverageMetricTitle}>Active family memories</Text>
            <Text style={styles.coverageMetricBody}>Names, relationships, and a familiar detail for each person.</Text>
          </View>
        </View>
        <View style={styles.coverageMetric}>
          <Text style={styles.coverageMetricValue}>{voiceCount}</Text>
          <View style={styles.coverageMetricCopy}>
            <Text style={styles.coverageMetricTitle}>Voice moments</Text>
            <Text style={styles.coverageMetricBody}>Marked in the saved memory set; playback is not available in this build.</Text>
          </View>
        </View>
      </SurfaceCard>

      {editPreview ? (
        <SoftPanel theme="caregiver" style={styles.editNotice}>
          <Text style={styles.editNoticeTitle}>{live ? 'Family memory management' : 'Preview-only controls'}</Text>
          <Text style={styles.editNoticeBody}>{live ? 'This view reflects saved, consented memories. Add or revise details through the caregiver management flow.' : 'A connected family editor belongs to the future management surface. Nothing is saved from this preview.'}</Text>
        </SoftPanel>
      ) : null}
      <MenteButton
        label={editPreview ? 'Hide family note' : live ? 'About saved memories' : 'Preview edit controls'}
        onPress={() => setEditPreview((current) => !current)}
        theme="caregiver"
        variant="secondary"
        iconName="create-outline"
        style={styles.fullButton}
      />
      <MenteButton label="Open companion setup" onPress={onOpenSetup} theme="caregiver" variant="quiet" iconName="calendar-outline" style={styles.fullButton} />
    </ScreenScroll>
  );
}

function FamilyState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return <ScreenScroll theme="caregiver"><PageHeader eyebrow="Family" title={title} subtitle={body} theme="caregiver" /><SurfaceCard theme="caregiver" style={styles.membersCard}><Text style={styles.overviewTitle}>{title}</Text><Text style={styles.overviewBody}>{body}</Text>{actionLabel && onAction ? <MenteButton label={actionLabel} onPress={onAction} theme="caregiver" /> : null}</SurfaceCard></ScreenScroll>;
}

const styles = StyleSheet.create({
  profileCard: { gap: spacing.xs, marginBottom: spacing.lg },
  overviewCard: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  overviewTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  overviewCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  overviewEyebrow: {
    color: caregiverTheme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  overviewTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  overviewBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  developmentCodeCard: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  developmentCodeHeading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  developmentCodeCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  developmentCodeTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  developmentCodeBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  developmentCode: {
    color: caregiverTheme.colors.primary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
  },
  coverageRow: {
    alignItems: 'center',
    backgroundColor: caregiverTheme.colors.background,
    borderRadius: caregiverTheme.radii.control,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  coverageDot: {
    backgroundColor: caregiverTheme.colors.stable,
    borderRadius: 8,
    height: 8,
    width: 8,
  },
  coverageText: {
    color: caregiverTheme.colors.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  membersCard: {
    marginBottom: spacing.xl,
    paddingVertical: spacing.xs,
  },
  coverageCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  coverageMetric: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  coverageMetricValue: {
    color: caregiverTheme.colors.primary,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
  },
  coverageMetricCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  coverageMetricTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  coverageMetricBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  editNotice: {
    backgroundColor: caregiverTheme.colors.watchBackground,
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  editNoticeTitle: {
    color: caregiverTheme.colors.watch,
    fontSize: 14,
    fontWeight: '800',
  },
  editNoticeBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  fullButton: {
    marginBottom: spacing.sm,
  },
});
