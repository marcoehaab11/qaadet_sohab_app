import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Cairo_400Regular } from '@expo-google-fonts/cairo/400Regular';
import { Cairo_700Bold } from '@expo-google-fonts/cairo/700Bold';
import { Lalezar_400Regular } from '@expo-google-fonts/lalezar/400Regular';
import { useApp } from '../store';
import { Screen, Text } from '../components/ui';
import { Toast } from '../components/Toast';
import { ar } from '../i18n/ar-EG';
import { theme } from '../theme';
export default function RootLayout() {
  const [fontsReady, fontError] = useFonts({ Cairo_400Regular, Cairo_700Bold, Lalezar_400Regular });
  const ready = useApp((s) => s.ready);
  const hydrate = useApp((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  if (!ready || (!fontsReady && !fontError))
    return (
      <Screen>
        <Text>{ar.loading}</Text>
      </Screen>
    );
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.night },
          animation: 'none',
        }}
      />
      <Toast />
    </>
  );
}
