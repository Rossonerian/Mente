import { StyleSheet, Text, View } from 'react-native';
import { Avatar, AvatarStack } from '../../components/Avatar';
import { MenteButton } from '../../components/Button';
import { SurfaceCard, SoftPanel } from '../../components/Card';
import { FamilyConstellation } from '../../components/FamilyConstellation';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { menteMockData } from '../../data/mockData';
import { patientTheme, spacing } from '../../theme/tokens';
import type { PatientRoute } from '../../types';
import { GlassSurface } from '../../components/glass/GlassSurface';
<<<<<<< HEAD
import { adaptMemoryToFamilyMember } from '../../api/adapters/caregiverFamily';
import { isDevelopmentMockMode } from '../../api/config';
import { createPatientClientId, usePatientGameWrite, usePatientMemoryQuery, usePatientProfileQuery, useStartPatientGame } from '../../features/patient/usePatientSession';
import type { MemoryDto, PatientSessionDto } from '../../api/contracts/patient';
import { useEffect, useState } from 'react';
import { patientDeviceStore } from '../../auth/patientDeviceStore';

export function PatientPlayScreen({ onNavigate, patientToken, onStart }: { onNavigate: (route: PatientRoute) => void; patientToken: string | null; onStart: (session: PatientSessionDto, memories: MemoryDto[]) => void }) {
  if (isDevelopmentMockMode) return <PatientPlayContent onNavigate={onNavigate} patientName={menteMockData.patient.preferredName} family={menteMockData.family} onStart={() => onNavigate('in-game')} starting={false} />;
  return <ConnectedPatientPlay onNavigate={onNavigate} patientToken={patientToken} onStart={onStart} />;
}

function ConnectedPatientPlay({ onNavigate, patientToken, onStart }: { onNavigate: (route: PatientRoute) => void; patientToken: string | null; onStart: (session: PatientSessionDto, memories: MemoryDto[]) => void }) {
  const memories = usePatientMemoryQuery(patientToken);
  const profile = usePatientProfileQuery(patientToken);
  const start = useStartPatientGame(patientToken);
  if (memories.isPending || profile.isPending) return <PatientState title="Getting family moments ready" body="Loading familiar memories…" />;
  if (memories.error instanceof Error || profile.error instanceof Error) return <PatientState title="Family moments are unavailable" body="Reconnect and try again. Nothing has been recorded." actionLabel="Try again" onAction={() => { void memories.refetch(); void profile.refetch(); }} />;
  const savedMemories = memories.data ?? [];
  if (!savedMemories.length) return <PatientState title="No familiar moments are ready" body="A caregiver can add consented family memories before starting." />;
  const begin = async () => {
    try {
      const session = await start.mutateAsync({ activity_type: 'MEMORY_TRAIN', client_session_id: createPatientClientId('game'), metadata_json: { source: 'patient-app' } });
      onStart(session, savedMemories);
    } catch { /* The inline state below gives a calm retry path. */ }
  };
  return <><PendingWriteRecovery patientToken={patientToken} /><PatientPlayContent onNavigate={onNavigate} patientName={profile.data?.preferred_name ?? 'there'} family={savedMemories.map(adaptMemoryToFamilyMember)} onStart={() => void begin()} starting={start.isPending} error={start.isError ? 'Mente could not start this moment. Please try again when you are ready.' : null} /></>;
}

type PendingFinalize = { sessionId: string; payload: { status: 'COMPLETED' | 'EARLY_TERMINATED' | 'INTERRUPTED'; termination_reason?: string; metadata_json?: Record<string, unknown> } };
function PendingWriteRecovery({ patientToken }: { patientToken: string | null }) {
  const [pending, setPending] = useState<PendingFinalize | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const write = usePatientGameWrite(patientToken);
  useEffect(() => { void patientDeviceStore.getPendingWrite().then((value) => { try { const parsed = value ? JSON.parse(value) as PendingFinalize : null; if (parsed?.sessionId && parsed.payload?.status) setPending(parsed); } catch { void patientDeviceStore.removePendingWrite(); } }); }, []);
  if (!pending) return null;
  return <SoftPanel theme="patient" style={styles.pendingPanel}><Text style={styles.pendingTitle}>A quiet moment still needs saving</Text><Text style={styles.pendingBody}>{message ?? 'You can try saving the earlier gentle close again. Nothing is shown as complete until it is saved.'}</Text><MenteButton label={write.finalize.isPending ? 'Saving gentle close…' : 'Try saving again'} onPress={() => void write.finalize.mutateAsync(pending).then(async () => { await patientDeviceStore.removePendingWrite(); setPending(null); }).catch(() => setMessage('Mente still could not save that close. You may leave safely and try again later.'))} disabled={write.finalize.isPending} theme="patient" variant="secondary" /></SoftPanel>;
}

