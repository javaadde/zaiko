import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Colors, BorderRadius } from '@/constants/tokens';
import { useAuthStore } from '@/stores/auth-store';

export default function AuthScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, clearError, authError, status } = useAuthStore();
  const isExpoGo = Constants.appOwnership === 'expo';
  const canUseAppleAuth = Platform.OS === 'ios' && !isExpoGo;
  const canUseGoogleAuth = !isExpoGo;
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async () => {
    if (isSignUp) {
      await signUpWithEmail(email, password, displayName || email.split('@')[0]);
    } else {
      await signInWithEmail(email, password);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Zaiko Mobiles</Text>
        <Text style={styles.subtitle}>Premium Mobile Store</Text>
      </View>

      <View style={styles.card}>
        {canUseGoogleAuth && (
          <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle}>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        )}

        {canUseAppleAuth && (
          <TouchableOpacity style={styles.appleBtn} onPress={signInWithApple}>
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholderTextColor="#999"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        {authError && <Text style={styles.error}>{authError}</Text>}

        <TouchableOpacity
          style={[styles.submitBtn, (!email || !password) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!email || !password || status === 'loading'}
        >
          {status === 'loading' ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            clearError();
            setIsSignUp(!isSignUp);
          }}
        >
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Text>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
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
  googleBtn: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.medium,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleBtnText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  appleBtn: {
    backgroundColor: '#000',
    borderRadius: BorderRadius.medium,
    padding: 16,
    alignItems: 'center',
  },
  appleBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
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
  toggleText: {
    color: Colors.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    color: Colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
});
