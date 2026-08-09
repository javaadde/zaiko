import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { getBrandLogo } from '@/data/brands';
import type { InventoryItem } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2;

type StockCardProps = {
  item: InventoryItem;
  onDelete?: (item: InventoryItem) => void;
  onPress?: (item: InventoryItem) => void;
};

export default function StockCard({ item, onDelete, onPress }: StockCardProps) {
  const { colors, shadows } = useTheme();
  const hasImage = !!item.imageUrl;
  const logo = item.brand ? getBrandLogo(item.brand) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
        shadows.card,
      ]}
      onPress={() => onPress?.(item)}
      onLongPress={() => onDelete?.(item)}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.bgCardAlt }]}>
        {hasImage ? (
          <Image
            source={{ uri: item.imageUrl as string }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.fallbackContainer}>
            {logo ? (
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            ) : (
              <Text style={styles.emoji}>📱</Text>
            )}
          </View>
        )}

        <View
          style={[
            styles.stockBadge,
            item.quantity <= 0 && styles.stockBadgeOut,
          ]}
        >
          <Text
            style={[
              styles.stockText,
              item.quantity <= 0 && styles.stockTextOut,
            ]}
          >
            {item.quantity} units
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.textContainer}>
          <Text style={[styles.model, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.model}
          </Text>
          <Text style={[styles.price, { color: colors.pastelGreen }]}>
            ₹{(item.sellingPrice / 1000).toFixed(1)}k
          </Text>
        </View>

        <View style={[styles.actionBtn, { backgroundColor: colors.pastelYellow }]}>
          <ArrowUpRight size={18} color="#18191E" strokeWidth={2.5} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 28,
    padding: 12,
    marginHorizontal: 6,
    marginVertical: 8,
    borderWidth: 1,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    opacity: 0.8,
  },
  emoji: {
    fontSize: 44,
  },
  stockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stockBadgeOut: {
    backgroundColor: '#FF6B6B',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#18191E',
  },
  stockTextOut: {
    color: '#FFFFFF',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 6,
  },
  model: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
