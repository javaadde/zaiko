import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import type { InventoryItem } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

type StockCardProps = {
  item: InventoryItem;
  onDelete?: (item: InventoryItem) => void;
  onPress?: (item: InventoryItem) => void;
};

export default function StockCard({ item, onDelete, onPress }: StockCardProps) {
  const { colors, radii, shadows } = useTheme();
  const hasImage = !!item.imageUrl;
  const logo = item.brand ? require(`../../assets/logos/${item.brand.toLowerCase()}.png`) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, shadows.card]}
      onPress={() => onPress?.(item)}
      onLongPress={() => onDelete?.(item)}
    >
      <View style={styles.imageContainer}>
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
            {item.quantity}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.textContainer}>
          <Text style={styles.model} numberOfLines={1}>
            {item.model}
          </Text>
          <Text style={styles.price}>
            ₹{(item.sellingPrice / 1000).toFixed(1)}k
          </Text>
        </View>

        <View style={styles.actionBtn}>
          <ArrowUpRight size={20} color="#1A1A1A" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 10,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
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
    width: 80,
    height: 80,
    opacity: 0.8,
  },
  emoji: {
    fontSize: 50,
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stockBadgeOut: {
    backgroundColor: '#EF4444',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  stockTextOut: {
    color: '#FFF',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  model: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
