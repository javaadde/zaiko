import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  RotateCcw,
  Trash2,
  Package,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { inventoryAPI } from "../services/api";
import { Shadows, BorderRadius } from "../theme/colors";

export default function ArchivedStocksScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmQty, setDeleteConfirmQty] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchArchivedItems = useCallback(async () => {
    try {
      const response = await inventoryAPI.getAll({
        isArchived: true,
        limit: 100,
      });
      setItems(response.data || []);
    } catch (error) {
      console.warn("Failed to fetch archived inventory:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedItems();
  }, [fetchArchivedItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchArchivedItems();
  }, [fetchArchivedItems]);

  const handleRestore = (item) => {
    Alert.alert(
      "Restore Stock",
      `Are you sure you want to restore "${item.brand} ${item.model}" to active inventory?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            try {
              await inventoryAPI.unarchive(item._id);
              setItems((prev) => prev.filter((i) => i._id !== item._id));
              Alert.alert("Success", "Item restored successfully");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
    );
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    if (Number(deleteConfirmQty) !== selectedItem.quantity) {
      Alert.alert(
        "Verification Failed",
        `Please enter the exact current quantity (${selectedItem.quantity}) to confirm deletion.`,
      );
      return;
    }

    setIsDeleting(true);
    try {
      await inventoryAPI.delete(selectedItem._id);
      setItems((prev) => prev.filter((i) => i._id !== selectedItem._id));
      setShowDeleteModal(false);
      setDeleteConfirmQty("");
      Alert.alert("Success", "Item deleted permanently");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Archived Stocks</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Package size={60} color="#E5E7EB" strokeWidth={1} />
            </View>
            <Text style={styles.emptyTitle}>No archived stocks</Text>
            <Text style={styles.emptySub}>
              Items you archive will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item._id} style={[styles.itemCard, Shadows.card]}>
                <View style={styles.itemMain}>
                  <View style={styles.imageBox}>
                    {item.image?.url ? (
                      <Image
                        source={{ uri: item.image.url }}
                        style={styles.image}
                      />
                    ) : (
                      <Text style={styles.emoji}>📱</Text>
                    )}
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.brand}>{item.brand}</Text>
                    <Text style={styles.model}>{item.model}</Text>
                    <Text style={styles.qty}>
                      {item.quantity} Units in stock
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.restoreBtn]}
                    onPress={() => handleRestore(item)}
                  >
                    <RotateCcw size={18} color="#6366F1" />
                    <Text style={[styles.actionText, { color: "#6366F1" }]}>
                      Restore
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => {
                      setSelectedItem(item);
                      setDeleteConfirmQty("");
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={18} color="#EF4444" />
                    <Text style={[styles.actionText, { color: "#EF4444" }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.restockDialog}>
            <View style={styles.dialogHeader}>
              <View>
                <Text style={[styles.dialogTitle, { color: "#EF4444" }]}>
                  Confirm Deletion
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.dialogBody}>
              {selectedItem && (
                <>
                  <Text style={styles.dialogSub}>
                    To delete{" "}
                    <Text style={{ fontWeight: "800", color: "#111827" }}>
                      {selectedItem.brand} {selectedItem.model}
                    </Text>{" "}
                    permanently, please type the current stock quantity:
                  </Text>

                  <View style={styles.confirmTarget}>
                    <Text style={styles.confirmTargetText}>
                      {selectedItem.quantity}
                    </Text>
                  </View>

                  <TextInput
                    style={styles.restockInput}
                    placeholder="Type quantity here..."
                    keyboardType="numeric"
                    value={deleteConfirmQty}
                    onChangeText={setDeleteConfirmQty}
                    autoFocus={true}
                  />

                  <TouchableOpacity
                    style={styles.dialogBtn}
                    onPress={handleDelete}
                    disabled={isDeleting}
                  >
                    <LinearGradient
                      colors={["#EF4444", "#DC2626"]}
                      style={styles.dialogBtnGrad}
                    >
                      {isDeleting ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.dialogBtnText}>
                          Permanently Delete
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  scroll: {
    padding: 20,
  },
  center: {
    flex: 1,
    paddingVertical: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: "center",
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  list: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  itemMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
  },
  imageBox: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.medium,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emoji: {
    fontSize: 30,
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6366F1",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  model: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  qty: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    height: 48,
    borderRadius: BorderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  restoreBtn: {
    backgroundColor: "#EEF2FF",
    borderColor: "#E0E7FF",
  },
  deleteBtn: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  // Modal Styles (matching SellScreen)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  restockDialog: {
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 24,
  },
  dialogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  dialogBody: {
    gap: 15,
  },
  dialogSub: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  confirmTarget: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginVertical: 5,
  },
  confirmTargetText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#EF4444",
    letterSpacing: 2,
  },
  restockInput: {
    backgroundColor: "#F9FAFB",
    height: 60,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  dialogBtn: {
    marginTop: 10,
    borderRadius: BorderRadius.medium,
    overflow: "hidden",
  },
  dialogBtnGrad: {
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
