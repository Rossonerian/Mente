import { StyleSheet, View } from 'react-native';
import { caregiverTheme, patientTheme } from '../theme/tokens';
import type { ThemeName } from './Card';

export function FamilyConstellation({ theme = 'caregiver' }: { theme?: ThemeName }) {
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  const accent = tokens.colors.primary;
  const secondary = theme === 'caregiver' ? '#7B87E8' : '#D58B58';

  return (
    <View accessible={false} accessibilityElementsHidden aria-hidden={true} style={styles.constellation}>
      <View style={[styles.line, { backgroundColor: secondary }]} />
      <View style={[styles.node, styles.centerNode, { backgroundColor: accent, borderColor: tokens.colors.surface }]} />
      <View style={[styles.node, styles.leftNode, { backgroundColor: secondary, borderColor: tokens.colors.surface }]} />
      <View style={[styles.node, styles.rightNode, { backgroundColor: secondary, borderColor: tokens.colors.surface }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  constellation: {
    height: 36,
    position: 'relative',
    width: 72,
  },
  line: {
    height: 2,
    left: 10,
    position: 'absolute',
    right: 10,
    top: 17,
  },
  node: {
    borderWidth: 3,
    borderRadius: 20,
    height: 18,
    position: 'absolute',
    top: 9,
    width: 18,
  },
  centerNode: {
    left: 27,
  },
  leftNode: {
    left: 0,
  },
  rightNode: {
    right: 0,
  },
});
