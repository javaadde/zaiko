import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.currentUser);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.bgCard }]} onPress={() => router.back()}>
            <ArrowLeft size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profile settings</Text>
          <View style={styles.spacer} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
            {user?.photoURL ? <Image source={{ uri: user.photoURL }} style={styles.avatarImage} /> : <User size={28} color={colors.textSecondary} />}
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.displayName ?? 'User'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email ?? ''}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.note, { color: colors.textSecondary }]}>Profile editing can be added here next.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 56, gap: 14 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 40 },
  card: { borderRadius: 28, padding: 18, borderWidth: 1, gap: 10, alignItems: 'center' },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  name: { fontSize: 18, fontWeight: '800' },
  email: { fontSize: 13, fontWeight: '600' },
  note: { fontSize: 13, fontWeight: '600' },
});
