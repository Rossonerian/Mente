import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input } from 'tamagui';
import type { CaregiverSettingsFormValues, CaregiverSettingsViewModel } from '../../api/adapters/caregiverSettings';
import { ApiError } from '../../api/errors';
import { MenteButton } from '../../components/Button';
import { SurfaceCard, Hairline, SoftPanel } from '../../components/Card';
import { FocusablePressable } from '../../components/FocusablePressable';
import { MenteIcon } from '../../components/Icon';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { ToggleRow } from '../../components/ToggleRow';
import { GlassSurface } from '../../components/glass/GlassSurface';
import { mergeSavedFormValues, useCaregiverSettingsQuery, useUpdateCaregiverSettingsMutation } from '../../features/caregiver/settings/useCaregiverSettings';
import { caregiverSettingsSchema } from '../../features/caregiver/settings/settingsSchema';
import { caregiverTheme, spacing } from '../../theme/tokens';
import { useCaregiverAuth } from '../../auth/CaregiverAuthContext';
import { isDevelopmentMockMode } from '../../api/config';

const scheduleFields = new Set<keyof CaregiverSettingsFormValues>(['localTime', 'timezone', 'daysOfWeek', 'quietStart', 'quietEnd', 'languageCode', 'active', 'allowOneRetry']);
const notificationFields = new Set<keyof CaregiverSettingsFormValues>(['sameDayEnabled', 'routineEnabled', 'caregiverPhoneE164', 'remindersPaused']);
type ScreenProps = { onOpenSetup: () => void; onSwitchRole: () => void; caregiverId: string | null; accessToken: string | null };
type ConnectedScreenProps = Omit<ScreenProps, 'caregiverId' | 'accessToken'> & { caregiverId: string; accessToken: string };

export function CaregiverSettingsScreen(props: ScreenProps) {
  const { signOut } = useCaregiverAuth();
  if (!props.caregiverId || !props.accessToken) return <SettingsAccessState onSwitchRole={props.onSwitchRole} />;
  return <ConnectedCaregiverSettingsScreen {...props} caregiverId={props.caregiverId} accessToken={props.accessToken} onSessionExpired={() => void signOut()} />;
}

function ConnectedCaregiverSettingsScreen({ onOpenSetup, onSwitchRole, caregiverId, accessToken, onSessionExpired }: ConnectedScreenProps & { onSessionExpired: () => void }) {
  const settings = useCaregiverSettingsQuery({ caregiverId, accessToken });
  if (settings.kind === 'loading') return <SettingsLoadingState />;
  if (settings.kind === 'empty') return <SettingsMessageState title="No patient settings yet" body="Add a family and a person in companion setup before configuring their daily call." actionLabel="Try again" onAction={settings.retry} />;
  if (settings.kind === 'session-expired') return <SettingsMessageState title="Your session has ended" body="Sign in again to keep this caregiver information protected." actionLabel="Sign out" onAction={onSessionExpired} />;
  if (settings.kind === 'forbidden') return <SettingsMessageState title="Settings are unavailable" body="This caregiver account does not have permission to change these settings." />;
  if (settings.kind === 'offline') return <SettingsMessageState title="You’re offline" body={settings.staleData ? 'The last saved settings are available again after you reconnect.' : 'Reconnect to load and change these settings.'} actionLabel="Try again" onAction={settings.retry} />;
  if (settings.kind === 'error') return <SettingsMessageState title="We could not load settings" body={settings.staleData ? 'The last saved settings may be out of date.' : settings.error.message} actionLabel="Try again" onAction={settings.retry} />;
  return <SettingsForm data={settings.data} isRefreshing={settings.isRefreshing} isStale={settings.isStale} onRefresh={settings.refresh} onOpenSetup={onOpenSetup} onSwitchRole={onSwitchRole} caregiverId={caregiverId} accessToken={accessToken} />;
}

