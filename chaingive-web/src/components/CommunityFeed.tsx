'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

interface FeedPost {
  id: string;
  type: 'story' | 'event' | 'announcement' | 'milestone';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  images?: string[];
  location?: string;
  category?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  eventDetails?: {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    rsvpCount: number;
  };
  donationDetails?: {
    amount: number;
    recipientName: string;
    category: string;
  };
}

interface FeedFilters {
  type?: string;
  category?: string;
  location?: string;
  timeframe?: 'day' | 'week' | 'month';
}

export const CommunityFeed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FeedFilters>({
    timeframe: 'week',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadFeed(true);
  }, [filters]);

  const loadFeed = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: reset ? '1' : page.toString(),
        limit: '20',
        ...filters,
      });

      const response = await apiClient.get(`/api/v1/community/feed?${params}`);
      const newPosts = response.data.posts || [];

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 20);
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      await apiClient.post(`/api/v1/community/posts/${postId}/like`);
      // Update local state
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const bookmarkPost = async (postId: string) => {
    try {
      await apiClient.post(`/api/v1/community/posts/${postId}/bookmark`);
      // Update local state
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      ));
    } catch (error) {
      console.error('Failed to bookmark post:', error);
    }
  };

  const sharePost = async (postId: string) => {
    try {
      await apiClient.post(`/api/v1/community/posts/${postId}/share`);
      // Update local state
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, shares: post.shares + 1 }
          : post
      ));
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return '📖';
      case 'event': return '📅';
      case 'announcement': return '📢';
      case 'milestone': return '🎯';
      default: return '💬';
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'story': return 'text-blue-600 bg-blue-100';
      case 'event': return 'text-green-600 bg-green-100';
      case 'announcement': return 'text-purple-600 bg-purple-100';
      case 'milestone': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderPost = (post: FeedPost) => (
    <div key={post.id} className="bg-white shadow rounded-lg p-6 mb-4">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {post.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{post.authorName}</h4>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPostTypeColor(post.type)}`}>
                {getPostTypeIcon(post.type)} {post.type}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </span>
              {post.location && (
                <span className="text-xs text-gray-500">📍 {post.location}</span>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          ⋯
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {post.images!.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      +{post.images!.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details */}
      {post.eventDetails && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600 font-medium">📅 Event:</span>
            <span className="text-blue-800 font-medium">{post.eventDetails.eventTitle}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-blue-700">
            <span>{new Date(post.eventDetails.eventDate).toLocaleString()}</span>
            <span>{post.eventDetails.rsvpCount} attending</span>
          </div>
        </div>
      )}

      {/* Donation Details */}
      {post.donationDetails && (
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600 font-medium">💝 Impact:</span>
            <span className="text-green-800 font-medium">
              ₦{post.donationDetails.amount.toLocaleString()} for {post.donationDetails.recipientName}
            </span>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}>
            {post.donationDetails.category}
          </span>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => likePost(post.id)}
            className={`flex items-center space-x-1 text-sm ${
              post.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <span>{post.isLiked ? '❤️' : '🤍'}</span>
            <span>{post.likes}</span>
          </button>

          <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
            <span>💬</span>
            <span>{post.comments}</span>
          </button>

          <button
            onClick={() => sharePost(post.id)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600"
          >
            <span>📤</span>
            <span>{post.shares}</span>
          </button>
        </div>

        <button
          onClick={() => bookmarkPost(post.id)}
          className={`text-sm ${post.isBookmarked ? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600'}`}
        >
          {post.isBookmarked ? '⭐' : '☆'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            🔍 Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            ✏️ Create Post
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Types</option>
                <option value="story">Stories</option>
                <option value="event">Events</option>
                <option value="announcement">Announcements</option>
                <option value="milestone">Milestones</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Categories</option>
                <option value="medical">Medical</option>
                <option value="education">Education</option>
                <option value="business">Business</option>
                <option value="community">Community</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || undefined }))}
                placeholder="e.g., Lagos"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Timeframe</label>
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value as any }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Feed Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12">
            <div className="text-center text-gray-500">
              <span className="text-6xl">📭</span>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No posts yet</h3>
              <p className="mt-2 text-sm">
                Be the first to share a story or create an event in your community!
              </p>
            </div>
          </div>
        ) : (
          <>
            {posts.map(renderPost)}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => loadFeed()}
                  disabled={loadingMore}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};