import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens';
import type { AppRole, TabItem } from '../types';
import { MenteIcon } from './Icon';
import { FocusablePressable } from './FocusablePressable';
import { GlassSurface } from './glass/GlassSurface';

export function BottomTabBar({
  role,
  tabs,
  activeRoute,
  onNavigate,
}: {
  role: AppRole;
  tabs: readonly TabItem[];
  activeRoute: string;
  onNavigate: (route: string) => void;
}) {
  const theme = role === 'caregiver' ? caregiverTheme : patientTheme;
  const isPatient = role === 'patient';

  return (
<<<<<<< HEAD
=======
<<<<<<< HEAD
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = tab.route === activeRoute;
          return (
            <FocusablePressable
              key={tab.route}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{ selected: isActive }}
              onPress={() => onNavigate(tab.route)}
              style={({ pressed, focused }) => [
                styles.tab,
                {
                  borderColor: theme.colors.text,
                  borderWidth: focused ? 2 : 0,
                  minHeight: isPatient ? 64 : 52,
                  opacity: pressed ? 0.68 : 1,
                },
              ]}
            >
              <View style={[styles.iconWrap, isActive && { backgroundColor: isPatient ? theme.colors.coralSoft : theme.colors.surfaceMuted }]}>
                <MenteIcon name={isActive ? tab.icon.replace('-outline', '') : tab.icon} size={isPatient ? 24 : 21} color={isActive ? theme.colors.primary : theme.colors.textFaint} />
              </View>
              <Text style={[styles.label, { color: isActive ? theme.colors.primary : theme.colors.textFaint, fontSize: isPatient ? 13 : 12 }]}>{tab.label}</Text>
            </FocusablePressable>
          );
        })}
      </View>
    </SafeAreaView>
=======
>>>>>>> origin/new_components
    <GlassSurface theme={role} variant="chrome" radius={0} style={styles.chrome}>
      <SafeAreaView edges={['bottom']}>
        <View style={styles.bar}>
          {tabs.map((tab) => {
            const isActive = tab.route === activeRoute;
            return (
              <FocusablePressable
                key={tab.route}
                accessibilityRole="tab"
                accessibilityLabel={`${tab.label} tab`}
                accessibilityState={{ selected: isActive }}
                onPress={() => onNavigate(tab.route)}
                style={({ pressed, focused }) => [
                  styles.tab,
                  {
                    borderColor: theme.colors.text,
                    borderWidth: focused ? 2 : 0,
                    minHeight: isPatient ? 64 : 52,
                    opacity: pressed ? 0.68 : 1,
                  },
                ]}
              >
                <View style={[styles.iconWrap, isActive && { backgroundColor: isPatient ? theme.colors.coralSoft : theme.colors.surfaceMuted }]}>
                  <MenteIcon name={isActive ? tab.icon.replace('-outline', '') : tab.icon} size={isPatient ? 24 : 21} color={isActive ? theme.colors.primary : theme.colors.textFaint} />
                </View>
                <Text style={[styles.label, { color: isActive ? theme.colors.primary : theme.colors.textFaint, fontSize: isPatient ? 13 : 12 }]}>{tab.label}</Text>
              </FocusablePressable>
            );
          })}
        </View>
      </SafeAreaView>
    </GlassSurface>
<<<<<<< HEAD
=======
>>>>>>> 76742b9 (Added basic liquid glass and UI enhancements)
>>>>>>> origin/new_components
  );
}

const styles = StyleSheet.create({
  chrome: {
    zIndex: 2,
  },
  bar: {
    alignItems: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  tab: {
    alignItems: 'center',
    borderRadius: caregiverTheme.radii.control,
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 42,
    paddingHorizontal: spacing.xs,
  },
  label: {
    fontWeight: '700',
  },
});