function SettingsForm({ data, isRefreshing, isStale, onRefresh, onOpenSetup, onSwitchRole, caregiverId, accessToken }: { data: CaregiverSettingsViewModel; isRefreshing: boolean; isStale: boolean; onRefresh: () => void; onOpenSetup: () => void; onSwitchRole: () => void; caregiverId: string; accessToken: string }) {
  const form = useForm<CaregiverSettingsFormValues>({ defaultValues: data, resolver: zodResolver(caregiverSettingsSchema), mode: 'onBlur' });
  const mutation = useUpdateCaregiverSettingsMutation({ caregiverId, accessToken });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { dirtyFields, errors, isDirty, isSubmitting } = form.formState;
  const saving = isSubmitting || mutation.isPending;

  useEffect(() => {
    if (!form.formState.isDirty) form.reset(data);
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveMessage(null);
    const dirtyNames = Object.keys(dirtyFields) as (keyof CaregiverSettingsFormValues)[];
    try {
      const result = await mutation.mutateAsync({
        patientId: data.patientId,
        values,
        updateSchedule: dirtyNames.some((name) => scheduleFields.has(name)),
        updateNotificationPreference: dirtyNames.some((name) => notificationFields.has(name)),
      });
      form.reset(mergeSavedFormValues(values, result));
      setSaveMessage('Settings saved.');
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [name, message] of Object.entries(error.fieldErrors)) form.setError(name as FieldPath<CaregiverSettingsFormValues>, { type: 'server', message });
        setSaveMessage(error.message);
      } else {
        setSaveMessage('Mente could not save these settings. Please try again.');
      }
    }
  });

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="Caregiver controls" title="Settings" subtitle="Keep daily calls and family attention preferences simple and direct." theme="caregiver" />
      {isStale && !isRefreshing ? <SoftPanel theme="caregiver" style={styles.stalePanel}><Text style={styles.staleText}>This information may be out of date.</Text><MenteButton label="Refresh" onPress={onRefresh} theme="caregiver" variant="quiet" /></SoftPanel> : null}
      {isRefreshing ? <Text accessibilityLiveRegion="polite" style={styles.refreshingText}>Refreshing saved settings…</Text> : null}
      <GlassSurface theme="caregiver" variant="elevated" style={styles.settingsCard}>
        <CardHeading icon="call-outline" title="Daily companion call" subtitle={`A gentle voice moment for ${data.patientName}`} />
        {!data.patientPhoneConfigured ? <SoftPanel theme="caregiver" style={styles.phoneNotice}><Text style={styles.phoneNoticeText}>Add a patient phone number in companion setup before turning this call on.</Text></SoftPanel> : null}
        <View style={styles.solidGroup}>
          <FormTextField control={form.control} name="localTime" label="Call time" hint="24-hour time, for example 09:00" editable={!saving} />
          <Hairline theme="caregiver" /><FormTextField control={form.control} name="timezone" label="Time zone" hint="IANA time zone, for example Asia/Kolkata" editable={!saving} />
          <Hairline theme="caregiver" /><DayPicker control={form.control} error={errors.daysOfWeek?.message} disabled={saving} />
          <Hairline theme="caregiver" /><FormTextField control={form.control} name="quietStart" label="Quiet hours start" hint="Leave both quiet-hour fields blank to disable" editable={!saving} />
          <Hairline theme="caregiver" /><FormTextField control={form.control} name="quietEnd" label="Quiet hours end" hint="24-hour time, for example 07:00" editable={!saving} />
          <Hairline theme="caregiver" /><FormTextField control={form.control} name="languageCode" label="Language" hint="Language code, for example en-IN" editable={!saving} />
          <Hairline theme="caregiver" /><BooleanField control={form.control} name="active" title="Daily companion call" detail="Keep the scheduled companion call active." disabled={saving} />
          <Hairline theme="caregiver" /><BooleanField control={form.control} name="allowOneRetry" title="One gentle retry" detail="Offer one later attempt when a call cannot be completed." disabled={saving} />
        </View>
      </GlassSurface>
      <GlassSurface theme="caregiver" variant="subtle" style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Attention preferences</Text><Text style={styles.sectionBody}>Same-day attention stays visible in Mente even when a notification is not delivered.</Text>
        <View style={styles.solidGroup}>
          <BooleanField control={form.control} name="sameDayEnabled" title="Same-day attention" detail="Send a clear caregiver review prompt when a session may need attention." disabled={saving} />
          <Hairline theme="caregiver" /><BooleanField control={form.control} name="routineEnabled" title="Routine updates" detail="Allow routine companion summaries when available." disabled={saving} />
          <Hairline theme="caregiver" /><FormTextField control={form.control} name="caregiverPhoneE164" label="Caregiver phone" hint="Optional. Include country code, for example +919999999999" editable={!saving} keyboardType="phone-pad" />
          <Hairline theme="caregiver" /><BooleanField control={form.control} name="remindersPaused" title="Pause reminders" detail="Keep saved preferences without scheduling a reminder." disabled={saving} />
        </View>
      </GlassSurface>
      {saveMessage ? <SoftPanel theme="caregiver" style={mutation.isError ? styles.errorPanel : styles.savedPanel}><Text accessibilityLiveRegion="polite" style={mutation.isError ? styles.errorText : styles.savedText}>{saveMessage}</Text></SoftPanel> : null}
      <MenteButton label={saving ? 'Saving settings…' : 'Save changes'} onPress={onSubmit} theme="caregiver" iconName="checkmark-circle-outline" disabled={!isDirty || saving} style={styles.fullButton} />
      <MenteButton label="Open companion setup" onPress={onOpenSetup} theme="caregiver" variant="secondary" iconName="options-outline" disabled={saving} style={styles.fullButton} />
      {isDevelopmentMockMode ? <SurfaceCard theme="caregiver" style={styles.previewCard}><View style={styles.previewIcon}><MenteIcon name="code-slash-outline" size={20} color={caregiverTheme.colors.primary} /></View><View style={styles.previewCopy}><Text style={styles.previewTitle}>Development role preview</Text><Text style={styles.previewBody}>Switch to the patient experience to review the warm, no-typing play flow.</Text></View><MenteButton label="Switch role" onPress={onSwitchRole} theme="caregiver" variant="quiet" iconName="swap-horizontal-outline" disabled={saving} style={styles.switchButton} /></SurfaceCard> : null}
      <SoftPanel theme="caregiver" style={styles.aboutPanel}><Text style={styles.aboutTitle}>Mente is assistive</Text><Text style={styles.aboutBody}>Activity signals help a caregiver decide when to check in. They are not a diagnosis or a medical conclusion.</Text></SoftPanel>
    </ScreenScroll>
  );
}

