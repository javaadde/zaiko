import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Trophy,
  Package,
  Building2,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react-native";
import { Colors, Shadows, BorderRadius } from "../theme/colors";
import { inventoryAPI } from "../services/api";

const { width } = Dimensions.get("window");

const BRAND_LOGOS = {
  Apple: require("../../assets/logos/apple.png"),
  Google: require("../../assets/logos/google.png"),
  Samsung: require("../../assets/logos/samsung.png"),
  OnePlus: require("../../assets/logos/oneplus.png"),
  Xiaomi: require("../../assets/logos/xiaomi.png"),
  Oppo: require("../../assets/logos/oppo.png"),
  Vivo: require("../../assets/logos/vivo.png"),
  IQOO: require("../../assets/logos/iqoo.png"),
  Motorola: require("../../assets/logos/motorola.png"),
  Realme: require("../../assets/logos/realme.png"),
};

const getBrandLogo = (brandName) => {
  const name = brandName.toLowerCase();
  if (name.includes("apple") || name.includes("iphone"))
    return BRAND_LOGOS.Apple;
  if (name.includes("google") || name.includes("pixel"))
    return BRAND_LOGOS.Google;
  if (name.includes("samsung")) return BRAND_LOGOS.Samsung;
  if (name.includes("oneplus")) return BRAND_LOGOS.OnePlus;
  if (name.includes("xiaomi") || name.includes("mi") || name.includes("poco"))
    return BRAND_LOGOS.Xiaomi;
  if (name.includes("oppo")) return BRAND_LOGOS.Oppo;
  if (name.includes("vivo")) return BRAND_LOGOS.Vivo;
  if (name.includes("iqoo")) return BRAND_LOGOS.IQOO;
  if (name.includes("motorola") || name.includes("moto"))
    return BRAND_LOGOS.Motorola;
  if (name.includes("realme")) return BRAND_LOGOS.Realme;
  return null;
};

export default function DashboardScreen({ onTabChange }) {
  const headerAnim = useRef(new Animated.Value(-10)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await inventoryAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.warn("Failed to fetch stats:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const totalStock = stats?.totalQuantity || 0;
  const activeBrands = stats?.brandDistribution?.length || 0;
  const bestSeller = stats?.bestSelling?.model || "N/A";
  const potentialProfit = stats?.potentialProfit || 0;

  const topBrands = Array.isArray(stats?.brandDistribution)
    ? [...stats.brandDistribution]
        .sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0))
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerAnim }],
            },
          ]}
        >
          <View>
            <Text style={styles.welcome}>{greeting},</Text>
            <Text style={styles.title}>
              <Text style={styles.bold}>Inventory</Text> Overview
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => onTabChange("Settings")}
          >
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileText}>JD</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Analyzing Inventory...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* High-Level Stats */}
            <View style={styles.mainStatsRow}>
              <View style={[styles.mainStat, Shadows.card]}>
                <Package size={24} color={Colors.primary} />
                <Text style={styles.mainStatValue}>{totalStock}</Text>
                <Text style={styles.mainStatLabel}>Total Stock</Text>
              </View>
              <View style={[styles.mainStat, Shadows.card]}>
                <Building2 size={24} color={Colors.primary} />
                <Text style={styles.mainStatValue}>{activeBrands}</Text>
                <Text style={styles.mainStatLabel}>Brands</Text>
              </View>
              <View style={[styles.mainStat, Shadows.card]}>
                <TrendingUp size={24} color={Colors.primary} />
                <Text style={[styles.mainStatValue, { color: Colors.success }]}>
                  ₹{(potentialProfit / 1000).toFixed(1)}k
                </Text>
                <Text style={styles.mainStatLabel}>Est. Profit</Text>
              </View>
            </View>

            {/* Featured Best Seller */}
            <TouchableOpacity
              style={[styles.featuredCard, Shadows.card]}
              activeOpacity={0.9}
              onPress={() => onTabChange("Stocks")}
            >
              <LinearGradient
                colors={[Colors.primary, "#333"]}
                style={styles.featuredGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featuredContent}>
                  <View style={styles.featuredTag}>
                    <Trophy size={14} color="#FFF" />
                    <Text style={styles.featuredTagText}>BEST SELLER</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{bestSeller}</Text>
                  <Text style={styles.featuredSub}>
                    Most demanded unit in current inventory
                  </Text>
                </View>
                <Zap size={60} color="rgba(255,255,255,0.1)" style={styles.featuredIcon} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Brand Distribution */}
            {topBrands.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Brand Distribution</Text>
                  <TouchableOpacity onPress={() => onTabChange("Stocks")}>
                    <Text style={styles.viewAll}>View All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.brandScroll}
                >
                  {topBrands.map((brand) => {
                    const logo = getBrandLogo(brand._id);
                    return (
                      <View
                        key={brand._id}
                        style={[styles.brandCard, Shadows.card]}
                      >
                        <View style={styles.brandLogoBox}>
                          {logo ? (
                            <Image
                              source={logo}
                              style={styles.brandLogo}
                              resizeMode="contain"
                            />
                          ) : (
                            <Package size={24} color={Colors.primary} />
                          )}
                        </View>
                        <Text style={styles.brandName} numberOfLines={1}>
                          {brand._id}
                        </Text>
                        <Text style={styles.brandCount}>
                          {brand.totalQuantity} Units
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Action Cards */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.smallActionCard, { backgroundColor: "#FFF" }, Shadows.card]}
                onPress={() => onTabChange("AddStock")}
              >
                <View style={styles.actionIconBox}>
                  <Package size={20} color={Colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Add New Stock</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallActionCard, { backgroundColor: "#FFF" }, Shadows.card]}
                onPress={() => onTabChange("History")}
              >
                <View style={styles.actionIconBox}>
                  <TrendingUp size={20} color={Colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Sales History</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  welcome: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontWeight: "300",
    marginTop: 2,
  },
  bold: { fontWeight: "700" },
  profileBadge: {
    width: 45,
    height: 45,
    borderRadius: BorderRadius.full,
    backgroundColor: "#FFF",
    padding: 3,
    ...Shadows.card,
  },
  profilePlaceholder: {
    flex: 1,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    gap: 25,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: "center",
    gap: 15,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  // Main Stats
  mainStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  mainStat: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mainStatValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  mainStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Featured Card
  featuredCard: {
    borderRadius: BorderRadius.large,
    overflow: "hidden",
  },
  featuredGrad: {
    padding: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredContent: {
    flex: 1,
    gap: 10,
  },
  featuredTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
    gap: 6,
  },
  featuredTagText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  featuredTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },
  featuredSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 18,
  },
  featuredIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
  },
  // Sections
  section: {
    gap: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  brandScroll: {
    paddingRight: 20,
    gap: 12,
  },
  brandCard: {
    width: 130,
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 15,
    alignItems: "center",
    gap: 10,
  },
  brandLogoBox: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  brandLogo: {
    width: "100%",
    height: "100%",
  },
  brandName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  brandCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  // Action Cards
  actionRow: {
    flexDirection: "row",
    gap: 15,
  },
  smallActionCard: {
    flex: 1,
    borderRadius: BorderRadius.large,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  actionIconBox: {
    width: 45,
    height: 45,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});
