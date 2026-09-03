import { StyleSheet, Text, View } from 'react-native';
import { MenteButton } from '../../components/Button';
import { SurfaceCard, SoftPanel } from '../../components/Card';
import { MenteIcon } from '../../components/Icon';
import { ScreenScroll } from '../../components/Screen';
import { patientTheme, spacing } from '../../theme/tokens';

export function PatientCompleteScreen({ onReturnToPlay, onFamily }: { onReturnToPlay: () => void; onFamily: () => void }) {
  return (
    <ScreenScroll theme="patient" contentStyle={styles.body}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>m</Text></View>
        <Text style={styles.brand}>mente</Text>
      </View>
      <View style={styles.centerContent}>
        <View style={styles.completeIcon}>
          <MenteIcon name="leaf-outline" size={38} color={patientTheme.colors.forest} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>That was enough for today</Text>
        <Text style={styles.subtitle}>Thank you for spending a quiet moment with your family. You can come back whenever it feels right.</Text>
        <SurfaceCard theme="patient" style={styles.completeCard}>
          <Text style={styles.cardTitle}>A gentle close</Text>
          <Text style={styles.cardBody}>There is nothing to finish and nothing to remember perfectly. A little time together is enough.</Text>
          <SoftPanel theme="patient" style={styles.familyNote}>
            <MenteIcon name="people-outline" size={21} color={patientTheme.colors.primary} />
            <Text style={styles.familyNoteText}>Ana, Miguel, and Sofia are close by in your family memories.</Text>
          </SoftPanel>
        </SurfaceCard>
        <View style={styles.actions}>
          <MenteButton label="Return to Play" onPress={onReturnToPlay} theme="patient" iconName="arrow-back-outline" />
          <MenteButton label="See family" onPress={onFamily} theme="patient" variant="secondary" iconName="people-outline" />
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.primary,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  brandMarkText: {
    color: patientTheme.colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  brand: {
    color: patientTheme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  completeIcon: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.forestSoft,
    borderRadius: 42,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  title: {
    color: patientTheme.colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 37,
    textAlign: 'center',
  },
  subtitle: {
    color: patientTheme.colors.textMuted,
    fontSize: 18,
    lineHeight: 27,
    maxWidth: 360,
    textAlign: 'center',
  },
  completeCard: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  cardTitle: {
    color: patientTheme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardBody: {
    color: patientTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  familyNote: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.coralSoft,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  familyNoteText: {
    color: patientTheme.colors.textMuted,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
});
