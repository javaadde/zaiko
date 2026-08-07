import React, { useState, useRef, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, Trash2, X, Plus, ImagePlus, Check, ChevronDown, ChevronUp, Smartphone } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryItem, createInventoryItem, updateInventoryItem, uploadInventoryImage, deleteInventoryItem } from '@/services/inventory';
import { brandCategories, brandPalette } from '@/data/brands';
import type { InventoryItem } from '@/types';

type Props = {};

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
  const { colors, radii, shadows } = useTheme();
  const isEditing = !!params.id;

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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [otherBrandName, setOtherBrandName] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPricingRules, setShowPricingRules] = useState(false);
  const [imei, setImei] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadItem(params.id as string);
    } else {
      resetForm();
    }
  }, [params.id]);

  const loadItem = async (id: string) => {
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
      setImei(item.imei || '');
      setColor(item.color || '');
      if (item.minWholesalePrice || item.minRetailPrice) {
        setShowPricingRules(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    } finally {
      setFetching(false);
    }
  };

  const resetForm = () => {
    setModel('');
    setBrand('');
    setPurchasePrice('');
    setSellingPrice('');
    setQuantity('');
    setSupplier('');
    setMinWholesalePrice('');
    setMinRetailPrice('');
    setImageUri(null);
    setExistingImageUrl(null);
    setOtherBrandName('');
    setImei('');
    setColor('');
  };

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
      setExistingImageUrl(null);
    }
    setShowImageModal(false);
  };

  const uploadImageIfNeeded = async (): Promise<{ url?: string; path?: string } | undefined> => {
    if (!imageUri) return {};
    const path = `inventory/${Date.now()}_${imageUri.split('/').pop()}`;
    const result = await uploadInventoryImage(imageUri, path);
    return result;
  };

  const handleSave = async () => {
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
        companyId: '',
        environmentId: '',
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
        createdBy: '',
      };

      if (isEditing) {
        await updateInventoryItem(params.id as string, itemData);
      } else {
        await createInventoryItem(itemData);
      }

      setLoading(false);
      setIsSuccess(true);

      try {
        const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/success.mp3'));
        await sound.playAsync();
      } catch {
        // no-op
      }

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
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add New Item'}</Text>
          <Text style={styles.subtitle}>
            {isEditing ? 'Update product information' : 'Fill in the details to update inventory'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.imageSection}>
            <Text style={styles.label}>Product Photo</Text>
            <TouchableOpacity
              style={styles.imagePickerBox}
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
                  <View style={styles.imagePlaceholderIconCircle}>
                    <ImagePlus size={32} color="#9CA3AF" strokeWidth={1.5} />
                    <View style={styles.imagePlaceholderPlusBadge}>
                      <Plus size={12} color="#FFF" strokeWidth={3} />
                    </View>
                  </View>
                  <Text style={styles.imagePlaceholderTitle}>Add Product Photo</Text>
                  <Text style={styles.imagePlaceholderSub}>High quality 1:1 photo recommended</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Model Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. iPhone 16 Pro Max"
              value={model}
              onChangeText={setModel}
              placeholderTextColor="#999"
            />
          </View>

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
                    {BRANDS.find((b) => b.name === brand)?.logo ? (
                      <Image
                        source={BRANDS.find((b) => b.name === brand)!.logo}
                        style={styles.selectedBrandLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.selectedBrandLogoPlaceholder}>
                        <Smartphone size={18} color="#666" />
                      </View>
                    )}
                    <Text style={[styles.selectedBrandText, isEditing && { color: '#999' }]}>
                      {brand === 'Other' && otherBrandName ? otherBrandName : brand}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select a brand</Text>
                )}
                {!isEditing && <Text style={styles.chevron}>▼</Text>}
              </View>
            </TouchableOpacity>
          </View>

          {!isEditing && brand === 'Other' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Brand Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile brand"
                value={otherBrandName}
                onChangeText={setOtherBrandName}
                placeholderTextColor="#999"
              />
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cost Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹0"
                  keyboardType="numeric"
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Selling Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹0"
                  keyboardType="numeric"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>IMEI (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="IMEI number"
                  value={imei}
                  onChangeText={setImei}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.pricingToggle}
            onPress={() => setShowPricingRules(!showPricingRules)}
          >
            <Text style={styles.pricingToggleText}>Pricing Rules</Text>
            {showPricingRules ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
          </TouchableOpacity>

          {showPricingRules && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Min Wholesale Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="₹0"
                    keyboardType="numeric"
                    value={minWholesalePrice}
                    onChangeText={setMinWholesalePrice}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Min Retail Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="₹0"
                    keyboardType="numeric"
                    value={minRetailPrice}
                    onChangeText={setMinRetailPrice}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Supplier (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Supplier name"
              value={supplier}
              onChangeText={setSupplier}
              placeholderTextColor="#999"
            />
          </View>

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
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BRANDS}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.brandOption}
                  onPress={() => {
                    setBrand(item.name);
                    setShowBrandModal(false);
                  }}
                >
                  {item.logo ? (
                    <Image source={item.logo} style={styles.brandOptionLogo} resizeMode="contain" />
                  ) : (
                    <View style={styles.brandOptionPlaceholder}>
                      <Smartphone size={18} color="#666" />
                    </View>
                  )}
                  <Text style={[styles.brandOptionText, { color: colors.textPrimary }]}>{item.name}</Text>
                  {brand === item.name && <Check size={20} color={colors.accent} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

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
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.imageOption} onPress={takePhoto}>
              <Camera size={24} color={colors.primary} />
              <Text style={[styles.imageOptionText, { color: colors.textPrimary }]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageOption} onPress={pickImage}>
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
    backgroundColor: '#FFF',
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    fontSize: 28,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    marginTop: 6,
  },
  form: {
    gap: 16,
  },
  imageSection: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  imagePickerBox: {
    height: 220,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    backgroundColor: 'rgba(0,0,0,0.35)',
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
    gap: 12,
  },
  imagePlaceholderIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderPlusBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#1A1A1A',
    borderRadius: 9999,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  imagePlaceholderSub: {
    fontSize: 13,
    color: '#999',
  },
  inputContainer: {
    gap: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dropdownTrigger: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
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
    width: 28,
    height: 28,
  },
  selectedBrandLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBrandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    color: '#999',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pricingToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  submitBtn: {
    borderRadius: 12,
    padding: 18,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandOptionLogo: {
    width: 32,
    height: 32,
  },
  brandOptionPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
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
    borderBottomColor: '#F3F4F6',
  },
  imageOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
