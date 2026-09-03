import { StyleSheet, Text, View } from 'react-native';
import { caregiverTheme, patientTheme } from '../theme/tokens';
import type { ThemeName } from './Card';

interface AvatarProps {
  initials: string;
  name: string;
  theme?: ThemeName;
  size?: 'small' | 'medium' | 'large';
  tone?: 'primary' | 'warm' | 'green';
  accessible?: boolean;
}

export function Avatar({ initials, name, theme = 'caregiver', size = 'medium', tone = 'primary', accessible = true }: AvatarProps) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  const dimensions = size === 'large' ? 72 : size === 'small' ? 40 : 52;
  const backgroundColor = tone === 'green'
    ? theme === 'caregiver' ? '#DDEFE7' : patientTheme.colors.forestSoft
    : tone === 'warm'
      ? theme === 'caregiver' ? '#FBE6DC' : patientTheme.colors.coralSoft
      : theme === 'caregiver' ? tokens.colors.surfaceMuted : patientTheme.colors.focus;
  const foregroundColor = tone === 'green'
    ? theme === 'caregiver' ? caregiverTheme.colors.stable : patientTheme.colors.forest
    : theme === 'caregiver' ? caregiverTheme.colors.primary : patientTheme.colors.primary;

  return (
    <View
      accessible={accessible}
      accessibilityElementsHidden={!accessible}
      aria-hidden={!accessible}
      accessibilityRole={accessible ? 'image' : undefined}
      accessibilityLabel={accessible ? `${name}, ${initials}` : undefined}
      style={[
        styles.avatar,
        { backgroundColor, borderRadius: dimensions / 2, height: dimensions, width: dimensions },
      ]}
    >
      <Text style={[styles.initials, { color: foregroundColor, fontSize: size === 'large' ? 26 : 16 }]}>{initials}</Text>
    </View>
  );
}

export function AvatarStack({
  people,
  theme = 'caregiver',
}: {
  people: readonly { initials: string; name: string }[];
  theme?: ThemeName;
}) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`${people.length} family members`} style={styles.stack}>
      {people.map((person, index) => (
        <View key={person.name} style={[styles.stackItem, { marginLeft: index === 0 ? 0 : -10 }]}>
          <Avatar initials={person.initials} name={person.name} accessible={false} theme={theme} size="small" tone={index % 2 === 0 ? 'primary' : 'warm'} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  stack: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  stackItem: {
    borderColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
  },
});
