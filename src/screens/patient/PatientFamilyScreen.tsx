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

export function PatientFamilyScreen() {
  const [playedName, setPlayedName] = useState<string | null>(null);
  const { family } = menteMockData;
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
          <Text style={styles.playedBody}>This voice moment is represented locally in the preview.</Text>
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
