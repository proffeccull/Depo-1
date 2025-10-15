import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface ActivityItem {
  id: string;
  type: 'earning' | 'achievement' | 'milestone' | 'purchase' | 'social';
  message: string;
  timestamp: Date;
  coinAmount?: number;
  user?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  isNew?: boolean;
}

interface RealTimeActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  autoScroll?: boolean;
  showHeader?: boolean;
  onActivityPress?: (activity: ActivityItem) => void;
  onViewAllPress?: () => void;
}

const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({
  activities,
  maxItems = 10,
  autoScroll = true,
  showHeader = true,
  onActivityPress,
  onViewAllPress,
}) => {
  const [displayActivities, setDisplayActivities] = useState<ActivityItem[]>([]);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sort activities by timestamp (newest first)
    const sortedActivities = [...activities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxItems);

    setDisplayActivities(sortedActivities);

    // Fade in animation for new activities
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activities, maxItems]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    const icons = {
      earning: 'monetization-on',
      achievement: 'emoji-events',
      milestone: 'flag',
      purchase: 'shopping-cart',
      social: 'people',
    };
    return icons[type] || 'info';
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    const colorsMap = {
      earning: colors.tertiary,
      achievement: colors.warning,
      milestone: colors.success,
      purchase: colors.primary,
      social: colors.secondary,
    };
    return colorsMap[type] || colors.info;
  };

  const getRarityColor = (rarity?: ActivityItem['rarity']) => {
    const rarityColors = {
      common: colors.gray[400],
      rare: colors.info,
      epic: colors.secondary,
      legendary: colors.warning,
      mythic: '#FF1493',
    };
    return rarityColors[rarity || 'common'];
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderActivity = ({ item, index }: { item: ActivityItem; index: number }) => {
    const iconName = getActivityIcon(item.type);
    const iconColor = getActivityColor(item.type);
    const rarityColor = getRarityColor(item.rarity);

    return (
      <Animated.View
        style={[
          styles.activityItem,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20 * (index + 1), 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.activityTouchable}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onActivityPress?.(item);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.activityLeft}>
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: iconColor + '20' },
              ]}
            >
              <Icon name={iconName} size={20} color={iconColor} />
              {item.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.activityContent}>
            <Text style={styles.activityMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <View style={styles.activityMeta}>
              <Text style={styles.activityTime}>
                {formatTimeAgo(item.timestamp)}
              </Text>
              {item.coinAmount && (
                <View style={styles.coinBadge}>
                  <Icon name="monetization-on" size={12} color={colors.tertiary} />
                  <Text style={styles.coinAmount}>
                    +{item.coinAmount.toLocaleString()}
                  </Text>
                </View>
              )}
              {item.rarity && (
                <View style={[styles.rarityIndicator, { backgroundColor: rarityColor }]}>
                  <Text style={styles.rarityText}>
                    {item.rarity.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.activityRight}>
            <Icon name="chevron-right" size={20} color={colors.text.secondary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="flash" size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>Live Activity</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onViewAllPress?.();
            }}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.feedContainer}>
        <FlatList
          data={displayActivities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {displayActivities.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="timeline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Recent Activity</Text>
            <Text style={styles.emptyMessage}>
              Activity from the ChainGive community will appear here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
    marginRight: spacing.xxs,
  },
  liveText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 10,
  },
  viewAllText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  feedContainer: {
    maxHeight: 400,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  activityItem: {
    marginHorizontal: spacing.md,
  },
  activityTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  activityLeft: {
    marginRight: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 18,
    marginBottom: spacing.xxs,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activityTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  coinAmount: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
    marginLeft: spacing.xxs,
  },
  rarityIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  rarityText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  activityRight: {
    marginLeft: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default RealTimeActivityFeed;