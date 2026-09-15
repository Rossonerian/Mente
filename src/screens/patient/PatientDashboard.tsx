import { StyleSheet, Text, View } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { StatBox } from '../../components/StatBox';
import { CalloutBox } from '../../components/CalloutBox';
import { InfoSection } from '../../components/InfoSection';
import { AvatarStack } from '../../components/Avatar';
import { MenteButton } from '../../components/Button';
import { caregiverTheme, spacing } from '../../theme/tokens-enhanced';
import { menteMockData } from '../../data/mockData';
import type { PatientRoute } from '../../types';

export function PatientDashboardScreen({ onNavigate }: { onNavigate: (route: PatientRoute) => void }) {
    const { patient, family, sessions } = menteMockData;
    const voiceCount = family.filter((member) => member.voiceAvailable).length;

    return (
        <ScreenScroll theme="patient">
            <PageHeader
                eyebrow="YOUR SPACE"
                title={`Hello, ${patient.name}`}
                subtitle="Your memories and moments"
                theme="patient"
            />

            {/* THIS WEEK'S STATS */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>This Week</Text>
                <View style={styles.statsRow}>
                    <StatBox value={sessions.length} label="moments" highlight theme="patient" />
                    <StatBox value={`${voiceCount}`} label="visitors" theme="patient" />
                    <StatBox value="Good" label="mood" theme="patient" />
                </View>
            </View>

            {/* UPCOMING */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Coming Up</Text>
                <CalloutBox theme="patient">
                    <Text style={styles.calloutTitle}>9:00 AM - Daily companion call</Text>
                    <Text style={styles.calloutBody}>With Ana and Miguel</Text>
                </CalloutBox>
            </View>

            {/* FAMILY VISITORS */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your People</Text>
                <InfoSection
                    title={`${family.length} People Care`}
                    description="Who visit and share memories"
                    theme="patient"
                >
                    <AvatarStack people={family.map(({ initials, name }) => ({ initials, name }))} theme="patient" />
                    <Text style={styles.familyDescription}>
                        {family.map((f) => f.name).join(', ')} share moments to help you remember.
                    </Text>
                </InfoSection>
            </View>

            {/* RECENT ACTIVITIES */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Moments</Text>
                {sessions.slice(0, 3).map((session) => (
                    <View key={session.id} style={styles.activityItem}>
                        <Text style={styles.activityTime}>{session.timeLabel}</Text>
                        <Text style={styles.activityLabel}>{session.activityLabel}</Text>
                        <Text style={styles.activityMeta}>{session.summary}</Text>
                    </View>
                ))}
            </View>

            <MenteButton label="View All Memories" onPress={() => { }} variant="primary" theme="patient" style={styles.button} />
            <MenteButton
                label="Back"
                onPress={() => onNavigate('home' as PatientRoute)}
                variant="secondary"
                theme="patient"
                style={styles.button}
            />
        </ScreenScroll>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        color: caregiverTheme.colors.text,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    calloutTitle: {
        color: caregiverTheme.colors.text,
        fontSize: 14,
        fontWeight: '800',
    },
    calloutBody: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
    },
    familyDescription: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
        lineHeight: 19,
    },
    activityItem: {
        borderBottomColor: caregiverTheme.colors.border,
        borderBottomWidth: 1,
        gap: spacing.xs,
        paddingVertical: spacing.md,
    },
    activityTime: {
        color: caregiverTheme.colors.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    activityLabel: {
        color: caregiverTheme.colors.text,
        fontSize: 14,
        fontWeight: '800',
    },
    activityMeta: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 12,
    },
    button: {
        marginBottom: spacing.md,
    },
});