function CardHeading({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) { return <View style={styles.cardHeading}><View style={styles.cardIcon}><MenteIcon name={icon} size={20} color={caregiverTheme.colors.primary} /></View><View style={styles.cardHeadingCopy}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardSubtitle}>{subtitle}</Text></View></View>; }
function FormTextField({ control, name, label, hint, editable, keyboardType = 'default' }: { control: Control<CaregiverSettingsFormValues>; name: FieldPath<CaregiverSettingsFormValues>; label: string; hint: string; editable: boolean; keyboardType?: 'default' | 'phone-pad' }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><Input value={String(field.value ?? '')} onBlur={field.onBlur} onChangeText={field.onChange} disabled={!editable} keyboardType={keyboardType} autoCapitalize="none" accessibilityLabel={label} accessibilityHint={hint} borderColor={fieldState.error ? caregiverTheme.colors.alert : caregiverTheme.colors.border} color={caregiverTheme.colors.text} background={editable ? caregiverTheme.colors.white : caregiverTheme.colors.surfaceMuted} style={styles.tamaguiInput} /><Text style={[styles.fieldHint, fieldState.error && styles.fieldError]} accessibilityLiveRegion="polite">{fieldState.error?.message ?? hint}</Text></View>} />;
}
function BooleanField({ control, name, title, detail, disabled }: { control: Control<CaregiverSettingsFormValues>; name: FieldPath<CaregiverSettingsFormValues>; title: string; detail: string; disabled: boolean }) { return <Controller control={control} name={name} render={({ field }) => <ToggleRow title={title} detail={detail} value={Boolean(field.value)} onValueChange={field.onChange} disabled={disabled} />} />; }
function DayPicker({ control, error, disabled }: { control: Control<CaregiverSettingsFormValues>; error?: string; disabled: boolean }) {
  const days = [['M', 0], ['T', 1], ['W', 2], ['T', 3], ['F', 4], ['S', 5], ['S', 6]] as const;
  return <Controller control={control} name="daysOfWeek" render={({ field }) => <View style={styles.dayField}><Text style={styles.fieldLabel}>Days</Text><View style={styles.dayRow}>{days.map(([label, day]) => { const selected = field.value.includes(day); return <FocusablePressable key={`${label}-${day}`} accessibilityRole="button" accessibilityLabel={`${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day]} ${selected ? 'selected' : 'not selected'}`} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => field.onChange(selected ? field.value.filter((value) => value !== day) : [...field.value, day].sort((a, b) => a - b))} style={({ focused, pressed }) => [styles.dayButton, selected && styles.dayButtonSelected, focused && styles.dayButtonFocused, { opacity: disabled ? 0.55 : pressed ? 0.7 : 1 }]}><Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>{label}</Text></FocusablePressable>; })}</View><Text style={[styles.fieldHint, error && styles.fieldError]} accessibilityLiveRegion="polite">{error ?? 'Choose the days a call may be scheduled.'}</Text></View>} />;
}
function SettingsLoadingState() { return <ScreenScroll theme="caregiver"><PageHeader eyebrow="Caregiver controls" title="Settings" subtitle="Loading saved preferences…" theme="caregiver" /><View accessibilityRole="progressbar" accessibilityLabel="Loading settings" style={styles.skeletonCard}>{[0, 1, 2, 3].map((item) => <View key={item} style={styles.skeletonLine} />)}</View></ScreenScroll>; }
function SettingsAccessState({ onSwitchRole }: { onSwitchRole: () => void }) { return <SettingsMessageState title="Caregiver sign-in required" body="Sign in with a caregiver account to view and change saved settings." actionLabel={isDevelopmentMockMode ? 'Switch role' : undefined} onAction={isDevelopmentMockMode ? onSwitchRole : undefined} />; }
function SettingsMessageState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) { return <ScreenScroll theme="caregiver"><PageHeader eyebrow="Caregiver controls" title={title} subtitle={body} theme="caregiver" /><SurfaceCard theme="caregiver" style={styles.stateCard}><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateBody}>{body}</Text>{actionLabel && onAction ? <MenteButton label={actionLabel} onPress={onAction} theme="caregiver" /> : null}</SurfaceCard></ScreenScroll>; }

