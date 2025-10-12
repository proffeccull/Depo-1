import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import {
  fetchGlobalLeaderboard,
  fetchCityLeaderboard,
  fetchMyRank,
  boostLeaderboard,
  setSelectedCity,
} from '../../store/slices/leaderboardSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { showToast } from '../../components/common/Toast';
import Badge from '../../components/common/Badge';
import {
  LevelBadge,
  CountUpAnimation,
  StreakFlame,
  PageTransition,
  ConfettiCelebration,
} from '../../components/animations';
import { Card } from '../../components/ui';

const { width: screenWidth } = Dimensions.get('window');

const LeaderboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { globalLeaderboard, cityLeaderboard, myRank, selectedCity, loading } = useSelector(
    (state: RootState) => state.leaderboard
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [viewMode, setViewMode] = useState<'global' | 'city'>('global');
  const [refreshing, setRefreshing] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostType, setBoostType] = useState<'visibility' | 'multiplier' | 'position'>('multiplier');
  const [coinsToSpend, setCoinsToSpend] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    dispatch(fetchMyRank());
  }, [dispatch]);

  const loadLeaderboard = () => {
    if (viewMode === 'global') {
      dispatch(fetchGlobalLeaderboard({ limit: 50 }));
    } else if (selectedCity) {
      dispatch(fetchCityLeaderboard(selectedCity));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    await dispatch(fetchMyRank());
    setRefreshing(false);
  };

  const handleBoost = async () => {
    if (!coinsToSpend || parseInt(coinsToSpend) <= 0) {
      showToast('Enter valid coin amount', 'error');
      return;
    }

    const coins = parseInt(coinsToSpend);
    if (coins > (user?.charityCoins || 0)) {
      showToast('Insufficient coins', 'error');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await dispatch(
        boostLeaderboard({
          boostType,
          coinsToSpend: coins,
          duration: 7, // 7 days
        })
      ).unwrap();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Leaderboard boosted! 🚀', 'success');
      setShowBoostModal(false);
      setCoinsToSpend('');
      
      // Show celebration
      setShowCelebration(true);
      
      dispatch(fetchMyRank());
      loadLeaderboard();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to boost', 'error');
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return colors.tertiary; // Gold
    if (rank === 2) return colors.coin.silver;
    if (rank === 3) return colors.coin.bronze;
    return colors.text.secondary;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const leaderboard = viewMode === 'global' ? globalLeaderboard : cityLeaderboard;

  const renderLeaderboardEntry = ({ item, index }: { item: any; index: number }) => {
    const isCurrentUser = item.userId === user?.id;
    const isTopThree = item.rank <= 3;
    
    return (
      <View style={[styles.entryCard, isCurrentUser && styles.entryCardHighlight, isTopThree && styles.topThreeCard]}>
        {/* Rank Badge - Use LevelBadge for top 3 */}
        <View style={styles.rankBadgeContainer}>
          {isTopThree ? (
            <LevelBadge 
              level={item.rank} 
              size={item.rank === 1 ? 'large' : 'medium'} 
              showIcon 
            />
          ) : (
            <View style={styles.rankBadge}>
              <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
                #{item.rank}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.entryInfo}>
          <View style={styles.entryNameRow}>
            <Text style={[styles.entryName, isCurrentUser && styles.entryNameHighlight]}>
              {item.firstName} {item.lastName}
            </Text>
            {item.role !== 'beginner' && (
              <Badge 
                text={item.role} 
                color={
                  item.role === 'agent' ? colors.info :
                  item.role === 'power_partner' ? colors.secondary :
                  colors.tertiary
                } 
              />
            )}
          </View>
          <Text style={styles.entryLocation}>📍 {item.locationCity}</Text>
          <View style={styles.entryStats}>
            <Text style={styles.entryStat}>
              💰 <CountUpAnimation
                from={0}
                to={item.totalDonated}
                duration={1000}
                formatter={(val) => `₦${(val / 1000).toFixed(0)}K`}
                style={styles.statValue}
              />
            </Text>
            <Text style={styles.entryStat}>🔄 {item.cyclesCompleted} cycles</Text>
            <Text style={styles.entryStat}>🪙 {item.charityCoinsBalance} coins</Text>
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <CountUpAnimation
            from={0}
            to={item.score}
            duration={1200}
            formatter={(val) => Math.round(val).toLocaleString()}
            style={styles.scoreValue}
          />
          <Text style={styles.scoreLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowBoostModal(true);
          }}
        >
          <Icon name="rocket-launch" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* My Rank Card */}
      {myRank && (
        <View style={styles.myRankCard}>
          <View style={styles.myRankHeader}>
            <Text style={styles.myRankLabel}>Your Rank</Text>
            <Text style={styles.myRankValue}>{getRankIcon(myRank.rank)}</Text>
          </View>
          <View style={styles.myRankStats}>
            <View style={styles.myRankStat}>
              <Text style={styles.myRankStatLabel}>Score</Text>
              <Text style={styles.myRankStatValue}>{myRank.score.toLocaleString()}</Text>
            </View>
            <View style={styles.myRankStat}>
              <Text style={styles.myRankStatLabel}>Donated</Text>
              <Text style={styles.myRankStatValue}>₦{myRank.totalDonated.toLocaleString()}</Text>
            </View>
            <View style={styles.myRankStat}>
              <Text style={styles.myRankStatLabel}>Cycles</Text>
              <Text style={styles.myRankStatValue}>{myRank.cyclesCompleted}</Text>
            </View>
          </View>
        </View>
      )}

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'global' && styles.toggleButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode('global');
            dispatch(fetchGlobalLeaderboard());
          }}
        >
          <Text style={[styles.toggleText, viewMode === 'global' && styles.toggleTextActive]}>
            🌍 Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'city' && styles.toggleButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setViewMode('city');
            if (user?.locationCity) {
              dispatch(setSelectedCity(user.locationCity));
              dispatch(fetchCityLeaderboard(user.locationCity));
            }
          }}
        >
          <Text style={[styles.toggleText, viewMode === 'city' && styles.toggleTextActive]}>
            📍 My City
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard List */}
      {loading && leaderboard.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : leaderboard.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="emoji-events" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Rankings Yet</Text>
          <Text style={styles.emptyMessage}>
            Be the first to donate and climb the leaderboard!
          </Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardEntry}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Boost Modal */}
      <Modal
        visible={showBoostModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBoostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Boost Your Ranking 🚀</Text>
            
            <Text style={styles.modalSubtitle}>
              Available Coins: {user?.charityCoins || 0} 🪙
            </Text>

            <Text style={styles.inputLabel}>Boost Type</Text>
            <View style={styles.boostTypes}>
              {['multiplier', 'visibility', 'position'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.boostType,
                    boostType === type && styles.boostTypeSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setBoostType(type as any);
                  }}
                >
                  <Text style={[
                    styles.boostTypeText,
                    boostType === type && styles.boostTypeTextSelected,
                  ]}>
                    {type === 'multiplier' ? '✖️ 2x Multiplier' :
                     type === 'visibility' ? '👁️ Visibility' :
                     '⬆️ Jump Position'}
                  </Text>
                  <Text style={styles.boostTypeDescription}>
                    {type === 'multiplier' ? 'Double your score for 7 days' :
                     type === 'visibility' ? 'Featured at top for 7 days' :
                     'Jump 10 positions instantly'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Coins to Spend</Text>
            <TextInput
              style={styles.input}
              value={coinsToSpend}
              onChangeText={setCoinsToSpend}
              placeholder="Enter coins"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBoostModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleBoost}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Boost Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Premium Animations */}
      <ConfettiCelebration
        visible={showCelebration}
        message="🚀 Leaderboard Boosted!"
        submessage="Your visibility has been increased"
        onComplete={() => setShowCelebration(false)}
        confettiCount={150}
      />
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
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  myRankCard: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
  },
  myRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  myRankLabel: {
    ...typography.h3,
    color: colors.white,
  },
  myRankValue: {
    ...typography.h1,
  },
  myRankStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  myRankStat: {
    alignItems: 'center',
  },
  myRankStatLabel: {
    ...typography.caption,
    color: colors.white + 'CC',
  },
  myRankStatValue: {
    ...typography.h3,
    color: colors.white,
    marginTop: spacing.xs,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  toggleTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  entryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  entryCardHighlight: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '10',
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...typography.h3,
  },
  topThreeBadge: {
    marginRight: spacing.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginLeft: spacing.sm,
  },
  entryInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  entryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  entryName: {
    ...typography.h4,
    color: colors.text.primary,
  },
  entryNameHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  entryLocation: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  entryStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  entryStat: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  scoreLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    minHeight: 500,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.tertiary,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  boostTypes: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  boostType: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
  },
  boostTypeSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  boostTypeText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  boostTypeTextSelected: {
    color: colors.primary,
  },
  boostTypeDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: spacing.sm,
    ...typography.body,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default LeaderboardScreen;
