import { StyleSheet, View } from 'react-native';

export function GlassLayers({
  tintColor,
  highlightColor,
  radius,
}: {
  tintColor: string;
  highlightColor: string;
  radius: number;
}) {
  return (
    <>
      <View
        accessible={false}
        style={[StyleSheet.absoluteFill, styles.nonInteractive, { backgroundColor: tintColor }]}
      />
      <View
        accessible={false}
        style={[
          styles.innerHighlight,
          styles.nonInteractive,
          { borderColor: highlightColor, borderRadius: Math.max(0, radius - 1) },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  innerHighlight: {
    borderTopWidth: 1,
    height: 12,
    left: 1,
    position: 'absolute',
    right: 1,
    top: 1,
    zIndex: 1,
  },
  nonInteractive: {
    pointerEvents: 'none',
  },
});
