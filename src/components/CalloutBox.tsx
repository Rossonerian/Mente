import type { JSX, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { caregiverTheme, spacing } from '../theme/tokens-enhanced';
import { SoftPanel } from './Card';
import type { ThemeName } from './Card';

interface CalloutBoxProps {
  children: ReactNode;
  theme?: ThemeName;
  highlight?: boolean;
}

export function CalloutBox({ children, theme = 'caregiver', highlight = false }: CalloutBoxProps): JSX.Element {
  return (
    <SoftPanel
      theme={theme}
      style={[
        styles.container,
        highlight && {
          backgroundColor: caregiverTheme.colors.stableBackground,
          borderLeftColor: caregiverTheme.colors.stable,
          borderLeftWidth: 3,
        },
      ]}
    >
      <View style={styles.content}>{children}</View>
    </SoftPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  content: {
    gap: spacing.xs,
  },
});
