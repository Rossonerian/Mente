import { StyleSheet, Text } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { MenteButton } from '../../components/Button';
import { SurfaceCard } from '../../components/Card';
import { caregiverTheme, spacing } from '../../theme/tokens';
import type { CaregiverRoute } from '../../types';

interface CaregiverAccessScreenProps {
  onNavigate?: (route: CaregiverRoute) => void;
}

export function CaregiverSignInScreen({ configured, onRegister }: { configured: boolean; onRegister: () => void }) {
  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="SIGN IN" title="Welcome back" subtitle="Sign in to access Rosa's care space" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        <MenteButton label="Sign In" onPress={() => {}} variant="primary" theme="caregiver" />
        <MenteButton label="Create Account" onPress={onRegister} variant="secondary" theme="caregiver" />
      </SurfaceCard>
    </ScreenScroll>
  );
}

export function CaregiverRegistrationScreen({ configured, onBack }: { configured: boolean; onBack: () => void }) {
  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="CREATE ACCOUNT" title="Join Mente" subtitle="Create your caregiver account" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.title}>Register</Text>
        <MenteButton label="Register" onPress={() => {}} variant="primary" theme="caregiver" />
        <MenteButton label="Back to Sign In" onPress={onBack} variant="secondary" theme="caregiver" />
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
      </SurfaceCard>
    </ScreenScroll>
  );
}

export function CaregiverProfileSetupScreen() {
  return (
    <ScreenScroll theme="caregiver">
      <PageHeader eyebrow="SETUP" title="Complete Your Profile" subtitle="Tell us about yourself" theme="caregiver" />
      <SurfaceCard theme="caregiver" style={styles.card}>
        <Text style={styles.title}>Profile Setup</Text>
        <MenteButton label="Continue" onPress={() => {}} variant="primary" theme="caregiver" />
      </SurfaceCard>
    </ScreenScroll>
  );
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
});
