import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Colors, Shadows, BorderRadius } from "../theme/colors";
import { inventoryAPI } from "../services/api";
import {
  TrendingUp,
  DollarSign,
  Target,
  ArrowDown,
  ArrowUp,
  RotateCcw,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

function AnimatedNumber({ target, prefix = "", suffix = "", style }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ""));
    Animated.timing(animVal, {
      toValue: isNaN(num) ? 0 : num,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    const id = animVal.addListener(({ value }) => {
      setDisplay(
        Number.isInteger(num)
          ? Math.floor(value).toLocaleString()
          : value.toFixed(1),
      );
    });
    return () => animVal.removeListener(id);
  }, [target]);

  return (
    <Text style={style}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}

function LineGraph({ data, labels, color, height = 120 }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x:
      data.length > 1
        ? (i / (data.length - 1)) * (width - 70)
        : (width - 70) / 2,
    y: height - ((v - min) / range) * (height - 30) - 10,
  }));

  return (
    <View style={{ height: height + 40, marginTop: 20 }}>
      <View style={styles.graphContainer}>
        {pts.length > 1 &&
          pts.slice(0, -1).map((pt, i) => {
            const next = pts[i + 1];
            const dx = next.x - pt.x;
            const dy = next.y - pt.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={i}
                style={[
                  styles.graphLine,
                  {
                    left: pt.x,
                    top: pt.y,
                    width: len,
                    backgroundColor: color,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: "0 0",
                  },
                ]}
              />
            );
          })}
        {pts.map((pt, i) => (
          <View
            key={i}
            style={[
              styles.graphDot,
              {
                left: pt.x - 4,
                top: pt.y - 4,
                backgroundColor: color,
                borderColor: "#FFF",
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.lgLabels}>
        {labels.map((l, i) => (
          <Text key={i} style={styles.lgLabel}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchStats = useCallback(async () => {
    try {
      const response = await inventoryAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.warn("Analytics fetch error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = stats?.monthlyTrends?.map((t) => t.count) || [0];
  const chartLabels = stats?.monthlyTrends?.map(
    (t) => monthNames[t._id - 1],
  ) || ["Start"];

  const sellingValue = stats?.totalSellingValue || 0;
  const purchaseValue = stats?.totalPurchaseValue || 0;
  const profit = sellingValue - purchaseValue;

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
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Track your performance</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1A1A1A" />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* KPI Grid */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, Shadows.card]}>
                <View
                  style={[styles.kpiIconBox, { backgroundColor: "#EFF6FF" }]}
                >
                  <DollarSign size={20} color="#3B82F6" />
                </View>
                <AnimatedNumber
                  target={sellingValue / 1000}
                  prefix="₹"
                  suffix="k"
                  style={styles.kpiValue}
                />
                <Text style={styles.kpiLabel}>Stock Value</Text>
              </View>

              <View style={[styles.kpiCard, Shadows.card]}>
                <View
                  style={[styles.kpiIconBox, { backgroundColor: "#F0FDF4" }]}
                >
                  <TrendingUp size={20} color="#10B981" />
                </View>
                <AnimatedNumber
                  target={profit / 1000}
                  prefix="₹"
                  suffix="k"
                  style={styles.kpiValue}
                />
                <Text style={styles.kpiLabel}>Potential Profit</Text>
              </View>
            </View>

            {/* Main Chart */}
            <View style={[styles.graphCard, Shadows.card]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Inventory Growth</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>YTD</Text>
                </View>
              </View>
              <LineGraph
                data={chartData}
                labels={chartLabels}
                color="#1A1A1A"
              />
            </View>

            {/* Insight Row */}
            <View style={styles.insightRow}>
              <View style={[styles.miniInsight, Shadows.card]}>
                <View style={styles.miniIconBox}>
                  <Target size={16} color="#333" />
                </View>
                <Text style={styles.miniTitle}>Total Items</Text>
                <Text style={styles.miniVal}>{stats?.totalQuantity || 0}</Text>
              </View>
              <View style={[styles.miniInsight, Shadows.card]}>
                <View style={styles.miniIconBox}>
                  <ArrowUp size={16} color="#10B981" />
                </View>
                <Text style={styles.miniTitle}>Top Brand</Text>
                <Text style={styles.miniVal}>
                  {stats?.brandDistribution?.[0]?._id || "None"}
                </Text>
              </View>
            </View>

            {/* Movement Section */}
            <View style={[styles.movCard, Shadows.card]}>
              <Text style={styles.cardTitle}>Stock Distribution</Text>
              <View style={styles.movList}>
                {stats?.statusDistribution?.map((status, i) => {
                  const labels = {
                    in_stock: "Available",
                    low: "Low Stock",
                    out_of_stock: "Out of Stock",
                  };
                  const colors = {
                    in_stock: "#10B981",
                    low: "#F59E0B",
                    out_of_stock: "#EF4444",
                  };
                  return (
                    <View key={i} style={styles.movRow}>
                      <View style={styles.rowLead}>
                        <View
                          style={[
                            styles.rowIcon,
                            { backgroundColor: colors[status._id] + "15" },
                          ]}
                        >
                          <ArrowDown size={14} color={colors[status._id]} />
                        </View>
                        <Text style={styles.rowLabel}>
                          {labels[status._id] || status._id}
                        </Text>
                      </View>
                      <View style={styles.barWrap}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${(status.totalQuantity / (stats.totalQuantity || 1)) * 100}%`,
                              backgroundColor: colors[status._id],
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.rowVal}>{status.totalQuantity}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFF6FF" },
  scroll: { paddingTop: 60, paddingHorizontal: 20 },
  header: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: "800", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#9CA3AF", marginTop: 4, fontWeight: "500" },

  loadingBox: { paddingVertical: 100, alignItems: "center", gap: 15 },
  loadingText: { color: "#9CA3AF", fontWeight: "600" },

  kpiGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 18,
    gap: 4,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  kpiValue: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
  kpiLabel: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },

  graphCard: {
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
  badge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#6B7280" },

  graphContainer: { height: 120, width: "100%" },
  graphLine: { position: "absolute", height: 2, borderRadius: 1 },
  graphDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  lgLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  lgLabel: { fontSize: 10, color: "#9CA3AF", fontWeight: "600" },

  insightRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  miniInsight: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  miniIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.medium,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  miniTitle: { fontSize: 11, color: "#9CA3AF", fontWeight: "600", flex: 1 },
  miniVal: { fontSize: 14, fontWeight: "800", color: "#1A1A1A" },

  movCard: { backgroundColor: "#FFF", borderRadius: BorderRadius.large, padding: 20 },
  movList: { marginTop: 20, gap: 15 },
  movRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowLead: { flexDirection: "row", alignItems: "center", gap: 10, width: 90 },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.small,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  barWrap: {
    flex: 1,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.small,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: BorderRadius.small },
  rowVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    width: 25,
    textAlign: "right",
  },
});
