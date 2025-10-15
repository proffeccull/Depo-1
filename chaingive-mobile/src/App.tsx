import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, StatusBar } from 'react-native';

import { store, persistor } from './store/store';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { colors } from './theme/colors';
import GlobalToastHost from './components/common/GlobalToastHost';
import pushNotificationService from './services/pushNotificationService';
import logger from './utils/logger';

// Component that initializes push notifications
const PushNotificationInitializer: React.FC = () => {
  useEffect(() => {
    // Initialize push notifications on app mount
    const initPushNotifications = async () => {
      try {
        await pushNotificationService.initialize();
        logger.info('Push notifications initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize push notifications', error as Error);
      }
    };

    initPushNotifications();
  }, []);

  return null;
};

const App: React.FC = () => {
  const linking: LinkingOptions<any> = {
    prefixes: ['chaingive://', 'https://chaingive.ng/app', 'https://chaingive.ng'],
    config: {
      screens: {
        Auth: {
          screens: {
            Login: 'login',
            Register: 'register',
            SignUp: 'signup',
            OTP: 'otp',
            ForgotPassword: 'forgot-password',
            ResetPassword: 'reset-password',
          },
        },
        Main: {
          screens: {
            Home: {
              screens: {
                HomeScreen: 'home',
                GiveScreen: 'donate/:userId?',
                TransactionHistory: 'transactions',
              },
            },
            Marketplace: {
              screens: {
                MarketplaceScreen: 'marketplace',
                ItemDetail: 'marketplace/:itemId',
                CheckoutScreen: 'checkout',
                RedemptionHistory: 'redemptions',
              },
            },
            Profile: {
              screens: {
                ProfileScreen: 'profile',
                EditProfile: 'profile/edit',
                Settings: 'settings',
                Notifications: 'notifications',
              },
            },
            Agent: {
              screens: {
                AgentDashboard: 'agent/dashboard',
                VerifyUser: 'agent/verify',
                ConfirmCoinPayment: 'agent/coins',
                VerificationDetail: 'agent/verification/:requestId',
              },
            },
          },
        },
        // Direct screen links
        CycleDetail: 'cycle/:cycleId',
        Leaderboard: 'leaderboard',
        Achievements: 'achievements/:achievementId?',
      },
    },
  };
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <Provider store={store}>
          <PersistGate 
            loading={<LoadingSpinner visible={true} message="Initializing app..." />} 
            persistor={persistor}
          >
            <SafeAreaProvider>
              <NavigationContainer linking={linking}>
                <StatusBar
                  barStyle="light-content"
                  backgroundColor={colors.primary}
                />
                <PushNotificationInitializer />
                <AppNavigator />
                <GlobalToastHost />
              </NavigationContainer>
            </SafeAreaProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;