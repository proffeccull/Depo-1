/**
 * API Type Definitions
 * Centralized type definitions for all API requests and responses
 */

// ============================================
// COMMON TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
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

// ============================================
// AUTH TYPES
// ============================================

export interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface RegisterData {
  phoneNumber: string;
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface OTPVerification {
  phoneNumber: string;
  otp: string;
}

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: string;
  tier: number;
  trustScore: number;
  totalCyclesCompleted: number;
  totalDonated: number;
  totalReceived: number;
  charityCoinsBalance: number;
  kycStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  profilePictureUrl?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  locationCity?: string;
  locationState?: string;
  preferredLanguage: string;
}

// ============================================
// WALLET TYPES
// ============================================

export interface Wallet {
  id: string;
  fiatBalance: number;
  receivableBalance: number;
  pendingObligations: number;
  totalInflows: number;
  totalOutflows: number;
}

export interface Transaction {
  id: string;
  transactionRef: string;
  type: string;
  fromUserId?: string;
  toUserId?: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'in_transit' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DepositRequest {
  amount: number;
  method: string;
}

export interface WithdrawalRequest {
  amount: number;
  bankAccountId: string;
}

// ============================================
// DONATION TYPES
// ============================================

export interface DonationRequest {
  amount: number;
  recipientPreference?: 'nearby' | 'trusted' | 'newbie';
}

export interface Cycle {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'in_transit' | 'received' | 'obligated' | 'fulfilled' | 'defaulted';
  receivedFromUserId?: string;
  givenToUserId?: string;
  dueDate?: string;
  receivedAt?: string;
  fulfilledAt?: string;
  charityCoinsEarned: number;
  cycleNumber: number;
  isSecondDonation: boolean;
  createdAt: string;
}

export interface Match {
  id: string;
  donor: User;
  recipient: User;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed';
  matchedAt: string;
  expiresAt?: string;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export interface Mission {
  id: string;
  type: string;
  title: string;
  description: string;
  coinsReward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
}

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface ProgressRing {
  type: 'donations' | 'verifications' | 'referrals';
  current: number;
  goal: number;
  percentage: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  target: number;
  coinsReward: number;
  startsAt: string;
  endsAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  coinsReward: number;
  badgeIcon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

// ============================================
// MARKETPLACE TYPES
// ============================================

export interface MarketplaceItem {
  id: string;
  vendorName: string;
  itemName: string;
  description?: string;
  category: string;
  coinPrice: number;
  realValue: number;
  stockQuantity: number;
  isInStock: boolean;
  imageUrl?: string;
  rating: number;
  totalRedemptions: number;
}

export interface Redemption {
  id: string;
  listing: MarketplaceItem;
  coinsSpent: number;
  realValue: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  deliveryMethod?: string;
  deliveryData?: any;
  createdAt: string;
  completedAt?: string;
}

export interface RedeemRequest {
  listingId: string;
  quantity?: number;
  deliveryInfo?: any;
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
  rank: number;
  user: User;
  totalScore: number;
  totalDonations: number;
  cyclesCompleted: number;
  coinsEarned: number;
}

export interface LeaderboardFilters {
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  location?: string;
  tier?: number;
}

// ============================================
// AGENT TYPES
// ============================================

export interface Agent {
  id: string;
  userId: string;
  agentCode: string;
  coinBalance: number;
  totalCoinsStocked: number;
  totalCoinsSold: number;
  lifetimeRevenue: number;
  rating: number;
  isActive: boolean;
}

export interface CoinSale {
  id: string;
  agent: Agent;
  user: User;
  quantity: number;
  pricePerCoin: number;
  totalPrice: number;
  status: 'pending' | 'escrowed' | 'hold' | 'completed' | 'cancelled';
  expiresAt?: string;
  createdAt: string;
}

export interface CoinPurchaseRequest {
  agentId: string;
  quantity: number;
  pricePerCoin: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// REFERRAL TYPES
// ============================================

export interface Referral {
  id: string;
  referrerId: string;
  referredUser: User;
  referralCode: string;
  status: 'registered' | 'first_cycle' | 'completed';
  coinsEarned: number;
  registeredAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  totalCoinsEarned: number;
  referralCode: string;
}
