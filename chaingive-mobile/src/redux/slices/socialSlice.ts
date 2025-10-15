import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SocialApi } from '../../api/social';
import {
  SocialCircle,
  SocialPost,
  SocialPostLike,
  SocialPostComment,
  SocialPostShare,
  CircleMember,
  CreatePostRequest,
  CreateCircleRequest,
  SocialFeedFilters,
  SocialStats,
  SocialNotification
} from '../../types/social';

interface SocialState {
  circles: SocialCircle[];
  posts: SocialPost[];
  currentCircle: SocialCircle | null;
  currentPost: SocialPost | null;
  circleMembers: CircleMember[];
  notifications: SocialNotification[];
  stats: SocialStats | null;
  loading: boolean;
  error: string | null;
  feedFilters: SocialFeedFilters;
  unreadNotifications: number;
  lastFetched: {
    circles: string | null;
    feed: string | null;
    notifications: string | null;
    stats: string | null;
  };
}

const initialState: SocialState = {
  circles: [],
  posts: [],
  currentCircle: null,
  currentPost: null,
  circleMembers: [],
  notifications: [],
  stats: null,
  loading: false,
  error: null,
  feedFilters: {
    limit: 20,
    offset: 0,
    sortBy: 'recent'
  },
  unreadNotifications: 0,
  lastFetched: {
    circles: null,
    feed: null,
    notifications: null,
    stats: null
  }
};

// Async thunks
export const fetchUserCircles = createAsyncThunk(
  'social/fetchUserCircles',
  async () => {
    return await SocialApi.getUserCircles();
  }
);

export const createCircle = createAsyncThunk(
  'social/createCircle',
  async (circleData: CreateCircleRequest) => {
    return await SocialApi.createCircle(circleData);
  }
);

export const fetchCircleDetails = createAsyncThunk(
  'social/fetchCircleDetails',
  async (circleId: string) => {
    return await SocialApi.getCircle(circleId);
  }
);

export const joinCircle = createAsyncThunk(
  'social/joinCircle',
  async (circleId: string) => {
    return await SocialApi.joinCircle(circleId);
  }
);

export const leaveCircle = createAsyncThunk(
  'social/leaveCircle',
  async (circleId: string) => {
    await SocialApi.leaveCircle(circleId);
    return circleId;
  }
);

export const fetchSocialFeed = createAsyncThunk(
  'social/fetchFeed',
  async (filters?: SocialFeedFilters) => {
    return await SocialApi.getFeed(filters);
  }
);

export const createPost = createAsyncThunk(
  'social/createPost',
  async (postData: CreatePostRequest) => {
    return await SocialApi.createPost(postData);
  }
);

export const fetchPostDetails = createAsyncThunk(
  'social/fetchPostDetails',
  async (postId: string) => {
    return await SocialApi.getPost(postId);
  }
);

export const likePost = createAsyncThunk(
  'social/likePost',
  async (postId: string) => {
    return await SocialApi.likePost(postId);
  }
);

export const unlikePost = createAsyncThunk(
  'social/unlikePost',
  async (postId: string) => {
    await SocialApi.unlikePost(postId);
    return postId;
  }
);

export const addComment = createAsyncThunk(
  'social/addComment',
  async ({ postId, content }: { postId: string; content: string }) => {
    return await SocialApi.addComment(postId, content);
  }
);

export const fetchPostComments = createAsyncThunk(
  'social/fetchPostComments',
  async ({ postId, limit, offset }: { postId: string; limit?: number; offset?: number }) => {
    return await SocialApi.getPostComments(postId, limit, offset);
  }
);

export const sharePost = createAsyncThunk(
  'social/sharePost',
  async ({ postId, shareType }: { postId: string; shareType?: 'share' | 'repost' }) => {
    return await SocialApi.sharePost(postId, shareType);
  }
);

export const fetchTrendingPosts = createAsyncThunk(
  'social/fetchTrendingPosts',
  async (limit: number = 10) => {
    return await SocialApi.getTrendingPosts(limit);
  }
);

export const searchSocial = createAsyncThunk(
  'social/search',
  async ({ query, type }: { query: string; type?: 'posts' | 'circles' | 'all' }) => {
    return await SocialApi.search(query, type);
  }
);

export const fetchSocialStats = createAsyncThunk(
  'social/fetchStats',
  async () => {
    return await SocialApi.getUserSocialStats();
  }
);

export const reportContent = createAsyncThunk(
  'social/reportContent',
  async ({
    contentId,
    contentType,
    reason,
    description
  }: {
    contentId: string;
    contentType: 'post' | 'comment';
    reason: string;
    description?: string;
  }) => {
    await SocialApi.reportContent(contentId, contentType, reason, description);
    return { contentId, contentType };
  }
);

