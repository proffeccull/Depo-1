import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface GivingCircle {
  id: string;
  name: string;
  description: string;
  image?: string;
  coverImage?: string;
  creatorId: string;
  memberCount: number;
  maxMembers: number;
  totalDonated: number;
  totalCycles: number;
  isPrivate: boolean;
  joinFee: number; // coins
  monthlyFee: number; // coins
  tags: string[];
  rules: string[];
  createdAt: string;
  lastActivity: string;
}

interface CircleMember {
  id: string;
  userId: string;
  circleId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  totalContributed: number;
  cyclesCompleted: number;
  isActive: boolean;
}

interface CircleActivity {
  id: string;
  circleId: string;
  userId: string;
  type: 'donation' | 'joined' | 'left' | 'achievement' | 'milestone';
  description: string;
  amount?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  type: 'group_donation' | 'member_challenge' | 'circle_competition';
  targetAmount: number;
  currentAmount: number;
  participantCount: number;
  maxParticipants?: number;
  rewardCoins: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  circleId?: string; // null for global challenges
  participants: ChallengeParticipant[];
}

interface ChallengeParticipant {
  userId: string;
  circleId?: string;
  contributedAmount: number;
  joinedAt: string;
  isCompleted: boolean;
}

interface SocialFeedItem {
  id: string;
  userId: string;
  type: 'achievement' | 'donation' | 'circle_join' | 'challenge_complete' | 'milestone';
  title: string;
  description: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  metadata?: Record<string, any>;
}

