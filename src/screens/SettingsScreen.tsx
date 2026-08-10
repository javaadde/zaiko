import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { ChevronRight, MoreHorizontal, Sun, Moon, SlidersHorizontal, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { usePreferenceStore } from '@/stores/preference-store';

function SectionHeader({ label }: { label: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>{label}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const user = useAuthStore((s) => s.currentUser);
  const themeMode = usePreferenceStore((s) => s.themeMode);
  const setThemeMode = usePreferenceStore((s) => s.setThemeMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topBar}>
          <Text style={[styles.header, { color: colors.textPrimary }]}>Settings</Text>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.bgCard }]}>
            <MoreHorizontal size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileWrap}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.bgCard }]}>
            <Image
              source={user?.photoURL ? { uri: user.photoURL } : require('../../assets/icon.png')}
              style={styles.avatar}
            />
          </View>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.displayName ?? 'User'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email ?? ''}</Text>
        </View>

        {/* Subscription */}
        <SectionHeader label="Subscription" />
        <LinearGradient colors={[colors.pastelYellow, "#F6ED8F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.subGradient}>
          <View style={styles.subContent}>
            <View style={styles.starBadge}>
              <Star size={18} color="#18191E" fill="#18191E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subTitle}>Upgrade to Premium</Text>
              <Text style={styles.subDesc}>Unlock unlimited inventory analytics</Text>
            </View>
            <TouchableOpacity activeOpacity={0.9} style={styles.planBtn}>
              <View style={styles.planBtnGrad}>
                <Text style={styles.planBtnText}>See Plan</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Appearance */}
        <SectionHeader label="Appearance" />
        <View style={styles.appearanceRow}>
          <AppearanceOption label="System" active={themeMode === 'auto'} onPress={() => setThemeMode('auto')} icon={<SlidersHorizontal size={18} color={themeMode === 'auto' ? '#18191E' : colors.textPrimary} />} />
          <AppearanceOption label="Dark" active={themeMode === 'dark'} onPress={() => setThemeMode('dark')} icon={<Moon size={18} color={themeMode === 'dark' ? '#18191E' : colors.textPrimary} />} />
          <AppearanceOption label="Light" active={themeMode === 'light'} onPress={() => setThemeMode('light')} icon={<Sun size={18} color={themeMode === 'light' ? '#18191E' : colors.textPrimary} />} />
        </View>

        {/* Data & Information */}
        <SectionHeader label="Data & Information" />
        <InfoRow label="Archive" onPress={() => router.push('/archived-stocks')} />
        <InfoRow label="Company Settings" onPress={() => router.push('/setup')} />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function AppearanceOption({ label, icon, active, onPress }: { label: string; icon: React.ReactNode; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.appearanceOption,
          { backgroundColor: colors.bgCard, borderColor: colors.border },
          active && { backgroundColor: colors.pastelYellow, borderColor: colors.pastelYellow },
        ]}
      >
        {icon}
      </TouchableOpacity>
      <Text style={[styles.appearanceLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.infoRow, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <Text style={[styles.infoRowText, { color: colors.textPrimary }]}>{label}</Text>
      <View style={[styles.infoRowIcon, { backgroundColor: colors.bgCardAlt }]}>
        <ChevronRight size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  header: {
    fontFamily: 'PlayfairDisplay_600SemiBold_Italic',
    fontSize: 26,
    fontWeight: '600',
  },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { fontSize: 14, fontWeight: '800', marginTop: 22, marginBottom: 12 },
  profileWrap: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  profileName: { fontSize: 18, fontWeight: '800' },
  profileEmail: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  subGradient: { borderRadius: 28, padding: 18, overflow: 'hidden' },
  subContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  starBadge: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(24, 25, 30, 0.1)', alignItems: 'center', justifyContent: 'center' },
  subTitle: { fontSize: 15, fontWeight: '800', color: '#18191E' },
  subDesc: { fontSize: 12, fontWeight: '600', color: 'rgba(24, 25, 30, 0.7)', marginTop: 2 },
  planBtn: { borderRadius: 18, overflow: 'hidden' },
  planBtnGrad: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#18191E' },
  planBtnText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  appearanceRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  appearanceOption: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  appearanceLabel: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  infoRow: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1 },
  infoRowText: { fontSize: 15, fontWeight: '700' },
  infoRowIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
