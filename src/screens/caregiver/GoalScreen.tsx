import { StyleSheet, Text, View } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SurfaceCard } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { MenteButton } from '../../components/Button';
import { caregiverTheme, spacing } from '../../theme/tokens';
import type { CaregiverRoute } from '../../types';

interface Goal {
    id: string;
    title: string;
    time: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    description: string;
}

const mockGoals: Goal[] = [
    {
        id: '1',
        title: 'Morning walk',
        time: '9:00 AM',
        completed: true,
        priority: 'high',
        description: 'Light exercise around the garden',
    },
    {
        id: '2',
        title: 'Medication',
        time: '10:30 AM',
        completed: true,
        priority: 'high',
        description: 'Take daily vitamins',
    },
    {
        id: '3',
        title: 'Lunch',
        time: '12:00 PM',
        completed: false,
        priority: 'high',
        description: 'Balanced meal with family',
    },
    {
        id: '4',
        title: 'Memory activity',
        time: '2:00 PM',
        completed: false,
        priority: 'medium',
        description: 'Photo viewing or memory cards',
    },
    {
        id: '5',
        title: 'Call with family',
        time: '4:00 PM',
        completed: false,
        priority: 'medium',
        description: 'Video call with Ana',
    },
    {
        id: '6',
        title: 'Dinner',
        time: '6:00 PM',
        completed: false,
        priority: 'high',
        description: 'Dinner with loved ones',
    },
];

export function GoalsScreen({ onNavigate }: { onNavigate: (route: CaregiverRoute) => void }) {
    const completedCount = mockGoals.filter((g) => g.completed).length;
    const totalCount = mockGoals.length;

    return (
        <ScreenScroll theme="caregiver">
            <PageHeader
                eyebrow="TODAY'S SCHEDULE"
                title="Rosa's Goals"
                subtitle={`${completedCount} of ${totalCount} completed`}
                theme="caregiver"
            />

            {/* PROGRESS */}
            <SurfaceCard theme="caregiver" style={styles.progressCard}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${(completedCount / totalCount) * 100}%`,
                            },
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {completedCount} of {totalCount} activities completed
                </Text>
            </SurfaceCard>

            {/* GOALS LIST */}
            {mockGoals.map((goal, index) => (
                <SurfaceCard key={goal.id} theme="caregiver" style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <View style={styles.goalTime}>
                            <Text style={styles.time}>{goal.time}</Text>
                            {goal.completed && <Badge label="Done" variant="success" size="sm" />}
                        </View>
                        <View style={styles.goalStatus}>
                            <View
                                style={[
                                    styles.checkbox,
                                    goal.completed && {
                                        backgroundColor: caregiverTheme.colors.stable,
                                    },
                                ]}
                            >
                                {goal.completed && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </View>
                    </View>

                    <View style={styles.goalContent}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <Text style={styles.goalDescription}>{goal.description}</Text>
                    </View>

                    <View style={styles.goalFooter}>
                        <Badge
                            label={goal.priority}
                            variant={goal.priority === 'high' ? 'warning' : goal.priority === 'medium' ? 'primary' : 'neutral'}
                            size="sm"
                        />
                    </View>
                </SurfaceCard>
            ))}

            <MenteButton
                label="Back to Home"
                onPress={() => onNavigate('home')}
                variant="secondary"
                theme="caregiver"
                style={styles.button}
            />
        </ScreenScroll>
    );
}

const styles = StyleSheet.create({
    progressCard: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    progressBar: {
        backgroundColor: caregiverTheme.colors.border,
        borderRadius: 8,
        height: 12,
        overflow: 'hidden',
    },
    progressFill: {
        backgroundColor: caregiverTheme.colors.stable,
        height: '100%',
    },
    progressText: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    goalCard: {
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    goalHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    goalTime: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        gap: spacing.sm,
    },
    time: {
        color: caregiverTheme.colors.primary,
        fontSize: 13,
        fontWeight: '800',
    },
    goalStatus: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkbox: {
        alignItems: 'center',
        borderColor: caregiverTheme.colors.textMuted,
        borderRadius: 6,
        borderWidth: 2,
        height: 24,
        justifyContent: 'center',
        width: 24,
    },
    checkmark: {
        color: caregiverTheme.colors.white,
        fontSize: 14,
        fontWeight: '800',
    },
    goalContent: {
        gap: spacing.xs,
    },
    goalTitle: {
        color: caregiverTheme.colors.text,
        fontSize: 15,
        fontWeight: '800',
    },
    goalDescription: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
    },
    goalFooter: {
        paddingTop: spacing.sm,
    },
    button: {
        marginBottom: spacing.md,
    },
});