import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import EnhancedCoinPurchaseScreen from '../screens/coins/EnhancedCoinPurchaseScreen';
import GamificationHubScreen from '../screens/gamification/GamificationHubScreen';
import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Premium screens for navigation
import SocialFeedScreen from '../screens/social/SocialFeedScreen';
import PredictiveInsightsScreen from '../screens/analytics/PredictiveInsightsScreen';
import CoinAnalyticsScreen from '../screens/analytics/CoinAnalyticsScreen';
import MerchantDirectoryScreen from '../screens/merchant/MerchantDirectoryScreen';
import CryptoGatewaySelectionScreen from '../screens/crypto/CryptoGatewaySelectionScreen';
import AIInsightsDashboard from '../screens/ai/AIInsightsDashboard';
import P2PMarketplaceScreen from '../screens/marketplace/P2PMarketplaceScreen';
import SubscriptionPlansScreen from '../screens/subscription/SubscriptionPlansScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

// Import coin components
import { CoinBalanceWidget } from '../components/coins';

// Import theme
import { colors, typography, shadows } from '../theme';

const Tab = createBottomTabNavigator();

const MainNavigator: React.FC = () => {
  return (
    <>
      {/* Always visible coin balance widget */}
      <CoinBalanceWidget
        balance={1250} // This would come from Redux state
        trend="up"
        change24h={150}
        animation="pulse"
        size="medium"
        showQuickActions={true}
        onQuickAction={(action) => {
          // Handle quick actions - navigation would be handled here
          console.log('Quick action:', action);
        }}
      />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'BuyCoins':
                iconName = 'add-circle';
                break;
              case 'Gamification':
                iconName = 'emoji-events';
                break;
              case 'Leaderboard':
                iconName = 'leaderboard';
                break;
              case 'Profile':
                iconName = 'person';
                break;
              default:
                iconName = 'circle';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerShown: false, // We'll handle headers in individual screens
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
          }}
        />
        <Tab.Screen
          name="BuyCoins"
          component={EnhancedCoinPurchaseScreen}
          options={{
            title: 'Buy Coins',
          }}
        />
        <Tab.Screen
          name="Gamification"
          component={GamificationHubScreen}
          options={{
            title: 'Achievements',
          }}
        />
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{
            title: 'Leaderboard',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
          }}
        />

        {/* Premium Tabs - conditionally shown based on subscription */}
        <Tab.Screen
          name="Social"
          component={SocialFeedScreen}
          options={{
            title: 'Social',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="group" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={PredictiveInsightsScreen}
          options={{
            title: 'Analytics',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="analytics" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Merchants"
          component={MerchantDirectoryScreen}
          options={{
            title: 'Merchants',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="store" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Crypto"
          component={CryptoGatewaySelectionScreen}
          options={{
            title: 'Crypto',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="account-balance-wallet" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="AI"
          component={AIInsightsDashboard}
          options={{
            title: 'AI',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="smart-toy" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="P2P"
          component={P2PMarketplaceScreen}
          options={{
            title: 'P2P',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="swap-horiz" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Subscription"
          component={SubscriptionPlansScreen}
          options={{
            title: 'Premium',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="star" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Admin"
          component={AdminDashboardScreen}
          options={{
            title: 'Admin',
            tabBarIcon: ({ focused, color, size }) => (
              <Icon name="admin-panel-settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
    ...shadows.small,
  },
  tabBarLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
});

export default MainNavigator;