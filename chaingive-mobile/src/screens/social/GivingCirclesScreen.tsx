import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchGivingCircles, joinGivingCircle } from '../../store/slices/socialSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';

const { width: screenWidth } = Dimensions.get('window');

const GivingCirclesScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { circles, loading } = useSelector((state: RootState) => state.social);
  const { user } = useSelector((state: RootState) => state.auth);
  const { balance } = useSelector((state: RootState) => state.coin);

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'public' | 'premium'>('all');

  useEffect(() => {
    dispatch(fetchGivingCircles());
  }, [dispatch]);

  const filteredCircles = circles.filter(circle => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'public') return circle.privacy === 'public';
    if (selectedFilter === 'premium') return circle.isPremium;
    return true;
  });

  const handleJoinCircle = async (circleId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(joinGivingCircle(circleId)).unwrap();
      showToast('Successfully joined the circle!', 'success');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to join circle', 'error');
    }
  };

  const handleCreateCircle = () => {
    navigation.navigate('CreateCircle' as never);
  };

  const renderCircleCard = ({ item: circle }: { item: any }) => {
    const isMember = circle.members.some((member: any) => member.userId === user?.id);
    const canAffordPremium = balance.current >= 200; // Premium circle cost

    return (
      <TouchableOpacity
        style={styles.circleCard}
        onPress={() => navigation.navigate('CircleDetail' as never, { circleId: circle.id })}
        activeOpacity={0.9}
      >
        {/* Premium Badge */}
        {circle.isPremium && (
          <View style={styles.premiumBadge}>
            <Icon name="star" size={12} color={colors.white} />
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.circleHeader}>
          <View style={styles.circleAvatar}>
            <Text style={styles.circleInitials}>
              {circle.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.circleInfo}>
            <Text style={styles.circleName} numberOfLines={1}>
              {circle.name}
            </Text>
            <Text style={styles.circlePrivacy}>
              {circle.privacy === 'public' ? '🌍 Public' :
               circle.privacy === 'private' ? '🔒 Private' :
               '✉️ Invite Only'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.circleDescription} numberOfLines={2}>
          {circle.description}
        </Text>

        {/* Stats */}
        <View style={styles.circleStats}>
          <View style={styles.stat}>
            <Icon name="people" size={16} color={colors.text.secondary} />
            <Text style={styles.statText}>{circle.members.length}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="favorite" size={16} color={colors.success} />
            <Text style={styles.statText}>
              ₦{circle.totalDonated.toLocaleString()}
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="emoji-events" size={16} color={colors.tertiary} />
            <Text style={styles.statText}>{circle.challenges.length}</Text>
          </View>
        </View>

        {/* Prize Pool (if premium) */}
        {circle.isPremium && circle.prizePool > 0 && (
          <View style={styles.prizePool}>
            <Icon name="trophy" size={16} color={colors.tertiary} />
            <Text style={styles.prizePoolText}>
              Prize Pool: {circle.prizePool.toLocaleString()} coins
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isMember && styles.memberButton,
            circle.isPremium && !canAffordPremium && styles.disabledButton,
          ]}
          onPress={() => {
            if (isMember) {
              navigation.navigate('CircleDetail' as never, { circleId: circle.id });
            } else if (circle.isPremium && !canAffordPremium) {
              showToast('Insufficient coins for premium circle', 'error');
            } else {
              handleJoinCircle(circle.id);
            }
          }}
          disabled={circle.isPremium && !canAffordPremium}
        >
          <Text style={[
            styles.actionButtonText,
            isMember && styles.memberButtonText,
          ]}>
            {isMember ? 'View Circle' :
             circle.isPremium ? `Join (${circle.coinRequirement} coins)` :
             'Join Circle'}
          </Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Giving Circles</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCircle}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {(['all', 'public', 'premium'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedFilter(filter);
            }}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === filter && styles.filterButtonTextSelected,
            ]}>
              {filter === 'all' ? 'All Circles' :
               filter === 'public' ? 'Public' :
               'Premium'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Circles List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading circles...</Text>
        </View>
      ) : filteredCircles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="groups" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Circles Found</Text>
          <Text style={styles.emptyMessage}>
            {selectedFilter === 'all'
              ? 'Be the first to create a giving circle!'
              : selectedFilter === 'public'
              ? 'No public circles available right now.'
              : 'No premium circles available. Upgrade to create one!'
            }
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={handleCreateCircle}
          >
            <Text style={styles.createFirstButtonText}>Create Circle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCircles}
          renderItem={renderCircleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={1}
        />
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Icon name="info" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Join giving circles to collaborate on charitable causes, participate in challenges,
          and earn bonus coins together!
        </Text>
      </View>
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
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  filterButtonSelected: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  filterButtonTextSelected: {
    color: colors.white,
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
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: 12,
  },
  createFirstButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  circleCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.tertiary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xxs,
  },
  premiumBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  circleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  circleAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  circleInitials: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xxs,
  },
  circlePrivacy: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  circleDescription: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  circleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  prizePool: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiary + '20',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  prizePoolText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  memberButton: {
    backgroundColor: colors.success,
  },
  memberButtonText: {
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.gray[300],
  },
  infoCard: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    ...shadows.card,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});

export default GivingCirclesScreen;