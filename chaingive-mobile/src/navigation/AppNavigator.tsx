import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootState } from '../store/store';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

// Premium screens
import NFTGalleryScreen from '../screens/nft/NFTGalleryScreen';
import NFTMintingScreen from '../screens/nft/NFTMintingScreen';
import SocialFeedScreen from '../screens/social/SocialFeedScreen';
import SocialChallengesScreen from '../screens/social/SocialChallengesScreen';
import PredictiveInsightsScreen from '../screens/analytics/PredictiveInsightsScreen';
import GivingPredictionsScreen from '../screens/analytics/GivingPredictionsScreen';
import CoinBattlePassScreen from '../screens/gamification/CoinBattlePassScreen';
import CoinAnalyticsScreen from '../screens/analytics/CoinAnalyticsScreen';
// Advanced Gamification screens
import { CharityCategoriesScreen } from '../screens/gamification/CharityCategoriesScreen';
import { CrewDashboardScreen } from '../screens/gamification/CrewDashboardScreen';
import { TrustReviewHubScreen } from '../screens/gamification/TrustReviewHubScreen';
import { WeeklyTargetsScreen } from '../screens/gamification/WeeklyTargetsScreen';
import { UserLevelsScreen } from '../screens/gamification/UserLevelsScreen';
import { CharitableNFTGalleryScreen } from '../screens/gamification/CharitableNFTGalleryScreen';

// Merchant screens
import MerchantDirectoryScreen from '../screens/merchant/MerchantDirectoryScreen';
import MerchantDetailScreen from '../screens/merchant/MerchantDetailScreen';
import QRPaymentScreen from '../screens/merchant/QRPaymentScreen';
import MerchantDashboardScreen from '../screens/merchant/MerchantDashboardScreen';

// Corporate screens
import CorporateSignupScreen from '../screens/corporate/CorporateSignupScreen';
import CorporateDashboardScreen from '../screens/corporate/CorporateDashboardScreen';
import TeamManagementScreen from '../screens/corporate/TeamManagementScreen';
import CSRTrackingScreen from '../screens/corporate/CSRTrackingScreen';
import BulkOperationsScreen from '../screens/corporate/BulkOperationsScreen';

// AI screens
import SmartAssistantScreen from '../screens/ai/SmartAssistantScreen';
import DonationRecommendationCard from '../screens/ai/DonationRecommendationCard';
import OptimalTimingWidget from '../screens/ai/OptimalTimingWidget';
import AIInsightsDashboard from '../screens/ai/AIInsightsDashboard';
import AIMatchingScreen from '../screens/ai/AIMatchingScreen';
import AIRecommendationsScreen from '../screens/ai/AIRecommendationsScreen';

// Subscription screens
import SubscriptionPlansScreen from '../screens/subscription/SubscriptionPlansScreen';
import SubscriptionManagementScreen from '../screens/subscription/SubscriptionManagementScreen';
import SubscriptionSuccessScreen from '../screens/subscription/SubscriptionSuccessScreen';
import AutoRenewalSettingsScreen from '../screens/subscription/AutoRenewalSettingsScreen';
import CoinPaymentScreen from '../screens/subscription/CoinPaymentScreen';

// Admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import TransactionMonitoringScreen from '../screens/admin/TransactionMonitoringScreen';
import DisputeManagementScreen from '../screens/admin/DisputeManagementScreen';
import CryptoPaymentSettingsScreen from '../screens/admin/CryptoPaymentSettingsScreen';
import CryptoPaymentConfirmationScreen from '../screens/admin/CryptoPaymentConfirmationScreen';
import AuctionManagementScreen from '../screens/admin/AuctionManagementScreen';
import NFTManagementScreen from '../screens/admin/NFTManagementScreen';
import GamificationAdminScreen from '../screens/admin/GamificationAdminScreen';
import CreateChallengeScreen from '../screens/admin/CreateChallengeScreen';
import ManageAchievementsScreen from '../screens/admin/ManageAchievementsScreen';

// Crypto Gateway screens
import CryptoGatewaySelectionScreen from '../screens/crypto/CryptoGatewaySelectionScreen';
import CoinPurchaseAmountScreen from '../screens/crypto/CoinPurchaseAmountScreen';
import CryptoPaymentScreen from '../screens/crypto/CryptoPaymentScreen';
import PaymentStatusScreen from '../screens/crypto/PaymentStatusScreen';
import CryptoTransactionHistoryScreen from '../screens/crypto/CryptoTransactionHistoryScreen';

