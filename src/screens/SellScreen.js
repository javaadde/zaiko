import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from "react-native";
import {
  MoreVertical,
  Edit2,
  PackagePlus,
  X,
  Archive,
  Trash2,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Shadows, BorderRadius } from "../theme/colors";
import { inventoryAPI } from "../services/api";

export default function SellScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState(false);

  // Sale form state
  const [salePrice, setSalePrice] = useState("");
  const [saleType, setSaleType] = useState("retail"); // 'wholesale' | 'retail'
  const [restockQty, setRestockQty] = useState("");
  const [restocking, setRestocking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmQty, setDeleteConfirmQty] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId) => {
    try {
      const response = await inventoryAPI.getById(itemId);
      setItem(response.data);
      // Pre-fill with existing selling price
      setSalePrice(String(response.data.sellingPrice));
    } catch (error) {
      Alert.alert("Error", "Failed to load item details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    if (!salePrice || isNaN(Number(salePrice))) {
      Alert.alert("Invalid Price", "Please enter a valid numeric sale price.");
      return;
    }

    const price = Number(salePrice);
    const cost = item.purchasePrice;

    // Validation based on item overrides or defaults
    if (saleType === "wholesale") {
      const minPrice = item.minWholesalePrice || cost + 500;
      if (price < minPrice) {
        Alert.alert(
          "Price Too Low",
          `Wholesale price must be at least ₹${minPrice}`,
        );
        return;
      }
    } else if (saleType === "retail") {
      const minPrice = item.minRetailPrice || cost + 1000;
      if (price < minPrice) {
        Alert.alert(
          "Price Too Low",
          `Retail price must be at least ₹${minPrice}`,
        );
        return;
      }
    }

    // Navigate to verification page
    router.push({
      pathname: "/sell-verify/[id]",
      params: { id, price, type: saleType },
    });
  };

  const handleRestock = async () => {
    if (!restockQty || isNaN(Number(restockQty)) || Number(restockQty) <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity to add.");
      return;
    }

    setRestocking(true);
    try {
      const response = await inventoryAPI.restock(id, Number(restockQty));
      setItem(response.data);
      setRestockQty("");
      Alert.alert("Success", "Inventory updated successfully!");
    } catch (error) {
      Alert.alert("Restock Failed", error.message);
    } finally {
      setRestocking(false);
    }
  };

  const handleArchive = async () => {
    Alert.alert(
      "Archive Item",
      "Are you sure you want to archive this stock? It will be moved to settings and can be restored later.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            setIsArchiving(true);
            try {
              await inventoryAPI.archive(id);
              Alert.alert("Success", "Item archived successfully");
              router.replace("/(tabs)/stocks");
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setIsArchiving(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = async () => {
    if (Number(deleteConfirmQty) !== item.quantity) {
      Alert.alert(
        "Verification Failed",
        `Please enter the exact current quantity (${item.quantity}) to confirm deletion.`,
      );
      return;
    }

    setIsDeleting(true);
    try {
      await inventoryAPI.delete(id);
      setShowDeleteModal(false);
      Alert.alert("Success", "Item deleted permanently");
      router.replace("/(tabs)/stocks");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A1A1A" />
      </View>
    );
  }

  if (!item) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Sell Phone</Text>
              <Text style={styles.subtitle}>
                {item.brand} {item.model}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => setShowMenu(true)}
              activeOpacity={0.7}
            >
              <MoreVertical size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.itemCard, Shadows.card]}>
          <View style={styles.itemImageWrap}>
            {item.image?.url ? (
              <Image
                source={{ uri: item.image.url }}
                style={styles.itemImage}
              />
            ) : (
              <View style={styles.noImage}>
                <Text style={styles.noImageText}>📱</Text>
              </View>
            )}
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.detailLabel}>In Stock</Text>
            <Text style={styles.detailValue}>{item.quantity} Units</Text>
            <View style={styles.divider} />
            <Text style={styles.detailLabel}>Purchase Price</Text>
            <Text style={styles.detailValue}>₹{item.purchasePrice}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Sale Type</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                saleType === "retail" && styles.typeBtnActive,
              ]}
              onPress={() => setSaleType("retail")}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  saleType === "retail" && styles.typeBtnTextActive,
                ]}
              >
                Retail
              </Text>
              <Text style={styles.typeMin}>
                min: ₹{item.minRetailPrice || item.purchasePrice + 1000}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                saleType === "wholesale" && styles.typeBtnActive,
              ]}
              onPress={() => setSaleType("wholesale")}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  saleType === "wholesale" && styles.typeBtnTextActive,
                ]}
              >
                Wholesale
              </Text>
              <Text style={styles.typeMin}>
                min: ₹{item.minWholesalePrice || item.purchasePrice + 500}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Final Sale Price</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 55000"
              keyboardType="numeric"
              value={salePrice}
              onChangeText={setSalePrice}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Profit: ₹{Number(salePrice) - item.purchasePrice || 0}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.sellBtn, item.quantity <= 0 && styles.disabledBtn]}
          onPress={handleSell}
          disabled={selling || item.quantity <= 0}
        >
          <LinearGradient colors={["#1A1A1A", "#333"]} style={styles.sellGrad}>
            {selling ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.sellBtnText}>
                {item.quantity <= 0 ? "Out of Stock" : "Complete Sale"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Options Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContent, Shadows.card]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowRestockModal(true);
              }}
            >
              <PackagePlus size={20} color="#111827" />
              <Text style={styles.menuItemText}>Restock Inventory</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push({ pathname: "/add", params: { id: item._id } });
              }}
            >
              <Edit2 size={20} color="#111827" />
              <Text style={styles.menuItemText}>Edit Item Details</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                handleArchive();
              }}
            >
              <Archive size={20} color="#6366F1" />
              <Text style={[styles.menuItemText, { color: "#6366F1" }]}>
                Archive Stock
              </Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: "#EF4444" }]}>
                Delete Item
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Restock Dialog Modal */}
      <Modal
        visible={showRestockModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRestockModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.restockDialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Restock Inventory</Text>
              <TouchableOpacity onPress={() => setShowRestockModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.dialogBody}>
              <Text style={styles.dialogSub}>
                Enter quantity to add for {item.model}
              </Text>
              <TextInput
                style={styles.restockInput}
                placeholder="Qty (e.g. 10)"
                keyboardType="numeric"
                value={restockQty}
                onChangeText={setRestockQty}
                autoFocus={true}
              />

              <TouchableOpacity
                style={styles.dialogBtn}
                onPress={async () => {
                  await handleRestock();
                  setShowRestockModal(false);
                }}
                disabled={restocking}
              >
                <LinearGradient
                  colors={["#111827", "#333"]}
                  style={styles.dialogBtnGrad}
                >
                  {restocking ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.dialogBtnText}>Confirm Restock</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
              <Text style={styles.dialogSub}>
                To delete{" "}
                <Text style={{ fontWeight: "800", color: "#111827" }}>
                  {item.brand} {item.model}
                </Text>{" "}
                permanently, please type the current stock quantity:
              </Text>

              <View style={styles.confirmTarget}>
                <Text style={styles.confirmTargetText}>{item.quantity}</Text>
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
                    <Text style={styles.dialogBtnText}>Permanently Delete</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.5,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  moreBtn: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemImageWrap: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  noImageText: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 6,
  },

  form: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 28,
    gap: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
  },
  typeBtnActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  typeBtnTextActive: {
    color: "#FFFFFF",
  },
  typeMin: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "600",
  },

  inputWrap: {
    gap: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    height: 64,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  infoText: {
    color: "#4B5563",
    fontWeight: "800",
    fontSize: 16,
  },

  sellBtn: {
    marginTop: 32,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sellGrad: {
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  sellBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  disabledBtn: {
    opacity: 0.4,
  },

  // Modal Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  menuContent: {
    position: "absolute",
    top: 110,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 8,
    minWidth: 180,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 8,
  },

  // Restock Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  restockDialog: {
    backgroundColor: "#FFF",
    borderRadius: 28,
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
  restockInput: {
    backgroundColor: "#F9FAFB",
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  dialogBtn: {
    marginTop: 10,
    borderRadius: 18,
    overflow: "hidden",
  },
  dialogBtnGrad: {
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  confirmTarget: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 5,
  },
  confirmTargetText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#EF4444",
  },
});
