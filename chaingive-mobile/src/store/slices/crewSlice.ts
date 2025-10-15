import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS, handleApiError } from '../../services/api';

// Types
export interface CrewMember {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  role: 'leader' | 'member';
  totalDonated: number;
  donationCount: number;
  lastDonation: string;
  streakDays: number;
  level: number;
  xp: number;
  achievements: string[];
  isActive: boolean;
}

export interface Crew {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  coverImage?: string;
  leaderId: string;
  leaderName: string;
  categoryId: string;
  categoryName: string;
  targetAmount: number;
  currentAmount: number;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings: CrewSettings;
  stats: CrewStats;
}

export interface CrewSettings {
  allowJoinRequests: boolean;
  requireApproval: boolean;
  donationGoal: number;
  rewardDistribution: 'equal' | 'proportional' | 'leader_bonus';
  notificationPreferences: {
    newMembers: boolean;
    donations: boolean;
    achievements: boolean;
    challenges: boolean;
  };
}

export interface CrewStats {
  totalDonated: number;
  totalMembers: number;
  averageDonation: number;
  topDonor: {
    userId: string;
    userName: string;
    amount: number;
  };
  longestStreak: number;
  completionRate: number;
  createdAt: string;
}

export interface CrewChallenge {
  id: string;
  crewId: string;
  title: string;
  description: string;
  targetAmount: number;
  rewardCoins: number;
  bonusReward: number; // Additional reward for crew completion
  participants: string[]; // User IDs
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  progress: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CrewDonation {
  id: string;
  crewId: string;
  userId: string;
  userName: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  timestamp: string;
  message?: string;
  isAnonymous: boolean;
  impactMultiplier: number;
}

export interface CrewLeaderboard {
  crewId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'allTime';
  entries: CrewLeaderboardEntry[];
  lastUpdated: string;
}

export interface CrewLeaderboardEntry {
  crewId: string;
  crewName: string;
  totalDonated: number;
  memberCount: number;
  averagePerMember: number;
  rank: number;
  change: number;
  topDonor: string;
}

interface CrewState {
  crews: Crew[];
  userCrews: Crew[];
  crewMembers: CrewMember[];
  crewChallenges: CrewChallenge[];
  crewDonations: CrewDonation[];
  crewLeaderboards: CrewLeaderboard[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: CrewState = {
  crews: [],
  userCrews: [],
  crewMembers: [],
  crewChallenges: [],
  crewDonations: [],
  crewLeaderboards: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks with real API integration
export const fetchCrews = createAsyncThunk(
  'crew/fetchCrews',
  async (filters: {
    categoryId?: string;
    isPublic?: boolean;
    minMembers?: number;
    maxMembers?: number;
  } | undefined, { rejectWithValue }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `${API_ENDPOINTS.CREW.LIST}?${queryParams}`;
    const response = await apiClient.get(endpoint);

    if (!response.success) {
      return rejectWithValue(handleApiError(response.error || 'Failed to fetch crews'));
    }

    return response.data;
  }
);

export const fetchUserCrews = createAsyncThunk(
  'crew/fetchUserCrews',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/crews`);
    return response.json();
  }
);

export const createCrew = createAsyncThunk(
  'crew/createCrew',
  async (crewData: {
    name: string;
    description: string;
    categoryId: string;
    maxMembers: number;
    isPublic: boolean;
    settings: CrewSettings;
    leaderId: string;
  }) => {
    const response = await fetch('/api/crews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crewData),
    });
    return response.json();
  }
);

export const joinCrew = createAsyncThunk(
  'crew/joinCrew',
  async ({ crewId, userId, message }: {
    crewId: string;
    userId: string;
    message?: string;
  }) => {
    const response = await fetch(`/api/crews/${crewId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    return response.json();
  }
);

export const leaveCrew = createAsyncThunk(
  'crew/leaveCrew',
  async ({ crewId, userId }: { crewId: string; userId: string }) => {
    const response = await fetch(`/api/crews/${crewId}/leave`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const updateCrewSettings = createAsyncThunk(
  'crew/updateSettings',
  async ({ crewId, settings, leaderId }: {
    crewId: string;
    settings: Partial<CrewSettings>;
    leaderId: string;
  }) => {
    const response = await fetch(`/api/crews/${crewId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, leaderId }),
    });
    return response.json();
  }
);

export const recordCrewDonation = createAsyncThunk(
  'crew/recordDonation',
  async (donationData: {
    crewId: string;
    userId: string;
    amount: number;
    categoryId: string;
    message?: string;
    isAnonymous: boolean;
  }) => {
    const response = await fetch(`/api/crews/${donationData.crewId}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData),
    });
    return response.json();
  }
);

export const fetchCrewChallenges = createAsyncThunk(
  'crew/fetchChallenges',
  async (crewId: string) => {
    const response = await fetch(`/api/crews/${crewId}/challenges`);
    return response.json();
  }
);

export const createCrewChallenge = createAsyncThunk(
  'crew/createChallenge',
  async (challengeData: {
    crewId: string;
    title: string;
    description: string;
    targetAmount: number;
    rewardCoins: number;
    bonusReward: number;
    startDate: string;
    endDate: string;
    difficulty: 'easy' | 'medium' | 'hard';
    leaderId: string;
  }) => {
    const response = await fetch(`/api/crews/${challengeData.crewId}/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(challengeData),
    });
    return response.json();
  }
);

export const joinCrewChallenge = createAsyncThunk(
  'crew/joinChallenge',
  async ({ challengeId, userId }: { challengeId: string; userId: string }) => {
    const response = await fetch(`/api/crews/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const fetchCrewLeaderboard = createAsyncThunk(
  'crew/fetchLeaderboard',
  async ({ categoryId, timeframe }: { categoryId: string; timeframe: string }) => {
    const response = await fetch(`/api/crews/leaderboard?categoryId=${categoryId}&timeframe=${timeframe}`);
    return response.json();
  }
);

export const distributeCrewRewards = createAsyncThunk(
  'crew/distributeRewards',
  async ({ crewId, challengeId, leaderId }: {
    crewId: string;
    challengeId: string;
    leaderId: string;
  }) => {
    const response = await fetch(`/api/crews/${crewId}/challenges/${challengeId}/rewards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaderId }),
    });
    return response.json();
  }
);

// Slice
const crewSlice = createSlice({
  name: 'crew',
  initialState,
  reducers: {
    updateCrew: (state, action: PayloadAction<Crew>) => {
      const index = state.crews.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.crews[index] = action.payload;
      }
    },
    updateCrewMember: (state, action: PayloadAction<CrewMember>) => {
      const index = state.crewMembers.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.crewMembers[index] = action.payload;
      }
    },
    addCrewDonation: (state, action: PayloadAction<CrewDonation>) => {
      state.crewDonations.unshift(action.payload);
      // Update crew stats
      const crew = state.crews.find(c => c.id === action.payload.crewId);
      if (crew) {
        crew.currentAmount += action.payload.amount;
        crew.stats.totalDonated += action.payload.amount;
      }
    },
    updateCrewChallenge: (state, action: PayloadAction<CrewChallenge>) => {
      const index = state.crewChallenges.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.crewChallenges[index] = action.payload;
      }
    },
    updateCrewLeaderboard: (state, action: PayloadAction<CrewLeaderboard>) => {
      const index = state.crewLeaderboards.findIndex(l => l.crewId === action.payload.crewId);
      if (index !== -1) {
        state.crewLeaderboards[index] = action.payload;
      } else {
        state.crewLeaderboards.push(action.payload);
      }
    },
    clearCrewError: (state) => {
      state.error = null;
    },
    resetCrewState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch crews
    builder
      .addCase(fetchCrews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCrews.fulfilled, (state, action) => {
        state.loading = false;
        state.crews = (action.payload as any).crews || action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCrews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch crews';
      });

    // Fetch user crews
    builder
      .addCase(fetchUserCrews.fulfilled, (state, action) => {
        state.userCrews = action.payload.crews;
      });

    // Create crew
    builder
      .addCase(createCrew.fulfilled, (state, action) => {
        state.crews.push(action.payload.crew);
        state.userCrews.push(action.payload.crew);
      });

    // Join crew
    builder
      .addCase(joinCrew.fulfilled, (state, action) => {
        const crew = state.crews.find(c => c.id === action.payload.crewId);
        if (crew) {
          crew.memberCount += 1;
        }
        state.userCrews.push(action.payload.crew);
      });

    // Leave crew
    builder
      .addCase(leaveCrew.fulfilled, (state, action) => {
        const crewIndex = state.crews.findIndex(c => c.id === action.payload.crewId);
        if (crewIndex !== -1) {
          state.crews[crewIndex].memberCount -= 1;
        }
        const userCrewIndex = state.userCrews.findIndex(c => c.id === action.payload.crewId);
        if (userCrewIndex !== -1) {
          state.userCrews.splice(userCrewIndex, 1);
        }
      });

    // Update crew settings
    builder
      .addCase(updateCrewSettings.fulfilled, (state, action) => {
        const crew = state.crews.find(c => c.id === action.payload.crewId);
        if (crew) {
          crew.settings = { ...crew.settings, ...action.payload.settings };
        }
      });

    // Record crew donation
    builder
      .addCase(recordCrewDonation.fulfilled, (state, action) => {
        state.crewDonations.unshift(action.payload.donation);
        // Update crew and member stats
        const crew = state.crews.find(c => c.id === action.payload.donation.crewId);
        if (crew) {
          crew.currentAmount += action.payload.donation.amount;
          crew.stats.totalDonated += action.payload.donation.amount;
        }
        const member = state.crewMembers.find(m => m.userId === action.payload.donation.userId);
        if (member) {
          member.totalDonated += action.payload.donation.amount;
          member.donationCount += 1;
          member.lastDonation = action.payload.donation.timestamp;
        }
      });

    // Fetch crew challenges
    builder
      .addCase(fetchCrewChallenges.fulfilled, (state, action) => {
        state.crewChallenges = action.payload.challenges;
      });

    // Create crew challenge
    builder
      .addCase(createCrewChallenge.fulfilled, (state, action) => {
        state.crewChallenges.push(action.payload.challenge);
      });

    // Join crew challenge
    builder
      .addCase(joinCrewChallenge.fulfilled, (state, action) => {
        const challenge = state.crewChallenges.find(c => c.id === action.payload.challengeId);
        if (challenge && !challenge.participants.includes(action.payload.userId)) {
          challenge.participants.push(action.payload.userId);
        }
      });

    // Fetch crew leaderboard
    builder
      .addCase(fetchCrewLeaderboard.fulfilled, (state, action) => {
        const index = state.crewLeaderboards.findIndex(l => l.crewId === action.payload.crewId);
        if (index !== -1) {
          state.crewLeaderboards[index] = action.payload;
        } else {
          state.crewLeaderboards.push(action.payload);
        }
      });

    // Distribute crew rewards
    builder
      .addCase(distributeCrewRewards.fulfilled, (state, action) => {
        // Update challenge status and distribute rewards
        const challenge = state.crewChallenges.find(c => c.id === action.payload.challengeId);
        if (challenge) {
          challenge.status = 'completed';
        }
      });
  },
});

export const {
  updateCrew,
  updateCrewMember,
  addCrewDonation,
  updateCrewChallenge,
  updateCrewLeaderboard,
  clearCrewError,
  resetCrewState,
} = crewSlice.actions;

export default crewSlice.reducer;