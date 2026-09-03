import { StyleSheet, View } from 'react-native';
import { GlassBackdropScene } from './GlassBackdropScene';
import type { GlassBackdropProps } from './GlassSurface.types';
import { getGlassPalette } from './GlassSurface.tokens';

export function GlassBackdrop({ children, theme, style }: GlassBackdropProps) {
  const palette = getGlassPalette(theme);

  return (
    <View style={[styles.container, { backgroundColor: palette.backdropColor }, style]}>
      <GlassBackdropScene theme={theme} />
      <View style={styles.content}>{children}</View>
    </View>
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
});
