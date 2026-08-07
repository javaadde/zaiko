import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import type { InventoryItem } from '@/types';

type StatusBadgeProps = {
  status: InventoryItem['status'];
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();

  const config = {
    in_stock: {
      label: 'In Stock',
      bg: colors.successLight,
      text: colors.success,
      dot: colors.success,
    },
    low: {
      label: 'Low Stock',
      bg: colors.warningLight,
      text: colors.warning,
      dot: colors.warning,
    },
    out_of_stock: {
      label: 'Out of Stock',
      bg: colors.dangerLight,
      text: colors.danger,
      dot: colors.danger,
    },
  };

  const c = config[status] || config.in_stock;

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.label, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
