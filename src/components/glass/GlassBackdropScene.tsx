import { StyleSheet, View } from 'react-native';
import type { GlassTheme } from './GlassSurface.types';

import { Image } from 'react-native';

export function GlassBackdropScene({ theme }: { theme: GlassTheme }) {
  return null;
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
