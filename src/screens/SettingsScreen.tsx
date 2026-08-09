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
  Modal,
} from 'react-native';
import {
  ChevronRight,
  LogOut,
  User as UserIcon,
  Lock,
  Bell,
  Globe,
  Info,
  Sun,
  Calendar,
  Archive,
  LifeBuoy,
  Building2,
  PlusCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { usePreferenceStore } from '@/stores/preference-store';
import { APP_VERSION } from '@/lib/version';

function SectionHeader({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{label}</Text>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, { backgroundColor: '#F3F4F6' }]}>{icon}</View>
        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>
        ) : null}
        <ChevronRight size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.currentUser);
  const companies = useAuthStore((s) => s.companies);
  const currentCompany = useAuthStore((s) => s.currentCompany);
  const switchCompany = useAuthStore((s) => s.switchCompany);
  const themeMode = usePreferenceStore((s) => s.themeMode);
  const [companyPickerOpen, setCompanyPickerOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const openPortfolio = () => {
    Linking.openURL('https://javade.in');
  };

  const themeLabel =
    themeMode === 'auto' ? `Auto (${scheme === 'dark' ? 'Dark' : 'Light'})` : themeMode[0].toUpperCase() + themeMode.slice(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
          <Image
            source={user?.photoURL ? { uri: user.photoURL } : require('../../assets/icon.png')}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.displayName ?? 'User'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email ?? ''}</Text>
          </View>
        </View>

        {/* Account */}
        <SectionHeader label="Account" />
        <Row icon={<UserIcon size={18} color="#111827" />} label="Manage Profile" onPress={() => {}} />
        <Row icon={<Lock size={18} color="#111827" />} label="Password & Security" onPress={() => {}} />
        <Row icon={<Bell size={18} color="#111827" />} label="Notifications" onPress={() => {}} />
        <Row icon={<Globe size={18} color="#111827" />} label="Language" value="English" onPress={() => {}} />
        <Row
          icon={<Archive size={18} color="#111827" />}
          label="Archived Stocks"
          onPress={() => router.push('/archived-stocks')}
        />

        {/* Preferences */}
        <SectionHeader label="Preferences" />
        <Row icon={<Info size={18} color="#111827" />} label="About Us" onPress={openPortfolio} />
        <Row icon={<Sun size={18} color="#111827" />} label="Theme" value={themeLabel} onPress={() => {}} />
        <Row icon={<Calendar size={18} color="#111827" />} label="Appointments" onPress={() => {}} />

        {/* Companies */}
        <SectionHeader label="Companies" />
        <Row
          icon={<Building2 size={18} color="#111827" />}
          label="Company"
          value={currentCompany?.name ?? 'Select'}
          onPress={() => setCompanyPickerOpen(true)}
        />
        {/* Optional quick create */}
        <Row
          icon={<PlusCircle size={18} color="#111827" />}
          label="Create New Company"
          onPress={() => router.push('/setup')}
        />

        {/* Support */}
        <SectionHeader label="Support" />
        <Row icon={<LifeBuoy size={18} color="#111827" />} label="Help Center" onPress={() => {}} />

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.dangerLight }]}
          onPress={handleSignOut}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.textMuted }]}>v{APP_VERSION}</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Company Picker Modal */}
      <Modal visible={companyPickerOpen} animationType="fade" transparent onRequestClose={() => setCompanyPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Company</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {companies.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.modalRow}
                  activeOpacity={0.8}
                  onPress={async () => {
                    await switchCompany(c.id);
                    setCompanyPickerOpen(false);
                  }}
                >
                  <Text style={[styles.modalRowText, { color: colors.textPrimary }]}>
                    {c.name} {currentCompany?.id === c.id ? '(Active)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalCreate, { borderColor: colors.border }]}
              onPress={() => {
                setCompanyPickerOpen(false);
                router.push('/setup');
              }}
            >
              <PlusCircle size={18} color={colors.textPrimary} />
              <Text style={[styles.modalCreateText, { color: colors.textPrimary }]}>Create New Company</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setCompanyPickerOpen(false)}>
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 14 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: { width: 56, height: 56, borderRadius: 14, marginRight: 12, backgroundColor: '#F3F4F6' },
  profileName: { fontSize: 16, fontWeight: '800' },
  profileEmail: { fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '700' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: { fontSize: 12, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, marginTop: 24 },
  logoutText: { fontSize: 16, fontWeight: '800' },
  footer: { alignItems: 'center', marginTop: 20 },
  version: { fontSize: 12, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: '#00000070', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 16, borderWidth: 1, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  modalRow: { paddingVertical: 12 },
  modalRowText: { fontSize: 14, fontWeight: '700' },
  modalCreate: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderTopWidth: 1 },
  modalCreateText: { fontSize: 14, fontWeight: '800' },
  modalCancel: { marginTop: 4, alignItems: 'center', paddingVertical: 10 },
  modalCancelText: { fontSize: 13, fontWeight: '700' },
});
