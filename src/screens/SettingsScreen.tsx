import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
} from 'react-native';
import { ChevronRight, Archive } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { APP_VERSION } from '@/lib/version';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const openPortfolio = () => {
    Linking.openURL('https://javade.in');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCard }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.businessLogoBox}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
            />
            <Text style={[styles.appName, { color: colors.textPrimary }]}>Zaiko Mobiles</Text>
            <Text style={[styles.appTagline, { color: colors.textSecondary }]}>Premium Mobile Store</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Backend</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { color: colors.textMuted }]}>Data Layer</Text>
                <Text style={[styles.urlText, { color: colors.textPrimary }]}>Firebase Firestore + Storage</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.badgeText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Inventory Management</Text>
          <TouchableOpacity
            style={[styles.salesCard, { backgroundColor: colors.bgCardAlt }]}
            onPress={() => router.push('/archived-stocks')}
          >
            <View style={[styles.salesIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Archive size={24} color="#6366F1" />
            </View>
            <View style={styles.salesContent}>
              <Text style={[styles.salesTitle, { color: colors.textPrimary }]}>Archived Stocks</Text>
              <Text style={[styles.salesSub, { color: colors.textSecondary }]}>
                Restore or delete previously archived items
              </Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.madeBy, { color: colors.textMuted }]}>Made by @javaadde</Text>
          <TouchableOpacity style={styles.knowMoreBtn} onPress={openPortfolio}>
            <Text style={[styles.knowMoreText, { color: colors.textPrimary }]}>Know more about javad</Text>
          </TouchableOpacity>
          <Text style={[styles.version, { color: colors.textMuted }]}>v{APP_VERSION}</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 80, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 50 },
  businessLogoBox: { alignItems: 'center', gap: 8 },
  logo: { width: 120, height: 120, borderRadius: 16, backgroundColor: '#F3F4F6', marginBottom: 10 },
  appName: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  appTagline: { fontSize: 14, fontWeight: '600' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 5, marginBottom: 12 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  statusRow: { padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusInfo: { flex: 1, marginRight: 10 },
  statusLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  urlText: { fontSize: 13, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  salesCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  salesIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  salesContent: { flex: 1 },
  salesTitle: { fontSize: 16, fontWeight: '700' },
  salesSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  footer: { marginTop: 60, alignItems: 'center', gap: 12 },
  madeBy: { fontSize: 14, fontWeight: '600' },
  knowMoreBtn: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, backgroundColor: '#F3F4F6', width: '100%', alignItems: 'center' },
  knowMoreText: { fontSize: 16, fontWeight: '700' },
  version: { fontSize: 12, fontWeight: '600' },
});
