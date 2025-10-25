import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/client';

interface CommunityPost {
  id: string;
  type: 'success_story' | 'event_announcement' | 'testimonial' | 'featured_request';
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: string;
  likes: number;
  shares: number;
  isLiked: boolean;
  isShared: boolean;
  metadata?: {
    eventDate?: string;
    eventLocation?: string;
    requestAmount?: number;
    requestCategory?: string;
    storyCategory?: string;
  };
  mediaUrls?: string[];
}

interface CommunityState {
  communityFeed: CommunityPost[];
  loading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  communityFeed: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCommunityFeed = createAsyncThunk(
  'community/fetchFeed',
  async ({ userId, category }: { userId: string; category: string }) => {
    const response = await api.get(`/community/feed?category=${category}`);
    return response.data.posts;
  }
);

export const likeCommunityPost = createAsyncThunk(
  'community/likePost',
  async ({ postId, userId }: { postId: string; userId: string }) => {
    await api.post(`/community/posts/${postId}/like`);
    return { postId, userId };
  }
);

export const shareCommunityPost = createAsyncThunk(
  'community/sharePost',
  async ({ postId, userId }: { postId: string; userId: string }) => {
    await api.post(`/community/posts/${postId}/share`);
    return { postId, userId };
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feed
      .addCase(fetchCommunityFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunityFeed.fulfilled, (state, action: PayloadAction<CommunityPost[]>) => {
        state.loading = false;
        state.communityFeed = action.payload;
      })
      .addCase(fetchCommunityFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch community feed';
      })
      // Like post
      .addCase(likeCommunityPost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.communityFeed.find(p => p.id === postId);
        if (post) {
          post.isLiked = !post.isLiked;
          post.likes += post.isLiked ? 1 : -1;
        }
      })
      // Share post
      .addCase(shareCommunityPost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.communityFeed.find(p => p.id === postId);
        if (post) {
          post.isShared = !post.isShared;
          post.shares += post.isShared ? 1 : -1;
        }
      });
  },
});

export const { clearError } = communitySlice.actions;
export default communitySlice.reducer;