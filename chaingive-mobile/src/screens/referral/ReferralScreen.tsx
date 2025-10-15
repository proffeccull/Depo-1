import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Clipboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { showToast } from '../../components/common/Toast';
import { referralAPI } from '../../api/referral';
import { EmptyStateIllustration } from '../../components/common/EmptyStateIllustration';
import { PulseAnimation } from '../../components/gamification/PulseAnimation';

const ReferralScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [copyButtonScale] = useState(new Animated.Value(1));
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [codeRes, historyRes] = await Promise.all([
        referralAPI.getMyCode(),
        referralAPI.getHistory(),
      ]);
      
      setReferralData(codeRes.data);
      setHistory(historyRes.data.referrals || []);
    } catch (error) {
      showToast('Failed to load referral data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReferralData();
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    if (!referralData) return;

    try {
      Clipboard.setString(referralData.referralCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animate button
      Animated.sequence([
        Animated.timing(copyButtonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(copyButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      showToast('Referral code copied!', 'success');
    } catch (error) {
      showToast('Failed to copy code', 'error');
    }
  };

  const handleShare = async () => {
    if (!referralData) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await Share.share({
        message: `Join ChainGive and start earning! Use my referral code: ${referralData.referralCode}

Download: https://chaingive.ng/app

Earn 300 coins when you complete 3 cycles! 🎁`,
        title: 'Join ChainGive',
      });

      // Trigger celebration
      setConfettiKey((prev) => prev + 1);
      showToast('Shared successfully!', 'success');
    } catch (error) {
      // User cancelled
    }
  };

  const renderReferral = ({ item }: { item: any }) => (
    <View style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <View style={styles.referralAvatar}>
          <Text style={styles.referralInitials}>
            {item.firstName?.[0]}{item.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.referralInfo}>
          <Text style={styles.referralName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.referralStatus}>
            {item.status === 'registered' ? '🎯 Registered (25 coins)' :
             item.status === 'first_cycle' ? '🔄 First Cycle (100 coins)' :
             '✅ Completed (175 coins)'}
          </Text>
        </View>
        <View style={styles.referralReward}>
          <Text style={styles.rewardValue}>{item.coinsEarned}</Text>
          <Text style={styles.rewardLabel}>coins</Text>
        </View>
      </View>
      <Text style={styles.referralDate}>
        Joined {new Date(item.registeredAt).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Referral Code Card */}
      {referralData && (
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{referralData.referralCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Copy to clipboard
                showToast('Code copied!', 'success');
              }}
            >
              <Icon name="content-copy" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Icon name="share" size={20} color={colors.white} />
            <Text style={styles.shareButtonText}>Share Referral Link</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rewards Info */}
      <View style={styles.rewardsCard}>
        <Text style={styles.rewardsTitle}>Earn Up to 300 Coins! 🎁</Text>
        <View style={styles.rewardsList}>
          <View style={styles.rewardItem}>
            <View style={styles.rewardIcon}>
              <Text style={styles.rewardEmoji}>🎯</Text>
            </View>
            <View style={styles.rewardDetails}>
              <Text style={styles.rewardName}>Friend Registers</Text>
              <Text style={styles.rewardAmount}>+25 coins</Text>
            </View>
          </View>
          <View style={styles.rewardItem}>
            <View style={styles.rewardIcon}>
              <Text style={styles.rewardEmoji}>🔄</Text>
            </View>
            <View style={styles.rewardDetails}>
              <Text style={styles.rewardName}>First Cycle Completed</Text>
              <Text style={styles.rewardAmount}>+100 coins</Text>
            </View>
          </View>
          <View style={styles.rewardItem}>
            <View style={styles.rewardIcon}>
              <Text style={styles.rewardEmoji}>✅</Text>
            </View>
            <View style={styles.rewardDetails}>
              <Text style={styles.rewardName}>Third Cycle Completed</Text>
              <Text style={styles.rewardAmount}>+175 coins</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      {referralData && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="people" size={24} color={colors.primary} />
            <CountUpAnimation
              value={referralData.totalReferrals || 0}
              style={styles.statValue}
            />
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="star" size={24} color={colors.success} />
            <CountUpAnimation
              value={referralData.activeReferrals || 0}
              style={styles.statValue}
            />
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="monetization-on" size={24} color={colors.gold} />
            <CountUpAnimation
              value={referralData.totalCoinsEarned || 0}
              style={styles.statValue}
            />
            <Text style={styles.statLabel}>Coins Earned</Text>
          </View>
        </View>
      )}

      {/* Referral History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Referrals</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Referrals Yet</Text>
          <Text style={styles.emptyMessage}>
            Share your code and start earning! You'll get 300 coins per successful referral.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderReferral}
          keyExtractor={(item) => item.id}
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
      
      {/* Celebration */}
      {showCelebration && (
        <>
          <ConfettiCelebration />
          <FloatingHearts count={8} />
        </>
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
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  codeCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  codeLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
  },
  codeText: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  copyButton: {
    padding: spacing.xs,
  },
  shareButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  shareButtonText: {
    ...typography.button,
    color: colors.white,
  },
  rewardsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rewardsTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  rewardsList: {
    gap: spacing.sm,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  rewardName: {
    ...typography.body,
    color: colors.text.primary,
  },
  rewardAmount: {
    ...typography.h4,
    color: colors.tertiary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  referralCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralInitials: {
    ...typography.h4,
    color: colors.white,
  },
  referralInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  referralName: {
    ...typography.h4,
    color: colors.text.primary,
  },
  referralStatus: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  referralReward: {
    alignItems: 'flex-end',
  },
  rewardValue: {
    ...typography.h3,
    color: colors.tertiary,
    fontWeight: '700',
  },
  rewardLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  referralDate: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
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
});

export default ReferralScreen;