// Slice
const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFeedFilters: (state, action: PayloadAction<SocialFeedFilters>) => {
      state.feedFilters = action.payload;
    },
    clearCurrentCircle: (state) => {
      state.currentCircle = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    updatePostLocally: (state, action: PayloadAction<{ id: string; updates: Partial<SocialPost> }>) => {
      const { id, updates } = action.payload;
      const index = state.posts.findIndex(post => post.id === id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...updates };
      }
      if (state.currentPost?.id === id) {
        state.currentPost = { ...state.currentPost, ...updates };
      }
    },
    markNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadNotifications = 0;
    },
    addNewNotification: (state, action: PayloadAction<SocialNotification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadNotifications += 1;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch user circles
    builder
      .addCase(fetchUserCircles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCircles.fulfilled, (state, action) => {
        state.loading = false;
        state.circles = action.payload;
        state.lastFetched.circles = new Date().toISOString();
      })
      .addCase(fetchUserCircles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch circles';
      })

      // Create circle
      .addCase(createCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.loading = false;
        state.circles.unshift(action.payload);
        state.currentCircle = action.payload;
      })
      .addCase(createCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create circle';
      })

      // Fetch circle details
      .addCase(fetchCircleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCircleDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCircle = action.payload;
      })
      .addCase(fetchCircleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch circle details';
      })

      // Join circle
      .addCase(joinCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCircle.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCircle) {
          state.currentCircle.memberCount += 1;
        }
        state.circleMembers.push(action.payload);
      })
      .addCase(joinCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to join circle';
      })

      // Leave circle
      .addCase(leaveCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveCircle.fulfilled, (state, action) => {
        state.loading = false;
        state.circles = state.circles.filter(c => c.id !== action.payload);
        if (state.currentCircle?.id === action.payload) {
          state.currentCircle = null;
        }
      })
      .addCase(leaveCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to leave circle';
      })

      // Fetch social feed
      .addCase(fetchSocialFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocialFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
        state.lastFetched.feed = new Date().toISOString();
      })
      .addCase(fetchSocialFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch social feed';
      })

      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create post';
      })

      // Fetch post details
      .addCase(fetchPostDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch post details';
      })

      // Like post
      .addCase(likePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.loading = false;
        // Update post likes count
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg);
        if (postIndex !== -1) {
          state.posts[postIndex].likesCount += 1;
          state.posts[postIndex].isLiked = true;
        }
        if (state.currentPost?.id === action.meta.arg) {
          state.currentPost.likesCount += 1;
          state.currentPost.isLiked = true;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to like post';
      })

      // Unlike post
      .addCase(unlikePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        state.loading = false;
        // Update post likes count
        const postIndex = state.posts.findIndex(p => p.id === action.payload);
        if (postIndex !== -1) {
          state.posts[postIndex].likesCount = Math.max(0, state.posts[postIndex].likesCount - 1);
          state.posts[postIndex].isLiked = false;
        }
        if (state.currentPost?.id === action.payload) {
          state.currentPost.likesCount = Math.max(0, state.currentPost.likesCount - 1);
          state.currentPost.isLiked = false;
        }
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to unlike post';
      })

      // Add comment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        // Update post comments count
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentsCount += 1;
        }
        if (state.currentPost?.id === action.meta.arg.postId) {
          state.currentPost.commentsCount += 1;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add comment';
      })

      // Fetch post comments
      .addCase(fetchPostComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        state.loading = false;
        // Comments are handled by the component
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })

      // Share post
      .addCase(sharePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        state.loading = false;
        // Update post shares count
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].sharesCount += 1;
          state.posts[postIndex].isShared = true;
        }
        if (state.currentPost?.id === action.meta.arg.postId) {
          state.currentPost.sharesCount += 1;
          state.currentPost.isShared = true;
        }
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to share post';
      })

      // Fetch trending posts
      .addCase(fetchTrendingPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
        state.loading = false;
        // Trending posts are handled by the component
      })
      .addCase(fetchTrendingPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trending posts';
      })

      // Search social
      .addCase(searchSocial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSocial.fulfilled, (state, action) => {
        state.loading = false;
        // Search results are handled by the component
      })
      .addCase(searchSocial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search';
      })

      // Fetch social stats
      .addCase(fetchSocialStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocialStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = {
          ...action.payload,
          engagementRate: 0, // Will be calculated by backend
          influenceScore: 0  // Will be calculated by backend
        };
        state.lastFetched.stats = new Date().toISOString();
      })
      .addCase(fetchSocialStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch social stats';
      })

      // Report content
      .addCase(reportContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reportContent.fulfilled, (state, action) => {
        state.loading = false;
        // Report submitted successfully
      })
      .addCase(reportContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to report content';
      });
  }
});

export const {
  clearError,
  setFeedFilters,
  clearCurrentCircle,
  clearCurrentPost,
  updatePostLocally,
  markNotificationsAsRead,
  addNewNotification
} = socialSlice.actions;

export default socialSlice.reducer;