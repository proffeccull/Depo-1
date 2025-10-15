import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../types';
import HomeScreen from '../screens/home/HomeScreen';
import GiveScreen from '../screens/home/GiveScreen';
import DepositScreen from '../screens/home/DepositScreen';
import WithdrawScreen from '../screens/home/WithdrawScreen';
import TransactionHistoryScreen from '../screens/home/TransactionHistoryScreen';
import TransactionDetailScreen from '../screens/home/TransactionDetailScreen';
import CycleDetailScreen from '../screens/donations/CycleDetailScreen';
import CycleHistoryScreen from '../screens/donations/CycleHistoryScreen';
import CoinPurchaseScreen from '../screens/coins/CoinPurchaseScreen';
import AchievementsScreen from '../screens/gamification/AchievementsScreen';
import WeeklyChallengesScreen from '../screens/gamification/WeeklyChallengesScreen';
// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import TransactionMonitoringScreen from '../screens/admin/TransactionMonitoringScreen';
import DisputeManagementScreen from '../screens/admin/DisputeManagementScreen';
import CryptoPaymentSettingsScreen from '../screens/admin/CryptoPaymentSettingsScreen';
import CryptoPaymentConfirmationScreen from '../screens/admin/CryptoPaymentConfirmationScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="GiveScreen" component={GiveScreen} />
      <Stack.Screen name="DepositScreen" component={DepositScreen} />
      <Stack.Screen name="WithdrawScreen" component={WithdrawScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="CycleDetail" component={CycleDetailScreen} />
      <Stack.Screen name="CycleHistory" component={CycleHistoryScreen} />
      <Stack.Screen name="CoinPurchase" component={CoinPurchaseScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="WeeklyChallenges" component={WeeklyChallengesScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;

export default HomeNavigator;