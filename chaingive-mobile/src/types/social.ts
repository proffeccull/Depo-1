export interface SocialCircle {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  isPrivate: boolean;
  maxMembers: number;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CircleMember {
  id: string;
  circleId: string;
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
}

export interface SocialPost {
  id: string;
  authorId: string;
  circleId?: string;
  content: string;
  mediaUrls: string[];
  postType: 'text' | 'image' | 'video' | 'poll';
  isPublic: boolean;
  isPinned: boolean;
  likesCount: number;
  sharesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
  circle?: {
    id: string;
    name: string;
  };
  isLiked?: boolean;
  isShared?: boolean;
}

export interface SocialPostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface SocialPostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
  likes?: SocialPostCommentLike[];
  isLiked?: boolean;
}

export interface SocialPostCommentLike {
  id: string;
  commentId: string;
  userId: string;
  createdAt: string;
}

export interface SocialPostShare {
  id: string;
  postId: string;
  userId: string;
  shareType: 'share' | 'repost';
  createdAt: string;
}

export interface CreateCircleRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}

export interface CreatePostRequest {
  content: string;
  mediaUrls?: string[];
  postType?: 'text' | 'image' | 'video' | 'poll';
  circleId?: string;
  isPublic?: boolean;
}

export interface SocialFeedFilters {
  circleId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'recent' | 'popular' | 'trending';
}

export interface SocialStats {
  circlesJoined: number;
  postsCreated: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  socialScore: number;
  engagementRate: number;
  influenceScore: number;
}

export interface SocialNotification {
  id: string;
  type: 'like' | 'comment' | 'share' | 'mention' | 'circle_invite';
  fromUserId: string;
  toUserId: string;
  postId?: string;
  commentId?: string;
  circleId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  fromUser?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
}

export interface SocialSearchResult {
  posts: SocialPost[];
  circles: SocialCircle[];
  users: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    socialScore: number;
  }[];
}