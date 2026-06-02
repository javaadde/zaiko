import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
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
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, Camera } from "expo-camera";
import { Shadows, BorderRadius } from "../theme/colors";
import { inventoryAPI } from "../services/api";
import { Audio } from "expo-av";

export default function SellVerifyScreen() {
  const router = useRouter();
  const { id, price, type } = useLocalSearchParams();

  const [selling, setSelling] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [imei, setImei] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
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

    // Play Success Sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/success.mp3"),
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound (likely file missing):", error);
    }
  };

  const finalizeSale = async () => {
    if (!customerName || !customerPhoto || !imei) {
      Alert.alert(
        "Missing Information",
        "Please complete all 3 validation steps.",
      );
      return;
    }

    setSelling(true);
    try {
      const saleData = {
        salePrice: Number(price),
        saleType: type,
        customerName: customerName,
        imei: imei,
      };

      await inventoryAPI.sell(id, saleData, customerPhoto);
      setSelling(false); // Hide loading before success
      triggerSuccess();
    } catch (error) {
      setSelling(false);
      Alert.alert("Sale Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Centered Header Design */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Sale</Text>
        <View style={{ width: 44 }} /> {/* Spacer for centering */}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 01: Customer Name */}
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

          {/* SECTION 02: IMEI Code */}
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

          {/* SECTION 03: Customer Photo */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderTitle}>SECTION 03</Text>
            <View style={styles.sectionHeaderLine} />
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.inputLabel}>Customer Photo</Text>
            <TouchableOpacity
              style={[
                styles.photoBox,
                customerPhoto && { borderStyle: "solid", borderWidth: 0 },
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
            Shadows.card,
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

      {/* Full Screen Loading Overlay */}
      {selling && (
        <View style={styles.loadingOverlay}>
          <StatusBar barStyle="light-content" />
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Processing Transaction...</Text>
            <Text style={styles.loadingSub}>
              Please wait while we finalize the sale
            </Text>
          </View>
        </View>
      )}

      {/* IMEI Scanner Overlay */}
      {scannerActive && (
        <View style={styles.cameraOverlay}>
          <CameraView
            barcodeScannerSettings={{
              barcodeTypes: ["code128", "code39"],
            }}
            onBarcodeScanned={({ data }) => {
              const cleanData = data.replace(/\D/g, "");
              if (cleanData.length === 15) {
                Vibration.vibrate(70);
                setImei(cleanData);
                setScannerActive(false);
              }
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.scannerUI}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>
              Point at IMEI barcode (15 digits)
            </Text>
            <TouchableOpacity
              style={styles.closeOverlay}
              onPress={() => setScannerActive(false)}
            >
              <X color="#FFF" size={32} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Camera Capture Overlay */}
      {cameraActive && (
        <View style={styles.cameraOverlay}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            ref={cameraRef}
          />
          <View style={styles.cameraUI}>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={async () => {
                if (cameraRef.current) {
                  const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                  });
                  setCustomerPhoto(photo.uri);
                  setCameraActive(false);
                }
              }}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeOverlay}
              onPress={() => setCameraActive(false)}
            >
              <X color="#FFF" size={32} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <View style={styles.successWrapper}>
          <Animated.View
            style={[
              styles.successCard,
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
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.successIconBox}
            >
              <PartyPopper color="#FFF" size={48} strokeWidth={1.5} />
            </LinearGradient>
            <Text style={styles.successTitle}>Successfully Sold!</Text>
            <Text style={styles.successSub}>
              The transaction for {customerName} has been processed
              successfully.
            </Text>

            <View style={styles.successStats}>
              <View style={styles.successStatItem}>
                <Text style={styles.successStatLabel}>Sale Amount</Text>
                <Text style={styles.successStatValue}>₹{price}</Text>
              </View>
              <View style={styles.successStatDivider} />
              <View style={styles.successStatItem}>
                <Text style={styles.successStatLabel}>Type</Text>
                <Text style={styles.successStatValue}>{type}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.successBtnWrapper}
              onPress={() => router.replace("/(tabs)/stocks")}
            >
              <LinearGradient
                colors={["#1E293B", "#0F172A"]}
                style={styles.successBtn}
              >
                <Text style={styles.successBtnText}>
                  Dismiss & Back to Inventory
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "ios" ? 55 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 1,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  stepCard: {
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.large,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#FFF",
    height: 56,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  imeiRow: {
    flexDirection: "row",
    gap: 12,
  },
  scanBtn: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.medium,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  photoBox: {
    width: "100%",
    height: 180,
    borderRadius: BorderRadius.large,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoIconCircle: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  placeholderTextText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "700",
  },
  placeholderSubTextText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  finalizeBtn: {
    height: 68,
    borderRadius: BorderRadius.large,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  finalizeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  finalizeText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 1000,
  },
  scannerUI: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerFrame: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: "#10B981",
    borderRadius: BorderRadius.large,
  },
  scannerText: {
    color: "#FFF",
    marginTop: 30,
    fontWeight: "700",
    fontSize: 16,
  },
  cameraUI: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 80,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: "#FFF",
  },
  closeOverlay: {
    position: "absolute",
    top: 60,
    right: 30,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: BorderRadius.large,
  },
  // Success State Styles
  successWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    zIndex: 5000,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successCard: {
    backgroundColor: "#FFF",
    width: "100%",
    borderRadius: BorderRadius.xl,
    padding: 32,
    alignItems: "center",
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.large,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 12,
  },
  successSub: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 32,
  },
  successStats: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.large,
    padding: 20,
    marginBottom: 32,
    width: "100%",
  },
  successStatItem: {
    flex: 1,
    alignItems: "center",
  },
  successStatLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  successStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  successStatDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 10,
  },
  successBtnWrapper: {
    width: "100%",
  },
  successBtn: {
    height: 64,
    borderRadius: BorderRadius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  successBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 20,
    letterSpacing: -0.5,
  },
  loadingSub: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
});