// Analytics screens
import DonationHeatmapScreen from '../screens/analytics/DonationHeatmapScreen';
import GivingTrendsScreen from '../screens/analytics/GivingTrendsScreen';
import CoinROIScreen from '../screens/analytics/CoinROIScreen';
import SocialImpactScoreScreen from '../screens/analytics/SocialImpactScoreScreen';

// Social screens
import CircleChatScreen from '../screens/social/CircleChatScreen';
import CircleLeaderboardScreen from '../screens/social/CircleLeaderboardScreen';
import PostDetailScreen from '../screens/social/PostDetailScreen';
import BoostPostScreen from '../screens/social/BoostPostScreen';
import LiveEventsScreen from '../screens/social/LiveEventsScreen';
import EventDetailScreen from '../screens/social/EventDetailScreen';
import EventParticipantsScreen from '../screens/social/EventParticipantsScreen';
import EventResultsScreen from '../screens/social/EventResultsScreen';

// Advanced Gamification screens
import ChallengeDetailScreen from '../screens/gamification/ChallengeDetailScreen';
import ChallengeProgressScreen from '../screens/gamification/ChallengeProgressScreen';
import ChallengeRewardsScreen from '../screens/gamification/ChallengeRewardsScreen';
import BattlePassRewardsScreen from '../screens/gamification/BattlePassRewardsScreen';
import BattlePassProgressScreen from '../screens/gamification/BattlePassProgressScreen';

