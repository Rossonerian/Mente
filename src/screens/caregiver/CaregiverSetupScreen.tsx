import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MenteButton, TextButton } from '../../components/Button';
import { SurfaceCard, SoftPanel } from '../../components/Card';
import { MenteIcon } from '../../components/Icon';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { ToggleRow } from '../../components/ToggleRow';
import { caregiverTheme, spacing } from '../../theme/tokens';
import { menteMockData } from '../../data/mockData';

export function CaregiverSetupScreen({ onBack }: { onBack: () => void }) {
  const [sameDayAlertsOn, setSameDayAlertsOn] = useState(true);
  const [saved, setSaved] = useState(false);
  const { patient } = menteMockData;

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader
        eyebrow="Setup · 1 of 1"
        title="Set up Rosa’s companion"
        subtitle="Choose a calm daily moment. Everything on this screen is local preview state."
        theme="caregiver"
        onBack={onBack}
      />

      <View style={styles.stepRow}>
        <View style={styles.stepActive}><Text style={styles.stepActiveLabel}>1</Text></View>
        <View style={styles.stepLine} />
        <View style={styles.step}><Text style={styles.stepLabel}>✓</Text></View>
        <Text style={styles.stepCaption}>Schedule ready to review</Text>
      </View>

      <SurfaceCard theme="caregiver" style={styles.scheduleCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconPanel}>
            <MenteIcon name="time-outline" size={23} color={caregiverTheme.colors.primary} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>Daily companion time</Text>
            <Text style={styles.cardBody}>A short, familiar moment for {patient.preferredName}.</Text>
          </View>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.time}>{patient.callTime}</Text>
          <Text style={styles.timeDetail}>Every day · {patient.timezone}</Text>
        </View>
        <SetupRow icon="moon-outline" label="Quiet hours" value={patient.quietHours} />
        <SetupRow icon="language-outline" label="Language" value="English · verified preview" />
      </SurfaceCard>

      <SurfaceCard theme="caregiver" style={styles.preferenceCard}>
        <Text style={styles.preferenceTitle}>Caregiver attention</Text>
        <Text style={styles.preferenceBody}>Keep a same-day review prompt visible when recent activity may need a closer look.</Text>
        <ToggleRow title="Same-day attention" detail="Rosa may need a check-in when a session ends early after more support." value={sameDayAlertsOn} onValueChange={setSameDayAlertsOn} />
      </SurfaceCard>

      {saved ? (
        <SoftPanel theme="caregiver" style={styles.savedPanel}>
          <MenteIcon name="checkmark-circle" size={20} color={caregiverTheme.colors.stable} />
          <View style={styles.savedCopy}>
            <Text style={styles.savedTitle}>Setup is ready in this preview</Text>
            <Text style={styles.savedBody}>No schedule or notification service is connected.</Text>
          </View>
        </SoftPanel>
      ) : null}
      <MenteButton
        label={saved ? 'Return to settings' : 'Save setup'}
        onPress={() => { if (saved) onBack(); else setSaved(true); }}
        theme="caregiver"
        iconName={saved ? 'arrow-back-outline' : 'checkmark-outline'}
        style={styles.fullButton}
      />
      {!saved ? <TextButton label="Cancel" onPress={onBack} accessibilityHint="Returns to settings" theme="caregiver" iconName="close-outline" /> : null}
    </ScreenScroll>
  );
}

function SetupRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.setupRow}>
      <MenteIcon name={icon} size={20} color={caregiverTheme.colors.textFaint} />
      <Text style={styles.setupLabel}>{label}</Text>
      <Text style={styles.setupValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  stepActive: {
    alignItems: 'center',
    backgroundColor: caregiverTheme.colors.primary,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepActiveLabel: {
    color: caregiverTheme.colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  stepLine: {
    backgroundColor: caregiverTheme.colors.primary,
    flex: 0.35,
    height: 2,
  },
  step: {
    alignItems: 'center',
    backgroundColor: caregiverTheme.colors.stableBackground,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepLabel: {
    color: caregiverTheme.colors.stable,
    fontSize: 13,
    fontWeight: '800',
  },
  stepCaption: {
    color: caregiverTheme.colors.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleCard: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconPanel: {
    alignItems: 'center',
    backgroundColor: caregiverTheme.colors.surfaceMuted,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  cardTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  timeBlock: {
    backgroundColor: caregiverTheme.colors.background,
    borderRadius: caregiverTheme.radii.control,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  time: {
    color: caregiverTheme.colors.primary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  timeDetail: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  setupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
  },
  setupLabel: {
    color: caregiverTheme.colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  setupValue: {
    color: caregiverTheme.colors.textMuted,
    flexShrink: 1,
    fontSize: 12,
    textAlign: 'right',
  },
  preferenceCard: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  preferenceTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  preferenceBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  savedPanel: {
    alignItems: 'flex-start',
    backgroundColor: caregiverTheme.colors.stableBackground,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  savedCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  savedTitle: {
    color: caregiverTheme.colors.stable,
    fontSize: 14,
    fontWeight: '800',
  },
  savedBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  fullButton: {
    marginBottom: spacing.xs,
  },
});