interface SocialState {
  circles: GivingCircle[];
  myCircles: GivingCircle[];
  circleMembers: Record<string, CircleMember[]>;
  circleActivities: Record<string, CircleActivity[]>;
  socialChallenges: SocialChallenge[];
  socialFeed: SocialFeedItem[];
  userConnections: string[]; // user IDs
  pendingInvites: CircleInvite[];
  filters: SocialFilters;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

interface CircleInvite {
  id: string;
  circleId: string;
  invitedBy: string;
  invitedUser: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface SocialFilters {
  circleCategory?: string;
  challengeType?: string;
  sortBy?: 'newest' | 'popular' | 'trending';
  showPrivate?: boolean;
}

// Initial state
const initialState: SocialState = {
  circles: [],
  myCircles: [],
  circleMembers: {},
  circleActivities: {},
  socialChallenges: [],
  socialFeed: [],
  userConnections: [],
  pendingInvites: [],
  filters: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchGivingCircles = createAsyncThunk(
  'social/fetchCircles',
  async (filters?: SocialFilters) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(`/api/social/circles?${queryParams}`);
    return response.json();
  }
);

export const fetchMyCircles = createAsyncThunk(
  'social/fetchMyCircles',
  async (userId: string) => {
    const response = await fetch(`/api/social/circles/my/${userId}`);
    return response.json();
  }
);

export const createGivingCircle = createAsyncThunk(
  'social/createCircle',
  async (circleData: {
    name: string;
    description: string;
    maxMembers: number;
    isPrivate: boolean;
    joinFee: number;
    monthlyFee: number;
    tags: string[];
    rules: string[];
    creatorId: string;
  }) => {
    const response = await fetch('/api/social/circles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(circleData),
    });
    return response.json();
  }
);

export const joinGivingCircle = createAsyncThunk(
  'social/joinCircle',
  async ({ circleId, userId }: { circleId: string; userId: string }) => {
    const response = await fetch(`/api/social/circles/${circleId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const leaveGivingCircle = createAsyncThunk(
  'social/leaveCircle',
  async ({ circleId, userId }: { circleId: string; userId: string }) => {
    const response = await fetch(`/api/social/circles/${circleId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const fetchCircleMembers = createAsyncThunk(
  'social/fetchCircleMembers',
  async (circleId: string) => {
    const response = await fetch(`/api/social/circles/${circleId}/members`);
    return response.json();
  }
);

export const fetchCircleActivities = createAsyncThunk(
  'social/fetchCircleActivities',
  async (circleId: string) => {
    const response = await fetch(`/api/social/circles/${circleId}/activities`);
    return response.json();
  }
);

export const fetchSocialChallenges = createAsyncThunk(
  'social/fetchChallenges',
  async (filters?: { type?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(`/api/social/challenges?${queryParams}`);
    return response.json();
  }
);

export const createSocialChallenge = createAsyncThunk(
  'social/createChallenge',
  async (challengeData: {
    title: string;
    description: string;
    type: 'group_donation' | 'member_challenge' | 'circle_competition';
    targetAmount: number;
    rewardCoins: number;
    startDate: string;
    endDate: string;
    maxParticipants?: number;
    circleId?: string;
    creatorId: string;
  }) => {
    const response = await fetch('/api/social/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(challengeData),
    });
    return response.json();
  }
);

export const joinSocialChallenge = createAsyncThunk(
  'social/joinChallenge',
  async ({ challengeId, userId, circleId }: {
    challengeId: string;
    userId: string;
    circleId?: string;
  }) => {
    const response = await fetch(`/api/social/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, circleId }),
    });
    return response.json();
  }
);

export const contributeToChallenge = createAsyncThunk(
  'social/contributeToChallenge',
  async ({ challengeId, userId, amount }: {
    challengeId: string;
    userId: string;
    amount: number;
  }) => {
    const response = await fetch(`/api/social/challenges/${challengeId}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    return response.json();
  }
);

export const fetchSocialFeed = createAsyncThunk(
  'social/fetchFeed',
  async ({ userId, page = 1, limit = 20 }: {
    userId: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await fetch(
      `/api/social/feed/${userId}?page=${page}&limit=${limit}`
    );
    return response.json();
  }
);

export const likeFeedItem = createAsyncThunk(
  'social/likeFeedItem',
  async ({ feedItemId, userId }: { feedItemId: string; userId: string }) => {
    const response = await fetch(`/api/social/feed/${feedItemId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const inviteToCircle = createAsyncThunk(
  'social/inviteToCircle',
  async ({ circleId, invitedUserId, inviterId }: {
    circleId: string;
    invitedUserId: string;
    inviterId: string;
  }) => {
    const response = await fetch(`/api/social/circles/${circleId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitedUserId, inviterId }),
    });
    return response.json();
  }
);

export const respondToInvite = createAsyncThunk(
  'social/respondToInvite',
  async ({ inviteId, accept }: { inviteId: string; accept: boolean }) => {
    const response = await fetch(`/api/social/invites/${inviteId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept }),
    });
    return response.json();
  }
);

// Slice
const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    updateCircle: (state, action: PayloadAction<GivingCircle>) => {
      const index = state.circles.findIndex(circle => circle.id === action.payload.id);
      if (index !== -1) {
        state.circles[index] = action.payload;
      }
      const myIndex = state.myCircles.findIndex(circle => circle.id === action.payload.id);
      if (myIndex !== -1) {
        state.myCircles[myIndex] = action.payload;
      }
    },
    updateChallenge: (state, action: PayloadAction<SocialChallenge>) => {
      const index = state.socialChallenges.findIndex(
        challenge => challenge.id === action.payload.id
      );
      if (index !== -1) {
        state.socialChallenges[index] = action.payload;
      }
    },
    updateFeedItem: (state, action: PayloadAction<SocialFeedItem>) => {
      const index = state.socialFeed.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.socialFeed[index] = action.payload;
      }
    },
    setFilters: (state, action: PayloadAction<SocialFilters>) => {
      state.filters = action.payload;
    },
    clearSocialError: (state) => {
      state.error = null;
    },
    resetSocialState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch giving circles
    builder
      .addCase(fetchGivingCircles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGivingCircles.fulfilled, (state, action) => {
        state.loading = false;
        state.circles = action.payload.circles;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchGivingCircles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch circles';
      });

    // Fetch my circles
    builder
      .addCase(fetchMyCircles.fulfilled, (state, action) => {
        state.myCircles = action.payload.circles;
      });

    // Create giving circle
    builder
      .addCase(createGivingCircle.fulfilled, (state, action) => {
        state.circles.unshift(action.payload.circle);
        state.myCircles.unshift(action.payload.circle);
      });

    // Join/Leave circle
    builder
      .addCase(joinGivingCircle.fulfilled, (state, action) => {
        const circle = state.circles.find(c => c.id === action.payload.circleId);
        if (circle) {
          circle.memberCount += 1;
        }
        state.myCircles.push(action.payload.circle);
      })
      .addCase(leaveGivingCircle.fulfilled, (state, action) => {
        const circle = state.circles.find(c => c.id === action.payload.circleId);
        if (circle) {
          circle.memberCount -= 1;
        }
        state.myCircles = state.myCircles.filter(c => c.id !== action.payload.circleId);
      });

    // Fetch circle members and activities
    builder
      .addCase(fetchCircleMembers.fulfilled, (state, action) => {
        state.circleMembers[action.payload.circleId] = action.payload.members;
      })
      .addCase(fetchCircleActivities.fulfilled, (state, action) => {
        state.circleActivities[action.payload.circleId] = action.payload.activities;
      });

    // Social challenges
    builder
      .addCase(fetchSocialChallenges.fulfilled, (state, action) => {
        state.socialChallenges = action.payload.challenges;
      })
      .addCase(createSocialChallenge.fulfilled, (state, action) => {
        state.socialChallenges.unshift(action.payload.challenge);
      })
      .addCase(joinSocialChallenge.fulfilled, (state, action) => {
        const challenge = state.socialChallenges.find(c => c.id === action.payload.challengeId);
        if (challenge) {
          challenge.participants.push(action.payload.participant);
          challenge.participantCount += 1;
        }
      })
      .addCase(contributeToChallenge.fulfilled, (state, action) => {
        const challenge = state.socialChallenges.find(c => c.id === action.payload.challengeId);
        if (challenge) {
          challenge.currentAmount += action.payload.amount;
          const participant = challenge.participants.find(p => p.userId === action.payload.userId);
          if (participant) {
            participant.contributedAmount += action.payload.amount;
          }
        }
      });

    // Social feed
    builder
      .addCase(fetchSocialFeed.fulfilled, (state, action) => {
        state.socialFeed = action.payload.feed;
      })
      .addCase(likeFeedItem.fulfilled, (state, action) => {
        const feedItem = state.socialFeed.find(item => item.id === action.payload.feedItemId);
        if (feedItem) {
          feedItem.isLiked = action.payload.isLiked;
          feedItem.likes = action.payload.likesCount;
        }
      });

    // Invites
    builder
      .addCase(inviteToCircle.fulfilled, (state, action) => {
        state.pendingInvites.push(action.payload.invite);
      })
      .addCase(respondToInvite.fulfilled, (state, action) => {
        state.pendingInvites = state.pendingInvites.filter(
          invite => invite.id !== action.payload.inviteId
        );
      });
  },
});

export const {
  updateCircle,
  updateChallenge,
  updateFeedItem,
  setFilters,
  clearSocialError,
  resetSocialState,
} = socialSlice.actions;

export default socialSlice.reducer;