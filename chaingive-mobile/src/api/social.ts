import { apiClient } from './client';
import {
  SocialCircle,
  SocialPost,
  SocialPostLike,
  SocialPostComment,
  SocialPostShare,
  CircleMember,
  CreatePostRequest,
  CreateCircleRequest,
  SocialFeedFilters
} from '../types/social';

export class SocialApi {
  /**
   * Create a new social circle
   */
  static async createCircle(circleData: CreateCircleRequest): Promise<SocialCircle> {
    const response = await apiClient.post('/social/circles', circleData);
    return response.data.data;
  }

  /**
   * Get user's circles
   */
  static async getUserCircles(): Promise<SocialCircle[]> {
    const response = await apiClient.get('/social/circles');
    return response.data.data;
  }

  /**
   * Get circle details
   */
  static async getCircle(circleId: string): Promise<SocialCircle> {
    const response = await apiClient.get(`/social/circles/${circleId}`);
    return response.data.data;
  }

  /**
   * Update circle
   */
  static async updateCircle(circleId: string, updates: Partial<CreateCircleRequest>): Promise<SocialCircle> {
    const response = await apiClient.put(`/social/circles/${circleId}`, updates);
    return response.data.data;
  }

  /**
   * Delete circle
   */
  static async deleteCircle(circleId: string): Promise<void> {
    await apiClient.delete(`/social/circles/${circleId}`);
  }

  /**
   * Join a circle
   */
  static async joinCircle(circleId: string): Promise<CircleMember> {
    const response = await apiClient.post(`/social/circles/${circleId}/join`);
    return response.data.data;
  }

  /**
   * Leave a circle
   */
  static async leaveCircle(circleId: string): Promise<void> {
    await apiClient.post(`/social/circles/${circleId}/leave`);
  }

  /**
   * Get circle members
   */
  static async getCircleMembers(circleId: string, limit: number = 20, offset: number = 0): Promise<CircleMember[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await apiClient.get(`/social/circles/${circleId}/members?${params}`);
    return response.data.data;
  }

  /**
   * Create a post
   */
  static async createPost(postData: CreatePostRequest): Promise<SocialPost> {
    const response = await apiClient.post('/social/posts', postData);
    return response.data.data;
  }

  /**
   * Get social feed
   */
  static async getFeed(filters?: SocialFeedFilters): Promise<SocialPost[]> {
    const params = new URLSearchParams();

    if (filters?.circleId) params.append('circleId', filters.circleId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const response = await apiClient.get(`/social/feed?${params}`);
    return response.data.data;
  }

  /**
   * Get post details
   */
  static async getPost(postId: string): Promise<SocialPost> {
    const response = await apiClient.get(`/social/posts/${postId}`);
    return response.data.data;
  }

  /**
   * Update post
   */
  static async updatePost(postId: string, updates: Partial<CreatePostRequest>): Promise<SocialPost> {
    const response = await apiClient.put(`/social/posts/${postId}`, updates);
    return response.data.data;
  }

  /**
   * Delete post
   */
  static async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/social/posts/${postId}`);
  }

  /**
   * Like a post
   */
  static async likePost(postId: string): Promise<SocialPostLike> {
    const response = await apiClient.post(`/social/posts/${postId}/like`);
    return response.data.data;
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId: string): Promise<void> {
    await apiClient.delete(`/social/posts/${postId}/like`);
  }

  /**
   * Add comment to post
   */
  static async addComment(postId: string, content: string): Promise<SocialPostComment> {
    const response = await apiClient.post(`/social/posts/${postId}/comments`, { content });
    return response.data.data;
  }

  /**
   * Get post comments
   */
  static async getPostComments(postId: string, limit: number = 20, offset: number = 0): Promise<SocialPostComment[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await apiClient.get(`/social/posts/${postId}/comments?${params}`);
    return response.data.data;
  }

  /**
   * Like a comment
   */
  static async likeComment(commentId: string): Promise<void> {
    await apiClient.post(`/social/comments/${commentId}/like`);
  }

  /**
   * Unlike a comment
   */
  static async unlikeComment(commentId: string): Promise<void> {
    await apiClient.delete(`/social/comments/${commentId}/like`);
  }

  /**
   * Share a post
   */
  static async sharePost(postId: string, shareType?: 'share' | 'repost'): Promise<SocialPostShare> {
    const response = await apiClient.post(`/social/posts/${postId}/share`, { shareType });
    return response.data.data;
  }

  /**
   * Get trending posts
   */
  static async getTrendingPosts(limit: number = 10): Promise<SocialPost[]> {
    const response = await apiClient.get(`/social/posts/trending?limit=${limit}`);
    return response.data.data;
  }

  /**
   * Search posts and circles
   */
  static async search(query: string, type?: 'posts' | 'circles' | 'all', limit: number = 20): Promise<{
    posts: SocialPost[];
    circles: SocialCircle[];
  }> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString()
    });

    if (type) params.append('type', type);

    const response = await apiClient.get(`/social/search?${params}`);
    return response.data.data;
  }

  /**
   * Get user's social stats
   */
  static async getUserSocialStats(): Promise<{
    circlesJoined: number;
    postsCreated: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    socialScore: number;
  }> {
    const response = await apiClient.get('/social/stats');
    return response.data.data;
  }

  /**
   * Report post or comment
   */
  static async reportContent(
    contentId: string,
    contentType: 'post' | 'comment',
    reason: string,
    description?: string
  ): Promise<void> {
    await apiClient.post('/social/report', {
      contentId,
      contentType,
      reason,
      description
    });
  }

  /**
   * Pin/unpin post in circle
   */
  static async togglePinPost(postId: string): Promise<SocialPost> {
    const response = await apiClient.patch(`/social/posts/${postId}/pin`);
    return response.data.data;
  }
}