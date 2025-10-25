import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Components
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import PostCard from './community/PostCard';
import CreatePostModal from './community/CreatePostModal';

// Services
import { apiClient } from '../services/apiClient';

// Types
interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  type: 'story' | 'event' | 'announcement';
  media?: string[];
  eventId?: string;
}

const CommunityFeed: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Posts' },
    { id: 'stories', label: 'Success Stories' },
    { id: 'events', label: 'Events' },
    { id: 'announcements', label: 'Announcements' },
  ];

  // Fetch posts
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['community-posts', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== 'all' ? { type: selectedCategory } : {};
      const response = await apiClient.get('/api/v2/community/posts', { params });
      return response.data.posts as Post[];
    },
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      if (liked) {
        await apiClient.post(`/api/v2/community/posts/${postId}/like`);
      } else {
        await apiClient.delete(`/api/v2/community/posts/${postId}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      content: string;
      type: string;
      media?: File[];
    }) => {
      const formData = new FormData();
      formData.append('content', postData.content);
      formData.append('type', postData.type);

      if (postData.media) {
        postData.media.forEach((file, index) => {
          formData.append(`media[${index}]`, file);
        });
      }

      return apiClient.post('/api/v2/community/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setShowCreatePost(false);
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  const handleLike = (postId: string, currentlyLiked: boolean) => {
    likeMutation.mutate({ postId, liked: !currentlyLiked });
  };

  const handleCreatePost = (postData: {
    content: string;
    type: string;
    media?: File[];
  }) => {
    createPostMutation.mutate(postData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message="Failed to load community feed" />
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="community-feed">
      {/* Header with Create Post Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Community Feed</h2>
        <button
          onClick={() => setShowCreatePost(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <span>+</span>
          <span>Share Story</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id, post.isLiked)}
              isLoading={likeMutation.isPending}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-400 mb-4">
              Be the first to share your story or create a community event!
            </p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create First Post
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
          isLoading={createPostMutation.isPending}
        />
      )}
    </div>
  );
};

export default CommunityFeed;