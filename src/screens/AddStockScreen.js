import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors, Shadows } from "../theme/colors";
import { inventoryAPI } from "../services/api";
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
  Plus,
  ImagePlus,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { Audio } from "expo-av";

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  editable = true,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && { color: "#999" }]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );
}

const BRANDS = [
  { name: "Apple", logo: require("../../assets/logos/apple.png") },
  { name: "Samsung", logo: require("../../assets/logos/samsung.png") },
  { name: "Google", logo: require("../../assets/logos/google.png") },
  { name: "Xiaomi", logo: require("../../assets/logos/xiaomi.png") },
  { name: "OnePlus", logo: require("../../assets/logos/oneplus.png") },
  { name: "Vivo", logo: require("../../assets/logos/vivo.png") },
  { name: "Oppo", logo: require("../../assets/logos/oppo.png") },
  { name: "Motorola", logo: require("../../assets/logos/motorola.png") },
  { name: "iQOO", logo: require("../../assets/logos/iqoo.png") },
  { name: "Realme", logo: require("../../assets/logos/realme.png") },
];

export default function AddStockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  // Form state
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [minWholesalePrice, setMinWholesalePrice] = useState("");
  const [minRetailPrice, setMinRetailPrice] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPricingRules, setShowPricingRules] = useState(false);

  // Load item data if editing
  useEffect(() => {
    if (isEditing) {
      loadItem(params.id);
    } else {
      resetForm();
    }
  }, [params.id]);

  const loadItem = async (id) => {
    setFetching(true);
    try {
      const response = await inventoryAPI.getById(id);
      const item = response.data;
      setModel(item.model);
      setBrand(item.brand);
      setPurchasePrice(String(item.purchasePrice));
      setSellingPrice(String(item.sellingPrice));
      setQuantity(String(item.quantity));
      setSupplier(item.supplier || "");
      setMinWholesalePrice(
        item.minWholesalePrice ? String(item.minWholesalePrice) : "",
      );
      setMinRetailPrice(item.minRetailPrice ? String(item.minRetailPrice) : "");
      setExistingImageUrl(item.image?.url || null);

      if (item.minWholesalePrice || item.minRetailPrice) {
        setShowPricingRules(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load item details");
      router.back();
    } finally {
      setFetching(false);
    }
  };

  const resetForm = () => {
    setModel("");
    setBrand("");
    setPurchasePrice("");
    setSellingPrice("");
    setQuantity("");
    setSupplier("");
    setMinWholesalePrice("");
    setMinRetailPrice("");
    setImageUri(null);
    setExistingImageUrl(null);
  };

  // ========================
  // Image Picker Functions
  // ========================

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take photos.",
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Gallery access is needed to select photos.",
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setExistingImageUrl(null);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setExistingImageUrl(null);
    }
  };

  const showImageOptions = () => {
    setShowImageModal(true);
  };

  // ========================
  // Save Handler
  // ========================

  const handleSave = async () => {
    // Validation
    if (!model.trim()) {
      Alert.alert("Missing Field", "Please enter the model name.");
      return;
    }
    if (!brand.trim()) {
      Alert.alert("Missing Field", "Please enter the brand.");
      return;
    }
    if (!purchasePrice.trim() || isNaN(Number(purchasePrice))) {
      Alert.alert("Invalid Field", "Please enter a valid purchase price.");
      return;
    }
    if (!sellingPrice.trim() || isNaN(Number(sellingPrice))) {
      Alert.alert("Invalid Field", "Please enter a valid selling price.");
      return;
    }

    setLoading(true);
    setIsSuccess(false);

    try {
      const itemData = {
        model: model.trim(),
        brand: brand.trim(),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        quantity: Number(quantity) || 1,
        supplier: supplier.trim() || null,
        minWholesalePrice: minWholesalePrice.trim()
          ? Number(minWholesalePrice)
          : null,
        minRetailPrice: minRetailPrice.trim() ? Number(minRetailPrice) : null,
      };

      if (isEditing) {
        await inventoryAPI.update(params.id, itemData, imageUri);
      } else {
        await inventoryAPI.create(itemData, imageUri);
      }

      setLoading(false);
      setIsSuccess(true);

      // Play success sound
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/success.mp3"),
        );
        await sound.playAsync();
      } catch (soundError) {
        console.log("Error playing sound", soundError);
      }

      // Show success animation
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(successAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();

          if (isEditing) {
            router.back();
          } else {
            resetForm();
            setIsSuccess(false);
          }
        }, 1200);
      });

      if (isEditing) {
        // If editing, we might want to wait for the animation to finish before navigating back
        // but the setLoading(false) should happen inside finally if we want the loading screen to stay
      } else {
        // For new items, we keep loading true until success animation is nearly done
      }
    } catch (error) {
      if (
        error.message === "Item already exists in inventory" &&
        error.existingItem
      ) {
        Alert.alert(
          "Item Already Exists",
          `${brand} ${model} is already in the inventory. Would you like to view/restock it instead?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "View Item",
              onPress: () =>
                router.push({
                  pathname: "/sell",
                  params: { id: error.existingItem._id },
                }),
            },
          ],
        );
      } else {
        Alert.alert("Error", error.message || "Failed to save item.");
      }
    } finally {
      if (!isSuccess) {
        setLoading(false);
      }
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1A1A1A" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? "Edit Item" : "Add New Item"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? "Update product information"
              : "Fill in the details to update inventory"}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Image Upload Section */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Product Photo</Text>
            <TouchableOpacity
              style={styles.imagePickerBox}
              onPress={showImageOptions}
              activeOpacity={0.7}
            >
              {imageUri || existingImageUrl ? (
                <View style={styles.imagePreviewWrap}>
                  <Image
                    source={{ uri: imageUri || existingImageUrl }}
                    style={styles.imagePreview}
                  />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageOverlayText}>Tap to change</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <View style={styles.imagePlaceholderIconCircle}>
                    <ImagePlus size={32} color="#9CA3AF" strokeWidth={1.5} />
                    <View style={styles.imagePlaceholderPlusBadge}>
                      <Plus size={12} color="#FFF" strokeWidth={3} />
                    </View>
                  </View>
                  <Text style={styles.imagePlaceholderTitle}>
                    Add Product Photo
                  </Text>
                  <Text style={styles.imagePlaceholderSub}>
                    High quality 1:1 photo recommended
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <InputField
            label="Model Name"
            placeholder="e.g. iPhone 16 Pro Max"
            value={model}
            onChangeText={setModel}
            editable={!isEditing}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Brand</Text>
            <TouchableOpacity
              style={[styles.dropdownTrigger, isEditing && { opacity: 0.6 }]}
              onPress={() => !isEditing && setShowBrandModal(true)}
              activeOpacity={isEditing ? 1 : 0.7}
            >
              <View style={styles.dropdownContent}>
                {brand ? (
                  <View style={styles.selectedBrandRow}>
                    {BRANDS.find((b) => b.name === brand) && (
                      <Image
                        source={BRANDS.find((b) => b.name === brand).logo}
                        style={styles.selectedBrandLogo}
                        resizeMode="contain"
                      />
                    )}
                    <Text
                      style={[
                        styles.selectedBrandText,
                        isEditing && { color: "#999" },
                      ]}
                    >
                      {brand}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select a brand</Text>
                )}
                {!isEditing && <Text style={styles.chevron}>▼</Text>}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Cost Price"
                placeholder="₹0"
                keyboardType="numeric"
                value={purchasePrice}
                onChangeText={setPurchasePrice}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Selling Price"
                placeholder="₹0"
                keyboardType="numeric"
                value={sellingPrice}
                onChangeText={setSellingPrice}
              />
            </View>
          </View>

          <InputField
            label="Quantity"
            placeholder="1"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <InputField
            label="Supplier"
            placeholder="e.g. TechDistro Inc."
            value={supplier}
            onChangeText={setSupplier}
          />

          <View style={styles.sectionDivider} />
          <TouchableOpacity
            style={styles.sectionToggle}
            onPress={() => setShowPricingRules(!showPricingRules)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionLabel}>
              Custom Pricing Rules (Optional)
            </Text>
            {showPricingRules ? (
              <ChevronUp size={20} color="#1A1A1A" />
            ) : (
              <ChevronDown size={20} color="#1A1A1A" />
            )}
          </TouchableOpacity>

          {showPricingRules && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Min Wholesale"
                  placeholder="₹500"
                  keyboardType="numeric"
                  value={minWholesalePrice}
                  onChangeText={setMinWholesalePrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Min Retail"
                  placeholder="₹1000"
                  keyboardType="numeric"
                  value={minRetailPrice}
                  onChangeText={setMinRetailPrice}
                />
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, Shadows.button]}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient colors={["#1A1A1A", "#333"]} style={styles.saveGrad}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.saveBtnText}> Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? "Update Item" : "Save Item"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Brand Selection Modal */}
      <Modal
        visible={showBrandModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBrandModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBrandModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Brand</Text>
            </View>
            <FlatList
              data={BRANDS}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.brandList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.brandItem,
                    brand === item.name && styles.brandItemActive,
                  ]}
                  onPress={() => {
                    setBrand(item.name);
                    setShowBrandModal(false);
                  }}
                >
                  <View style={styles.brandIconWrap}>
                    <Image
                      source={item.logo}
                      style={styles.brandIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={[
                      styles.brandName,
                      brand === item.name && styles.brandNameActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {brand === item.name && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetContent}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetTitleRow}>
                  <Text style={styles.sheetTitle}>Add Photo</Text>
                  <TouchableOpacity
                    onPress={() => setShowImageModal(false)}
                    style={styles.closeBtn}
                  >
                    <X size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.sheetSubtitle}>
                  Choose how you'd like to add a product image
                </Text>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    takePhoto();
                    setShowImageModal(false);
                  }}
                >
                  <LinearGradient
                    colors={["#E0F2FE", "#DBEAFE"]}
                    style={styles.optionIconBox}
                  >
                    <Camera size={24} color="#2563EB" strokeWidth={2.5} />
                  </LinearGradient>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Take a Photo</Text>
                    <Text style={styles.optionSub}>
                      Use camera to snap a product photo
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    pickImage();
                    setShowImageModal(false);
                  }}
                >
                  <LinearGradient
                    colors={["#F0FDF4", "#DCFCE7"]}
                    style={styles.optionIconBox}
                  >
                    <ImageIcon size={24} color="#16A34A" strokeWidth={2.5} />
                  </LinearGradient>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Choose from Gallery</Text>
                    <Text style={styles.optionSub}>
                      Select an existing photo from your device
                    </Text>
                  </View>
                </TouchableOpacity>

                {(imageUri || existingImageUrl) && (
                  <TouchableOpacity
                    style={[styles.optionItem, styles.marginTop]}
                    onPress={() => {
                      setImageUri(null);
                      setExistingImageUrl(null);
                      setShowImageModal(false);
                    }}
                  >
                    <LinearGradient
                      colors={["#FEF2F2", "#FEE2E2"]}
                      style={styles.optionIconBox}
                    >
                      <Trash2 size={24} color="#DC2626" strokeWidth={2.5} />
                    </LinearGradient>
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionTitle, { color: "#DC2626" }]}>
                        Remove Photo
                      </Text>
                      <Text style={styles.optionSub}>
                        Delete current image and start over
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.cancelSheetBtn}
                onPress={() => setShowImageModal(false)}
              >
                <Text style={styles.cancelSheetText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full Screen Loading Overlay */}
      <Modal visible={loading} transparent={true} animationType="fade">
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.85)"]}
            style={styles.loadingOverlayGradient}
          >
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.loadingOverlayText}>
                {isEditing ? "Updating Inventory..." : "Adding to Inventory..."}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Success Animation Overlay */}
      <Modal visible={isSuccess} transparent={true} animationType="none">
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            style={styles.successCircle}
          >
            <Check size={50} color="#FFF" strokeWidth={4} />
          </LinearGradient>
          <Text style={styles.successTitleText}>Success!</Text>
          <Text style={styles.successSubtitleText}>
            {isEditing
              ? "Item updated successfully"
              : "New item added to inventory"}
          </Text>
        </Animated.View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    fontWeight: "500",
  },
  form: {
    gap: 15,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  sectionToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    gap: 15,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F3F4F6",
    height: 55,
    borderRadius: 18,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  // Image Picker Styles
  imageSection: {
    gap: 8,
  },
  imagePickerBox: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePlaceholderIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholderPlusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#1A1A1A",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#F3F4F6",
  },
  imagePlaceholderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  imagePlaceholderSub: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  imagePreviewWrap: {
    flex: 1,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 8,
    alignItems: "center",
  },
  imageOverlayText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  // Save Button
  saveBtn: {
    marginTop: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  saveGrad: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: 15,
    alignItems: "center",
    padding: 10,
  },
  cancelText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#999",
    fontWeight: "600",
  },
  // Loading Overlay
  loadingOverlay: {
    flex: 1,
  },
  loadingOverlayGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: 15,
  },
  loadingOverlayText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Success Overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitleText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  successSubtitleText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  // Dropdown Styles
  dropdownTrigger: {
    backgroundColor: "#F3F4F6",
    height: 55,
    borderRadius: 18,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedBrandLogo: {
    width: 24,
    height: 24,
  },
  selectedBrandText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  placeholderText: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  chevron: {
    fontSize: 10,
    color: "#999",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "60%",
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  brandList: {
    padding: 20,
    gap: 12,
  },
  brandItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    gap: 15,
  },
  brandItemActive: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  brandIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  brandIcon: {
    width: 28,
    height: 28,
  },
  brandName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  brandNameActive: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  checkMark: {
    fontSize: 18,
    color: "#1A1A1A",
    fontWeight: "bold",
  },
  // Bottom Sheet Styles
  bottomSheetContainer: {
    width: "100%",
    backgroundColor: "transparent",
  },
  bottomSheetContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 25,
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 20,
  },
  sheetHandle: {
    width: 36,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 20,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "left",
    width: "100%",
  },
  optionsContainer: {
    gap: 16,
    marginTop: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  optionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  optionSub: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  marginTop: {
    marginTop: 8,
    backgroundColor: "#FFF1F2",
    borderColor: "#FFE4E6",
  },
  cancelSheetBtn: {
    marginTop: 24,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  cancelSheetText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B5563",
  },
});
