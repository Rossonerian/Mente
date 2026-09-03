import { Platform, useWindowDimensions } from 'react-native';
import { getResponsiveLayout } from '../theme/responsive';

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  return getResponsiveLayout(width, Platform.OS === 'web' ? 'web' : 'native');
}
