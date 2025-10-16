import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import { TRPCProvider } from './providers/TRPCProvider';
import { initI18n } from './i18n';
import { initializeWebSocket } from './services/websocketService';
import { useOfflineSync } from './hooks/useOfflineSync';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import i18n from './i18n';

// Use Expo Router instead of React Navigation
import { Slot } from 'expo-router';

function AppContent() {
  useOfflineSync();
  
  useEffect(() => {
    initializeWebSocket().catch(console.warn);
  }, []);

  return (
    <SafeAreaProvider>
      <Slot />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

export default function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initI18n();
        setIsI18nInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Initialization failed');
      }
    };

    initializeApp();
  }, []);

  if (initError) {
    return <LoadingScreen message={`Error: ${initError}`} />;
  }

  if (!isI18nInitialized) {
    return <LoadingScreen message="Initializing app..." />;
  }

  return (
    <ErrorBoundary>
      <TRPCProvider>
        <I18nextProvider i18n={i18n}>
          <AppContent />
        </I18nextProvider>
      </TRPCProvider>
    </ErrorBoundary>
  );
}