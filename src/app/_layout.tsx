import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/providers/theme-context';
import { useAuthStore } from '@/stores/auth-store';

export default function RootLayout() {
  const authLoading = useAuthStore((s) => s.status === 'loading');
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentCompany = useAuthStore((s) => s.currentCompany);

  useEffect(() => {
    const unsub = useAuthStore.getState().initAuth();
    return unsub;
  }, []);

  if (authLoading) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <ThemeProvider>
          <View style={styles.root} />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <StatusBar style="dark" backgroundColor="#EFF6FF" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#EFF6FF' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="sell" />
          <Stack.Screen name="sell-verify/[id]" />
          <Stack.Screen name="archived-stocks" />
        </Stack>
        {!currentUser && <Redirect href="/auth" />}
        {currentUser && !currentCompany && <Redirect href="/setup" />}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
});
