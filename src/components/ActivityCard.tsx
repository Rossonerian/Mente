import type { JSX, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme/tokens-enhanced';
import { SurfaceCard, Hairline } from './Card';
import type { ThemeName } from './Card';

interface ActivityCardProps {
  children: ReactNode;
  theme?: ThemeName;
}

export function ActivityCard({ children, theme = 'caregiver' }: ActivityCardProps): JSX.Element {
  const childArray = Array.isArray(children) ? children : [children];
  const validChildren = childArray.filter((child): child is ReactNode => Boolean(child));

  return (
    <SurfaceCard theme={theme} style={styles.card}>
      {validChildren.map((child, index) => (
        <View key={index}>
          {child}
          {index < validChildren.length - 1 && (
            <View style={[styles.divider, { marginLeft: 56 }]}>
              <Hairline theme={theme} />
            </View>
          )}
        </View>
      ))}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.sm,
  },
  divider: {
    marginVertical: spacing.xs,
  },
});
