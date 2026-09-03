import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import type { ThemeName } from './Card';
import { caregiverTheme, patientTheme, spacing } from '../theme/tokens';
import { getResponsiveLayout } from '../theme/responsive';

export function ScreenScroll({
  children,
  theme = 'caregiver',
  contentStyle,
}: {
  children: ReactNode;
  theme?: ThemeName;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const backgroundColor = theme === 'caregiver' ? caregiverTheme.colors.background : patientTheme.colors.background;
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width, Platform.OS === 'web' ? 'web' : 'native');
  const maxWidth = theme === 'patient' ? 480 : layout.contentMaxWidth;
  const horizontalPadding = theme === 'caregiver' && layout.isWideWeb ? spacing.lg : spacing.md;

  return (
    <ScrollView
      style={{ backgroundColor }}
      contentContainerStyle={[styles.content, { backgroundColor, paddingHorizontal: horizontalPadding }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.inner, maxWidth ? { maxWidth, alignSelf: 'center' } : null]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  inner: {
    width: '100%',
  },
});
