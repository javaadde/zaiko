import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { API_BASE_URL } from "../services/api";
import { useRouter } from "expo-router";
import { ChevronRight, Archive } from "lucide-react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const [serverStatus, setServerStatus] = useState("checking...");
  const [loading, setLoading] = useState(false);

  const checkConnectivity = async () => {
    setLoading(true);
    setServerStatus("checking...");
    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/health`);
      const end = Date.now();
      if (response.ok) {
        setServerStatus("Server is Online");
      } else {
        setServerStatus("Server is Offline");
      }
    } catch (e) {
      setServerStatus("No Connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  const openPortfolio = () => {
    Linking.openURL("https://javade.in");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.businessLogoBox}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
            />
            <Text style={styles.appName}>TakeOne Mobiles</Text>
            <Text style={styles.appTagline}>Premium Mobile Store</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>Connection Status</Text>
                <Text style={styles.urlText} numberOfLines={1}>
                  {API_BASE_URL}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      serverStatus === "Server is Online"
                        ? "#10B981"
                        : "#EF4444",
                  },
                ]}
              >
                <Text style={styles.badgeText}>{serverStatus}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory Management</Text>
          <TouchableOpacity
            style={styles.salesCard}
            onPress={() => router.push("/archived-stocks")}
          >
            <View style={[styles.salesIconBox, { backgroundColor: "#EEF2FF" }]}>
              <Archive size={24} color="#6366F1" />
            </View>
            <View style={styles.salesContent}>
              <Text style={styles.salesTitle}>Archived Stocks</Text>
              <Text style={styles.salesSub}>
                Restore or delete previously archived items
              </Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.madeBy}>Made by @javaadde</Text>
          <TouchableOpacity style={styles.knowMoreBtn} onPress={openPortfolio}>
            <Text style={styles.knowMoreText}>Know more about javad</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scroll: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  businessLogoBox: {
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statusRow: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusInfo: {
    flex: 1,
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  urlText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  footer: {
    marginTop: 60,
    alignItems: "center",
  },
  madeBy: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
    marginBottom: 16,
  },
  knowMoreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    width: "100%",
    alignItems: "center",
  },
  knowMoreText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  salesCard: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  salesIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  salesContent: {
    flex: 1,
  },
  salesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  salesSub: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
});
