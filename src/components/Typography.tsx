import { Text, type StyleProp, type TextStyle } from 'react-native';
import { caregiverTheme, patientTheme, typeScale } from '../theme/tokens';
import type { ThemeName } from './Card';

interface TypographyProps {
    children: React.ReactNode;
    theme?: ThemeName;
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
    accessible?: boolean;
    accessibilityRole?: 'header' | 'text';
}

const getTheme = (theme?: ThemeName) => (theme === 'patient' ? patientTheme : caregiverTheme);

// Display - Extra large (32px)
export function Display({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.display,
                    fontWeight: '800',
                    color: colors.text,
                    lineHeight: typeScale.display + 8,
                    letterSpacing: -0.5,
                },
                style,
            ]}
            accessible
            accessibilityRole="header"
            {...props}
        >
            {children}
        </Text>
    );
}

// Title - Large (26px)
export function Title({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.title,
                    fontWeight: '800',
                    color: colors.text,
                    lineHeight: typeScale.title + 6,
                    letterSpacing: -0.3,
                },
                style,
            ]}
            accessible
            accessibilityRole="header"
            {...props}
        >
            {children}
        </Text>
    );
}

// Section - Medium (18px)
export function Section({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.section,
                    fontWeight: '700',
                    color: colors.text,
                    lineHeight: typeScale.section + 6,
                    letterSpacing: 0,
                },
                style,
            ]}
            accessible
            accessibilityRole="header"
            {...props}
        >
            {children}
        </Text>
    );
}

// Body - Primary text (16px)
export function Body({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.body,
                    fontWeight: '500',
                    color: colors.text,
                    lineHeight: typeScale.body + 8,
                    letterSpacing: 0,
                },
                style,
            ]}
            accessible
            accessibilityRole="text"
            {...props}
        >
            {children}
        </Text>
    );
}

// Body Strong - Bold body text (16px)
export function BodyStrong({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.body,
                    fontWeight: '700',
                    color: colors.text,
                    lineHeight: typeScale.body + 8,
                    letterSpacing: 0,
                },
                style,
            ]}
            accessible
            accessibilityRole="text"
            {...props}
        >
            {children}
        </Text>
    );
}

// Body Small - Supporting text (14px)
export function BodySmall({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.bodySmall,
                    fontWeight: '600',
                    color: colors.textMuted,
                    lineHeight: typeScale.bodySmall + 6,
                    letterSpacing: 0,
                },
                style,
            ]}
            accessible
            accessibilityRole="text"
            {...props}
        >
            {children}
        </Text>
    );
}

// Caption - Small supporting text (12px)
export function Caption({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.caption,
                    fontWeight: '600',
                    color: colors.textMuted,
                    lineHeight: typeScale.caption + 4,
                    letterSpacing: 0.5,
                },
                style,
            ]}
            accessible
            accessibilityRole="text"
            {...props}
        >
            {children}
        </Text>
    );
}

// Muted text - Low emphasis
export function Muted({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.body,
                    fontWeight: '500',
                    color: colors.textMuted,
                    lineHeight: typeScale.body + 8,
                    letterSpacing: 0,
                },
                style,
            ]}
            accessible
            accessibilityRole="text"
            {...props}
        >
            {children}
        </Text>
    );
}

// Highlight text - Emphasis
export function Highlight({ children, theme = 'caregiver', style, ...props }: TypographyProps) {
    const colors = getTheme(theme).colors;
    return (
        <Text
            style={[
                {
                    fontSize: typeScale.body,
                    fontWeight: '700',
                    color: colors.primary,
                    lineHeight: typeScale.body + 8,
                    letterSpacing: 0,
                },
                style,
            ]}
            accessible
            accessibilityRole="text"
            {...props}
        >
            {children}
        </Text>
    );
}