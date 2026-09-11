import { StyleSheet, Text, View } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { MenteButton } from '../../components/Button';
import { SurfaceCard } from '../../components/Card';
import { caregiverTheme, spacing } from '../../theme/tokens';
import type { CaregiverRoute } from '../../types';

interface CaregiverAccessScreenProps {
  onNavigate: (route: CaregiverRoute) => void;
}

export function CaregiverAccessScreen({ onNavigate }: CaregiverAccessScreenProps) {
  return (
    <ScreenScroll theme="caregiver">
      <PageHeader
        eyebrow="CAREGIVER ACCESS"
        title="Your family's Mente space"
        subtitle="Sign in to see the moments you are allowed to review."
        theme="caregiver"
      />

      <SurfaceCard theme="caregiver" style={styles.card}>
        <View accessible accessibilityRole="text" accessibilityLabel="Configuration needed">
          <Text style={styles.title}>Live caregiver access is not configured</Text>
          <Text style={styles.body}>
            Add the public Supabase URL, publishable key, and Mente API base URL to this build. No caregiver data is
            shown until that configuration is available.
          </Text>
        </View>

        {/* DEMO BUTTON */}
        <MenteButton
          label="View Demo (Mock Data)"
          onPress={() => onNavigate('home')}
          variant="primary"
          theme="caregiver"
          style={styles.demoButton}
          accessibilityHint="Opens the demo caregiver home screen with mock data"
        />

        <Text style={styles.demoNote}>
          This shows the UI with sample data. Configure Supabase to see real caregiver data.
        </Text>
      </SurfaceCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  title: {
    color: caregiverTheme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  body: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  demoButton: {
    marginTop: spacing.md,
  },
  demoNote: {
    color: caregiverTheme.colors.textFaint,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});