import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { GlassBackdropTargetContext } from './GlassBackdropContext';
import { GlassBackdropScene } from './GlassBackdropScene';
import type { GlassBackdropProps } from './GlassSurface.types';
import { getGlassPalette } from './GlassSurface.tokens';

export function GlassBackdrop({ children, theme, style }: GlassBackdropProps) {
  const targetRef = useRef<View>(null);
  const palette = getGlassPalette(theme);

  return (
    <GlassBackdropTargetContext.Provider value={targetRef}>
      <View style={[styles.container, { backgroundColor: palette.backdropColor }, style]}>
        <BlurTargetView
          ref={targetRef}
          accessible={false}
          collapsable={false}
          importantForAccessibility="no-hide-descendants"
          style={[StyleSheet.absoluteFill, styles.nonInteractive]}
        >
          <View
            accessible={false}
            style={[
              StyleSheet.absoluteFill,
              styles.nonInteractive,
              { backgroundColor: palette.backdropColor },
            ]}
          />
          <GlassBackdropScene theme={theme} />
        </BlurTargetView>
        <View style={styles.content}>{children}</View>
      </View>
    </GlassBackdropTargetContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  nonInteractive: {
    pointerEvents: 'none',
  },
});
