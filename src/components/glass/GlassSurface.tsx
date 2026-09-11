import { StyleSheet, View } from 'react-native';
import { GlassLayers } from './GlassLayers';
import type { GlassSurfaceProps } from './GlassSurface.types';
import { getGlassVisualTokens } from './GlassSurface.tokens';
import { caregiverTheme, patientTheme } from '../../theme/tokens-enhanced';

export function GlassSurface({
  children,
  theme = 'caregiver',
  variant = 'elevated',
  style,
  radius,
}: GlassSurfaceProps) {
  const visual = getGlassVisualTokens(theme, variant);
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  const resolvedRadius = radius ?? tokens.radii.card;

  return (
    <View
      style={[
        styles.surface,
        style,
        {
          backgroundColor: visual.fallbackColor,
          borderColor: visual.borderColor,
          borderRadius: resolvedRadius,
          boxShadow: `0px ${Math.round(visual.shadowDepth / 4)}px ${visual.shadowDepth}px ${visual.shadowColor}`,
          overflow: 'hidden',
        },
      ]}
    >
      <GlassLayers
        tintColor="transparent"
        highlightColor={visual.highlightColor}
        radius={resolvedRadius}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderWidth: 1,
    position: 'relative',
  },
});
