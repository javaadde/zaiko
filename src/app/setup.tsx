import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius } from '@/constants/tokens';
import { useAuthStore } from '@/stores/auth-store';

export default function SetupScreen() {
  const router = useRouter();
  const { createCompany, status, currentUser, companies } = useAuthStore();
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const { companies, currentCompany, status } = useAuthStore.getState();
    console.log('[setup-guard] companies:', companies.length, 'company:', !!currentCompany, 'status:', status);
    if (companies.length > 0 && status === 'authenticated') {
      console.log('[setup-guard] redirecting to /(tabs)');
      router.replace('/(tabs)' as never);
    }
  }, [companies, status, router]);

  const handleCreate = async () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    if ((currentUser?.createdCompanyIds ?? []).length >= 3) {
      setError('You can only create up to 3 companies');
      return;
    }
    try {
      setError('');
      await createCompany(companyName.trim());
      router.replace('/(tabs)' as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Company</Text>
        <Text style={styles.subtitle}>
          Set up your workspace to start managing inventory
        </Text>
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Company name"
          value={companyName}
          onChangeText={setCompanyName}
          placeholderTextColor="#999"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, !companyName.trim() && styles.submitBtnDisabled]}
          onPress={handleCreate}
          disabled={!companyName.trim() || status === 'loading'}
        >
          {status === 'loading' ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Create Company</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.large,
    padding: 24,
    gap: 16,
  },
  input: {
    backgroundColor: Colors.bgCardAlt,
    borderRadius: BorderRadius.medium,
    padding: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.medium,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    color: Colors.danger,
    fontWeight: '600',
  },
});
