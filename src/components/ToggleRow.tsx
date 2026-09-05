import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens';
import { FocusablePressable, type FocusableKeyboardEvent } from './FocusablePressable';

export function ToggleRow({
  title,
  detail,
  value,
  onValueChange,
<<<<<<< HEAD
  disabled = false,
=======
>>>>>>> origin/new_components
}: {
  title: string;
  detail: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
<<<<<<< HEAD
  disabled?: boolean;
=======
>>>>>>> origin/new_components
}) {
  const handleKeyDown = (event: FocusableKeyboardEvent) => {
    const key = event.key ?? event.nativeEvent?.key;
    const isSpace = key === ' ' || key === 'Spacebar';
    const isRepeat = event.repeat ?? event.nativeEvent?.repeat;

<<<<<<< HEAD
    if (!disabled && isSpace && !isRepeat) {
=======
    if (isSpace && !isRepeat) {
>>>>>>> origin/new_components
      event.preventDefault?.();
      onValueChange(!value);
    }
  };

  return (
    <FocusablePressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityHint={detail}
      accessibilityState={{ checked: value }}
      aria-checked={value}
<<<<<<< HEAD
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onPress={() => { if (!disabled) onValueChange(!value); }}
=======
      onKeyDown={handleKeyDown}
      onPress={() => onValueChange(!value)}
>>>>>>> origin/new_components
      style={({ pressed, focused }) => [
        styles.row,
        {
          borderColor: focused ? caregiverTheme.colors.text : 'transparent',
<<<<<<< HEAD
          opacity: disabled ? 0.55 : pressed ? 0.7 : 1,
=======
          opacity: pressed ? 0.7 : 1,
>>>>>>> origin/new_components
        },
      ]}
    >
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <View
        accessible={false}
        accessibilityElementsHidden
        aria-hidden={true}
        style={[styles.switchVisual, { backgroundColor: value ? '#AEB7F5' : caregiverTheme.colors.border }]}
      >
        <View style={[styles.switchThumb, value && styles.switchThumbOn, { backgroundColor: value ? caregiverTheme.colors.primary : caregiverTheme.colors.white }]} />
      </View>
    </FocusablePressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: caregiverTheme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  detail: {
    color: caregiverTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  switchVisual: {
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    padding: 2,
    width: 52,
  },
  switchThumb: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
});
