import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { MenteButton } from '../../components/Button';
import { SurfaceCard } from '../../components/Card';
import { caregiverTheme, spacing } from '../../theme/tokens';
import type { CaregiverRoute } from '../../types';
import { useCaregiverAuth } from '../../auth/CaregiverAuthContext';
import { createCaregiverClient } from '../../api/caregiverClient';

const emailSchema = z.email();
const configurationMessage = 'Caregiver access is not configured. Add the public Supabase URL, publishable key, and Mente API base URL, then restart the app.';

interface CaregiverAccessScreenProps {
  onNavigate?: (route: CaregiverRoute) => void;
}

export function CaregiverSignInScreen({ configured, onRegister }: { configured: boolean; onRegister: () => void }) {
  const { signIn } = useCaregiverAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  const submit = async () => {
    if (!configured || submitting.current) return;
    if (!emailSchema.safeParse(email.trim()).success || !password) {
      setMessage('Enter a valid email address and your password.');
      return;
    }
    submitting.current = true;
    setSaving(true);
    setMessage(null);
    try {
      setMessage(await signIn(email, password));
    } catch {
      setMessage('We could not reach caregiver sign-in. Check your connection and try again.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="SIGN IN" title="Welcome back" subtitle="Sign in to access your family's care space" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        <AccessField label="Email address" value={email} onChangeText={setEmail} email disabled={saving || !configured} />
        <AccessField label="Password" value={password} onChangeText={setPassword} secure disabled={saving || !configured} onSubmit={() => void submit()} />
        <AccessMessage message={configured ? message : configurationMessage} />
        <MenteButton label={saving ? 'Signing in…' : 'Sign In'} onPress={() => void submit()} disabled={saving || !configured} variant="primary" theme="caregiver" />
        <MenteButton label="Create Account" onPress={onRegister} disabled={saving} variant="secondary" theme="caregiver" />
      </SurfaceCard>
    </ScreenScroll>
  );
}

export function CaregiverRegistrationScreen({ configured, onBack }: { configured: boolean; onBack: () => void }) {
  const { signUp } = useCaregiverAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  const submit = async () => {
    if (!configured || submitting.current) return;
    if (!displayName.trim() || displayName.trim().length > 120) {
      setMessage('Enter your name using 1 to 120 characters.');
      return;
    }
    if (!emailSchema.safeParse(email.trim()).success) {
      setMessage('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setMessage('Choose a password with at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setMessage('Your passwords do not match.');
      return;
    }
    submitting.current = true;
    setSaving(true);
    setMessage(null);
    try {
      const result = await signUp(email, password, displayName);
      setMessage(result || 'Account created. Preparing your caregiver profile…');
    } catch {
      setMessage('We could not reach caregiver registration. Check your connection and try again.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="CREATE ACCOUNT" title="Join Mente" subtitle="Create your caregiver account" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.title}>Register</Text>
        <AccessField label="Your name" value={displayName} onChangeText={setDisplayName} disabled={saving || !configured} />
        <AccessField label="Email address" value={email} onChangeText={setEmail} email disabled={saving || !configured} />
        <AccessField label="Password" value={password} onChangeText={setPassword} secure newPassword disabled={saving || !configured} />
        <Text style={styles.body}>Use at least 8 characters for your password.</Text>
        <AccessField label="Confirm password" value={confirmation} onChangeText={setConfirmation} secure newPassword disabled={saving || !configured} onSubmit={() => void submit()} />
        <AccessMessage message={configured ? message : configurationMessage} />
        <MenteButton label={saving ? 'Creating account…' : 'Register'} onPress={() => void submit()} disabled={saving || !configured} variant="primary" theme="caregiver" />
        <MenteButton label="Back to Sign In" onPress={onBack} disabled={saving} variant="secondary" theme="caregiver" />
      </SurfaceCard>
    </ScreenScroll>
  );
}

export function CaregiverLoadingScreen() {
  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="LOADING" title="Setting up..." subtitle="Please wait" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.title}>Loading your profile...</Text>
        <ActivityIndicator accessibilityLabel="Loading caregiver profile" color={caregiverTheme.colors.primary} />
      </SurfaceCard>
    </ScreenScroll>
  );
}

export function CaregiverProfileSetupScreen({ accessToken, onComplete }: { accessToken: string; onComplete: () => void | Promise<void> }) {
  const { state, signOut } = useCaregiverAuth();
  const [displayName, setDisplayName] = useState(() => {
    const name = state.kind === 'signed-in' ? state.user.user_metadata?.display_name : null;
    return typeof name === 'string' ? name : '';
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  const submit = async () => {
    if (submitting.current) return;
    const name = displayName.trim();
    if (!name || name.length > 120) {
      setMessage('Enter your name using 1 to 120 characters.');
      return;
    }
    submitting.current = true;
    setSaving(true);
    setMessage(null);
    try {
      await createCaregiverClient(accessToken).createProfile({ display_name: name });
      await onComplete();
    } catch {
      setMessage('We could not finish your caregiver profile. Check your connection and try again.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="SETUP" title="Complete Your Profile" subtitle="Tell us about yourself" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.title}>Profile Setup</Text>
        <AccessField label="Your name" value={displayName} onChangeText={setDisplayName} disabled={saving} onSubmit={() => void submit()} />
        <AccessMessage message={message} />
        <MenteButton label={saving ? 'Saving profile…' : 'Continue'} onPress={() => void submit()} disabled={saving} variant="primary" theme="caregiver" />
        <MenteButton label="Sign out" onPress={() => { void signOut().catch(() => setMessage('We could not sign you out. Please try again.')); }} disabled={saving} variant="secondary" theme="caregiver" />
      </SurfaceCard>
    </ScreenScroll>
  );
}

function AccessField({ label, value, onChangeText, disabled, email = false, secure = false, newPassword = false, onSubmit }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  disabled: boolean;
  email?: boolean;
  secure?: boolean;
  newPassword?: boolean;
  onSubmit?: () => void;
}) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} editable={!disabled} secureTextEntry={secure} keyboardType={email ? 'email-address' : 'default'} autoCapitalize={email || secure ? 'none' : 'words'} autoCorrect={!email && !secure} autoComplete={email ? 'email' : secure ? newPassword ? 'new-password' : 'current-password' : 'name'} onSubmitEditing={onSubmit} style={styles.input} />
  </View>;
}

function AccessMessage({ message }: { message: string | null }) {
  return message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null;
}

export function CaregiverAccessScreen({ onNavigate }: CaregiverAccessScreenProps) {
  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="CAREGIVER ACCESS" title="Your family's Mente space" subtitle="Sign in to see the moments you are allowed to review." theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.title}>Live caregiver access is not configured</Text>
        <Text style={styles.body}>Add the public Supabase URL, publishable key, and Mente API base URL to this build.</Text>
      </SurfaceCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  title: { color: caregiverTheme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: spacing.sm },
  body: { color: caregiverTheme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  field: { gap: spacing.xs },
  label: { color: caregiverTheme.colors.text, fontSize: 14, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderColor: caregiverTheme.colors.border, borderRadius: caregiverTheme.radii.control, paddingHorizontal: spacing.md, color: caregiverTheme.colors.text, backgroundColor: caregiverTheme.colors.white, fontSize: 16 },
  message: { color: caregiverTheme.colors.text, fontSize: 14, lineHeight: 20 },
});
