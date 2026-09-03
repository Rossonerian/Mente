import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { caregiverTheme, patientTheme } from '../../theme/tokens';
import { GlassLayers } from './GlassLayers';
import { getIosGlassStyle } from './GlassSurface.policy';
import { getGlassVisualTokens } from './GlassSurface.tokens';
import type { GlassSurfaceProps } from './GlassSurface.types';

function getNativeGlassAvailability() {
  let liquidGlassAvailable = false;
  let glassEffectApiAvailable = false;

  try {
    liquidGlassAvailable = isLiquidGlassAvailable();
  } catch {
    liquidGlassAvailable = false;
  }

  try {
    glassEffectApiAvailable = isGlassEffectAPIAvailable();
  } catch {
    glassEffectApiAvailable = false;
  }

  return liquidGlassAvailable && glassEffectApiAvailable;
}

function useReduceTransparency() {
  const [reduceTransparencyEnabled, setReduceTransparencyEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (isMounted) setReduceTransparencyEnabled(enabled);
      })
      .catch(() => {
        if (isMounted) setReduceTransparencyEnabled(true);
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparencyEnabled,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceTransparencyEnabled;
}

export function GlassSurface({
  children,
  theme = 'caregiver',
  variant = 'elevated',
  style,
  radius,
}: GlassSurfaceProps) {
  const reduceTransparencyEnabled = useReduceTransparency();
  const liquidGlassAvailable = getNativeGlassAvailability();
  const visual = getGlassVisualTokens(theme, variant);
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  const resolvedRadius = radius ?? tokens.radii.card;
  const useLiquidGlass = liquidGlassAvailable && !reduceTransparencyEnabled;
  const useBlurFallback = !liquidGlassAvailable && !reduceTransparencyEnabled;

  return (
    <View
      style={[
        styles.surface,
        style,
        {
          backgroundColor: reduceTransparencyEnabled ? visual.fallbackColor : 'transparent',
          borderColor: visual.borderColor,
          borderRadius: resolvedRadius,
          boxShadow: `0px ${Math.round(visual.shadowDepth / 4)}px ${visual.shadowDepth}px ${visual.shadowColor}`,
          overflow: 'hidden',
        },
      ]}
    >
      {useLiquidGlass ? (
        <GlassView
          accessible={false}
          colorScheme="light"
          glassEffectStyle={getIosGlassStyle(theme, variant)}
          isInteractive={false}
          tintColor={visual.iosTintColor}
          style={[
            StyleSheet.absoluteFill,
            styles.nonInteractive,
            { borderRadius: resolvedRadius, overflow: 'hidden' },
          ]}
        />
      ) : null}
      {useBlurFallback ? (
        <BlurView
          accessible={false}
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
        tintColor={useBlurFallback ? visual.tintColor : 'transparent'}
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
