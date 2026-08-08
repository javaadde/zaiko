import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useRouter, usePathname } from 'expo-router';
import { runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

const ROUTES = ['/', '/stocks', '/add', '/history', '/settings'];

type SwipeWrapperProps = {
  children: React.ReactNode;
};

export default function SwipeWrapper({ children }: SwipeWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (direction: 'next' | 'prev') => {
    const currentIndex = ROUTES.indexOf(pathname);
    let nextIndex = currentIndex;

    if (direction === 'next' && currentIndex < ROUTES.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      router.push(ROUTES[nextIndex] as never);
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(navigateTo)('next');
      } else if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(navigateTo)('prev');
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
