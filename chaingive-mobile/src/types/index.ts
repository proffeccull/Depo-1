// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  trustScore: number;
  isAgent: boolean;
  isVerified: boolean;
  role: 'regular' | 'agent' | 'admin'; // User role system
  permissions: UserPermissions; // Granular permissions
  // Aggregated wallet fields for convenient access in UI
  // Source of truth may live in Wallet; these are mirrored snapshots
  balance?: number;
  charityCoins?: number;
  createdAt: string;
  updatedAt: string;
}

// User Role and Permissions System
export type UserRole = 'regular' | 'agent' | 'admin';

export interface UserPermissions {
  // Gamification permissions
  canCreateCharityCategories: boolean;
  canManageNFTs: boolean;
  canModerateReviews: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;

  // Agent permissions
  canVerifyUsers: boolean;
  canProcessDeposits: boolean;
  canManageCoinPurchases: boolean;

  // Admin permissions
  canAssignRoles: boolean;
  canManageAdmins: boolean;
  canAccessSystemSettings: boolean;
  canViewAuditLogs: boolean;
}

// Default permissions for each role
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  regular: {
    canCreateCharityCategories: false,
    canManageNFTs: false,
    canModerateReviews: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSystem: false,
    canVerifyUsers: false,
    canProcessDeposits: false,
    canManageCoinPurchases: false,
    canAssignRoles: false,
    canManageAdmins: false,
    canAccessSystemSettings: false,
    canViewAuditLogs: false,
  },
  agent: {
    canCreateCharityCategories: false,
    canManageNFTs: false,
    canModerateReviews: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSystem: false,
    canVerifyUsers: true,
    canProcessDeposits: true,
    canManageCoinPurchases: true,
    canAssignRoles: false,
    canManageAdmins: false,
    canAccessSystemSettings: false,
    canViewAuditLogs: false,
  },
  admin: {
    canCreateCharityCategories: true,
    canManageNFTs: true,
    canModerateReviews: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageSystem: true,
    canVerifyUsers: true,
    canProcessDeposits: true,
    canManageCoinPurchases: true,
    canAssignRoles: true,
    canManageAdmins: true,
    canAccessSystemSettings: true,
    canViewAuditLogs: true,
  },
};

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  charityCoins: number;
  totalDonated: number;
  totalReceived: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'donation_sent' | 'donation_received' | 'redemption';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

// Donation Cycle Types
export interface DonationCycle {
  id: string;
  donorId: string;
  recipientId: string;
  amount: number;
  status: 'pending' | 'matched' | 'confirmed' | 'completed' | 'defaulted';
  dueDate: string;
  confirmedAt?: string;
  completedAt?: string;
  charityCoinsEarned: number;
  createdAt: string;
  updatedAt: string;
}

// Marketplace Types
export interface MarketplaceItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  category: 'airtime' | 'data' | 'vouchers' | 'services';
  price: number; // in Charity Coins
  originalPrice?: number; // in Naira
  image: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Redemption {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  totalCoins: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  deliveryInfo?: {
    phoneNumber?: string;
    email?: string;
    address?: string;
  };
  voucherCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Checklist Types
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'setup' | 'verification' | 'donation' | 'marketplace';
  order: number;
  requiredFor?: string; // What this unlocks
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  userId: string;
  completedItems: string[];
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  updatedAt: string;
}

