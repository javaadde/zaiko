import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

const TAB_CONFIG = [
  { label: 'Home', icon: '🏠', route: '/' },
  { label: 'Stocks', icon: '📦', route: '/stocks' },
  { label: 'Add', icon: '➕', route: '/add', isFab: true },
  { label: 'History', icon: '📊', route: '/history' },
  { label: 'Settings', icon: '👤', route: '/settings' },
];

type BottomNavProps = {
  activeTab?: string;
  onTabChange?: (route: string) => void;
};

export default function BottomNav({ activeTab = '/', onTabChange }: BottomNavProps) {
  const { colors, radii } = useTheme();
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(18,23,43,0.98)', 'rgba(11,14,26,0.99)']}
        style={styles.navBar}
      >
        {TAB_CONFIG.map((tab, i) => {
          const isActive = activeTab === tab.route;
          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => onTabChange?.(tab.route)}
            >
              {tab.isFab ? (
                <Animated.View style={{ transform: [{ scale: fabScale }] }}>
                  <View style={[styles.fab, { backgroundColor: colors.accent }]}>
                    <Text style={styles.fabIcon}>{tab.icon}</Text>
                  </View>
                </Animated.View>
              ) : (
                <View style={styles.iconWrapper}>
                  {isActive && <View style={[styles.activePill, { backgroundColor: colors.primaryGlow }]} />}
                  <Text style={[styles.tabIcon, isActive && { color: colors.accent }]}>
                    {tab.icon}
                  </Text>
                  <Text style={[styles.tabLabel, isActive && { color: colors.accent, fontWeight: '700' }]}>
                    {tab.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 24,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  iconWrapper: {
    width: 44,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    width: 40,
    height: 30,
    borderRadius: 12,
  },
  tabIcon: {
    fontSize: 19,
    color: '#6B7280',
  },
  tabLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    marginTop: -22,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 14,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
    marginTop: -2,
  },
});
