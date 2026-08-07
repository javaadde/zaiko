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
  Animated,
  Vibration,
} from 'react-native';
import {
  X,
  Camera as CameraIcon,
  Scan,
  User,
  Smartphone,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  PartyPopper,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, Camera } from 'expo-camera';
import { useTheme } from '@/hooks/use-theme';
import { getInventoryItem } from '@/services/inventory';
import { createSale as createSaleRecord } from '@/services/sales';
import { Audio } from 'expo-av';
import type { InventoryItem } from '@/types';

export default function SellVerifyScreen() {
  const router = useRouter();
  const { id, price, type } = useLocalSearchParams<{ id: string; price: string; type: string }>();
  const { colors, radii, shadows } = useTheme();
  const [selling, setSelling] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [imei, setImei] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<typeof CameraView | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const triggerSuccess = async () => {
    setShowSuccess(true);
    Animated.spring(successAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/success.mp3'),
      );
      await sound.playAsync();
    } catch {
      // no-op
    }
  };

  const finalizeSale = async () => {
    if (!customerName || !customerPhoto || !imei) {
      Alert.alert(
        'Missing Information',
        'Please complete all 3 validation steps.',
      );
      return;
    }
    setSelling(true);
    try {
      const item = await getInventoryItem(id);
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
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1800);
    } catch (error) {
      setSelling(false);
      Alert.alert('Sale Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Sale</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderTitle}>SECTION 01</Text>
            <View style={styles.sectionHeaderLine} />
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.inputLabel}>Customer Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alexander Sterling"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor="#CBD5E1"
            />
          </View>

          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderTitle}>SECTION 02</Text>
            <View style={styles.sectionHeaderLine} />
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.inputLabel}>IMEI Code</Text>
            <View style={styles.imeiRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="865230041943561"
                value={imei}
                onChangeText={setImei}
                keyboardType="numeric"
                placeholderTextColor="#CBD5E1"
              />
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={() => setScannerActive(true)}
              >
                <Scan color="#FFF" size={22} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderTitle}>SECTION 03</Text>
            <View style={styles.sectionHeaderLine} />
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.inputLabel}>Customer Photo</Text>
            <TouchableOpacity
              style={[
                styles.photoBox,
                customerPhoto && { borderStyle: 'solid', borderWidth: 0 },
              ]}
              onPress={() => setCameraActive(true)}
              activeOpacity={0.7}
            >
              {customerPhoto ? (
                <Image source={{ uri: customerPhoto }} style={styles.preview} />
              ) : (
                <View style={styles.placeholder}>
                  <View style={styles.photoIconCircle}>
                    <CameraIcon color="#64748B" size={28} />
                  </View>
                  <Text style={styles.placeholderTextText}>
                    Take or upload a photo
                  </Text>
                  <Text style={styles.placeholderSubTextText}>
                    PNG, JPG up to 10MB
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.finalizeBtn,
            (!customerName || !imei || !customerPhoto) && styles.disabledBtn,
            shadows.card,
          ]}
          onPress={finalizeSale}
          disabled={selling || !customerName || !imei || !customerPhoto}
        >
          <View style={styles.finalizeContent}>
            <Text style={styles.finalizeText}>Complete Selling Process</Text>
            <ArrowRight color="#FFF" size={20} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>

      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successCard,
              {
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <CheckCircle2 size={80} color="#10B981" />
            <Text style={styles.successTitle}>Sale Complete!</Text>
            <PartyPopper size={40} color="#F59E0B" style={{ marginTop: 12 }} />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionHeaderContainer: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  sectionHeaderTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginRight: 12 },
  sectionHeaderLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  stepCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, gap: 12 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  input: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, color: '#1E293B', fontWeight: '500', borderWidth: 1, borderColor: '#E2E8F0' },
  imeiRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  scanBtn: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
  photoBox: { height: 180, borderRadius: 16, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: 12 },
  photoIconCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  placeholderTextText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  placeholderSubTextText: { fontSize: 12, color: '#94A3B8' },
  footer: { padding: 20, paddingBottom: 32 },
  finalizeBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  disabledBtn: { opacity: 0.4 },
  finalizeContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  finalizeText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  successOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  successCard: { alignItems: 'center', gap: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#10B981', marginTop: 12 },
});
