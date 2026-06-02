import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { ArrowUpRight } from "lucide-react-native";
import { Colors, Shadows, BorderRadius } from "../theme/colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

export default function StockCard({ item, onDelete, onPress }) {
  // ... rest of the component remains same ...
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, Shadows.card]}
      onPress={() => onPress && onPress(item)}
      onLongPress={() => onDelete && onDelete(item)}
    >
      {/* Image / Header Section */}
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: item.image.url }}
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

        {/* Stock Badge Overlay */}
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

      {/* Info Section */}
      <View style={styles.info}>
        <View style={styles.textContainer}>
          <Text style={styles.model} numberOfLines={1}>
            {item.model}
          </Text>
          <Text style={styles.price}>
            ₹{(item.sellingPrice / 1000).toFixed(1)}k
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.actionBtn}>
          <ArrowUpRight size={20} color="#1A1A1A" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    width: CARD_WIDTH,
    borderRadius: BorderRadius.large,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 10,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.large,
    backgroundColor: "#F8F9FA",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallbackContainer: {
    alignItems: "center",
    justifyContent: "center",
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
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stockBadgeOut: {
    backgroundColor: "#EF4444",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  stockTextOut: {
    color: "#FFF",
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  model: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.warning, // Gold/Orange color from theme, matching shoe image
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