function PatientPlayContent({ onNavigate, patientName, family, onStart, starting, error = null }: { onNavigate: (route: PatientRoute) => void; patientName: string; family: import('../../types').FamilyMember[]; onStart: () => void; starting: boolean; error?: string | null }) {
=======

export function PatientPlayScreen({ onNavigate }: { onNavigate: (route: PatientRoute) => void }) {
  const { patient, family } = menteMockData;
>>>>>>> origin/new_components

  return (
    <ScreenScroll theme="patient">
      <PageHeader
        eyebrow="A gentle moment"
<<<<<<< HEAD
        title={`Hello, ${patientName}`}
=======
        title={`Hello, ${patient.preferredName}`}
>>>>>>> origin/new_components
        subtitle="There is no rush. Spend a little time with people and memories that feel familiar."
        theme="patient"
      />

      <GlassSurface theme="patient" variant="focus" style={styles.invitationCard}>
        <View style={styles.invitationTopRow}>
          <View style={styles.invitationCopy}>
            <Text style={styles.invitationEyebrow}>Today’s invitation</Text>
            <Text style={styles.invitationTitle}>A few familiar moments</Text>
            <Text style={styles.invitationBody}>Listen, look, or pass. You are always in control.</Text>
          </View>
          <FamilyConstellation theme="patient" />
        </View>
<<<<<<< HEAD
        <MenteButton label={starting ? 'Starting your moment…' : 'Start today’s moment'} onPress={onStart} disabled={starting} theme="patient" iconName="play" />
      </GlassSurface>

      {error ? <SoftPanel theme="patient" style={styles.errorPanel}><Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text></SoftPanel> : null}

=======
        <MenteButton label="Start today’s moment" onPress={() => onNavigate('in-game')} theme="patient" iconName="play" />
      </GlassSurface>

>>>>>>> origin/new_components
      <SectionHeader title="People close to you" theme="patient" />
      <SurfaceCard theme="patient" style={styles.familyCard}>
        <View style={styles.familyIntro}>
          <AvatarStack people={family.map(({ initials, name }) => ({ initials, name }))} theme="patient" />
          <Text style={styles.familyIntroText}>Your family’s familiar voices and memories are here.</Text>
        </View>
        {family.slice(0, 2).map((member) => (
          <View key={member.id} style={styles.familyMemberRow}>
            <Avatar initials={member.initials} name={member.name} theme="patient" size="small" tone="warm" />
            <View style={styles.memberCopy}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberMemory}>{member.memory}</Text>
            </View>
          </View>
        ))}
        <MenteButton label="See everyone" onPress={() => onNavigate('family')} theme="patient" variant="secondary" iconName="people-outline" />
      </SurfaceCard>

      <SoftPanel theme="patient" style={styles.reassurancePanel}>
        <Text style={styles.reassuranceTitle}>Take your time</Text>
        <Text style={styles.reassuranceBody}>You can repeat, skip, or stop whenever you like.</Text>
      </SoftPanel>
    </ScreenScroll>
  );
}

<<<<<<< HEAD
function PatientState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) { return <ScreenScroll theme="patient"><PageHeader eyebrow="A gentle moment" title={title} subtitle={body} theme="patient" /><SurfaceCard theme="patient" style={styles.familyCard}><Text style={styles.invitationTitle}>{title}</Text><Text style={styles.invitationBody}>{body}</Text>{actionLabel && onAction ? <MenteButton label={actionLabel} onPress={onAction} theme="patient" /> : null}</SurfaceCard></ScreenScroll>; }

=======
>>>>>>> origin/new_components
const styles = StyleSheet.create({
  invitationCard: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  invitationTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  invitationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  invitationEyebrow: {
    color: patientTheme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  invitationTitle: {
    color: patientTheme.colors.text,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 31,
  },
  invitationBody: {
    color: patientTheme.colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
  },
  familyCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  familyIntro: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  familyIntroText: {
    color: patientTheme.colors.textMuted,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  familyMemberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  memberCopy: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    color: patientTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  memberMemory: {
    color: patientTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  reassurancePanel: {
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  reassuranceTitle: {
    color: patientTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  reassuranceBody: {
    color: patientTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
  },
<<<<<<< HEAD
  errorPanel: { backgroundColor: patientTheme.colors.coralSoft, marginBottom: spacing.md },
  errorText: { color: patientTheme.colors.text, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  pendingPanel: { backgroundColor: patientTheme.colors.coralSoft, gap: spacing.xs, marginBottom: spacing.md },
  pendingTitle: { color: patientTheme.colors.text, fontSize: 16, fontWeight: '800' },
  pendingBody: { color: patientTheme.colors.textMuted, fontSize: 15, lineHeight: 22 },
=======
>>>>>>> origin/new_components
});
