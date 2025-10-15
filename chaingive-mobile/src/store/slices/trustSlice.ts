import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS, handleApiError } from '../../services/api';

// Types
export interface TrustReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  recipientId: string;
  recipientName: string;
  transactionId: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  reviewText: string;
  videoUrl?: string;
  videoThumbnail?: string;
  isVerified: boolean;
  isAnonymous: boolean;
  helpfulVotes: number;
  reportedCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: TrustAIAnalysis;
}

export interface TrustAIAnalysis {
  authenticityScore: number;
  fakeDetectionConfidence: number;
  sentimentScore: number;
  keyPhrases: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  processedAt: string;
}

export interface TrustLevel {
  userId: string;
  level: number;
  xp: number;
  totalReviews: number;
  averageRating: number;
  trustScore: number;
  badges: TrustBadge[];
  verifiedReviews: number;
  helpfulReviews: number;
  streakDays: number;
  lastActivity: string;
  nextLevelXP: number;
}

export interface TrustBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  criteria: string;
}

export interface TrustChallenge {
  id: string;
  title: string;
  description: string;
  type: 'review_count' | 'rating_average' | 'streak_days' | 'helpful_votes';
  target: number;
  current: number;
  rewardXP: number;
  rewardCoins: number;
  timeLimit?: string; // ISO date string
  isCompleted: boolean;
  progress: number;
  category?: string;
}

export interface TrustLeaderboard {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'allTime';
  entries: TrustLeaderboardEntry[];
  lastUpdated: string;
  totalParticipants: number;
}

export interface TrustLeaderboardEntry {
  userId: string;
  userName: string;
  trustScore: number;
  level: number;
  totalReviews: number;
  averageRating: number;
  rank: number;
  change: number;
  badges: string[]; // Badge IDs
}

export interface TrustSettings {
  userId: string;
  requireVideoReviews: boolean;
  allowAnonymousReviews: boolean;
  autoApproveTrustedUsers: boolean;
  notificationPreferences: {
    newReviews: boolean;
    reviewResponses: boolean;
    trustLevelUp: boolean;
    badgeUnlocks: boolean;
    challenges: boolean;
  };
  privacySettings: {
    showTrustScore: boolean;
    showReviewHistory: boolean;
    showBadges: boolean;
  };
}

interface TrustState {
  reviews: TrustReview[];
  userTrustLevel: TrustLevel | null;
  trustChallenges: TrustChallenge[];
  trustLeaderboard: TrustLeaderboard | null;
  trustSettings: TrustSettings | null;
  pendingReviews: TrustReview[];
  userReviews: TrustReview[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: TrustState = {
  reviews: [],
  userTrustLevel: null,
  trustChallenges: [],
  trustLeaderboard: null,
  trustSettings: null,
  pendingReviews: [],
  userReviews: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks with real API integration
export const fetchTrustReviews = createAsyncThunk(
  'trust/fetchReviews',
  async (filters: {
    userId?: string;
    categoryId?: string;
    rating?: number;
    status?: string;
    limit?: number;
    offset?: number;
  } | undefined, { rejectWithValue }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `${API_ENDPOINTS.TRUST.REVIEWS}?${queryParams}`;
    const response = await apiClient.get(endpoint);

    if (!response.success) {
      return rejectWithValue(handleApiError(response.error || 'Failed to fetch trust reviews'));
    }

    return response.data;
  }
);

export const submitTrustReview = createAsyncThunk(
  'trust/submitReview',
  async (reviewData: {
    reviewerId: string;
    recipientId: string;
    transactionId: string;
    amount: number;
    categoryId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    reviewText: string;
    videoUrl?: string;
    isAnonymous: boolean;
  }) => {
    const response = await fetch('/api/trust/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return response.json();
  }
);

export const uploadReviewVideo = createAsyncThunk(
  'trust/uploadVideo',
  async ({ reviewId, videoUri, userId }: {
    reviewId: string;
    videoUri: string;
    userId: string;
  }) => {
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: `review_${reviewId}.mp4`,
    } as any);
    formData.append('reviewId', reviewId);
    formData.append('userId', userId);

    const response = await fetch('/api/trust/reviews/upload-video', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.json();
  }
);

export const fetchUserTrustLevel = createAsyncThunk(
  'trust/fetchUserLevel',
  async (userId: string) => {
    const response = await fetch(`/api/trust/users/${userId}/level`);
    return response.json();
  }
);

export const fetchTrustChallenges = createAsyncThunk(
  'trust/fetchChallenges',
  async (userId: string) => {
    const response = await fetch(`/api/trust/users/${userId}/challenges`);
    return response.json();
  }
);

export const fetchTrustLeaderboard = createAsyncThunk(
  'trust/fetchLeaderboard',
  async (timeframe: string = 'weekly') => {
    const response = await fetch(`/api/trust/leaderboard?timeframe=${timeframe}`);
    return response.json();
  }
);

export const updateTrustSettingsAsync = createAsyncThunk(
  'trust/updateSettings',
  async ({ userId, settings }: { userId: string; settings: Partial<TrustSettings> }) => {
    const response = await fetch(`/api/trust/users/${userId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return response.json();
  }
);

export const voteReviewHelpful = createAsyncThunk(
  'trust/voteHelpful',
  async ({ reviewId, userId, isHelpful }: {
    reviewId: string;
    userId: string;
    isHelpful: boolean;
  }) => {
    const response = await fetch(`/api/trust/reviews/${reviewId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isHelpful }),
    });
    return response.json();
  }
);

export const reportReview = createAsyncThunk(
  'trust/reportReview',
  async ({ reviewId, userId, reason, description }: {
    reviewId: string;
    userId: string;
    reason: string;
    description?: string;
  }) => {
    const response = await fetch(`/api/trust/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason, description }),
    });
    return response.json();
  }
);

export const moderateReview = createAsyncThunk(
  'trust/moderateReview',
  async ({ reviewId, moderatorId, action, reason }: {
    reviewId: string;
    moderatorId: string;
    action: 'approve' | 'reject' | 'flag';
    reason?: string;
  }) => {
    const response = await fetch(`/api/trust/admin/reviews/${reviewId}/moderate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moderatorId, action, reason }),
    });
    return response.json();
  }
);

