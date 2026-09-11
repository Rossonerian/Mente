import { StyleSheet, Text, View } from 'react-native';
import { MenteButton } from '../../components/Button';
import { SurfaceCard, SoftPanel } from '../../components/Card';
import { MenteIcon } from '../../components/Icon';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { patientTheme, spacing } from '../../theme/tokens-enhanced';
import type { PatientRoute } from '../../types';

export function PatientHelpScreen({ onNavigate }: { onNavigate: (route: PatientRoute) => void }) {
  return (
    <ScreenScroll theme="patient">
      <PageHeader
        eyebrow="You are in control"
        title="Help"
        subtitle="Mente is here for a quiet moment. You can always pause or stop."
        theme="patient"
      />

      <SurfaceCard theme="patient" style={styles.controlCard}>
        <View style={styles.controlIcon}>
          <MenteIcon name="hand-left-outline" size={26} color={patientTheme.colors.primary} />
        </View>
        <Text style={styles.controlTitle}>Every moment has a stop</Text>
        <Text style={styles.controlBody}>During an activity, use Show again to revisit a prompt, Skip to move on, or Stop to finish for now.</Text>
        <MenteButton label="Finish for now" onPress={() => onNavigate('complete')} theme="patient" variant="secondary" iconName="stop-circle-outline" />
      </SurfaceCard>

      <SurfaceCard theme="patient" style={styles.howCard}>
        <Text style={styles.howTitle}>How a moment works</Text>
        <HelpRow icon="eye-outline" title="Look over" body="A familiar person or memory is shown one at a time." />
        <HelpRow icon="refresh-outline" title="Show again" body="See the moment again whenever you want." />
        <HelpRow icon="arrow-forward-outline" title="Skip" body="Move to another moment without needing to explain." />
      </SurfaceCard>

      <SoftPanel theme="patient" style={styles.supportPanel}>
        <Text style={styles.supportTitle}>A little is enough</Text>
        <Text style={styles.supportBody}>There are no scores, timers, streaks, or wrong answers here.</Text>
      </SoftPanel>
    </ScreenScroll>
  );
}

function HelpRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <View style={styles.helpRow}>
      <View style={styles.helpIcon}>
        <MenteIcon name={icon} size={21} color={patientTheme.colors.primary} />
      </View>
      <View style={styles.helpCopy}>
        <Text style={styles.helpTitle}>{title}</Text>
        <Text style={styles.helpBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlCard: {
    alignItems: 'flex-start',
    backgroundColor: patientTheme.colors.surfaceWarm,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  controlIcon: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.coralSoft,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  controlTitle: {
    color: patientTheme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 29,
  },
  controlBody: {
    color: patientTheme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  howCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  howTitle: {
    color: patientTheme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  helpRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  helpIcon: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.coralSoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  helpCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  helpTitle: {
    color: patientTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  helpBody: {
    color: patientTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  supportPanel: {
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  supportTitle: {
    color: patientTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  supportBody: {
    color: patientTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
