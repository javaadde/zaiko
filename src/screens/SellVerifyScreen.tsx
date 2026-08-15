import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import {
  Camera as CameraIcon,
  Scan,
  ChevronLeft,
  CheckCircle2,
  PartyPopper,
  X,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryItem } from '@/services/inventory';
import { createSale as createSaleRecord } from '@/services/sales';
import { playSuccessSound } from '@/lib/play-success-sound';
import type { InventoryItem } from '@/types';

export default function SellVerifyScreen() {
  const router = useRouter();
  const { id, price, type } = useLocalSearchParams<{ id: string; price: string; type: string }>();
  const { colors, scheme } = useTheme();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [selling, setSelling] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [imei, setImei] = useState('');
  const imeiInputRef = useRef<TextInput | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const cameraPermission = useCameraPermissions();
  const requestCameraIfNeeded = async () => {
    if (cameraPermission[0]?.granted) {
      setShowScanner(true);
      setScanned(false);
      return;
    }
    const result = await cameraPermission[1]();
    if (result.granted) {
      setShowScanner(true);
      setScanned(false);
    } else {
      Alert.alert('Camera required', 'Please grant camera access to scan barcodes.');
    }
  };

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await getInventoryItem(id);
        setItem(data);
      } catch {
        Alert.alert('Error', 'Failed to load sale details');
        router.back();
      } finally {
        setLoadingItem(false);
      }
    })();
  }, [id, router]);

  const handleBarcodeScanned = (result: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const code = result.data?.trim() ?? '';
    if (code) {
      setImei(code);
      setShowScanner(false);
    } else {
      setScanned(false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take a customer photo.');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to select a customer photo.');
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
      setCustomerPhoto(result.assets[0].uri);
    }
  };

  const pickPhoto = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCustomerPhoto(result.assets[0].uri);
    }
  };

  const triggerSuccess = async () => {
    setShowSuccess(true);
    await playSuccessSound();
  };

  const finalizeSale = async () => {
    if (!customerName || !customerPhoto || !imei) {
      Alert.alert('Missing Information', 'Please complete all 3 validation steps.');
      return;
    }
    setSelling(true);
    try {
      if (!item) throw new Error('Sale item not loaded');
      const saleData = {
        companyId: item.companyId,
        environmentId: item.environmentId,
        itemId: item.id,
        customerName,
        customerPhotoUrl: customerPhoto,
        customerPhotoPath: null,
        imei,
        salePrice: Number(price),
        saleType: type as 'retail' | 'wholesale',
        saleDate: Date.now(),
        createdBy: '',
      };
      await createSaleRecord(saleData);
      setSelling(false);
      triggerSuccess();
      setTimeout(() => router.replace('/(tabs)'), 1800);
    } catch (error) {
      setSelling(false);
      Alert.alert('Sale Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  if (loadingItem || !item) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bgCard }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stockDotColor =
    item.quantity <= 0
      ? colors.danger
      : item.status === 'low'
        ? colors.pastelYellow
        : colors.pastelGreen;
  const stockPillLabel = item.quantity <= 0 ? 'Out of stock' : item.status === 'low' ? 'Low stock' : 'In stock';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bgCard }]}
    >
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Minimal nav */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()} activeOpacity={0.6} hitSlop={12}>
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Confirm Sale</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Product strip */}
        <View style={[styles.productStrip, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
          <View style={[styles.productImageWrap, { backgroundColor: colors.bgCard }]}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="contain" />
            ) : (
              <Text style={styles.productEmoji}>📱</Text>
            )}
          </View>
          <View style={styles.productCopy}>
            <Text style={[styles.productBrand, { color: colors.textMuted }]}>{item.brand}</Text>
            <Text style={[styles.productModel, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.model}
            </Text>
            <Text style={[styles.productPrice, { color: colors.textPrimary }]}>
              {Number(price).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.stripPill, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <View style={[styles.stripDot, { backgroundColor: stockDotColor }]} />
            <Text style={[styles.stripPillText, { color: colors.textPrimary }]}>
              {stockPillLabel}
            </Text>
          </View>
        </View>

        {/* Type badge + amount row */}
        <View style={styles.metaRow}>
          <View style={[styles.typeChip, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
            <Text style={[styles.typeChipText, { color: colors.textPrimary }]}>
              {type === 'wholesale' ? 'Wholesale' : 'Retail'} sale
            </Text>
          </View>
          <Text style={[styles.amountLabel, { color: colors.textPrimary }]}>
            Total {Number(price).toLocaleString('en-IN')}
          </Text>
        </View>

        {/* Customer section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Customer</Text>
          <TextInput
            style={[styles.pillInput, { backgroundColor: colors.bgCardAlt, color: colors.textPrimary }]}
            placeholder="e.g. Alexander Sterling"
            value={customerName}
            onChangeText={setCustomerName}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* IMEI section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>IMEI Check</Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>Scan or enter manually</Text>
          </View>
          <View style={styles.imeiRow}>
            <TextInput
              ref={imeiInputRef}
              style={[styles.pillInput, styles.imeiInput, { backgroundColor: colors.bgCardAlt, color: colors.textPrimary }]}
              placeholder="865230041943561"
              value={imei}
              onChangeText={setImei}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.pillBtn, { backgroundColor: colors.primary }]}
              onPress={requestCameraIfNeeded}
              activeOpacity={0.85}
            >
              <Scan color={colors.textInverse} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer photo section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Customer Photo</Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>Capture a clear handoff photo</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.photoBox,
              { borderColor: colors.border, backgroundColor: colors.bgCardAlt },
              customerPhoto && { borderStyle: 'solid', borderWidth: 0 },
            ]}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
          >
            {customerPhoto ? (
              <Image source={{ uri: customerPhoto }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <View style={[styles.photoIconCircle, { backgroundColor: colors.bgCard }]}>
                  <CameraIcon color={colors.textSecondary} size={28} />
                </View>
                <Text style={[styles.photoPrimary, { color: colors.textPrimary }]}>Take or upload a photo</Text>
                <Text style={[styles.photoSecondary, { color: colors.textSecondary }]}>PNG, JPG up to 10MB</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={[styles.pillBtn, styles.photoActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => void takePhoto()}
              activeOpacity={0.85}
            >
              <CameraIcon size={16} color={colors.textInverse} />
              <Text style={[styles.pillBtnText, { color: colors.textInverse }]}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pillBtn,
                styles.photoActionBtn,
                { backgroundColor: colors.bgCardAlt, borderColor: colors.border },
              ]}
              onPress={() => void pickPhoto()}
              activeOpacity={0.85}
            >
              <Text style={[styles.pillBtnText, { color: colors.textPrimary }]}>Choose photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hint */}
        <Text style={[styles.footerHint, { color: colors.textMuted }]}>
          This will record the sale and reduce stock immediately.
        </Text>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={finalizeSale}
          disabled={selling || !customerName || !imei || !customerPhoto}
          activeOpacity={0.9}
        >
          {selling ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={[styles.ctaText, { color: colors.textInverse }]}>Confirm Sale</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Camera barcode scanner */}
      <Modal visible={showScanner} animationType="fade" onRequestClose={() => setShowScanner(false)}>
        <View style={styles.scannerContainer}>
          <StatusBar barStyle="light-content" />
          {cameraPermission[0]?.granted ? (
            <CameraView
              facing="back"
              style={styles.camera}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_e'],
              }}
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.cameraPlaceholderText, { color: colors.textPrimary }]}>Starting camera…</Text>
            </View>
          )}

          {/* Overlay */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerTopBar}>
              <TouchableOpacity
                style={styles.scannerCloseBtn}
                onPress={() => setShowScanner(false)}
                activeOpacity={0.8}
              >
                <X size={22} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.scannerTitle}>Scan IMEI / Barcode</Text>
              <View style={{ width: 44 }} />
            </View>

            <View style={styles.scannerCenter}>
              <View style={styles.scannerFrame}>
                <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
              </View>
            </View>

            <View style={styles.scannerBottom}>
              <Text style={styles.scannerHint}>Position the barcode within the frame</Text>
              {scanned && (
                <TouchableOpacity
                  style={styles.scannerRetry}
                  onPress={() => setScanned(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.scannerRetryText}>Scan another</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPhotoModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add customer photo</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.modalAction, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowPhotoModal(false);
                void takePhoto();
              }}
              activeOpacity={0.85}
            >
              <CameraIcon size={18} color={colors.textInverse} />
              <Text style={[styles.modalActionText, { color: colors.textInverse }]}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalAction, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}
              onPress={() => {
                setShowPhotoModal(false);
                void pickPhoto();
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.modalActionText, { color: colors.textPrimary }]}>Choose from library</Text>
            </TouchableOpacity>
            {customerPhoto && (
              <TouchableOpacity
                style={[styles.modalAction, { backgroundColor: colors.danger }]}
                onPress={() => {
                  setCustomerPhoto(null);
                  setShowPhotoModal(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalActionText, { color: colors.textInverse }]}>Remove current photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <CheckCircle2 size={80} color="#10B981" />
            <Text style={styles.successTitle}>Sale Complete!</Text>
            <PartyPopper size={40} color="#F59E0B" style={{ marginTop: 12 }} />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 56, paddingHorizontal: 22, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  navTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold_Italic',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },

  productStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
  },
  productImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  productImage: { width: '100%', height: '100%' },
  productEmoji: { fontSize: 28 },
  productCopy: { flex: 1, gap: 2 },
  productBrand: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  productModel: { fontSize: 17, fontWeight: '800' },
  productPrice: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  stripPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    flexShrink: 0,
  },
  stripDot: { width: 8, height: 8, borderRadius: 4 },
  stripPillText: { fontSize: 11, fontWeight: '800' },

  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 10 },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9999, borderWidth: 1 },
  typeChipText: { fontSize: 13, fontWeight: '800' },
  amountLabel: { fontSize: 18, fontWeight: '800' },

  section: { marginTop: 32 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold_Italic',
    fontSize: 21,
    fontWeight: '600',
  },
  sectionHint: { fontSize: 12, fontWeight: '600' },

  pillInput: {
    borderRadius: 9999,
    paddingHorizontal: 22,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
  },
  imeiInput: { flex: 1 },

  imeiRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },

  pillBtn: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 22,
  },
  pillBtnText: { fontSize: 14, fontWeight: '800' },
  photoActionBtn: { flexDirection: 'row', gap: 8, borderWidth: 1 },

  photoBox: {
    height: 190,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center', gap: 10 },
  photoIconCircle: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  photoPrimary: { fontSize: 15, fontWeight: '700' },
  photoSecondary: { fontSize: 12, fontWeight: '600' },
  photoActions: { flexDirection: 'row', gap: 10, marginTop: 12 },

  footerHint: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 28, lineHeight: 18 },

  cta: {
    borderRadius: 9999,
    paddingVertical: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  ctaText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.1 },

  scannerContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cameraPlaceholderText: { fontSize: 14, fontWeight: '600' },
  scannerOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'space-between' },
  scannerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  scannerCloseBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)' },
  scannerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  scannerCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scannerFrame: { width: 240, height: 240, position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  scannerBottom: { paddingHorizontal: 22, paddingBottom: 48, alignItems: 'center', gap: 12, backgroundColor: 'rgba(0,0,0,0.45)' },
  scannerHint: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  scannerRetry: {
    backgroundColor: '#FFF',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 9999,
  },
  scannerRetryText: { color: '#000', fontSize: 14, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 24, padding: 18, gap: 12 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalClose: { fontSize: 13, fontWeight: '700' },
  modalAction: {
    minHeight: 50,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  modalActionText: { fontSize: 14, fontWeight: '800' },

  successOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  successCard: { alignItems: 'center', gap: 12 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#10B981', marginTop: 14 },
});
