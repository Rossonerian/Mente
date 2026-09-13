import { useEffect, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeIn({ children, duration = 300, delay = 0, style }: FadeInProps) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
}

interface ScaleInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  style?: StyleProp<ViewStyle>;
}

export function ScaleIn({ children, duration = 300, delay = 0, initialScale = 0.95, style }: ScaleInProps) {
  const [scale] = useState(() => new Animated.Value(initialScale));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scale, opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
}

interface SlideInProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export function SlideIn({ children, direction = 'up', distance = 20, duration = 300, delay = 0, style }: SlideInProps) {
  const initialOffset = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
  const initialOffsetHorizontal = direction === 'left' ? distance : direction === 'right' ? -distance : 0;

  const [translateY] = useState(() => new Animated.Value(initialOffset));
  const [translateX] = useState(() => new Animated.Value(initialOffsetHorizontal));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [translateY, translateX, opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }, { translateX }] }, style]}>
      {children}
    </Animated.View>
  );
}
