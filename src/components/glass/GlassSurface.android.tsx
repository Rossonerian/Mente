import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { caregiverTheme, patientTheme } from '../../theme/tokens';
import { useGlassBackdropTarget } from './GlassBackdropContext';
import { GlassLayers } from './GlassLayers';
import { getAndroidGlassBehavior } from './GlassSurface.policy';
import { getGlassVisualTokens } from './GlassSurface.tokens';
import type { GlassSurfaceProps } from './GlassSurface.types';

export function GlassSurface({
  children,
  theme = 'caregiver',
  variant = 'elevated',
  style,
  radius,
}: GlassSurfaceProps) {
  const targetRef = useGlassBackdropTarget();
  const visual = getGlassVisualTokens(theme, variant);
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  const resolvedRadius = radius ?? tokens.radii.card;
  const apiLevel = typeof Platform.Version === 'number'
    ? Platform.Version
    : Number.parseInt(String(Platform.Version), 10);
  const behavior = getAndroidGlassBehavior(apiLevel, targetRef !== null);

  return (
    <View
      style={[
        styles.surface,
        style,
        {
          backgroundColor: behavior.shouldRenderBlur ? 'transparent' : visual.fallbackColor,
          borderColor: visual.borderColor,
          borderRadius: resolvedRadius,
          boxShadow: `0px ${Math.round(visual.shadowDepth / 4)}px ${visual.shadowDepth}px ${visual.shadowColor}`,
          elevation: Math.max(1, Math.round(visual.shadowDepth / 8)),
          overflow: 'hidden',
        },
      ]}
    >
      {behavior.shouldRenderBlur && targetRef ? (
        <BlurView
          accessible={false}
          blurMethod={behavior.blurMethod}
          blurReductionFactor={visual.blurReductionFactor}
          blurTarget={targetRef}
          intensity={visual.blurIntensity}
          tint={visual.blurTint}
          style={[
            StyleSheet.absoluteFill,
            styles.nonInteractive,
            { borderRadius: resolvedRadius, overflow: 'hidden' },
          ]}
        />
      ) : null}
      <GlassLayers
        tintColor={behavior.shouldRenderBlur ? visual.tintColor : 'transparent'}
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
  nonInteractive: {
    pointerEvents: 'none',
  },
});
