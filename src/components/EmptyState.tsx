import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens';
import { MenteButton } from './Button';
import type { ThemeName } from './Card';

type EmptyStateType = 'no-activities' | 'no-memories' | 'no-family' | 'no-data' | 'loading';

interface EmptyStateProps {
    type: EmptyStateType;
    theme?: ThemeName;
    onActionPress?: () => void;
    actionLabel?: string;
}

const getTheme = (theme?: ThemeName) => (theme === 'patient' ? patientTheme : caregiverTheme);

const emptyStates = {
    'no-activities': {
        icon: '📅',
        title: 'No activities yet',
        description: 'Sessions will appear here as they are recorded',
    },
    'no-memories': {
        icon: '📸',
        title: 'No memories yet',
        description: 'Start sharing moments to build a collection of precious memories',
    },
    'no-family': {
        icon: '👨‍👩‍👧',
        title: 'No family members',
        description: 'Add family members to share memories and stay connected',
    },
    'no-data': {
        icon: '📊',
        title: 'No data available',
        description: 'Data will appear here once available',
    },
    'loading': {
        icon: '⏳',
        title: 'Loading',
        description: 'Getting things ready for you...',
    },
};

export function EmptyState({
    type,
    theme = 'caregiver',
    onActionPress,
    actionLabel = 'Get Started',
}: EmptyStateProps) {
    const colors = getTheme(theme).colors;
    const state = emptyStates[type];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={styles.icon}>{state.icon}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{state.title}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
                {state.description}
            </Text>
            {onActionPress && (
                <MenteButton
                    label={actionLabel}
                    onPress={onActionPress}
                    variant="primary"
                    theme={theme}
                    style={styles.button}
                />
            )}
        </View>
    );
}

// Mini empty state (for sidebars, cards)
export function MiniEmptyState({
    type,
    theme = 'caregiver',
}: Omit<EmptyStateProps, 'onActionPress' | 'actionLabel'>) {
    const colors = getTheme(theme).colors;
    const state = emptyStates[type];

    return (
        <View style={[styles.miniContainer, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={styles.miniIcon}>{state.icon}</Text>
            <Text style={[styles.miniTitle, { color: colors.text }]}>{state.title}</Text>
            <Text style={[styles.miniDescription, { color: colors.textMuted }]}>
                {state.description}
            </Text>
        </View>
    );
}

// Skeleton loader (for loading states)
export function SkeletonLoader({
    lines = 3,
    theme = 'caregiver',
}: {
    lines?: number;
    theme?: ThemeName;
}) {
    const colors = getTheme(theme).colors;

    return (
        <View style={styles.skeleton}>
            {Array.from({ length: lines }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.skeletonLine,
                        {
                            backgroundColor: colors.border,
                            width: i === lines - 1 ? '60%' : '100%',
                            marginBottom: i < lines - 1 ? spacing.md : 0,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    // Full empty state
    container: {
        alignItems: 'center',
        gap: spacing.md,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        minHeight: 300,
    },
    icon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    button: {
        marginTop: spacing.md,
        width: '100%',
    },

    // Mini empty state
    miniContainer: {
        alignItems: 'center',
        borderRadius: 12,
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
    },
    miniIcon: {
        fontSize: 40,
    },
    miniTitle: {
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
    },
    miniDescription: {
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
    },

    // Skeleton loader
    skeleton: {
        gap: spacing.md,
        paddingVertical: spacing.lg,
    },
    skeletonLine: {
        borderRadius: 8,
        height: 16,
    },
});