import { StyleSheet, Text, View } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { ActivityCard } from '../../components/ActivityCard';
import { ActivityRow } from '../../components/ActivityRow';
import { MenteButton } from '../../components/Button';
import { caregiverTheme, spacing } from '../../theme/tokens-enhanced';
import { menteMockData } from '../../data/mockData';
import type { CaregiverRoute } from '../../types';

export function ActivityHistoryScreen({ onNavigate }: { onNavigate: (route: CaregiverRoute) => void }) {
    const { sessions } = menteMockData;

    return (
        <ScreenScroll theme="caregiver">
            <PageHeader
                eyebrow="ACTIVITY HISTORY"
                title="Rosa's moments"
                subtitle={`${sessions.length} sessions recorded`}
                theme="caregiver"
            />

            {sessions.length > 0 ? (
                <ActivityCard theme="caregiver">
                    {sessions.map((session) => (
                        <ActivityRow key={session.id} session={session} />
                    ))}
                </ActivityCard>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No activities yet</Text>
                    <Text style={styles.emptyBody}>Sessions will appear here as they are recorded.</Text>
                </View>
            )}

            <MenteButton
                label="Back to Home"
                onPress={() => onNavigate('home')}
                variant="secondary"
                theme="caregiver"
                style={styles.backButton}
            />
        </ScreenScroll>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    emptyTitle: {
        color: caregiverTheme.colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    emptyBody: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
    backButton: {
        marginTop: spacing.lg,
    },
});