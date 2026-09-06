import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput } from 'react-native';
import { createPatientBindingClient } from '../../api/patientClient';
import { ApiError } from '../../api/errors';
import { patientDeviceStore } from '../../auth/patientDeviceStore';
import { MenteButton } from '../../components/Button';
import { SurfaceCard, SoftPanel } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { patientTheme, spacing } from '../../theme/tokens';

export function PatientDeviceAccessScreen({ onBound }: { onBound: () => void }) {
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const bind = async () => {
    setMessage(null);
    setSaving(true);
    try {
      const result = await createPatientBindingClient().bind(code.replace(/\D/g, ''));
      await patientDeviceStore.setToken(result.patient_token);
      onBound();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Mente could not connect this device. Please try again.');
    } finally { setSaving(false); }
  };
  return <ScreenScroll theme="patient"><PageHeader eyebrow="Caregiver-assisted setup" title="Connect this device" subtitle="A caregiver can enter the six-digit setup code here. You do not need an account or password." theme="patient" />
    <SurfaceCard theme="patient" style={styles.card}><Text style={styles.title}>A quiet step with a caregiver</Text><Text style={styles.body}>Ask a caregiver for the six-digit connection code from Mente’s family settings.</Text><TextInput value={code} onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" accessibilityLabel="Caregiver setup code" accessibilityHint="A caregiver enters a six-digit connection code" style={styles.input} maxLength={6} /><MenteButton label={saving ? 'Connecting device…' : 'Caregiver: connect device'} onPress={() => void bind()} disabled={saving || code.length !== 6} theme="patient" /></SurfaceCard>
    {message ? <SoftPanel theme="patient" style={styles.error}><Text accessibilityLiveRegion="polite" style={styles.errorText}>{message}</Text></SoftPanel> : null}
    <Text style={styles.note}>{Platform.OS === 'web' ? 'On web, browser storage cannot provide the same protection as native secure storage.' : 'This device uses protected native storage for its device credential.'}</Text>
  </ScreenScroll>;
}
const styles = StyleSheet.create({ card: { gap: spacing.md, marginBottom: spacing.md }, title: { color: patientTheme.colors.text, fontSize: 21, fontWeight: '800' }, body: { color: patientTheme.colors.textMuted, fontSize: 16, lineHeight: 24 }, input: { backgroundColor: patientTheme.colors.white, borderColor: patientTheme.colors.border, borderRadius: patientTheme.radii.control, borderWidth: 1, color: patientTheme.colors.text, fontSize: 24, fontWeight: '800', letterSpacing: 6, minHeight: 64, paddingHorizontal: spacing.md, textAlign: 'center' }, error: { backgroundColor: patientTheme.colors.coralSoft, marginBottom: spacing.sm }, errorText: { color: patientTheme.colors.text, fontSize: 15, fontWeight: '700', lineHeight: 22 }, note: { color: patientTheme.colors.textFaint, fontSize: 13, lineHeight: 19, textAlign: 'center' } });
