import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const BRAND_GREEN = '#5EEA9A';

type BrandStatusScreenProps = {
  variant?: 'loading' | 'success';
  title?: string;
  subtitle?: string;
};

function BrandMark() {
  const pulse = useMemo(() => new Animated.Value(0), []);
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loopRef.current.start();

    return () => {
      loopRef.current?.stop();
    };
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });
  const rotate = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
      <Svg width={164} height={164} viewBox="0 0 164 164">
        <Rect
          x="10"
          y="10"
          width="144"
          height="144"
          rx="42"
          fill="rgba(255,255,255,0.16)"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="3"
        />
        <Path
          d="M56 44h52c7 0 11 8 6 14L82 80h32v18H56c-7 0-11-8-6-14l31-22H49V44z"
          fill="#FFFFFF"
        />
        <Circle cx="123" cy="41" r="8" fill="#FFFFFF" opacity="0.92" />
      </Svg>
    </Animated.View>
  );
}

function LoadingDots() {
  const dot1 = useMemo(() => new Animated.Value(0), []);
  const dot2 = useMemo(() => new Animated.Value(0), []);
  const dot3 = useMemo(() => new Animated.Value(0), []);
  const loopsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    const animateDot = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          ]),
      );

    const a1 = animateDot(dot1, 0);
    const a2 = animateDot(dot2, 160);
    const a3 = animateDot(dot3, 320);
    loopsRef.current = [a1, a2, a3];

    a1.start();
    a2.start();
    a3.start();

    return () => {
      loopsRef.current.forEach((animation) => animation.stop());
    };
  }, [dot1, dot2, dot3]);

  const renderDot = (value: Animated.Value) => ({
    opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
    transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }],
  });

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, renderDot(dot1)]} />
      <Animated.View style={[styles.dot, renderDot(dot2)]} />
      <Animated.View style={[styles.dot, renderDot(dot3)]} />
    </View>
  );
}

export default function BrandStatusScreen({
  variant = 'loading',
  title = 'Zaiko',
  subtitle = 'Loading your inventory workspace',
}: BrandStatusScreenProps) {
  const isSuccess = variant === 'success';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_GREEN} />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.center}>
        <BrandMark />

        {isSuccess ? (
          <View style={styles.successWrap}>
            <View style={styles.successBadge}>
              <Check size={32} color={BRAND_GREEN} strokeWidth={3.2} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <LoadingDots />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dotsRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
  },
  successWrap: {
    alignItems: 'center',
  },
  successBadge: {
    width: 70,
    height: 70,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 2,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  glowBottom: {
    position: 'absolute',
    right: -90,
    bottom: -120,
    width: 280,
    height: 280,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
