import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import type { ThemeName } from './Card';
import { spacing } from '../theme/tokens-enhanced';
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
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width, Platform.OS === 'web' ? 'web' : 'native');
  const maxWidth = theme === 'patient' ? 480 : layout.contentMaxWidth;
  const horizontalPadding = theme === 'caregiver' && layout.isWideWeb ? spacing.lg : spacing.md;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.inner, maxWidth ? { maxWidth, alignSelf: 'center' } : null]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: 'transparent',
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  inner: {
    width: '100%',
  },
});
