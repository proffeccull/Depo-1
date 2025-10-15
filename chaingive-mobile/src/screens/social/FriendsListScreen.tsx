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
import { fetchFriends, searchUsers, sendFriendRequest } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const FriendsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { friends, searchResults, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFriends(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        dispatch(searchUsers({ query: searchQuery, userId: user?.id || '' }));
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, dispatch, user?.id]);

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await dispatch(sendFriendRequest({ senderId: user?.id || '', receiverId: targetUserId })).unwrap();
      showToast('Friend request sent!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send friend request', 'error');
    }
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile' as never, { userId });
  };

  const renderFriendItem = ({ item: friend }: { item: any }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleUserPress(friend.id)}
      activeOpacity={0.9}
    >
      <View style={styles.friendAvatar}>
        <Text style={styles.friendInitial}>
          {friend.displayName?.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.displayName}</Text>
        <Text style={styles.friendStatus}>
          {friend.isOnline ? '🟢 Online' : '⚫ Offline'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => navigation.navigate('Messaging' as never, {
          recipientId: friend.id,
          recipientName: friend.displayName
        })}
      >
        <Icon name="message" size={20} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item: user }: { item: any }) => {
    const isFriend = friends.some(friend => friend.id === user.id);
    const hasPendingRequest = user.friendRequestStatus === 'pending';

    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => handleUserPress(user.id)}
        activeOpacity={0.9}
      >
        <View style={styles.friendAvatar}>
          <Text style={styles.friendInitial}>
            {user.displayName?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{user.displayName}</Text>
          <Text style={styles.friendUsername}>@{user.username}</Text>
        </View>

        {!isFriend && !hasPendingRequest && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleSendFriendRequest(user.id)}
          >
            <Icon name="person-add" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}

        {hasPendingRequest && (
          <View style={styles.pendingButton}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}

        {isFriend && (
          <View style={styles.friendBadge}>
            <Icon name="check" size={16} color={colors.success} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getCurrentData = () => {
    if (selectedTab === 'search' && isSearching) {
      return searchResults;
    }
    return friends;
  };

  const getCurrentRenderItem = () => {
    if (selectedTab === 'search') {
      return renderSearchResult;
    }
    return renderFriendItem;
  };

  const getEmptyMessage = () => {
    if (selectedTab === 'search') {
      return searchQuery.length > 2
        ? 'No users found matching your search'
        : 'Start typing to search for users';
    }
    return 'No friends yet. Start connecting with other users!';
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
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setSelectedTab('search')}
        >
          <Icon name="person-add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSelectedTab('search')}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        {(['friends', 'search'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.tabButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTab(tab);
            }}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab && styles.tabButtonTextSelected,
            ]}>
              {tab === 'friends' ? 'My Friends' : 'Search Users'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Friends List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {selectedTab === 'search' ? 'Searching...' : 'Loading friends...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={getCurrentData()}
          renderItem={getCurrentRenderItem()}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon
                name={selectedTab === 'search' ? 'search' : 'people'}
                size={64}
                color={colors.gray[300]}
              />
              <Text style={styles.emptyTitle}>
                {selectedTab === 'search' ? 'Search Users' : 'No Friends Yet'}
              </Text>
              <Text style={styles.emptyMessage}>
                {getEmptyMessage()}
              </Text>
              {selectedTab === 'friends' && (
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => setSelectedTab('search')}
                >
                  <Text style={styles.exploreButtonText}>Find Friends</Text>
                </TouchableOpacity>
              )}
            </View>
          }
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
  addButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabButtonSelected: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  tabButtonTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
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
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  friendInitial: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  friendUsername: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  friendStatus: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  messageButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  addFriendButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  pendingButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
  },
  pendingText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: 'bold',
  },
  friendBadge: {
    padding: spacing.sm,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
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
    marginBottom: spacing.lg,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  exploreButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default FriendsListScreen;