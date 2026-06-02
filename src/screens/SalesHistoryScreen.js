import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  RefreshControl,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import {
  Search,
  ChevronLeft,
  Calendar,
  User,
  Smartphone,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CreditCard,
} from "lucide-react-native";
import { salesAPI } from "../services/api";
import { Colors, Shadows, BorderRadius } from "../theme/colors";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function SalesHistoryScreen() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchSales = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const response = await salesAPI.getAll({
          search,
          sortBy,
          sortOrder,
        });
        setSales(response.data);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, sortBy, sortOrder],
  );

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderSaleItem = ({ item }) => (
    <View style={[styles.saleCard, Shadows.card]}>
      <View style={styles.cardHeader}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>
            {item.itemId?.brand || "Deleted Item"}
          </Text>
        </View>
        <Text style={styles.saleDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardDetails}>
          <View style={styles.productInfo}>
            <Smartphone size={16} color="#6B7280" />
            <Text style={styles.modelName}>
              {item.itemId?.model || "Unknown Model"}
            </Text>
          </View>

          <View style={styles.customerInfo}>
            <User size={16} color="#6B7280" />
            <Text style={styles.customerName}>{item.customerName}</Text>
          </View>

          <View style={styles.imeiBox}>
            <Text style={styles.imeiLabel}>IMEI:</Text>
            <Text style={styles.imeiValue}>{item.imei}</Text>
          </View>
        </View>

        {item.customerPhoto?.url && (
          <Image
            source={{ uri: item.customerPhoto.url }}
            style={styles.customerAvatar}
          />
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Sold for</Text>
          <Text style={styles.priceValue}>
            ₹{item.salePrice.toLocaleString()}
          </Text>
        </View>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                item.saleType === "wholesale" ? "#E0F2FE" : "#F0FDF4",
            },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              { color: item.saleType === "wholesale" ? "#0369A1" : "#15803D" },
            ]}
          >
            {item.saleType.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );

  const SortButton = ({ label, value }) => {
    const isActive = sortBy === value;
    return (
      <TouchableOpacity
        style={[styles.sortBtn, isActive && styles.activeSortBtn]}
        onPress={() => {
          if (isActive) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          } else {
            setSortBy(value);
            setSortOrder("desc");
          }
        }}
      >
        <Text
          style={[styles.sortBtnText, isActive && styles.activeSortBtnText]}
        >
          {label}
        </Text>
        {isActive &&
          (sortOrder === "asc" ? (
            <ArrowUpRight size={14} color="#FFF" />
          ) : (
            <ArrowDownRight size={14} color="#FFF" />
          ))}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales History</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search & Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customer, model, or IMEI..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.sortContainer}>
          <Filter size={16} color="#6B7280" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            <SortButton label="Date" value="date" />
            <SortButton label="Price" value="price" />
            <SortButton label="Customer" value="customer" />
            <SortButton label="Brand" value="brand" />
          </ScrollView>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1A1A1A" />
          <Text style={styles.loadingText}>Fetching sales history...</Text>
        </View>
      ) : (
        <FlatList
          data={sales}
          renderItem={renderSaleItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSales(true)}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <TrendingUp size={48} color="#E5E7EB" />
              <Text style={styles.emptyText}>No sales recorded yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  filterSection: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.medium,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sortScroll: {
    gap: 8,
    paddingRight: 16,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.large,
    backgroundColor: "#F3F4F6",
    gap: 4,
  },
  activeSortBtn: {
    backgroundColor: "#1A1A1A",
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeSortBtnText: {
    color: "#FFF",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  saleCard: {
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brandBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    textTransform: "uppercase",
  },
  saleDate: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 16,
  },
  cardDetails: {
    flex: 1,
    gap: 12,
  },
  customerAvatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.medium,
    backgroundColor: "#F3F4F6",
    marginLeft: 15,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modelName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  imeiBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF9F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.small,
    alignSelf: "flex-start",
  },
  imeiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
  },
  imeiValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceBox: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.small,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  emptyBox: {
    paddingVertical: 100,
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
});
