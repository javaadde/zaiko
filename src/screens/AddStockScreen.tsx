import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, X, Plus, ImagePlus, Check, ChevronDown, ChevronUp, Smartphone } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { getInventoryItem, createInventoryItem, updateInventoryItem, uploadInventoryImage } from '@/services/inventory';
import { playSuccessSound } from '@/lib/play-success-sound';

const BRANDS = [
  { name: 'Apple', logo: require('../../assets/logos/apple.png') },
  { name: 'Samsung', logo: require('../../assets/logos/samsung.png') },
  { name: 'Google', logo: require('../../assets/logos/google.png') },
  { name: 'Xiaomi', logo: require('../../assets/logos/xiaomi.png') },
  { name: 'OnePlus', logo: require('../../assets/logos/oneplus.png') },
  { name: 'Vivo', logo: require('../../assets/logos/vivo.png') },
  { name: 'Oppo', logo: require('../../assets/logos/oppo.png') },
  { name: 'Motorola', logo: require('../../assets/logos/motorola.png') },
  { name: 'iQOO', logo: require('../../assets/logos/iqoo.png') },
  { name: 'Realme', logo: require('../../assets/logos/realme.png') },
  { name: 'Other', logo: null },
] as const;

export default function AddStockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, scheme } = useTheme();
  const isEditing = !!params.id;
  const currentCompany = useAuthStore((s) => s.currentCompany);
  const currentEnvironment = useAuthStore((s) => s.currentEnvironment);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [minWholesalePrice, setMinWholesalePrice] = useState('');
  const [minRetailPrice, setMinRetailPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<{ uri: string; mimeType?: string | null; fileName?: string | null } | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [otherBrandName, setOtherBrandName] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPricingRules, setShowPricingRules] = useState(false);
  const [imei, setImei] = useState('');
  const [color, setColor] = useState('');

  const resetForm = useCallback(() => {
    setModel('');
    setBrand('');
    setPurchasePrice('');
    setSellingPrice('');
    setQuantity('');
    setSupplier('');
    setMinWholesalePrice('');
    setMinRetailPrice('');
    setImageUri(null);
    setImageAsset(null);
    setExistingImageUrl(null);
    setOtherBrandName('');
    setImei('');
    setColor('');
  }, []);

  const loadItem = useCallback(async (id: string) => {
    setFetching(true);
    try {
      const item = await getInventoryItem(id);
      setModel(item.model);
      const itemBrand = item.brand;
      const isPredefined = BRANDS.find((b) => b.name === itemBrand);
      if (isPredefined && itemBrand !== 'Other') {
        setBrand(itemBrand);
        setOtherBrandName('');
      } else {
        setBrand('Other');
        setOtherBrandName(itemBrand);
      }
      setPurchasePrice(String(item.purchasePrice));
      setSellingPrice(String(item.sellingPrice));
      setQuantity(String(item.quantity));
      setSupplier(item.supplier || '');
      setMinWholesalePrice(item.minWholesalePrice ? String(item.minWholesalePrice) : '');
      setMinRetailPrice(item.minRetailPrice ? String(item.minRetailPrice) : '');
      setExistingImageUrl(item.imageUrl || null);
      setImageAsset(null);
      setImei(item.imei || '');
      setColor(item.color || '');
      if (item.minWholesalePrice || item.minRetailPrice) {
        setShowPricingRules(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    } finally {
      setFetching(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing) {
        if (!currentCompany || !currentEnvironment) {
          Alert.alert('Select Company', 'Choose an active company and environment before editing stock.');
          router.back();
          return;
        }
        void loadItem(params.id as string);
      } else {
        resetForm();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [currentCompany, currentEnvironment, loadItem, params.id, resetForm, isEditing, router]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take photos.');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed to select photos.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageAsset({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType ?? null,
        fileName: result.assets[0].fileName ?? null,
      });
      setExistingImageUrl(null);
    }
    setShowImageModal(false);
  };

  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageAsset({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType ?? null,
        fileName: result.assets[0].fileName ?? null,
      });
      setExistingImageUrl(null);
    }
    setShowImageModal(false);
  };

  const uploadImageIfNeeded = async (): Promise<{ url?: string; path?: string } | undefined> => {
    if (!imageAsset) return {};
    const fileBase = imageAsset.fileName?.replace(/\.[^.]+$/, '') || imageAsset.uri.split('/').pop() || 'image';
    const path = `${Date.now()}_${fileBase}`;
    const result = await uploadInventoryImage(imageAsset, path);
    return result;
  };

  const handleSave = async () => {
    if (!currentCompany || !currentEnvironment) {
      Alert.alert('No Active Environment', 'Select a company and environment before saving stock.');
      return;
    }

    if (!model.trim()) {
      Alert.alert('Missing Field', 'Please enter the model name.');
      return;
    }
    if (!brand.trim()) {
      Alert.alert('Missing Field', 'Please select a brand.');
      return;
    }
    if (brand === 'Other' && !otherBrandName.trim()) {
      Alert.alert('Missing Field', 'Please specify the brand name.');
      return;
    }
    if (!purchasePrice.trim() || isNaN(Number(purchasePrice))) {
      Alert.alert('Invalid Field', 'Please enter a valid purchase price.');
      return;
    }
    if (!sellingPrice.trim() || isNaN(Number(sellingPrice))) {
      Alert.alert('Invalid Field', 'Please enter a valid selling price.');
      return;
    }

    setLoading(true);
    setIsSuccess(false);

    try {
      const upload = await uploadImageIfNeeded();
      const itemData = {
        companyId: currentCompany.id,
        environmentId: currentEnvironment.id,
        model: model.trim(),
        brand: brand === 'Other' ? otherBrandName.trim() : brand.trim(),
        imei: imei || null,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        quantity: Number(quantity) || 1,
        minWholesalePrice: minWholesalePrice.trim() ? Number(minWholesalePrice) : null,
        minRetailPrice: minRetailPrice.trim() ? Number(minRetailPrice) : null,
        supplier: supplier.trim() || null,
        purchaseDate: Date.now(),
        status: 'in_stock' as const,
        color: color || null,
        imageUrl: upload?.url || existingImageUrl || null,
        imagePath: upload?.path || null,
        isArchived: false,
        createdBy: currentUser?.uid ?? '',
      };

      if (isEditing) {
        await updateInventoryItem(params.id as string, itemData);
      } else {
        await createInventoryItem(itemData);
      }

      setLoading(false);
      setIsSuccess(true);

      await playSuccessSound();

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
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save item.');
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isEditing ? 'Update product information' : 'Fill in the details to update inventory'}
          </Text>
        </View>

        <View style={styles.form}>
          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Product Photo</Text>
            <TouchableOpacity
              style={[
                styles.imagePickerBox,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
              onPress={() => setShowImageModal(true)}
              activeOpacity={0.7}
            >
              {imageUri || existingImageUrl ? (
                <View style={styles.imagePreviewWrap}>
                  <Image
                    source={{ uri: (imageUri || existingImageUrl) as string }}
                    style={styles.imagePreview}
                  />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageOverlayText}>Tap to change</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <View
                    style={[
                      styles.imagePlaceholderIconCircle,
                      { backgroundColor: scheme === 'dark' ? '#2A2C35' : '#F3F4F6' },
                    ]}
                  >
                    <ImagePlus size={32} color={colors.textMuted} strokeWidth={1.5} />
                    <View style={[styles.imagePlaceholderPlusBadge, { backgroundColor: colors.primary }]}>
                      <Plus size={12} color="#FFF" strokeWidth={3} />
                    </View>
                  </View>
                  <Text style={[styles.imagePlaceholderTitle, { color: colors.textPrimary }]}>
                    Add Product Photo
                  </Text>
                  <Text style={[styles.imagePlaceholderSub, { color: colors.textMuted }]}>
                    High quality 1:1 photo recommended
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Model Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Model Name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="e.g. iPhone 16 Pro Max"
              value={model}
              onChangeText={setModel}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Brand Dropdown */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Brand</Text>
            <TouchableOpacity
              style={[
                styles.dropdownTrigger,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
                isEditing && { opacity: 0.6 },
              ]}
              onPress={() => !isEditing && setShowBrandModal(true)}
              activeOpacity={isEditing ? 1 : 0.7}
            >
              <View style={styles.dropdownContent}>
                {brand ? (
                  <View style={styles.selectedBrandRow}>
                    {BRANDS.find((b) => b.name === brand)?.logo ? (
                      <Image
                        source={BRANDS.find((b) => b.name === brand)!.logo}
                        style={styles.selectedBrandLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <View
                        style={[
                          styles.selectedBrandLogoPlaceholder,
                          { backgroundColor: scheme === 'dark' ? '#2A2C35' : '#F3F4F6' },
                        ]}
                      >
                        <Smartphone size={18} color={colors.textSecondary} />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.selectedBrandText,
                        { color: colors.textPrimary },
                        isEditing && { color: colors.textMuted },
                      ]}
                    >
                      {brand === 'Other' && otherBrandName ? otherBrandName : brand}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Select a brand</Text>
                )}
                {!isEditing && <Text style={[styles.chevron, { color: colors.textMuted }]}>▼</Text>}
              </View>
            </TouchableOpacity>
          </View>

          {!isEditing && brand === 'Other' && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Brand Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
                ]}
                placeholder="Enter mobile brand"
                value={otherBrandName}
                onChangeText={setOtherBrandName}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          )}

          {/* Pricing Row */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Cost Price</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                  placeholder="₹0"
                  keyboardType="numeric"
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Selling Price</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                  placeholder="₹0"
                  keyboardType="numeric"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>

          {/* Quantity & IMEI Row */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                  placeholder="1"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>IMEI (optional)</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                  placeholder="IMEI number"
                  value={imei}
                  onChangeText={setImei}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>

          {/* Pricing Rules Toggle */}
          <TouchableOpacity
            style={[
              styles.pricingToggle,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
            onPress={() => setShowPricingRules(!showPricingRules)}
          >
            <Text style={[styles.pricingToggleText, { color: colors.textSecondary }]}>Pricing Rules</Text>
            {showPricingRules ? (
              <ChevronUp size={20} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          {showPricingRules && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Min Wholesale Price</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
                    ]}
                    placeholder="₹0"
                    keyboardType="numeric"
                    value={minWholesalePrice}
                    onChangeText={setMinWholesalePrice}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Min Retail Price</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
                    ]}
                    placeholder="₹0"
                    keyboardType="numeric"
                    value={minRetailPrice}
                    onChangeText={setMinRetailPrice}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Supplier Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Supplier (optional)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="Supplier name"
              value={supplier}
              onChangeText={setSupplier}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }, !model && styles.submitBtnDisabled]}
            onPress={handleSave}
            disabled={!model || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>{isEditing ? 'Update Item' : 'Add to Inventory'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Brand Selection Modal */}
      <Modal visible={showBrandModal} transparent animationType="fade" onRequestClose={() => setShowBrandModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBrandModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Brand</Text>
              <TouchableOpacity onPress={() => setShowBrandModal(false)}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BRANDS}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.brandOption, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setBrand(item.name);
                    setShowBrandModal(false);
                  }}
                >
                  {item.logo ? (
                    <Image source={item.logo} style={styles.brandOptionLogo} resizeMode="contain" />
                  ) : (
                    <View
                      style={[
                        styles.brandOptionPlaceholder,
                        { backgroundColor: scheme === 'dark' ? '#2A2C35' : '#F3F4F6' },
                      ]}
                    >
                      <Smartphone size={18} color={colors.textSecondary} />
                    </View>
                  )}
                  <Text style={[styles.brandOptionText, { color: colors.textPrimary }]}>{item.name}</Text>
                  {brand === item.name && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Selection Modal */}
      <Modal visible={showImageModal} transparent animationType="fade" onRequestClose={() => setShowImageModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Photo</Text>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.imageOption, { borderBottomColor: colors.border }]}
              onPress={takePhoto}
            >
              <Camera size={24} color={colors.primary} />
              <Text style={[styles.imageOptionText, { color: colors.textPrimary }]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageOption, { borderBottomColor: colors.border }]}
              onPress={pickImage}
            >
              <ImageIcon size={24} color={colors.primary} />
              <Text style={[styles.imageOptionText, { color: colors.textPrimary }]}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#999',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'PlayfairDisplay_600SemiBold_Italic',
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  form: {
    gap: 16,
  },
  imageSection: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imagePickerBox: {
    height: 200,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewWrap: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  imageOverlayText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 10,
  },
  imagePlaceholderIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderPlusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 9999,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  imagePlaceholderSub: {
    fontSize: 12,
  },
  inputContainer: {
    gap: 6,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontWeight: '500',
    fontSize: 15,
    borderWidth: 1,
  },
  dropdownTrigger: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedBrandLogo: {
    width: 26,
    height: 26,
  },
  selectedBrandLogoPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBrandText: {
    fontSize: 15,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  pricingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  pricingToggleText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  submitBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  brandOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  brandOptionLogo: {
    width: 30,
    height: 30,
  },
  brandOptionPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  imageOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