const styles = StyleSheet.create({
  settingsCard: { gap: spacing.sm, marginBottom: spacing.lg, padding: spacing.md }, solidGroup: { backgroundColor: caregiverTheme.colors.surface, borderColor: caregiverTheme.colors.border, borderRadius: caregiverTheme.radii.control, borderWidth: 1, paddingHorizontal: spacing.sm }, cardHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm }, cardIcon: { alignItems: 'center', backgroundColor: caregiverTheme.colors.surfaceMuted, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 }, cardHeadingCopy: { flex: 1, gap: spacing.xxs }, cardTitle: { color: caregiverTheme.colors.text, fontSize: 16, fontWeight: '800' }, cardSubtitle: { color: caregiverTheme.colors.textMuted, fontSize: 13, lineHeight: 18 },
  field: { gap: 4, minHeight: 76, paddingVertical: spacing.xs }, fieldLabel: { color: caregiverTheme.colors.text, fontSize: 14, fontWeight: '800' }, tamaguiInput: { minHeight: 48 }, fieldHint: { color: caregiverTheme.colors.textMuted, fontSize: 12, lineHeight: 16 }, fieldError: { color: caregiverTheme.colors.alert, fontWeight: '700' },
  dayField: { gap: spacing.xs, minHeight: 104, paddingVertical: spacing.xs }, dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, dayButton: { alignItems: 'center', backgroundColor: caregiverTheme.colors.surfaceMuted, borderColor: caregiverTheme.colors.border, borderRadius: 8, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 }, dayButtonSelected: { backgroundColor: caregiverTheme.colors.primary, borderColor: caregiverTheme.colors.primary }, dayButtonFocused: { borderColor: caregiverTheme.colors.text, borderWidth: 3 }, dayLabel: { color: caregiverTheme.colors.primary, fontSize: 13, fontWeight: '800' }, dayLabelSelected: { color: caregiverTheme.colors.white },
  sectionTitle: { color: caregiverTheme.colors.text, fontSize: 16, fontWeight: '800' }, sectionBody: { color: caregiverTheme.colors.textMuted, fontSize: 13, lineHeight: 19 }, phoneNotice: { backgroundColor: caregiverTheme.colors.alertBackground, padding: spacing.sm }, phoneNoticeText: { color: caregiverTheme.colors.text, fontSize: 13, fontWeight: '700', lineHeight: 18 }, stalePanel: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', marginBottom: spacing.sm }, staleText: { color: caregiverTheme.colors.textMuted, flex: 1, fontSize: 13, fontWeight: '700' }, refreshingText: { color: caregiverTheme.colors.textMuted, fontSize: 12, marginBottom: spacing.sm }, savedPanel: { backgroundColor: caregiverTheme.colors.stableBackground, marginBottom: spacing.sm }, errorPanel: { backgroundColor: caregiverTheme.colors.alertBackground, marginBottom: spacing.sm }, savedText: { color: caregiverTheme.colors.stable, fontSize: 14, fontWeight: '800' }, errorText: { color: caregiverTheme.colors.alert, fontSize: 14, fontWeight: '800' }, fullButton: { marginBottom: spacing.sm },
  previewCard: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }, previewIcon: { alignItems: 'center', backgroundColor: caregiverTheme.colors.surfaceMuted, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 }, previewCopy: { flex: 1, gap: spacing.xxs, minWidth: 180 }, previewTitle: { color: caregiverTheme.colors.text, fontSize: 15, fontWeight: '800' }, previewBody: { color: caregiverTheme.colors.textMuted, fontSize: 13, lineHeight: 19 }, switchButton: { flexBasis: '100%' }, aboutPanel: { gap: spacing.xxs, marginTop: spacing.lg }, aboutTitle: { color: caregiverTheme.colors.text, fontSize: 14, fontWeight: '800' }, aboutBody: { color: caregiverTheme.colors.textMuted, fontSize: 13, lineHeight: 19 },
  skeletonCard: { backgroundColor: caregiverTheme.colors.surface, borderColor: caregiverTheme.colors.border, borderRadius: caregiverTheme.radii.card, borderWidth: 1, gap: spacing.sm, padding: spacing.md }, skeletonLine: { backgroundColor: caregiverTheme.colors.surfaceMuted, borderRadius: 8, height: 52 }, stateCard: { gap: spacing.sm }, stateTitle: { color: caregiverTheme.colors.text, fontSize: 18, fontWeight: '800' }, stateBody: { color: caregiverTheme.colors.textMuted, fontSize: 14, lineHeight: 20 },
});
