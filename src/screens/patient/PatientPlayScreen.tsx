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

export function PatientPlayScreen({ onNavigate }: { onNavigate: (route: PatientRoute) => void }) {
  const { patient, family } = menteMockData;

  return (
    <ScreenScroll theme="patient">
      <PageHeader
        eyebrow="A gentle moment"
        title={`Hello, ${patient.preferredName}`}
        subtitle="There is no rush. Spend a little time with people and memories that feel familiar."
        theme="patient"
      />

      <SurfaceCard theme="patient" style={styles.invitationCard}>
        <View style={styles.invitationTopRow}>
          <View style={styles.invitationCopy}>
            <Text style={styles.invitationEyebrow}>Today’s invitation</Text>
            <Text style={styles.invitationTitle}>A few familiar moments</Text>
            <Text style={styles.invitationBody}>Listen, look, or pass. You are always in control.</Text>
          </View>
          <FamilyConstellation theme="patient" />
        </View>
        <MenteButton label="Start today’s moment" onPress={() => onNavigate('in-game')} theme="patient" iconName="play" />
      </SurfaceCard>

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

const styles = StyleSheet.create({
  invitationCard: {
    backgroundColor: patientTheme.colors.surfaceWarm,
    gap: spacing.md,
    marginBottom: spacing.xl,
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
});
