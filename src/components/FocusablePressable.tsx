import { useState } from 'react';
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export interface FocusablePressableState {
  readonly pressed: boolean;
  readonly focused: boolean;
}

export interface FocusableKeyboardEvent {
  readonly key?: string;
  readonly repeat?: boolean;
  readonly nativeEvent?: {
    readonly key?: string;
    readonly repeat?: boolean;
  };
  preventDefault?: () => void;
}

type FocusablePressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: FocusablePressableState) => StyleProp<ViewStyle>);
  onKeyDown?: (event: FocusableKeyboardEvent) => void;
};

export function FocusablePressable({ onFocus, onBlur, onKeyDown, style, ...props }: FocusablePressableProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      {...(Platform.OS === 'web' ? { onKeyDown } : {})}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={({ pressed }) => (typeof style === 'function' ? style({ pressed, focused }) : style)}
    />
  );
}
