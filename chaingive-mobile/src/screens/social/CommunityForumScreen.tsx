import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchForumPosts, createForumPost, likeForumPost } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const CommunityForumScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { forumPosts, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    dispatch(fetchForumPosts());
  }, [dispatch]);

  const filteredPosts = forumPosts.filter(post => {
    if (selectedCategory === 'all') return true;
    return post.category === selectedCategory;
  });

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      showToast('Please fill in both title and content', 'error');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(createForumPost({
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        category: selectedCategory !== 'all' ? selectedCategory : 'general',
        authorId: user?.id || '',
      })).unwrap();

      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
      showToast('Post created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create post', 'error');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(likeForumPost({ postId, userId: user?.id || '' })).unwrap();
    } catch (error: any) {
      showToast(error.message || 'Failed to like post', 'error');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return 'forum';
      case 'donation': return 'favorite';
      case 'challenge': return 'emoji-events';
      case 'technical': return 'build';
      case 'suggestion': return 'lightbulb';
      default: return 'chat';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return colors.primary;
      case 'donation': return colors.error;
      case 'challenge': return colors.tertiary;
      case 'technical': return colors.info;
      case 'suggestion': return colors.warning;
      default: return colors.secondary;
    }
  };

  const categories = [
    { key: 'all', label: 'All Posts', icon: 'list' },
    { key: 'general', label: 'General', icon: 'forum' },
    { key: 'donation', label: 'Donations', icon: 'favorite' },
    { key: 'challenge', label: 'Challenges', icon: 'emoji-events' },
    { key: 'technical', label: 'Technical', icon: 'build' },
    { key: 'suggestion', label: 'Suggestions', icon: 'lightbulb' },
  ];

  const renderPost = ({ item: post }: { item: any }) => {
    const isLiked = post.likes?.some((like: any) => like.userId === user?.id);

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => navigation.navigate('ForumPostDetail' as never, { postId: post.id })}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {post.author.displayName?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{post.author.displayName}</Text>
              <Text style={styles.postTime}>
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={[styles.categoryBadge, {
            backgroundColor: getCategoryColor(post.category) + '20'
          }]}>
            <Icon
              name={getCategoryIcon(post.category)}
              size={14}
              color={getCategoryColor(post.category)}
            />
            <Text style={[styles.categoryText, {
              color: getCategoryColor(post.category)
            }]}>
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postPreview} numberOfLines={2}>
            {post.content}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.postFooter}>
          <View style={styles.postStats}>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => handleLikePost(post.id)}
            >
              <Icon
                name={isLiked ? "favorite" : "favorite-border"}
                size={16}
                color={isLiked ? colors.error : colors.text.secondary}
              />
              <Text style={[
                styles.statText,
                isLiked && { color: colors.error }
              ]}>
                {post.likes?.length || 0}
              </Text>
            </TouchableOpacity>

            <View style={styles.statButton}>
              <Icon name="chat-bubble-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.statText}>{post.replies?.length || 0}</Text>
            </View>

            <View style={styles.statButton}>
              <Icon name="visibility" size={16} color={colors.text.secondary} />
              <Text style={styles.statText}>{post.views || 0}</Text>
            </View>
          </View>

          {post.isPinned && (
            <View style={styles.pinnedBadge}>
              <Icon name="push-pin" size={14} color={colors.tertiary} />
              <Text style={styles.pinnedText}>Pinned</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Forum</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreatePost(!showCreatePost)}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Create Post Form */}
      {showCreatePost && (
        <View style={styles.createPostForm}>
          <TextInput
            style={styles.titleInput}
            placeholder="Post title..."
            value={newPostTitle}
            onChangeText={setNewPostTitle}
            maxLength={100}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind?"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCreatePost(false);
                setNewPostTitle('');
                setNewPostContent('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.postButton,
                (!newPostTitle.trim() || !newPostContent.trim()) && styles.postButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={!newPostTitle.trim() || !newPostContent.trim()}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.key && styles.categoryButtonSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(item.key);
              }}
            >
              <Icon
                name={item.icon}
                size={16}
                color={selectedCategory === item.key ? colors.white : colors.text.secondary}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === item.key && styles.categoryButtonTextSelected,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Posts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading forum posts...</Text>
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="forum" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Posts Yet</Text>
          <Text style={styles.emptyMessage}>
            {selectedCategory === 'all'
              ? 'Be the first to start a discussion!'
              : `No posts in ${selectedCategory} category yet.`
            }
          </Text>
          <TouchableOpacity
            style={styles.startDiscussionButton}
            onPress={() => setShowCreatePost(true)}
          >
            <Text style={styles.startDiscussionText}>Start Discussion</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  createButton: {
    padding: spacing.xs,
  },
  createPostForm: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  titleInput: {
    ...typography.bodyBold,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  contentInput: {
    ...typography.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: spacing.sm,
    minHeight: 80,
    marginBottom: spacing.md,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  cancelText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  postButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  postButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  categoryFilter: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 20,
  },
  startDiscussionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  startDiscussionText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  postsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  authorInitial: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  authorName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  postTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
  },
  postContent: {
    marginBottom: spacing.md,
  },
  postTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  postPreview: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  pinnedText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
    fontSize: 10,
  },
});

export default CommunityForumScreen;