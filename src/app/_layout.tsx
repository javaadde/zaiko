import { useEffect } from 'react';
import { AppState, View } from 'react-native';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { Stack, Redirect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@/providers/theme-context';
import { usePreferenceStore } from '@/stores/preference-store';
import { useAuthStore } from '@/stores/auth-store';
import * as SplashScreen from 'expo-splash-screen';
import { requestTrackingOnce } from '@/lib/tracking';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = true;
  const themeMode = usePreferenceStore((s) => s.themeMode);
  const authLoading = useAuthStore((s) => s.status === 'loading');
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentCompany = useAuthStore((s) => s.currentCompany);

  useEffect(() => {
    const unsub = useAuthStore.getState().initAuth();
    return unsub;
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        requestTrackingOnce();
      }
    });
    return () => sub.remove();
  }, []);

  const ready = fontsLoaded && !authLoading;

  if (!ready) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <View style={{ flex: 1 }} />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  const statusBarStyle: StatusBarStyle =
    themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'dark' : 'auto';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <StatusBar style={statusBarStyle as StatusBarStyle} key={statusBarStyle} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="setup" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="sell" />
              <Stack.Screen name="sell-verify/[id]" />
              <Stack.Screen name="archived-stocks" />
            </Stack>
            {!currentUser && <Redirect href="/auth" />}
            {currentUser && !currentCompany && <Redirect href="/setup" />}
          </BottomSheetModalProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
