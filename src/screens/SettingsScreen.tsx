import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Modal } from 'react-native';
import { ChevronRight, MoreHorizontal, Sun, Moon, SlidersHorizontal, Star, Building2, Plus, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { usePreferenceStore } from '@/stores/preference-store';
import type { Company } from '@/types';

function SectionHeader({ label }: { label: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>{label}</Text>;
}

function CompanyRow({ company, isActive, onPress }: { company: Company; isActive: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.companyRow,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
        isActive && { backgroundColor: colors.pastelYellow, borderColor: colors.pastelYellow },
      ]}
    >
      <Building2 size={20} color={isActive ? '#18191E' : colors.textPrimary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.companyRowName, { color: isActive ? '#18191E' : colors.textPrimary }]}>
          {company.name}
        </Text>
        <Text style={[styles.companyRowSlug, { color: isActive ? 'rgba(24,25,30,0.7)' : colors.textSecondary }]}>
          {company.slug}
        </Text>
      </View>
      {isActive && (
        <View style={[styles.checkBadge, { backgroundColor: 'rgba(24,25,30,0.15)' }]}>
          <Check size={16} color="#18191E" />
        </View>
      )}
    </TouchableOpacity>
  );
}

function CompanyPickerModal({ visible, onClose, companies, currentCompany, onSwitchCompany, onCreateNew }: {
  visible: boolean;
  onClose: () => void;
  companies: Company[];
  currentCompany: Company | null;
  onSwitchCompany: (id: string) => void;
  onCreateNew: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
          <View style={styles.modalHandle} />
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Company</Text>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {companies.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                isActive={currentCompany?.id === company.id}
                onPress={() => {
                  onSwitchCompany(company.id);
                  onClose();
                }}
              />
            ))}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onCreateNew();
              }}
              activeOpacity={0.85}
              style={[styles.createCompanyBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            >
              <Plus size={20} color={colors.textPrimary} />
              <Text style={[styles.createCompanyText, { color: colors.textPrimary }]}>Create New Company</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ActionMenuModal({
  visible,
  onClose,
  onProfileSettings,
  onCompanySettings,
  onLogout,
}: {
  visible: boolean;
  onClose: () => void;
  onProfileSettings: () => void;
  onCompanySettings: () => void;
  onLogout: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.menuOverlay}>
        <TouchableOpacity style={styles.menuBackdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.menuCard, { backgroundColor: colors.bg }]}> 
          <TouchableOpacity onPress={onProfileSettings} activeOpacity={0.85} style={[styles.menuItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Profile settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCompanySettings} activeOpacity={0.85} style={[styles.menuItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Company settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} activeOpacity={0.85} style={[styles.menuItem, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const user = useAuthStore((s) => s.currentUser);
  const themeMode = usePreferenceStore((s) => s.themeMode);
  const setThemeMode = usePreferenceStore((s) => s.setThemeMode);
  const companies = useAuthStore((s) => s.companies);
  const currentCompany = useAuthStore((s) => s.currentCompany);
  const switchCompany = useAuthStore((s) => s.switchCompany);
  const signOut = useAuthStore((s) => s.signOut);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = async () => {
    setMenuVisible(false);
    await signOut();
    router.replace('/auth');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topBar}>
          <Text style={[styles.header, { color: colors.textPrimary }]}>Settings</Text>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.bgCard }]} onPress={() => setMenuVisible(true)}>
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

        {/* Company */}
        <SectionHeader label="Company" />
        <InfoRow  label={currentCompany ? currentCompany.name : 'Switch Company'} onPress={() => setCompanyModalVisible(true)}  />

        {/* Data & Information */}
        <SectionHeader label="Archived Stocks" />
        <InfoRow label="Archive" onPress={() => router.push('/archived-stocks')} />

        {companyModalVisible && (
          <CompanyPickerModal
            visible={companyModalVisible}
            onClose={() => setCompanyModalVisible(false)}
            companies={companies}
            currentCompany={currentCompany}
            onSwitchCompany={async (id) => {
              await switchCompany(id);
            }}
            onCreateNew={() => {
              setCompanyModalVisible(false);
              router.push('/setup');
            }}
            />
        )}

        {menuVisible && (
          <ActionMenuModal
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            onProfileSettings={() => {
              setMenuVisible(false);
              router.push('/profile-settings');
            }}
            onCompanySettings={() => {
              setMenuVisible(false);
              router.push('/company-settings');
            }}
            onLogout={handleLogout}
          />
        )}

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
  appearanceOption: { width: 56, height: 56, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  appearanceLabel: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  infoRow: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1 },
  infoRowText: { fontSize: 15, fontWeight: '700' },
  infoRowIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 34, maxHeight: '80%' },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.15)', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  modalList: { maxHeight: 400 },
  menuOverlay: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 78, paddingRight: 20 },
  menuBackdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.24)' },
  menuCard: { width: 220, borderRadius: 24, padding: 10, gap: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1 },
  menuItemText: { fontSize: 15, fontWeight: '700' },
  companyRow: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 50, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  companyRowContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  companyRowName: { fontSize: 15, fontWeight: '700' },
  companyRowSlug: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  checkBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  createCompanyBtn: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, borderWidth: 1 },
  createCompanyText: { fontSize: 15, fontWeight: '700', marginLeft: 10 },
});
