import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color: ColorValue;
  accessibilityLabel?: string;
}

export function MenteIcon({ name, size = 22, color, accessibilityLabel }: IconProps) {
  return (
    <Ionicons
      name={name as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
