import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlayfairDisplay_600SemiBold_Italic } from '@expo-google-fonts/playfair-display';
import { ThemeProvider } from '@/providers/theme-context';
import { useAuthStore } from '@/stores/auth-store';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold_Italic,
  });

  const authLoading = useAuthStore((s) => s.status === 'loading');
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentCompany = useAuthStore((s) => s.currentCompany);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsub = useAuthStore.getState().initAuth();
    return unsub;
  }, []);

  useEffect(() => {
    if (authLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === 'auth';
    const inSetupGroup = segments[0] === 'setup';

    if (!currentUser && !inAuthGroup) {
      router.replace('/auth');
    } else if (currentUser && !currentCompany && !inSetupGroup) {
      router.replace('/setup');
    } else if (currentUser && currentCompany && inAuthGroup) {
      // Allow navigating to setup even when a company exists (for creating another one)
      router.replace('/(tabs)');
    }
  }, [currentUser, currentCompany, authLoading, fontsLoaded, segments, router]);

  if (authLoading || !fontsLoaded) {
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
        <StatusBar style="dark" />
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
