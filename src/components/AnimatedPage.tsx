import React, { useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

const TAB_ORDER = ['/', '/stocks', '/add', '/history', '/settings'];

export default function AnimatedPage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevIndex = useRef(TAB_ORDER.indexOf(pathname));
  const currentIndex = TAB_ORDER.indexOf(pathname);

  const offset = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const isMovingRight = currentIndex > prevIndex.current;

    offset.value = isMovingRight ? width : -width;
    opacity.value = 0.8;

    offset.value = withSpring(0, {
      damping: 26,
      stiffness: 150,
      mass: 1,
      ...({ restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 } as any),
    } as any);

    opacity.value = withTiming(1, { duration: 300 });

    prevIndex.current = currentIndex;
  }, [pathname]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: opacity.value,
    transform: [{ translateX: offset.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
