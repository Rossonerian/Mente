import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens';
import type { AppRole } from '../types';
import type { ThemeName } from './Card';
import { MenteIcon } from './Icon';
import { FocusablePressable } from './FocusablePressable';

export function PreviewBar({ role, onSwitchRole }: { role: AppRole; onSwitchRole: () => void }) {
  const theme: ThemeName = role === 'caregiver' ? 'caregiver' : 'patient';
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  const nextRoleLabel = role === 'caregiver' ? 'Patient view' : 'Caregiver view';
  const minimumTouchTarget = role === 'patient' ? 64 : 48;

  return (
    <View style={[styles.container, { backgroundColor: theme === 'caregiver' ? '#E9ECFF' : '#FBE6DC', minHeight: minimumTouchTarget }]}>
      <View style={styles.copy}>
        <MenteIcon name="code-slash-outline" size={16} color={tokens.colors.primary} />
        <Text style={[styles.label, { color: tokens.colors.text }]}>Development preview · {role === 'caregiver' ? 'Caregiver' : 'Patient'}</Text>
      </View>
      <FocusablePressable
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${nextRoleLabel}`}
        accessibilityHint="Changes the local development preview role"
        onPress={onSwitchRole}
        style={({ pressed, focused }) => [
          styles.switch,
          {
            borderColor: tokens.colors.text,
            borderWidth: focused ? 2 : 0,
            minHeight: minimumTouchTarget,
            opacity: pressed ? 0.65 : 1,
          },
        ]}
      >
        <Text style={[styles.switchLabel, { color: tokens.colors.primary }]}>{nextRoleLabel}</Text>
        <MenteIcon name="swap-horizontal-outline" size={17} color={tokens.colors.primary} />
      </FocusablePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  copy: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minWidth: 0,
  },
  label: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  switch: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 3,
    minHeight: 48,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xxs,
  },
  switchLabel: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
});
