import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { Smartphone, PackageOpen } from "lucide-react-native";
import { Colors, Shadows, BorderRadius } from "../theme/colors";
import { inventoryAPI } from "../services/api";
import StockCard from "../components/StockCard";

const { width } = Dimensions.get("window");

const brandLogos = {
  Apple: require("../../assets/logos/apple.png"),
  Samsung: require("../../assets/logos/samsung.png"),
  Google: require("../../assets/logos/google.png"),
  Xiaomi: require("../../assets/logos/xiaomi.png"),
  OnePlus: require("../../assets/logos/oneplus.png"),
  Motorola: require("../../assets/logos/motorola.png"),
  Vivo: require("../../assets/logos/vivo.png"),
  Oppo: require("../../assets/logos/oppo.png"),
  iQOO: require("../../assets/logos/iqoo.png"),
  Realme: require("../../assets/logos/realme.png"),
};

const brandColors = {
  Apple: "#FFFFFF",
  Samsung: "#FFFFFF",
  Google: "#FFFFFF",
  Xiaomi: "#FFFFFF",
  OnePlus: "#FFFFFF",
  Motorola: "#FFFFFF",
  Vivo: "#FFFFFF",
  Oppo: "#FFFFFF",
  iQOO: "#FFFFFF",
  Realme: "#FFFFFF",
  All: "#F3F4F6",
};

function CategoryIcon({ label, icon, active, onPress, isImage, bgColor }) {
  return (
    <TouchableOpacity style={styles.catWrap} onPress={onPress}>
      <View
        style={[
          styles.catCircle,
          active && styles.catCircleActive,
          bgColor && { backgroundColor: bgColor },
        ]}
      >
        {isImage ? (
          <Image
            source={icon}
            style={{ width: 45, height: 45, borderRadius: BorderRadius.full }}
            resizeMode="contain"
          />
        ) : React.isValidElement(icon) ? (
          icon
        ) : (
          <Text style={styles.catEmoji}>{icon}</Text>
        )}
      </View>
      <Text style={[styles.catLabel, active && styles.catLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function StocksScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const headerAnim = useRef(new Animated.Value(-10)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  // ========================
  // Fetch inventory from API
  // ========================

  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      if (selectedBrand !== "All") params.brand = selectedBrand;
      if (search.trim()) params.search = search.trim();
      if (filterStatus !== "all") params.status = filterStatus;
      params.sort = sortBy;
      params.limit = 100;

      const response = await inventoryAPI.getAll(params);
      setItems(response.data || []);
    } catch (error) {
      console.warn("Failed to fetch inventory:", error.message);
      // Keep existing items on error for better UX
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBrand, search, filterStatus, sortBy]);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, [fetchItems]);

  // ========================
  // Delete item
  // ========================

  const handleDelete = (item) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.model}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await inventoryAPI.delete(item._id);
              setItems((prev) => prev.filter((i) => i._id !== item._id));
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
    );
  };

  const categories = [
    {
      id: "1",
      label: "Apple",
      logo: brandLogos.Apple,
      color: brandColors.Apple,
    },
    {
      id: "2",
      label: "Samsung",
      logo: brandLogos.Samsung,
      color: brandColors.Samsung,
    },
    {
      id: "3",
      label: "Google",
      logo: brandLogos.Google,
      color: brandColors.Google,
    },
    {
      id: "4",
      label: "Xiaomi",
      logo: brandLogos.Xiaomi,
      color: brandColors.Xiaomi,
    },
    {
      id: "5",
      label: "OnePlus",
      logo: brandLogos.OnePlus,
      color: brandColors.OnePlus,
    },
    { id: "6", label: "Vivo", logo: brandLogos.Vivo, color: brandColors.Vivo },
    { id: "7", label: "Oppo", logo: brandLogos.Oppo, color: brandColors.Oppo },
    {
      id: "8",
      label: "Motorola",
      logo: brandLogos.Motorola,
      color: brandColors.Motorola,
    },
    { id: "9", label: "iQOO", logo: brandLogos.iQOO, color: brandColors.iQOO },
    {
      id: "10",
      label: "Realme",
      logo: brandLogos.Realme,
      color: brandColors.Realme,
    },
  ];

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
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerAnim }],
          }}
        >
          <View style={styles.header}>
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Search size={20} color="#6B7280" strokeWidth={2} />
                <TextInput
                  placeholder="Search inventory..."
                  style={styles.searchInput}
                  placeholderTextColor="#636b7aff"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
              <TouchableOpacity
                style={styles.filterBtn}
                activeOpacity={0.8}
                onPress={() => setIsFilterVisible(true)}
              >
                <Filter size={20} color="#FFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          <CategoryIcon
            label="All"
            icon={
              <Smartphone
                size={28}
                color={selectedBrand === "All" ? "#1A1A1A" : "#999"}
                strokeWidth={1.5}
              />
            }
            active={selectedBrand === "All"}
            bgColor={brandColors.All}
            onPress={() => setSelectedBrand("All")}
          />
          {categories.map((c) => (
            <CategoryIcon
              key={c.id}
              label={c.label}
              icon={c.logo}
              isImage={true}
              bgColor={c.color}
              active={selectedBrand === c.label}
              onPress={() => setSelectedBrand(c.label)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A1A1A" />
            <Text style={styles.loadingText}>Loading inventory...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <PackageOpen size={60} color="#E5E7EB" strokeWidth={1} />
            </View>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>
              {search || selectedBrand !== "All"
                ? "Try adjusting your search or filters"
                : "Add your first inventory item!"}
            </Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {items.map((item) => (
              <StockCard
                key={item._id}
                item={item}
                onPress={() =>
                  router.push({ pathname: "/sell", params: { id: item._id } })
                }
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.filterRow}>
              {["all", "in_stock", "low", "out_of_stock"].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.filterOption,
                    filterStatus === s && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterStatus(s)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filterStatus === s && styles.filterTextActive,
                    ]}
                  >
                    {s.replace("_", " ").toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.filterRow}>
              {[
                { label: "Newest", value: "createdAt" },
                { label: "Price", value: "sellingPrice" },
                { label: "Stock", value: "quantity" },
              ].map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.filterOption,
                    sortBy === s.value && styles.filterOptionActive,
                  ]}
                  onPress={() => setSortBy(s.value)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      sortBy === s.value && styles.filterTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scroll: {
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: "#333",
    fontWeight: "300",
    marginTop: 15,
    marginBottom: 25,
  },
  bold: { fontWeight: "700" },
  searchBox: {
    flex: 1,
    height: 56,
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.large,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  filterBtn: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.large,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  catScroll: {
    paddingLeft: 20,
    paddingBottom: 25,
    gap: 15,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: 24,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeBtnText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    marginTop: 5,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.medium,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  filterOptionActive: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1A1A1A",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  filterTextActive: {
    color: "#FFF",
  },
  catWrap: {
    alignItems: "center",
    gap: 8,
  },
  catCircle: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  catCircleActive: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  catEmoji: { fontSize: 24 },
  catLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  catLabelActive: {
    color: "#333",
    fontWeight: "700",
  },
  // Loading & Empty states
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 8,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  emptySub: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  // Card structure handled by StockCard component
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    rowGap: 16,
  },
});
