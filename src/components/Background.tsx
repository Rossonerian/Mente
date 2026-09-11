import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { caregiverTheme, patientTheme } from '../theme/tokens';
import type { ThemeName } from './Card';

type GradientType = 'morning' | 'embrace' | 'gentle' | 'nature' | 'sunset';

interface BackgroundProps {
    children?: React.ReactNode;
    gradientType?: GradientType;
    theme?: ThemeName;
    style?: StyleProp<ViewStyle>;
}

const getTheme = (theme?: ThemeName) => (theme === 'patient' ? patientTheme : caregiverTheme);

// Full gradient background
export function GradientBackground({
    children,
    gradientType = 'morning',
    theme = 'caregiver',
    style,
}: BackgroundProps) {
    const colors = getTheme(theme).colors;

    const gradients: Record<GradientType, [string, string]> = {
        morning: [colors.background, colors.surfaceWarm],
        embrace: [colors.surfaceWarm, colors.background],
        gentle: [colors.primary, colors.alert],
        nature: [colors.alert, colors.alertBackground],
        sunset: [colors.alert, colors.alert],
    };

    const gradient = gradients[gradientType];

    return (
        <View
            style={[
                styles.gradientBg,
                {
                    backgroundColor: gradient[0],
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

// Soft card background with subtle gradient
export function SoftCardBackground({ children, theme = 'caregiver', style }: BackgroundProps) {
    const colors = getTheme(theme).colors;
    return (
        <View
            style={[
                styles.softCard,
                {
                    backgroundColor: colors.surface,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

// Warm embrace background for panels
export function WarmPanelBackground({ children, theme = 'caregiver', style }: BackgroundProps) {
    const colors = getTheme(theme).colors;
    return (
        <View
            style={[
                styles.warmPanel,
                {
                    backgroundColor: colors.surfaceWarm,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

// Accent gradient - for CTAs and highlights
export function AccentGradientBg({
    children,
    theme = 'caregiver',
    style,
}: BackgroundProps) {
    const colors = getTheme(theme).colors;
    return (
        <View
            style={[
                styles.accentGrad,
                {
                    backgroundColor: colors.primary,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

// Gentle gradient section background
export function GentleGradientSection({
    children,
    theme = 'caregiver',
    style,
}: BackgroundProps) {
    const colors = getTheme(theme).colors;
    return (
        <View
            style={[
                styles.gentleSection,
                {
                    backgroundColor: colors.surfaceMuted,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    gradientBg: {
        flex: 1,
        width: '100%',
    },
    softCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    warmPanel: {
        borderRadius: 12,
        overflow: 'hidden',
        padding: 16,
    },
    accentGrad: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gentleSection: {
        padding: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
});
