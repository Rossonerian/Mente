import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens';
import type { FamilyMember } from '../types';
import type { ThemeName } from './Card';
import { Avatar } from './Avatar';
import { MenteIcon } from './Icon';

export function MemberCard({ member, theme = 'caregiver' }: { member: FamilyMember; theme?: ThemeName }) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={`${member.name}, ${member.relationship}. ${member.memory}`} style={styles.row}>
      <Avatar initials={member.initials} name={member.name} accessible={false} theme={theme} tone={theme === 'patient' ? 'warm' : 'primary'} />
      <View style={styles.copy}>
        <Text style={[styles.name, { color: tokens.colors.text }]}>{member.name}</Text>
        <Text style={[styles.relationship, { color: tokens.colors.primary }]}>{member.relationship}</Text>
        <Text style={[styles.memory, { color: tokens.colors.textMuted }]}>{member.memory}</Text>
      </View>
      {member.voiceAvailable ? <View style={[styles.voice, { backgroundColor: theme === 'caregiver' ? tokens.colors.surfaceMuted : patientTheme.colors.coralSoft }]}>
        <MenteIcon name="volume-medium-outline" size={17} color={tokens.colors.primary} />
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  relationship: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  memory: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  voice: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
