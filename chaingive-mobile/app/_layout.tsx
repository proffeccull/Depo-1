import { Stack } from 'expo-router';
import { TRPCProvider } from '../src/providers/TRPCProvider';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <TRPCProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
      </Stack>
    </TRPCProvider>
  );
}