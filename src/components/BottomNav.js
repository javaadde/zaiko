import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, BorderRadius } from "../theme/colors";

const { width } = Dimensions.get("window");

const TAB_CONFIG = [
  // ... rest of the config ...
];

export default function BottomNav({ activeTab, onTabChange }) {
  // ... rest of the component ...
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(18,23,43,0.98)", "rgba(11,14,26,0.99)"]}
        style={styles.navBar}
      >
        {TAB_CONFIG.map((tab, i) => {
          // ... rendering logic ...
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 24,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.large,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  iconWrapper: {
    width: 44,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.medium,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    width: 40,
    height: 30,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.primaryGlow,
  },
  tabIcon: {
    fontSize: 19,
    color: Colors.textMuted,
  },
  tabIconActive: {
    color: Colors.primaryLight,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.primaryLight,
    fontWeight: "700",
  },
  fabWrapper: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    marginTop: -22,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.large,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 14,
  },
  fabIcon: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
    lineHeight: 32,
    marginTop: -2,
  },
});

