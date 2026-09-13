import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { MenteIcon } from './Icon';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens-enhanced';
import type { ThemeName } from './Card';
import { FocusablePressable } from './FocusablePressable';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  theme?: ThemeName;
  variant?: ButtonVariant;
  iconName?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  disabled?: boolean;
}

export function MenteButton({
  label,
  onPress,
  theme = 'caregiver',
  variant = 'primary',
  iconName,
  style,
  accessibilityHint,
  disabled = false,
}: ButtonProps) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const textColor = isPrimary || isDanger ? tokens.colors.white : tokens.colors.primary;
  const backgroundColor = isPrimary
    ? tokens.colors.primary
    : isDanger
      ? theme === 'patient'
        ? tokens.colors.primary
        : tokens.colors.alert
      : variant === 'secondary'
        ? theme === 'caregiver'
          ? tokens.colors.surfaceMuted
          : tokens.colors.coralSoft
        : 'transparent';

  return (
    <FocusablePressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, focused }) => [
        styles.button,
        {
          minHeight: theme === 'patient' ? 68 : 52,
          backgroundColor: disabled ? tokens.colors.border : backgroundColor,
          borderColor: focused ? tokens.colors.text : variant === 'quiet' ? tokens.colors.border : backgroundColor,
          borderWidth: focused ? 3 : 1,
          borderRadius: tokens.radii.control,
          opacity: pressed ? 0.84 : 1,
        },
        style,
      ]}
    >
      {iconName ? <MenteIcon name={iconName} size={theme === 'patient' ? 24 : 20} color={textColor} /> : null}
      <Text style={[styles.label, { color: disabled ? tokens.colors.textFaint : textColor }]}>{label}</Text>
    </FocusablePressable>
  );
}

export function TextButton({
  label,
  onPress,
  theme = 'caregiver',
  iconName = 'chevron-forward',
  accessibilityHint = 'Opens this section',
}: Omit<ButtonProps, 'variant'>) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;

  return (
    <FocusablePressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed, focused }) => [
        styles.textButton,
        focused && { borderColor: tokens.colors.text, borderWidth: 2 },
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={[styles.textButtonLabel, { color: tokens.colors.primary }]}>{label}</Text>
      <MenteIcon name={iconName} size={18} color={tokens.colors.primary} />
    </FocusablePressable>
  );
}

export function IconButton({
  label,
  onPress,
  theme = 'caregiver',
  iconName,
  selected = false,
  disabled = false,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  theme?: ThemeName;
  iconName: string;
  selected?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;

  return (
    <FocusablePressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, focused }) => [
        styles.iconButton,
        {
          backgroundColor: disabled
            ? tokens.colors.border
            : selected
              ? tokens.colors.primary
              : theme === 'caregiver'
                ? tokens.colors.surfaceMuted
                : tokens.colors.coralSoft,
          borderRadius: tokens.radii.pill,
          borderColor: focused ? tokens.colors.text : selected ? tokens.colors.primary : 'transparent',
          borderWidth: focused ? 3 : selected ? 2 : 0,
          opacity: pressed ? 0.7 : disabled ? 0.5 : 1,
        },
      ]}
    >
      <MenteIcon
        name={iconName}
        size={22}
        color={selected ? tokens.colors.white : tokens.colors.primary}
      />
    </FocusablePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
    flexShrink: 1,
    textAlign: 'center',
  },
  textButton: {
    alignItems: 'center',
    borderRadius: caregiverTheme.radii.control,
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 48,
    paddingHorizontal: spacing.xxs,
  },
  textButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  iconButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
});
