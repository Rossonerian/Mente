import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { createCaregiverClient } from '../../api/caregiverClient';
import { MenteButton } from '../../components/Button';
import { SurfaceCard } from '../../components/Card';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { useCaregiverAuth } from '../../auth/CaregiverAuthContext';
import { caregiverTheme, spacing } from '../../theme/tokens';

export function CaregiverSignInScreen({ configured }: { configured: boolean }) {
  const { signIn } = useCaregiverAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const message = await signIn(email, password);
    setSubmitting(false);
    if (message) setError(message);
  };

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="Caregiver access" title="Your family’s Mente space" subtitle="Sign in to see the moments you are allowed to review." theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        {configured ? (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput accessibilityLabel="Caregiver email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} style={styles.input} value={email} />
            <Text style={styles.label}>Password</Text>
            <TextInput accessibilityLabel="Caregiver password" autoComplete="current-password" onChangeText={setPassword} secureTextEntry style={styles.input} value={password} />
            {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
            <MenteButton label={submitting ? 'Signing in…' : 'Sign in'} onPress={() => void submit()} theme="caregiver" disabled={submitting || !email || !password} />
          </>
        ) : (
          <>
            <Text style={styles.title}>Live caregiver access is not configured</Text>
            <Text style={styles.body}>Add the public Supabase URL, publishable key, and Mente API base URL to this build. No caregiver data is shown until that configuration is available.</Text>
          </>
        )}
      </SurfaceCard>
    </ScreenScroll>
  );
}

export function CaregiverProfileSetupScreen({ accessToken, onComplete }: { accessToken: string; onComplete: () => void }) {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createCaregiverClient(accessToken).createProfile({ display_name: displayName });
      onComplete();
    } catch {
      setError('We could not set up this caregiver profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="Caregiver setup" title="Set up your profile" subtitle="This creates your Mente family profile after Supabase has securely signed you in." theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.label}>Name to show your family</Text>
        <TextInput accessibilityLabel="Caregiver display name" autoComplete="name" onChangeText={setDisplayName} style={styles.input} value={displayName} />
        {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        <MenteButton label={submitting ? 'Saving…' : 'Continue'} onPress={() => void submit()} theme="caregiver" disabled={submitting || !displayName.trim()} />
      </SurfaceCard>
    </ScreenScroll>
  );
}

export function CaregiverLoadingScreen() {
  return (
    <ScreenScroll theme="caregiver">
      <View accessibilityRole="progressbar" accessibilityLabel="Loading caregiver data">
        <SurfaceCard theme="caregiver" style={styles.loadingCard}>
          <Text style={styles.title}>Preparing your family view</Text>
          <Text style={styles.body}>Mente is checking the most recent saved information.</Text>
        </SurfaceCard>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  loadingCard: { gap: spacing.xs, marginTop: spacing.xl },
  label: { color: caregiverTheme.colors.text, fontSize: 14, fontWeight: '800' },
  input: {
    backgroundColor: caregiverTheme.colors.background,
    borderColor: caregiverTheme.colors.border,
    borderRadius: caregiverTheme.radii.control,
    borderWidth: 1,
    color: caregiverTheme.colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
  },
  title: { color: caregiverTheme.colors.text, fontSize: 18, fontWeight: '800' },
  body: { color: caregiverTheme.colors.textMuted, fontSize: 15, lineHeight: 22 },
  error: { color: caregiverTheme.colors.alert, fontSize: 14, fontWeight: '700', lineHeight: 20 },
});
