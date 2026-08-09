import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PieChart,
  BarChart3,
  CreditCard,
  ArrowLeftRight,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';

type TabBarProps = any;

// Custom 4-Dots icon matching the exact 5th tab in the reference mockup
function GridDotsIcon({ focused }: { focused: boolean }) {
  const dotColor = focused ? '#FFFFFF' : '#A0A6B5';
  return (
    <View style={styles.gridDotsWrap}>
      <View style={styles.gridDotsRow}>
        <View style={[styles.gridDot, { backgroundColor: dotColor }]} />
        <View style={[styles.gridDot, { backgroundColor: dotColor }]} />
      </View>
      <View style={styles.gridDotsRow}>
        <View style={[styles.gridDot, { backgroundColor: dotColor }]} />
        <View style={[styles.gridDot, { backgroundColor: dotColor }]} />
      </View>
    </View>
  );
}

export default function MindBloomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const routes = state.routes as Array<{ key: string; name: string }>;

  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16;

  const renderIcon = (name: string, focused: boolean) => {
    const iconColor = focused ? '#FFFFFF' : '#8A90A0';
    const strokeWidth = focused ? 2.5 : 2;
    const size = 20;

    switch (name) {
      case 'index':
        return <PieChart size={size} color={iconColor} strokeWidth={strokeWidth} />;
      case 'stocks':
        return <BarChart3 size={size} color={iconColor} strokeWidth={strokeWidth} />;
      case 'add':
        return <CreditCard size={size} color={iconColor} strokeWidth={strokeWidth} />;
      case 'history':
        return <ArrowLeftRight size={size} color={iconColor} strokeWidth={strokeWidth} />;
      case 'settings':
        return <GridDotsIcon focused={focused} />;
      default:
        return <PieChart size={size} color={iconColor} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <View style={[styles.root, { bottom: bottomInset }]} pointerEvents="box-none">
      <View style={[styles.capsuleBar, { backgroundColor: '#1C1D24' }]}>
        {routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              activeOpacity={0.8}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.iconCircleTile,
                  isFocused && styles.activeCircleTile,
                  !isFocused && route.name === 'settings' && styles.settingsInactiveTile,
                ]}
              >
                {renderIcon(route.name, isFocused)}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '88%',
    height: 62,
    borderRadius: 31,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconCircleTile: {
    width: 44,
    height: 44,
    borderRadius: 22, // Exact half of 44 for 100% perfect circle in all environments
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  activeCircleTile: {
    backgroundColor: '#8C80FF', // Vibrant lavender/purple circle background from mockup
    shadowColor: '#8C80FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  settingsInactiveTile: {
    backgroundColor: '#2B2D37', // Dark circular background for 5th tab when inactive
  },
  gridDotsWrap: {
    width: 14,
    height: 14,
    justifyContent: 'space-between',
  },
  gridDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
