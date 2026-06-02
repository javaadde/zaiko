import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Package,
  Plus,
  History,
  User,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import SwipeWrapper from "../../src/components/SwipeWrapper";
import { BorderRadius } from "../../src/theme/colors";

const { width } = Dimensions.get("window");
const TAB_BAR_HORIZONTAL_MARGIN = 20;
const TAB_BAR_WIDTH = width - TAB_BAR_HORIZONTAL_MARGIN * 2;
const TAB_WIDTH = TAB_BAR_WIDTH / 5;

function AnimatedIcon({ children, isFocused }) {
  const scale = useSharedValue(isFocused ? 1 : 1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

function MyTabBar({ state, descriptors, navigation }) {
  const translateX = useSharedValue(state.index * TAB_WIDTH);

  useEffect(() => {
    translateX.value = state.index * TAB_WIDTH;
  }, [state.index]);

  const animatedSliderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(translateX.value, {
            damping: 15,
            stiffness: 120,
            mass: 0.8,
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        <BlurView
          intensity={32}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={styles.tabBarBlur}
        />
        <Animated.View style={[styles.fluidSlider, animatedSliderStyle]} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = options.tabBarIcon;
          const color = isFocused ? "#FFF" : "#B2BEC3";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.6}
            >
              <AnimatedIcon isFocused={isFocused}>
                {Icon && Icon({ focused: isFocused, color })}
              </AnimatedIcon>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <SwipeWrapper>
      <Tabs
        tabBar={(props) => <MyTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <LayoutDashboard
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="stocks"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Package
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Plus size={28} color={color} strokeWidth={focused ? 3 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <History
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
      </Tabs>
    </SwipeWrapper>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
    paddingHorizontal: TAB_BAR_HORIZONTAL_MARGIN,
    backgroundColor: "transparent",
  },
  tabBar: {
    height: 70,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.72)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 2,
  },
  fluidSlider: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: "#1E272E",
    left: (TAB_WIDTH - 52) / 2,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
