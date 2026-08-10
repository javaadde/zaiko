import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, ImagePlus, Users, Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';
import { uploadCompanyLogo } from '@/services/company';
import type { Company } from '@/types';

export default function CompanySettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const company = useAuthStore((s) => s.currentCompany);

  if (!company) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No active company</Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.bgCard }]} onPress={() => router.back()}>
            <ArrowLeft size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Company settings</Text>
          <View style={styles.spacer} />
        </View>

        <CompanySettingsContent key={company.id} company={company} />
      </ScrollView>
    </View>
  );
}

function CompanySettingsContent({ company }: { company: Company }) {
  const router = useRouter();
  const { colors } = useTheme();
  const updateCompany = useAuthStore((s) => s.updateCompany);
  const addCompanyMember = useAuthStore((s) => s.addCompanyMember);

  const [name, setName] = useState(company.name);
  const [description, setDescription] = useState(company.description ?? '');
  const [employeeUid, setEmployeeUid] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const saveDetails = async () => {
    if (!name.trim()) {
      Alert.alert('Company name is required');
      return;
    }
    setSaving(true);
    try {
      await updateCompany(company.id, {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
      });
      router.back();
    } catch (err) {
      Alert.alert('Save failed', err instanceof Error ? err.message : 'Could not update company');
    } finally {
      setSaving(false);
    }
  };

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery access is needed to choose a company logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadingLogo(true);
    try {
      const upload = await uploadCompanyLogo(company.id, {
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType ?? null,
        fileName: result.assets[0].fileName ?? null,
      });
      await updateCompany(company.id, upload);
    } catch (err) {
      Alert.alert('Logo upload failed', err instanceof Error ? err.message : 'Could not upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const addEmployee = async () => {
    if (!employeeUid.trim()) {
      Alert.alert('Enter an employee UID');
      return;
    }
    setAddingEmployee(true);
    try {
      await addCompanyMember(company.id, employeeUid.trim());
      setEmployeeUid('');
    } catch (err) {
      Alert.alert('Add employee failed', err instanceof Error ? err.message : 'Could not add employee');
    } finally {
      setAddingEmployee(false);
    }
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <View style={[styles.logoWrap, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
          {company.logoUrl ? (
            <Image source={{ uri: company.logoUrl }} style={styles.logo} />
          ) : (
            <Building2 size={28} color={colors.textSecondary} />
          )}
        </View>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={pickLogo} disabled={uploadingLogo}>
          <ImagePlus size={16} color="#fff" />
          <Text style={styles.primaryBtnText}>{uploadingLogo ? 'Uploading...' : 'Add / change logo'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Basic info</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bgCardAlt, color: colors.textPrimary, borderColor: colors.border }]}
          value={name}
          onChangeText={setName}
          placeholder="Company name"
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.bgCardAlt, color: colors.textPrimary, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Company description"
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={saveDetails} disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Save changes'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Employees</Text>
        <Text style={[styles.helper, { color: colors.textSecondary }]}>Add employees by Firebase UID for now.</Text>
        <View style={styles.memberRow}>
          <TextInput
            style={[styles.input, styles.memberInput, { backgroundColor: colors.bgCardAlt, color: colors.textPrimary, borderColor: colors.border }]}
            value={employeeUid}
            onChangeText={setEmployeeUid}
            placeholder="Employee UID"
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.pastelYellow }]} onPress={addEmployee} disabled={addingEmployee}>
            <Plus size={18} color="#18191E" />
          </TouchableOpacity>
        </View>
        <View style={styles.memberList}>
          {company.members.map((member) => (
            <View key={member} style={[styles.memberChip, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
              <Users size={14} color={colors.textSecondary} />
              <Text style={[styles.memberText, { color: colors.textPrimary }]} numberOfLines={1}>{member}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 56, gap: 14 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  title: {  fontFamily: 'PlayfairDisplay_600SemiBold_Italic', fontSize: 22, },
  iconBtn: { width: 40, height: 40, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 40 },
  card: { borderRadius: 28, padding: 18, borderWidth: 1, gap: 14 },
  logoWrap: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 1, overflow: 'hidden' },
  logo: { width: '100%', height: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: '800',fontFamily: 'PlayfairDisplay_600SemiBold_Italic' },
  helper: { fontSize: 12, fontWeight: '500' },
  input: { borderRadius: 28, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: '600' },
  textArea: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: '600', minHeight: 110, textAlignVertical: 'top' },
  primaryBtn: { minHeight: 48, borderRadius: 28, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  memberRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  memberInput: { flex: 1 },
  addBtn: { width: 48, height: 48, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  memberList: { gap: 10 },
  memberChip: { borderRadius: 28, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1 },
  memberText: { fontSize: 13, fontWeight: '700', flex: 1 },
  emptyTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 80 },
});
