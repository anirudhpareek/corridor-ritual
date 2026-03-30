import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { DevScenarioToggle } from '../src/components/DevScenarioToggle';
import { AppProviders } from '../src/providers/AppProviders';
import { theme } from '../src/theme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InstrumentSerif_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <StatusBar style="dark" />
        <DevScenarioToggle />
        <Stack
          screenOptions={{
            animation: 'fade',
            contentStyle: { backgroundColor: theme.colors.canvas },
            headerShown: false,
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="membership" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="pay/index" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="pay/confirm" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="pay/status" options={{ animation: 'fade_from_bottom' }} />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
