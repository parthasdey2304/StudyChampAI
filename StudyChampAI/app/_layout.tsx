import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="coursedoubts" options={{ headerShown: false }} />
        <Stack.Screen name="planner" options={{ title: 'Smart Planner' }} />
        <Stack.Screen name="whiteboard" options={{ title: 'Whiteboard' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
