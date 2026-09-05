import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MenteButton } from '../../components/Button';
import { SurfaceCard, Hairline, SoftPanel } from '../../components/Card';
import { MemberCard } from '../../components/MemberCard';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { menteMockData } from '../../data/mockData';
import { patientTheme, spacing } from '../../theme/tokens';
import { GlassSurface } from '../../components/glass/GlassSurface';
import { adaptMemoryToFamilyMember } from '../../api/adapters/caregiverFamily';
import { isDevelopmentMockMode } from '../../api/config';
import { usePatientMemoryQuery } from '../../features/patient/usePatientSession';
import type { FamilyMember } from '../../types';

export function PatientFamilyScreen({ patientToken = null }: { patientToken?: string | null }) {
  if (isDevelopmentMockMode) return <PatientFamilyContent family={menteMockData.family} />;
  return <ConnectedPatientFamily patientToken={patientToken} />;
}

function ConnectedPatientFamily({ patientToken }: { patientToken: string | null }) {
  const memories = usePatientMemoryQuery(patientToken);
  if (memories.isPending) return <FamilyState title="Getting family memories ready" body="Loading familiar memories…" />;
  if (memories.error instanceof Error) return <FamilyState title="Family memories are unavailable" body="Reconnect and try again when you are ready." actionLabel="Try again" onAction={() => void memories.refetch()} />;
  const family = (memories.data ?? []).map(adaptMemoryToFamilyMember);
  if (!family.length) return <FamilyState title="No family memories are ready" body="A caregiver can add consented familiar memories before this view is ready." />;
  return <PatientFamilyContent family={family} />;
}

function PatientFamilyContent({ family }: { family: FamilyMember[] }) {
  const [playedName, setPlayedName] = useState<string | null>(null);
  const selectedMember = playedName ? family.find((member) => member.name.startsWith(playedName)) : undefined;

  return (
    <ScreenScroll theme="patient">
      <PageHeader
        eyebrow="Familiar people"
        title="Family"
        subtitle="Spend time with the people and memories that belong to your story."
        theme="patient"
      />

      <GlassSurface theme="patient" variant="focus" style={styles.introCard}>
        <Text style={styles.introTitle}>Your family is close</Text>
        <Text style={styles.introBody}>Choose a voice or memory to sit with for a little while. There is nothing to get right.</Text>
      </GlassSurface>

      <SurfaceCard theme="patient" style={styles.membersCard}>
        {family.map((member, index) => (
          <View key={member.id}>
            <MemberCard member={member} theme="patient" />
            {index < family.length - 1 ? <Hairline theme="patient" /> : null}
          </View>
        ))}
      </SurfaceCard>

      {playedName ? (
        <SoftPanel theme="patient" style={styles.playedPanel}>
          <Text style={styles.playedTitle}>A hello from {playedName}</Text>
          <Text style={styles.playedBody}>Take a quiet moment with this familiar memory. There is nothing to get right.</Text>
        </SoftPanel>
      ) : null}
      <MenteButton
        label={selectedMember ? `Play ${selectedMember.name.split(' ')[0]}’s hello again` : 'Play a familiar hello'}
        onPress={() => setPlayedName(selectedMember?.name.split(' ')[0] ?? family[0].name.split(' ')[0])}
        theme="patient"
        variant="secondary"
        iconName="volume-medium-outline"
        style={styles.fullButton}
      />
      <Text style={styles.note}>Voice moments are gentle prompts, not a test.</Text>
    </ScreenScroll>
  );
}

function FamilyState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) { return <ScreenScroll theme="patient"><PageHeader eyebrow="Familiar people" title={title} subtitle={body} theme="patient" /><SurfaceCard theme="patient" style={styles.membersCard}><Text style={styles.introTitle}>{title}</Text><Text style={styles.introBody}>{body}</Text>{actionLabel && onAction ? <MenteButton label={actionLabel} onPress={onAction} theme="patient" /> : null}</SurfaceCard></ScreenScroll>; }

const styles = StyleSheet.create({
  introCard: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  introTitle: {
    color: patientTheme.colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  introBody: {
    color: patientTheme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  membersCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  playedPanel: {
    backgroundColor: patientTheme.colors.forestSoft,
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  playedTitle: {
    color: patientTheme.colors.forest,
    fontSize: 16,
    fontWeight: '800',
  },
  playedBody: {
    color: patientTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  fullButton: {
    marginBottom: spacing.sm,
  },
  note: {
    color: patientTheme.colors.textFaint,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
