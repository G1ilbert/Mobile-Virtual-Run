import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getTheme } from '../constants/GlobalStyles';

export default function RootLayout() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="event/register" />
        <Stack.Screen name="event/payment" />
        <Stack.Screen name="run/[id]" />
        <Stack.Screen name="profile/settings" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/history" />
        <Stack.Screen name="profile/completed" />
        <Stack.Screen name="(common)" />
      </Stack>
    </SafeAreaProvider>
  );
}
