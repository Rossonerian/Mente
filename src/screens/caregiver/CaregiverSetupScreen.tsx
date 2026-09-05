<<<<<<< HEAD
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input } from 'tamagui';
import { z } from 'zod';
import { createCaregiverClient } from '../../api/caregiverClient';
import { isDevelopmentMockMode } from '../../api/config';
import { ApiError } from '../../api/errors';
=======
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
>>>>>>> origin/new_components
import { MenteButton, TextButton } from '../../components/Button';
import { SurfaceCard, SoftPanel } from '../../components/Card';
import { MenteIcon } from '../../components/Icon';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
<<<<<<< HEAD
import { caregiverTheme, spacing } from '../../theme/tokens';
import { toSetupFormField } from '../../features/caregiver/setup/formFields';

const setupSchema = z.object({
  familyName: z.string().trim().min(1, 'Enter a family name.').max(120),
  preferredName: z.string().trim().min(1, 'Enter a preferred name.').max(120),
  legalName: z.string().trim().max(160).optional(),
  phoneE164: z.string().trim().regex(/^$|^\+[1-9]\d{7,14}$/, 'Use a phone number with country code, for example +919876543210.'),
  timezone: z.string().trim().min(1, 'Enter an IANA time zone.').max(64),
  languageCode: z.string().trim().min(1, 'Enter a language code.').max(32),
});
type SetupValues = z.infer<typeof setupSchema>;

export function CaregiverSetupScreen({ onBack, caregiverId, accessToken }: { onBack: () => void; caregiverId: string | null; accessToken: string | null }) {
  if (isDevelopmentMockMode) return <SetupState title="Preview setup" body="Development preview does not create a family or patient record." onBack={onBack} />;
  if (!caregiverId || !accessToken) return <SetupState title="Caregiver sign-in required" body="Sign in with a caregiver account before creating a family profile." onBack={onBack} />;
  return <ConnectedSetup onBack={onBack} caregiverId={caregiverId} accessToken={accessToken} />;
}

function ConnectedSetup({ onBack, caregiverId, accessToken }: { onBack: () => void; caregiverId: string; accessToken: string }) {
  const queryClient = useQueryClient();
  const client = useMemo(() => createCaregiverClient(accessToken), [accessToken]);
  const [createdFamilyId, setCreatedFamilyId] = useState<string | null>(null);
  const form = useForm<SetupValues>({ defaultValues: { familyName: '', preferredName: '', legalName: '', phoneE164: '', timezone: 'Asia/Kolkata', languageCode: 'en-IN' }, resolver: zodResolver(setupSchema), mode: 'onBlur' });
  const mutation = useMutation({
    mutationFn: async (values: SetupValues) => {
      const familyId = createdFamilyId ?? (await client.createFamily({ name: values.familyName, mode: 'SOLO' })).id;
      try {
        const patient = await client.createPatient(familyId, { preferred_name: values.preferredName, legal_name: values.legalName || null, phone_e164: values.phoneE164 || null, timezone: values.timezone, preferred_language: values.languageCode });
        return { familyId, patient };
      } catch (error) { setCreatedFamilyId(familyId); throw error; }
    },
    onSuccess: () => { setCreatedFamilyId(null); void queryClient.invalidateQueries({ queryKey: ['caregiver', caregiverId] }); },
  });
  const submit = form.handleSubmit(async (values) => {
    try { await mutation.mutateAsync(values); onBack(); }
    catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          form.setError(toSetupFormField(field), { type: 'server', message });
        }
      }
    }
  });
  const error = mutation.error instanceof ApiError ? mutation.error.message : mutation.isError ? 'Mente could not save this family setup. Your entered details are still here.' : null;
  return <ScreenScroll theme="caregiver"><PageHeader eyebrow="Companion setup" title="Set up a familiar moment" subtitle="Add a family and the person whose familiar memories Mente will support." theme="caregiver" onBack={onBack} />
    <SurfaceCard theme="caregiver" style={styles.card}><CardHeader /><SetupField control={form.control} name="familyName" label="Family name" hint="For example, Delgado family" disabled={mutation.isPending} /><SetupField control={form.control} name="preferredName" label="Preferred name" hint="The name used in gentle companion moments" disabled={mutation.isPending} /><SetupField control={form.control} name="legalName" label="Legal name" hint="Optional" disabled={mutation.isPending} /><SetupField control={form.control} name="phoneE164" label="Patient phone" hint="Optional now; required before activating calls" disabled={mutation.isPending} keyboardType="phone-pad" /><SetupField control={form.control} name="timezone" label="Time zone" hint="IANA zone, for example Asia/Kolkata" disabled={mutation.isPending} /><SetupField control={form.control} name="languageCode" label="Language" hint="Language code, for example en-IN" disabled={mutation.isPending} /></SurfaceCard>
    {createdFamilyId ? <SoftPanel theme="caregiver" style={styles.notice}><Text style={styles.noticeText}>The family profile was saved. You can retry adding the person without creating another family.</Text></SoftPanel> : null}
    {error ? <SoftPanel theme="caregiver" style={styles.error}><Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text></SoftPanel> : null}
    <MenteButton label={mutation.isPending ? 'Saving setup…' : createdFamilyId ? 'Retry adding person' : 'Save setup'} onPress={submit} disabled={mutation.isPending} theme="caregiver" iconName="checkmark-outline" style={styles.button} /><TextButton label="Cancel" onPress={onBack} theme="caregiver" iconName="close-outline" accessibilityHint="Returns without changing unsaved details" />
  </ScreenScroll>;
}