// Slice
const trustSlice = createSlice({
  name: 'trust',
  initialState,
  reducers: {
    updateTrustReview: (state, action: PayloadAction<TrustReview>) => {
      const index = state.reviews.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
      // Also update in userReviews if present
      const userIndex = state.userReviews.findIndex(r => r.id === action.payload.id);
      if (userIndex !== -1) {
        state.userReviews[userIndex] = action.payload;
      }
    },
    updateTrustLevel: (state, action: PayloadAction<TrustLevel>) => {
      state.userTrustLevel = action.payload;
    },
    updateTrustChallenge: (state, action: PayloadAction<TrustChallenge>) => {
      const index = state.trustChallenges.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.trustChallenges[index] = action.payload;
      }
    },
    updateTrustLeaderboard: (state, action: PayloadAction<TrustLeaderboard>) => {
      state.trustLeaderboard = action.payload;
    },
    updateTrustSettings: (state, action: PayloadAction<TrustSettings>) => {
      state.trustSettings = action.payload;
    },
    addPendingReview: (state, action: PayloadAction<TrustReview>) => {
      state.pendingReviews.push(action.payload);
    },
    removePendingReview: (state, action: PayloadAction<string>) => {
      state.pendingReviews = state.pendingReviews.filter(r => r.id !== action.payload);
    },
    clearTrustError: (state) => {
      state.error = null;
    },
    resetTrustState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch trust reviews
    builder
      .addCase(fetchTrustReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrustReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = (action.payload as any).reviews || action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchTrustReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      });

    // Submit trust review
    builder
      .addCase(submitTrustReview.fulfilled, (state, action) => {
        state.pendingReviews.push(action.payload.review);
        // Update user's trust level XP
        if (state.userTrustLevel) {
          state.userTrustLevel.xp += 10; // XP for submitting review
          state.userTrustLevel.totalReviews += 1;
        }
      });

    // Upload review video
    builder
      .addCase(uploadReviewVideo.fulfilled, (state, action) => {
        const review = state.pendingReviews.find(r => r.id === action.payload.reviewId);
        if (review) {
          review.videoUrl = action.payload.videoUrl;
          review.videoThumbnail = action.payload.thumbnailUrl;
          review.isVerified = true;
        }
      });

    // Fetch user trust level
    builder
      .addCase(fetchUserTrustLevel.fulfilled, (state, action) => {
        state.userTrustLevel = action.payload.trustLevel;
      });

    // Fetch trust challenges
    builder
      .addCase(fetchTrustChallenges.fulfilled, (state, action) => {
        state.trustChallenges = action.payload.challenges;
      });

    // Fetch trust leaderboard
    builder
      .addCase(fetchTrustLeaderboard.fulfilled, (state, action) => {
        state.trustLeaderboard = action.payload.leaderboard;
      });

    // Update trust settings
    builder
      .addCase(updateTrustSettingsAsync.fulfilled, (state, action) => {
        state.trustSettings = action.payload.settings;
      });

    // Vote review helpful
    builder
      .addCase(voteReviewHelpful.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r.id === action.payload.reviewId);
        if (review) {
          review.helpfulVotes = action.payload.helpfulVotes;
        }
        // Award XP for helpful votes
        if (state.userTrustLevel && action.payload.votedUserId === state.userTrustLevel.userId) {
          state.userTrustLevel.xp += 2;
        }
      });

    // Report review
    builder
      .addCase(reportReview.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r.id === action.payload.reviewId);
        if (review) {
          review.reportedCount = action.payload.reportedCount;
          review.status = action.payload.status;
        }
      });

    // Moderate review
    builder
      .addCase(moderateReview.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r.id === action.payload.reviewId);
        if (review) {
          review.status = action.payload.status;
          review.updatedAt = new Date().toISOString();
        }
        // Remove from pending if approved/rejected
        if (action.payload.status !== 'pending') {
          state.pendingReviews = state.pendingReviews.filter(r => r.id !== action.payload.reviewId);
        }
      });
  },
});

export const {
  updateTrustReview,
  updateTrustLevel,
  updateTrustChallenge,
  updateTrustLeaderboard,
  updateTrustSettings: updateTrustSettingsAction,
  addPendingReview,
  removePendingReview,
  clearTrustError,
  resetTrustState,
} = trustSlice.actions;

export default trustSlice.reducer;