// Marketplace 2.0 screens
import AuctionDetailScreen from '../screens/marketplace/AuctionDetailScreen';
import BidHistoryScreen from '../screens/marketplace/BidHistoryScreen';
import MyBidsScreen from '../screens/marketplace/MyBidsScreen';
import LiveAuctionScreen from '../screens/marketplace/LiveAuctionScreen';
import PriceAlertsScreen from '../screens/marketplace/PriceAlertsScreen';
import P2PMarketplaceScreen from '../screens/marketplace/P2PMarketplaceScreen';
import ListItemScreen from '../screens/marketplace/ListItemScreen';
import TradeDetailScreen from '../screens/marketplace/TradeDetailScreen';
import MyListingsScreen from '../screens/marketplace/MyListingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Check if user needs onboarding (new user or incomplete profile)
  const needsOnboarding = user && (!user.isVerified || user.tier === 'Tier 1');

  const linking: LinkingOptions<any> = {
    prefixes: ['chaingive://', 'https://chaingive.ng/app'],
    config: {
      screens: {
        Auth: {
          screens: {
            Login: 'login',
            Register: 'register',
            OTP: 'otp',
          },
        },
        Main: {
          screens: {
            Home: {
              screens: {
                HomeScreen: 'home',
                TransactionHistory: 'transactions',
              },
            },
            Marketplace: 'marketplace',
            Profile: 'profile',
          },
        },
        // Advanced Gamification deep links
        CharityCategories: 'gamification/categories',
        CrewDashboard: 'gamification/crews',
        TrustReviewHub: 'gamification/trust',
        WeeklyTargets: 'gamification/targets',
        UserLevels: 'gamification/levels',
        CharitableNFTGallery: 'gamification/nfts',
        // Merchant deep links
        MerchantDirectory: 'merchant/directory',
        MerchantDetail: 'merchant/:merchantId',
        QRPayment: 'merchant/:merchantId/pay/:amount',
        MerchantDashboard: 'merchant/dashboard',
        // Corporate deep links
        CorporateSignup: 'corporate/signup',
        CorporateDashboard: 'corporate/dashboard',
        TeamManagement: 'corporate/team',
        CSRTracking: 'corporate/csr',
        BulkOperations: 'corporate/bulk',
        // AI deep links
        SmartAssistant: 'ai/assistant',
        DonationRecommendationCard: 'ai/recommendation/:recommendationId',
        OptimalTimingWidget: 'ai/timing',
        AIInsightsDashboard: 'ai/insights',
        AIMatching: 'ai/matching',
        AIRecommendations: 'ai/recommendations',
        // Crypto Gateway deep links
        CryptoGatewaySelection: 'crypto/gateways',
        CoinPurchaseAmount: 'crypto/purchase/:gateway',
        CryptoPayment: 'crypto/payment/:purchaseId',
        PaymentStatus: 'crypto/status/:transactionId',
        CryptoTransactionHistory: 'crypto/history',
        // Analytics deep links
        DonationHeatmap: 'analytics/heatmap',
        GivingTrends: 'analytics/trends',
        CoinROI: 'analytics/roi',
        SocialImpactScore: 'analytics/impact',
        // Social deep links
        CircleChat: 'social/circle/:circleId/chat',
        CircleLeaderboard: 'social/circle/:circleId/leaderboard',
        PostDetail: 'social/post/:postId',
        BoostPost: 'social/post/:postId/boost',
        LiveEvents: 'social/events',
        EventDetail: 'social/event/:eventId',
        EventParticipants: 'social/event/:eventId/participants',
        EventResults: 'social/event/:eventId/results',
        // Advanced Gamification deep links
        ChallengeDetail: 'gamification/challenge/:challengeId',
        ChallengeProgress: 'gamification/challenge/:challengeId/progress',
        ChallengeRewards: 'gamification/challenge/:challengeId/rewards',
        BattlePassRewards: 'gamification/battlepass/:seasonId/rewards',
        BattlePassProgress: 'gamification/battlepass/:seasonId/progress',
        // Marketplace 2.0 deep links
        AuctionDetail: 'marketplace/auction/:auctionId',
        BidHistory: 'marketplace/auction/:auctionId/bids',
        MyBids: 'marketplace/my-bids',
        LiveAuction: 'marketplace/auction/:auctionId/live',
        PriceAlerts: 'marketplace/alerts',
        P2PMarketplace: 'marketplace/p2p',
        ListItem: 'marketplace/list',
        TradeDetail: 'marketplace/trade/:tradeId',
        MyListings: 'marketplace/my-listings',
        // Subscription deep links
        SubscriptionPlans: 'subscription/plans',
        SubscriptionManagement: 'subscription/manage',
        SubscriptionSuccess: 'subscription/success/:planId',
        AutoRenewalSettings: 'subscription/renewal',
        CoinPayment: 'subscription/payment/:planId/:amount',
        // Admin deep links
        AdminDashboard: 'admin/dashboard',
        UserManagement: 'admin/users/:filter?',
        TransactionMonitoring: 'admin/transactions/:filter?',
        DisputeManagement: 'admin/disputes',
        CryptoPaymentSettings: 'admin/crypto/settings',
        CryptoPaymentConfirmation: 'admin/crypto/confirmation',
        AuctionManagement: 'admin/auctions',
        NFTManagement: 'admin/nfts',
        GamificationAdmin: 'admin/gamification',
        CreateChallenge: 'admin/challenge/create',
        ManageAchievements: 'admin/achievements',
      },
    },
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : needsOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}

      {/* Premium screens - accessible from anywhere */}
      <Stack.Screen name="NFTGallery" component={NFTGalleryScreen} />
      <Stack.Screen name="NFTMinting" component={NFTMintingScreen} />
      <Stack.Screen name="SocialFeed" component={SocialFeedScreen} />
      <Stack.Screen name="SocialChallenges" component={SocialChallengesScreen} />
      <Stack.Screen name="PredictiveInsights" component={PredictiveInsightsScreen} />
      <Stack.Screen name="GivingPredictions" component={GivingPredictionsScreen} />
      <Stack.Screen name="CoinBattlePass" component={CoinBattlePassScreen} />
      <Stack.Screen name="CoinAnalytics" component={CoinAnalyticsScreen} />

      {/* Advanced Gamification screens - accessible from anywhere */}
      <Stack.Screen name="CharityCategories" component={CharityCategoriesScreen} />
      <Stack.Screen name="CrewDashboard" component={CrewDashboardScreen} />
      <Stack.Screen name="TrustReviewHub" component={TrustReviewHubScreen} />
      <Stack.Screen name="WeeklyTargets" component={WeeklyTargetsScreen} />
      <Stack.Screen name="UserLevels" component={UserLevelsScreen} />
      <Stack.Screen name="CharitableNFTGallery" component={CharitableNFTGalleryScreen} />

      {/* Merchant screens */}
      <Stack.Screen name="MerchantDirectory" component={MerchantDirectoryScreen} />
      <Stack.Screen name="MerchantDetail" component={MerchantDetailScreen} />
      <Stack.Screen name="QRPayment" component={QRPaymentScreen} />
      <Stack.Screen name="MerchantDashboard" component={MerchantDashboardScreen} />

      {/* Corporate screens */}
      <Stack.Screen name="CorporateSignup" component={CorporateSignupScreen} />
      <Stack.Screen name="CorporateDashboard" component={CorporateDashboardScreen} />
      <Stack.Screen name="TeamManagement" component={TeamManagementScreen} />
      <Stack.Screen name="CSRTracking" component={CSRTrackingScreen} />
      <Stack.Screen name="BulkOperations" component={BulkOperationsScreen} />

      {/* AI screens */}
      <Stack.Screen name="SmartAssistant" component={SmartAssistantScreen} />
      <Stack.Screen name="DonationRecommendationCard" component={DonationRecommendationCard} />
      <Stack.Screen name="OptimalTimingWidget" component={OptimalTimingWidget} />
      <Stack.Screen name="AIInsightsDashboard" component={AIInsightsDashboard} />
      <Stack.Screen name="AIMatching" component={AIMatchingScreen} />
      <Stack.Screen name="AIRecommendations" component={AIRecommendationsScreen} />

      {/* Subscription screens */}
      <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
      <Stack.Screen name="SubscriptionManagement" component={SubscriptionManagementScreen} />
      <Stack.Screen name="SubscriptionSuccess" component={SubscriptionSuccessScreen} />
      <Stack.Screen name="AutoRenewalSettings" component={AutoRenewalSettingsScreen} />
      <Stack.Screen name="CoinPayment" component={CoinPaymentScreen} />

      {/* Admin screens */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="TransactionMonitoring" component={TransactionMonitoringScreen} />
      <Stack.Screen name="DisputeManagement" component={DisputeManagementScreen} />
      <Stack.Screen name="CryptoPaymentSettings" component={CryptoPaymentSettingsScreen} />
      <Stack.Screen name="CryptoPaymentConfirmation" component={CryptoPaymentConfirmationScreen} />
      <Stack.Screen name="AuctionManagement" component={AuctionManagementScreen} />
      <Stack.Screen name="NFTManagement" component={NFTManagementScreen} />
      <Stack.Screen name="GamificationAdmin" component={GamificationAdminScreen} />
      <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} />
      <Stack.Screen name="ManageAchievements" component={ManageAchievementsScreen} />

      {/* Crypto Gateway screens */}
      <Stack.Screen name="CryptoGatewaySelection" component={CryptoGatewaySelectionScreen} />
      <Stack.Screen name="CoinPurchaseAmount" component={CoinPurchaseAmountScreen} />
      <Stack.Screen name="CryptoPayment" component={CryptoPaymentScreen} />
      <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
      <Stack.Screen name="CryptoTransactionHistory" component={CryptoTransactionHistoryScreen} />

      {/* Analytics screens */}
      <Stack.Screen name="DonationHeatmap" component={DonationHeatmapScreen} />
      <Stack.Screen name="GivingTrends" component={GivingTrendsScreen} />
      <Stack.Screen name="CoinROI" component={CoinROIScreen} />
      <Stack.Screen name="SocialImpactScore" component={SocialImpactScoreScreen} />

      {/* Social screens */}
      <Stack.Screen name="CircleChat" component={CircleChatScreen} />
      <Stack.Screen name="CircleLeaderboard" component={CircleLeaderboardScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="BoostPost" component={BoostPostScreen} />
      <Stack.Screen name="LiveEvents" component={LiveEventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="EventParticipants" component={EventParticipantsScreen} />
      <Stack.Screen name="EventResults" component={EventResultsScreen} />

      {/* Advanced Gamification screens */}
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <Stack.Screen name="ChallengeProgress" component={ChallengeProgressScreen} />
      <Stack.Screen name="ChallengeRewards" component={ChallengeRewardsScreen} />
      <Stack.Screen name="BattlePassRewards" component={BattlePassRewardsScreen} />
      <Stack.Screen name="BattlePassProgress" component={BattlePassProgressScreen} />

      {/* Marketplace 2.0 screens */}
      <Stack.Screen name="AuctionDetail" component={AuctionDetailScreen} />
      <Stack.Screen name="BidHistory" component={BidHistoryScreen} />
      <Stack.Screen name="MyBids" component={MyBidsScreen} />
      <Stack.Screen name="LiveAuction" component={LiveAuctionScreen} />
      <Stack.Screen name="PriceAlerts" component={PriceAlertsScreen} />
      <Stack.Screen name="P2PMarketplace" component={P2PMarketplaceScreen} />
      <Stack.Screen name="ListItem" component={ListItemScreen} />
      <Stack.Screen name="TradeDetail" component={TradeDetailScreen} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;