// Agent Types
export interface Agent {
  id: string;
  userId: string;
  agentCode: string;
  location: {
    state: string;
    city: string;
    address: string;
  };
  rating: number;
  totalVerifications: number;
  totalDeposits: number;
  commissionEarned: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  agentId: string;
  type: 'tier2' | 'tier3';
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    selfie?: string;
    idCard?: string;
    utilityBill?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  // Premium screens
  NFTGallery: undefined;
  NFTMinting: { achievementId: string };
  SocialFeed: undefined;
  SocialChallenges: undefined;
  PredictiveInsights: undefined;
  GivingPredictions: undefined;
  CoinBattlePass: undefined;
  CoinAnalytics: undefined;
  // Advanced Gamification screens
  CharityCategories: undefined;
  CrewDashboard: undefined;
  TrustReviewHub: undefined;
  WeeklyTargets: undefined;
  UserLevels: undefined;
  CharitableNFTGallery: undefined;
  // Merchant screens
  MerchantDirectory: undefined;
  MerchantDetail: { merchantId: string };
  QRPayment: { merchantId: string; amount: number };
  MerchantDashboard: undefined;
  // Corporate screens
  CorporateSignup: undefined;
  CorporateDashboard: undefined;
  TeamManagement: undefined;
  CSRTracking: undefined;
  BulkOperations: undefined;
  // AI screens
  SmartAssistant: undefined;
  DonationRecommendationCard: { recommendationId: string };
  OptimalTimingWidget: undefined;
  AIInsightsDashboard: undefined;
  AIMatching: undefined;
  AIRecommendations: undefined;
  // Crypto Gateway screens
  CryptoGatewaySelection: undefined;
  CoinPurchaseAmount: { gateway: string };
  CryptoPayment: { purchaseId: string };
  PaymentStatus: { transactionId: string };
  CryptoTransactionHistory: undefined;
  // Analytics screens
  DonationHeatmap: undefined;
  GivingTrends: undefined;
  CoinROI: undefined;
  SocialImpactScore: undefined;
  // Social screens
  CircleChat: { circleId: string };
  CircleLeaderboard: { circleId: string };
  PostDetail: { postId: string };
  BoostPost: { postId: string };
  LiveEvents: undefined;
  EventDetail: { eventId: string };
  EventParticipants: { eventId: string };
  EventResults: { eventId: string };
  // Advanced Gamification screens
  ChallengeDetail: { challengeId: string };
  ChallengeProgress: { challengeId: string };
  ChallengeRewards: { challengeId: string };
  BattlePassRewards: { seasonId: string };
  BattlePassProgress: { seasonId: string };
  // Marketplace 2.0 screens
  AuctionDetail: { auctionId: string };
  BidHistory: { auctionId: string };
  MyBids: undefined;
  LiveAuction: { auctionId: string };
  PriceAlerts: undefined;
  P2PMarketplace: undefined;
  ListItem: undefined;
  TradeDetail: { tradeId: string };
  MyListings: undefined;
  // Subscription screens
  SubscriptionPlans: undefined;
  SubscriptionManagement: undefined;
  SubscriptionSuccess: { plan: any };
  AutoRenewalSettings: undefined;
  CoinPayment: { planId: string; amount: number };
  // Admin screens
  AdminDashboard: undefined;
  UserManagement: { filter?: string };
  TransactionMonitoring: { filter?: string };
  DisputeManagement: undefined;
  CryptoPaymentSettings: undefined;
  CryptoPaymentConfirmation: undefined;
  AuctionManagement: undefined;
  NFTManagement: undefined;
  GamificationAdmin: undefined;
  CreateChallenge: undefined;
  ManageAchievements: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OTP: { phoneNumber: string };
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Missions: undefined;
  Leaderboard: undefined;
  Marketplace: undefined;
  Referral: undefined;
  Profile: undefined;
  Agent?: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  GiveScreen: undefined;
  DepositScreen: undefined;
  WithdrawScreen: undefined;
  TransactionHistory: undefined;
  TransactionDetailHome: { transactionId: string };
  CycleDetail: { cycleId: string };
  CycleHistory: undefined;
  CoinPurchase: undefined;
  Achievements: undefined;
  WeeklyChallenges: undefined;
  // Admin Screens
  AdminDashboard: undefined;
  UserManagement: { filter?: string };
  TransactionMonitoring: { filter?: string };
  DisputeManagement: undefined;
  UserDetail: { userId: string };
  TransactionDetailAdmin: { transactionId: string };
  ActivityLog: undefined;
  AgentManagement: undefined;
  AdminSettings: undefined;
  CryptoPaymentSettings: undefined;
  CryptoPaymentConfirmation: undefined;
  // Gamification Admin
  GamificationAdminDashboard: undefined;
  UserRoleManagement: { userId?: string };
  PermissionManagement: { role?: UserRole };
};

export type MarketplaceStackParamList = {
  MarketplaceScreen: undefined;
  ItemDetail: { itemId: string };
  Checkout: { itemId: string; quantity: number };
  RedemptionHistory: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  KYCVerification: undefined;
  Help: undefined;
  Notifications: undefined;
  // Admin access from profile
  AdminDashboard: undefined;
};

export type AgentStackParamList = {
  AgentDashboard: undefined;
  VerifyUser: undefined;
  CashDeposit: undefined;
  VerificationDetail: { requestId: string };
  BuyCoinsWithCrypto: undefined;
  ConfirmCoinPayment: { purchaseId: string };
  PendingCoinPurchases: undefined;
};