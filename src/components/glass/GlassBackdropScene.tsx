import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getGlassPalette, getRoleBackgroundStops } from './GlassSurface.tokens';
import type { GlassTheme } from './GlassSurface.types';

export function GlassBackdropScene({ theme }: { theme: GlassTheme }) {
  const palette = getGlassPalette(theme);
  const backgroundStops = getRoleBackgroundStops(theme);

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, styles.nonInteractive]}
    >
      <LinearGradient
        accessible={false}
        colors={backgroundStops}
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, styles.nonInteractive]}
      />
      <View style={[styles.topRibbon, { backgroundColor: palette.accentPrimary }]} />
      <View style={[styles.middleRibbon, { backgroundColor: palette.accentSecondary }]} />
      <View style={[styles.bottomRing, { borderColor: palette.accentOutline }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  nonInteractive: {
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  topRibbon: {
    borderRadius: 999,
    height: 220,
    position: 'absolute',
    right: '-14%',
    top: -96,
    transform: [{ rotate: '-8deg' }],
    width: '62%',
  },
  middleRibbon: {
    borderRadius: 999,
    height: 170,
    left: '-18%',
    position: 'absolute',
    top: '42%',
    transform: [{ rotate: '11deg' }],
    width: '54%',
  },
  bottomRing: {
    borderRadius: 999,
    borderWidth: 28,
    bottom: -120,
    height: 300,
    position: 'absolute',
    right: '8%',
    transform: [{ rotate: '-7deg' }],
    width: '42%',
  },
});
