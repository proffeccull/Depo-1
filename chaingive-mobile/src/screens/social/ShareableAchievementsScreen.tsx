import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchAchievements, shareAchievement } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const ShareableAchievementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { achievements, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAchievements(user.id));
    }
  }, [dispatch, user?.id]);

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  const handleShare = async (achievement: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const shareMessage = `🏆 I just unlocked "${achievement.title}" on ChainGive! ${achievement.description}\n\nJoin me in making a difference! #ChainGive #GivingBack`;

      await Share.share({
        message: shareMessage,
      });

      // Track the share action
      await dispatch(shareAchievement({
        achievementId: achievement.id,
        userId: user?.id || '',
      })).unwrap();

      showToast('Achievement shared successfully!', 'success');
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        showToast(error.message || 'Failed to share achievement', 'error');
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'donation': return 'favorite';
      case 'challenge': return 'emoji-events';
      case 'social': return 'people';
      case 'milestone': return 'star';
      default: return 'celebration';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'donation': return colors.primary;
      case 'challenge': return colors.tertiary;
      case 'social': return colors.secondary;
      case 'milestone': return colors.warning;
      default: return colors.success;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return ['#FFD700', '#FFA500'];
      case 'epic': return ['#8A2BE2', '#4B0082'];
      case 'rare': return ['#00BFFF', '#0000FF'];
      case 'common': return ['#32CD32', '#228B22'];
      default: return [colors.gray[400], colors.gray[600]];
    }
  };

  const categories = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'donation', label: 'Donations', icon: 'favorite' },
    { key: 'challenge', label: 'Challenges', icon: 'emoji-events' },
    { key: 'social', label: 'Social', icon: 'people' },
    { key: 'milestone', label: 'Milestones', icon: 'star' },
  ];

  const renderAchievementCard = ({ item: achievement }: { item: any }) => {
    const categoryColor = getCategoryColor(achievement.category);
    const rarityColors = getRarityColor(achievement.rarity);

    return (
      <View style={styles.achievementCard}>
        {/* Rarity Background */}
        <LinearGradient
          colors={rarityColors}
          style={styles.rarityBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Header */}
        <View style={styles.achievementHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Icon name={getCategoryIcon(achievement.category)} size={16} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
            </Text>
          </View>
          <View style={styles.rarityBadge}>
            <Text style={styles.rarityText}>
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Icon */}
        <View style={styles.achievementIcon}>
          <Text style={styles.achievementEmoji}>{achievement.icon || '🏆'}</Text>
        </View>

        {/* Content */}
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>

          {/* Progress (if applicable) */}
          {achievement.progress && achievement.target && (
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                Progress: {achievement.progress}/{achievement.target}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(achievement.progress / achievement.target) * 100}%` }
                  ]}
                />
              </View>
            </View>
          )}

          {/* Unlocked Date */}
          <Text style={styles.unlockedDate}>
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.achievementActions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(achievement)}
          >
            <Icon name="share" size={20} color={colors.white} />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Share Count */}
        {achievement.shareCount > 0 && (
          <View style={styles.shareCount}>
            <Icon name="visibility" size={14} color={colors.text.secondary} />
            <Text style={styles.shareCountText}>
              Shared {achievement.shareCount} times
            </Text>
          </View>
        )}
      </View>
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
        <Text style={styles.headerTitle}>Achievements</Text>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => navigation.navigate('AchievementStats' as never)}
        >
          <Icon name="bar-chart" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

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

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{achievements.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {achievements.filter(a => a.rarity === 'legendary').length}
          </Text>
          <Text style={styles.statLabel}>Legendary</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {achievements.reduce((sum, a) => sum + (a.shareCount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Shares</Text>
        </View>
      </View>

      {/* Achievements List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      ) : filteredAchievements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="emoji-events" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Achievements Yet</Text>
          <Text style={styles.emptyMessage}>
            {selectedCategory === 'all'
              ? 'Start participating to unlock your first achievement!'
              : `No ${selectedCategory} achievements unlocked yet.`
            }
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Challenges' as never)}
          >
            <Text style={styles.exploreButtonText}>Explore Challenges</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredAchievements}
          renderItem={renderAchievementCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.achievementsList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
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
  statsButton: {
    padding: spacing.xs,
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
  statsOverview: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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
  achievementsList: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  achievementCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    margin: spacing.xs,
    ...shadows.card,
    position: 'relative',
    overflow: 'hidden',
  },
  rarityBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  rarityBadge: {
    backgroundColor: colors.white + '90',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  rarityText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 10,
  },
  achievementIcon: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementEmoji: {
    fontSize: 48,
  },
  achievementContent: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  achievementTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  achievementDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  progressSection: {
    width: '100%',
    marginBottom: spacing.md,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  unlockedDate: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  achievementActions: {
    marginBottom: spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    padding: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
  },
  shareButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  shareCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  shareCountText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

export default ShareableAchievementsScreen;