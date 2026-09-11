import { StyleSheet, Text } from 'react-native';
import { SurfaceCard } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { ScreenScroll } from '../components/Screen';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens-enhanced';
import type { AppRole } from '../types';

export function ConnectedFeatureState({ role, title, body }: { role: AppRole; title: string; body: string }) {
  const theme = role === 'caregiver' ? 'caregiver' : 'patient';
  const colors = role === 'caregiver' ? caregiverTheme.colors : patientTheme.colors;
  return (
    <ScreenScroll theme={theme}>
      <PageHeader eyebrow={role === 'caregiver' ? 'Caregiver access' : 'Patient device'} title={title} subtitle={body} theme={theme} />
      <SurfaceCard theme={theme} style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>No preview information is being shown</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>Mente keeps this view empty until the connected service can provide the information safely.</Text>
      </SurfaceCard>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs, marginTop: spacing.lg },
  title: { fontSize: 17, fontWeight: '800' },
  body: { fontSize: 15, lineHeight: 22 },
});
