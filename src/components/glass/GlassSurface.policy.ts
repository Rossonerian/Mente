import type { BlurMethod } from 'expo-blur';
import type { GlassStyle } from 'expo-glass-effect';
import type { GlassTheme, GlassVariant } from './GlassSurface.types';

const ANDROID_BLUR_METHOD: BlurMethod = 'dimezisBlurViewSdk31Plus';

export function getAndroidGlassBehavior(apiLevel: number, hasTarget: boolean) {
  return {
    blurMethod: ANDROID_BLUR_METHOD,
    shouldRenderBlur: apiLevel >= 31 && hasTarget,
  } as const;
}

export function getIosGlassStyle(theme: GlassTheme, variant: GlassVariant): GlassStyle {
  return theme === 'patient' || variant === 'focus' ? 'clear' : 'regular';
}