function SetupField({ control, name, label, hint, disabled, keyboardType = 'default' }: { control: Control<SetupValues>; name: FieldPath<SetupValues>; label: string; hint: string; disabled: boolean; keyboardType?: 'default' | 'phone-pad' }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <View style={styles.field}><Text style={styles.label}>{label}</Text><Input value={field.value ?? ''} onChangeText={field.onChange} onBlur={field.onBlur} disabled={disabled} keyboardType={keyboardType} autoCapitalize="none" accessibilityLabel={label} accessibilityHint={hint} borderColor={fieldState.error ? caregiverTheme.colors.alert : caregiverTheme.colors.border} color={caregiverTheme.colors.text} background={caregiverTheme.colors.white} style={styles.tamaguiInput} /><Text accessibilityLiveRegion="polite" style={[styles.hint, fieldState.error && styles.errorText]}>{fieldState.error?.message ?? hint}</Text></View>} />;
}
function CardHeader() { return <View style={styles.header}><View style={styles.icon}><MenteIcon name="people-outline" size={22} color={caregiverTheme.colors.primary} /></View><View style={styles.copy}><Text style={styles.title}>Family details</Text><Text style={styles.body}>You can add call preferences after these details are securely saved.</Text></View></View>; }
function SetupState({ title, body, onBack }: { title: string; body: string; onBack: () => void }) { return <ScreenScroll theme="caregiver"><PageHeader eyebrow="Companion setup" title={title} subtitle={body} theme="caregiver" onBack={onBack} /><SurfaceCard theme="caregiver" style={styles.card}><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text></SurfaceCard></ScreenScroll>; }

const styles = StyleSheet.create({ card: { gap: spacing.md, marginBottom: spacing.md }, header: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm }, icon: { alignItems: 'center', backgroundColor: caregiverTheme.colors.surfaceMuted, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 }, copy: { flex: 1, gap: spacing.xxs }, title: { color: caregiverTheme.colors.text, fontSize: 17, fontWeight: '800' }, body: { color: caregiverTheme.colors.textMuted, fontSize: 13, lineHeight: 19 }, field: { gap: 4 }, label: { color: caregiverTheme.colors.text, fontSize: 14, fontWeight: '800' }, tamaguiInput: { minHeight: 48 }, hint: { color: caregiverTheme.colors.textMuted, fontSize: 12, lineHeight: 16 }, notice: { backgroundColor: caregiverTheme.colors.stableBackground, marginBottom: spacing.sm }, noticeText: { color: caregiverTheme.colors.stable, fontSize: 13, fontWeight: '700', lineHeight: 19 }, error: { backgroundColor: caregiverTheme.colors.alertBackground, marginBottom: spacing.sm }, errorText: { color: caregiverTheme.colors.alert, fontSize: 13, fontWeight: '700', lineHeight: 19 }, button: { marginBottom: spacing.sm } });
=======
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
>>>>>>> origin/new_components
