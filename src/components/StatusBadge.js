import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, BorderRadius } from "../theme/colors";

export default function StatusBadge({ status }) {
  const config = {
    in_stock: {
      label: "In Stock",
      bg: Colors.successLight,
      text: Colors.success,
      dot: Colors.success,
    },
    low: {
      label: "Low Stock",
      bg: Colors.warningLight,
      text: Colors.warning,
      dot: Colors.warning,
    },
    out_of_stock: {
      label: "Out of Stock",
      bg: Colors.dangerLight,
      text: Colors.danger,
      dot: Colors.danger,
    },
  };
  const c = config[status] || config["in_stock"];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.label, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
