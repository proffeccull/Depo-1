import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

// Import admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import TransactionMonitoringScreen from '../screens/admin/TransactionMonitoringScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import SystemHealthScreen from '../screens/admin/SystemHealthScreen';
import KYCApprovalsScreen from '../screens/admin/KYCApprovalsScreen';
import CoinPurchaseApprovalsScreen from '../screens/admin/CoinPurchaseApprovalsScreen';
import DisputeManagementScreen from '../screens/admin/DisputeManagementScreen';
import CoinManagementScreen from '../screens/admin/CoinManagementScreen';
import FeatureFlagsScreen from '../screens/admin/FeatureFlagsScreen';
import AuditLogsScreen from '../screens/admin/AuditLogsScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  TransactionMonitoring: undefined;
  Analytics: undefined;
  SystemHealth: undefined;
  KYCApprovals: undefined;
  CoinPurchaseApprovals: undefined;
  DisputeManagement: undefined;
  CoinManagement: undefined;
  FeatureFlags: undefined;
  AuditLogs: undefined;
};

const Stack = createStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: t('admin.dashboard.title', 'Admin Dashboard'),
        }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{
          title: t('admin.users.title', 'User Management'),
        }}
      />
      <Stack.Screen
        name="TransactionMonitoring"
        component={TransactionMonitoringScreen}
        options={{
          title: t('admin.transactions.title', 'Transaction Monitoring'),
        }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: t('admin.analytics.title', 'Analytics'),
        }}
      />
      <Stack.Screen
        name="SystemHealth"
        component={SystemHealthScreen}
        options={{
          title: t('admin.system.title', 'System Health'),
        }}
      />
      <Stack.Screen
        name="KYCApprovals"
        component={KYCApprovalsScreen}
        options={{
          title: t('admin.kyc.title', 'KYC Approvals'),
        }}
      />
      <Stack.Screen
        name="CoinPurchaseApprovals"
        component={CoinPurchaseApprovalsScreen}
        options={{
          title: t('admin.coinPurchases.title', 'Coin Purchase Approvals'),
        }}
      />
      <Stack.Screen
        name="DisputeManagement"
        component={DisputeManagementScreen}
        options={{
          title: t('admin.disputes.title', 'Dispute Management'),
        }}
      />
      <Stack.Screen
        name="CoinManagement"
        component={CoinManagementScreen}
        options={{
          title: t('admin.coinManagement.title', 'Coin Management'),
        }}
      />
      <Stack.Screen
        name="FeatureFlags"
        component={FeatureFlagsScreen}
        options={{
          title: t('admin.features.title', 'Feature Flags'),
        }}
      />
      <Stack.Screen
        name="AuditLogs"
        component={AuditLogsScreen}
        options={{
          title: t('admin.audit.title', 'Audit Logs'),
        }}
      />
    </Stack.Navigator>
  );
}