import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MenteButton } from '../../components/Button';
import { SurfaceCard, Hairline, SoftPanel } from '../../components/Card';
import { FocusablePressable } from '../../components/FocusablePressable';
import { MenteIcon } from '../../components/Icon';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { ToggleRow } from '../../components/ToggleRow';
import { caregiverTheme, spacing } from '../../theme/tokens';
import { menteMockData } from '../../data/mockData';

export function CaregiverSettingsScreen({ onOpenSetup, onSwitchRole }: { onOpenSetup: () => void; onSwitchRole: () => void }) {
  const [remindersOn, setRemindersOn] = useState(true);
  const [sameDayAlertsOn, setSameDayAlertsOn] = useState(true);
  const [saved, setSaved] = useState(false);
  const { patient } = menteMockData;

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader
        eyebrow="Caregiver controls"
        title="Settings"
        subtitle="Keep reminders and family attention preferences simple and direct."
        theme="caregiver"
      />

      <SurfaceCard theme="caregiver" style={styles.settingsCard}>
        <View style={styles.cardHeading}>
          <View style={styles.cardIcon}>
            <MenteIcon name="call-outline" size={20} color={caregiverTheme.colors.primary} />
          </View>
          <View style={styles.cardHeadingCopy}>
            <Text style={styles.cardTitle}>Daily companion call</Text>
            <Text style={styles.cardSubtitle}>A gentle voice moment for {patient.preferredName}</Text>
          </View>
        </View>
        <Hairline theme="caregiver" />
        <SettingRow icon="time-outline" label="Call time" value={patient.callTime} onPress={onOpenSetup} />
        <Hairline theme="caregiver" />
        <SettingRow icon="calendar-outline" label="Days" value="Every day" onPress={onOpenSetup} />
        <Hairline theme="caregiver" />
        <SettingRow icon="moon-outline" label="Quiet hours" value={patient.quietHours} onPress={onOpenSetup} />
        <Hairline theme="caregiver" />
        <ToggleRow title="Daily reminders" detail="Keep the scheduled companion call active." value={remindersOn} onValueChange={(value) => { setRemindersOn(value); setSaved(false); }} />
      </SurfaceCard>

      <SurfaceCard theme="caregiver" style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Attention preferences</Text>
        <Text style={styles.sectionBody}>Same-day attention stays visible here even when a notification is not delivered.</Text>
        <Hairline theme="caregiver" />
        <ToggleRow title="Same-day attention" detail="Show a clear caregiver review prompt when a session may need attention." value={sameDayAlertsOn} onValueChange={(value) => { setSameDayAlertsOn(value); setSaved(false); }} />
        <Hairline theme="caregiver" />
        <SettingRow icon="notifications-outline" label="Routine updates" value="In-app only" />
      </SurfaceCard>

      {saved ? (
        <SoftPanel theme="caregiver" style={styles.savedPanel}>
          <Text style={styles.savedTitle}>Preferences saved in this preview</Text>
          <Text style={styles.savedBody}>No account or notification service is connected.</Text>
        </SoftPanel>
      ) : null}
      <MenteButton label={saved ? 'Saved locally' : 'Save changes'} onPress={() => setSaved(true)} theme="caregiver" iconName="checkmark-circle-outline" style={styles.fullButton} />
      <MenteButton label="Open companion setup" onPress={onOpenSetup} theme="caregiver" variant="secondary" iconName="options-outline" style={styles.fullButton} />

      <SurfaceCard theme="caregiver" style={styles.previewCard}>
        <View style={styles.previewIcon}>
          <MenteIcon name="code-slash-outline" size={20} color={caregiverTheme.colors.primary} />
        </View>
        <View style={styles.previewCopy}>
          <Text style={styles.previewTitle}>Development role preview</Text>
          <Text style={styles.previewBody}>Switch to the patient experience to review the warm, no-typing play flow.</Text>
        </View>
        <MenteButton label="Switch role" onPress={onSwitchRole} theme="caregiver" variant="quiet" iconName="swap-horizontal-outline" style={styles.switchButton} />
      </SurfaceCard>

      <SoftPanel theme="caregiver" style={styles.aboutPanel}>
        <Text style={styles.aboutTitle}>Mente is assistive</Text>
        <Text style={styles.aboutBody}>Activity signals help a caregiver decide when to check in. They are not a diagnosis or a medical conclusion.</Text>
      </SoftPanel>
    </ScreenScroll>
  );
}

function SettingRow({ icon, label, value, onPress }: { icon: string; label: string; value: string; onPress?: () => void }) {
  const row = (
    <View style={styles.settingRow}>
      <MenteIcon name={icon} size={20} color={caregiverTheme.colors.textFaint} />
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
      {onPress ? <MenteIcon name="chevron-forward" size={18} color={caregiverTheme.colors.primary} /> : null}
    </View>
  );

  if (!onPress) return row;

  return (
    <FocusablePressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      accessibilityHint="Opens companion setup"
      onPress={onPress}
      style={({ pressed, focused }) => [
        styles.settingPressable,
        focused && { borderColor: caregiverTheme.colors.text, borderRadius: 8, borderWidth: 2 },
        { opacity: pressed ? 0.65 : 1 },
      ]}
    >
      {row}
    </FocusablePressable>
  );
}

const styles = StyleSheet.create({
  settingsCard: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: caregiverTheme.colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  cardHeadingCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  cardTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
  },
  settingPressable: {
    borderRadius: 8,
  },
  settingLabel: {
    color: caregiverTheme.colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  settingValue: {
    color: caregiverTheme.colors.textMuted,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  sectionTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  savedPanel: {
    backgroundColor: caregiverTheme.colors.stableBackground,
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  savedTitle: {
    color: caregiverTheme.colors.stable,
    fontSize: 14,
    fontWeight: '800',
  },
  savedBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
  },
  fullButton: {
    marginBottom: spacing.sm,
  },
  previewCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  previewIcon: {
    alignItems: 'center',
    backgroundColor: caregiverTheme.colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  previewCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 180,
  },
  previewTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  previewBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  switchButton: {
    flexBasis: '100%',
  },
  aboutPanel: {
    gap: spacing.xxs,
    marginTop: spacing.lg,
  },
  aboutTitle: {
    color: caregiverTheme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  aboutBody: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
