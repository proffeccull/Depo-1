import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store/store';
import { fetchAchievements, fetchUserProgress } from '../../store/slices/gamificationSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

// Import advanced gamification components
import { CharityCategoryCard } from '../../components/gamification/CharityCategoryCard';
import { CrewProgressBar } from '../../components/gamification/CrewProgressBar';
import { TrustReviewCard } from '../../components/gamification/TrustReviewCard';
import { WeeklyTargetCard } from '../../components/gamification/WeeklyTargetCard';
import { UserLevelCard } from '../../components/gamification/UserLevelCard';
import { CharitableNFTCard } from '../../components/gamification/CharitableNFTCard';

// Import premium coin components
import {
  CoinBalanceWidget,
  CoinAchievementCard,
  CoinBattlePass,
  CoinParticleSystem,
  coinSounds,
} from '../../components/coins';
import { FadeInView } from '../../components/animated';

const { width: screenWidth } = Dimensions.get('window');

type TabType = 'achievements' | 'battlepass' | 'missions' | 'stats' | 'advanced';

const GamificationHubScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { achievements, userProgress, loading } = useSelector((state: RootState) => state.gamification);
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<TabType>('achievements');
  const [showParticleEffect, setShowParticleEffect] = useState(false);

  useEffect(() => {
    dispatch(fetchAchievements());
    dispatch(fetchUserProgress());
  }, [dispatch]);

  const handleTabPress = (tab: TabType) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleAchievementUnlock = (achievementId: string) => {
    coinSounds.playMilestoneReach();
    setShowParticleEffect(true);
    // Handle achievement unlock logic
  };

  const handleBattlePassClaim = (tierId: number) => {
    coinSounds.playCoinRain();
    setShowParticleEffect(true);
    // Handle battle pass claim logic
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'achievements', label: 'Achievements', icon: 'emoji-events' },
    { key: 'battlepass', label: 'Battle Pass', icon: 'military-tech' },
    { key: 'missions', label: 'Missions', icon: 'assignment' },
    { key: 'advanced', label: 'Advanced', icon: 'rocket' },
    { key: 'stats', label: 'Stats', icon: 'bar-chart' },
  ];

  const renderAchievement = ({ item }: { item: any }) => (
    <FadeInView duration={400} delay={Math.random() * 500}>
      <CoinAchievementCard
        id={item.id}
        name={item.name}
        description={item.description}
        rarity={item.rarity || 'common'}
        coinReward={item.coinReward || 0}
        serialNumber={item.serialNumber || Math.floor(Math.random() * 10000)}
        totalSupply={item.totalSupply || 10000}
        unlockedAt={item.unlockedAt || new Date()}
        canMintNFT={item.canMintNFT || false}
        mintCost={item.mintCost || 100}
        isTradeable={item.isTradeable || false}
        marketValue={item.marketValue || 0}
        glowColor={item.glowColor || colors.primary}
        animationType={item.animationType || 'fade'}
        unlocked={item.unlocked || Math.random() > 0.5}
        onPress={() => handleAchievementUnlock(item.id)}
        onMintNFT={() => console.log('Mint NFT:', item.id)}
        onTrade={() => console.log('Trade:', item.id)}
      />
    </FadeInView>
  );

  const renderMission = ({ item }: { item: any }) => (
    <FadeInView duration={400} delay={Math.random() * 500}>
      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <View style={styles.missionIcon}>
            <Icon name={item.icon || 'assignment'} size={24} color={colors.primary} />
          </View>
          <View style={styles.missionInfo}>
            <Text style={styles.missionTitle}>{item.title}</Text>
            <Text style={styles.missionDesc}>{item.description}</Text>
          </View>
          <View style={styles.missionReward}>
            <Icon name="stars" size={16} color={colors.tertiary} />
            <Text style={styles.rewardText}>+{item.reward} coins</Text>
          </View>
        </View>

        <View style={styles.missionProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(item.progress / item.target) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.progress}/{item.target} completed
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.missionButton,
            item.progress >= item.target && styles.missionButtonActive,
          ]}
          onPress={() => {
            if (item.progress >= item.target) {
              coinSounds.playCoinRain();
              setShowParticleEffect(true);
            }
          }}
          disabled={item.progress < item.target}
        >
          <Text style={[
            styles.missionButtonText,
            item.progress >= item.target && styles.missionButtonTextActive,
          ]}>
            {item.progress >= item.target ? 'Claim Reward' : 'In Progress'}
          </Text>
        </TouchableOpacity>
      </View>
    </FadeInView>
  );

  const renderStats = () => (
    <FadeInView duration={600}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '10']}
            style={styles.statGradient}
          >
            <Icon name="volunteer-activism" size={32} color={colors.primary} />
            <Text style={styles.statNumber}>{userProgress?.totalDonations || 0}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.tertiary + '20', colors.tertiary + '10']}
            style={styles.statGradient}
          >
            <Icon name="monetization-on" size={32} color={colors.tertiary} />
            <Text style={styles.statNumber}>{user?.charityCoins || 0}</Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.secondary + '20', colors.secondary + '10']}
            style={styles.statGradient}
          >
            <Icon name="emoji-events" size={32} color={colors.secondary} />
            <Text style={styles.statNumber}>{achievements?.filter(a => a.unlocked).length || 0}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.success + '20', colors.success + '10']}
            style={styles.statGradient}
          >
            <Icon name="local-fire-department" size={32} color={colors.success} />
            <Text style={styles.statNumber}>{userProgress?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </LinearGradient>
        </View>
      </View>
    </FadeInView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Coin Balance Widget - Always Visible */}
      <CoinBalanceWidget
        balance={user?.charityCoins || 0}
        trend="up"
        change24h={200}
        animation="glow"
        size="medium"
        showQuickActions={true}
        onQuickAction={(action) => {
          switch (action) {
            case 'buy':
              navigation.navigate('BuyCoinsScreen');
              break;
            case 'earn':
              navigation.navigate('GiveScreen');
              break;
            case 'spend':
              navigation.navigate('MarketplaceScreen');
              break;
            case 'history':
              navigation.navigate('TransactionHistory');
              break;
          }
        }}
      />

      {/* Particle Effects */}
      {showParticleEffect && (
        <CoinParticleSystem
          trigger={showParticleEffect}
          type="celebration"
          intensity="high"
          duration={2000}
          onComplete={() => setShowParticleEffect(false)}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gamification Hub</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('GamificationSettings')}
          >
            <Icon name="settings" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonActive,
              ]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? colors.white : colors.text.secondary}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'achievements' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Your Achievements</Text>
            <FlatList
              data={achievements || []}
              renderItem={renderAchievement}
              keyExtractor={(item) => item.id}
              numColumns={1}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.achievementsList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon name="emoji-events" size={64} color={colors.gray[300]} />
                  <Text style={styles.emptyTitle}>No achievements yet</Text>
                  <Text style={styles.emptyText}>Start donating to unlock achievements!</Text>
                </View>
              }
            />
          </View>
        )}

        {activeTab === 'battlepass' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Coin Master Battle Pass</Text>
            <CoinBattlePass
              tiers={[
                {
                  id: 1,
                  name: 'Welcome Bonus',
                  description: 'Your first coin reward',
                  coinReward: 100,
                  unlocked: true,
                  claimed: true,
                  rarity: 'common',
                  icon: 'celebration',
                },
                {
                  id: 2,
                  name: 'Generous Spirit',
                  description: 'Complete 5 donations',
                  coinReward: 500,
                  unlocked: true,
                  claimed: false,
                  rarity: 'rare',
                  icon: 'volunteer_activism',
                },
                {
                  id: 3,
                  name: 'Coin Collector',
                  description: 'Earn 1,000 coins total',
                  coinReward: 1000,
                  bonusReward: 200,
                  unlocked: false,
                  claimed: false,
                  rarity: 'epic',
                  icon: 'savings',
                },
                {
                  id: 4,
                  name: 'Philanthropist',
                  description: 'Complete 25 donation cycles',
                  coinReward: 2500,
                  bonusReward: 500,
                  unlocked: false,
                  claimed: false,
                  rarity: 'legendary',
                  icon: 'workspace-premium',
                },
                {
                  id: 5,
                  name: 'Coin Legend',
                  description: 'Reach top 10 on leaderboard',
                  coinReward: 5000,
                  bonusReward: 1000,
                  unlocked: false,
                  claimed: false,
                  rarity: 'mythic',
                  icon: 'military-tech',
                },
              ]}
              currentProgress={750}
              totalProgress={1000}
              userCoins={user?.charityCoins || 0}
              premiumUnlocked={false}
              onClaimReward={handleBattlePassClaim}
              onPurchasePremium={() => navigation.navigate('PremiumSubscription')}
              seasonName="Coin Master Season"
              seasonEndDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
            />
          </View>
        )}

        {activeTab === 'missions' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Daily Missions</Text>
            <FlatList
              data={[
                {
                  id: '1',
                  title: 'First Donation',
                  description: 'Make your first donation today',
                  icon: 'favorite',
                  progress: 1,
                  target: 1,
                  reward: 50,
                },
                {
                  id: '2',
                  title: 'Coin Collector',
                  description: 'Earn 100 coins today',
                  icon: 'monetization-on',
                  progress: 75,
                  target: 100,
                  reward: 25,
                },
                {
                  id: '3',
                  title: 'Streak Master',
                  description: 'Maintain a 7-day giving streak',
                  icon: 'local-fire-department',
                  progress: 5,
                  target: 7,
                  reward: 200,
                },
                {
                  id: '4',
                  title: 'Referral Champion',
                  description: 'Refer 3 new users',
                  icon: 'person-add',
                  progress: 1,
                  target: 3,
                  reward: 150,
                },
              ]}
              renderItem={renderMission}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.missionsList}
            />
          </View>
        )}

        {activeTab === 'advanced' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Advanced Gamification</Text>

            {/* Advanced Features Grid */}
            <View style={styles.advancedGrid}>
              <TouchableOpacity
                style={styles.advancedCard}
                onPress={() => navigation.navigate('CharityCategories')}
              >
                <LinearGradient
                  colors={[colors.primary + '20', colors.primary + '10']}
                  style={styles.advancedGradient}
                >
                  <Icon name="volunteer-activism" size={32} color={colors.primary} />
                  <Text style={styles.advancedTitle}>Charity Categories</Text>
                  <Text style={styles.advancedDesc}>Admin-created donation categories with rewards</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.advancedCard}
                onPress={() => navigation.navigate('CrewDashboard')}
              >
                <LinearGradient
                  colors={[colors.secondary + '20', colors.secondary + '10']}
                  style={styles.advancedGradient}
                >
                  <Icon name="groups" size={32} color={colors.secondary} />
                  <Text style={styles.advancedTitle}>Crew System</Text>
                  <Text style={styles.advancedDesc}>Group donations with shared progress bars</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.advancedCard}
                onPress={() => navigation.navigate('TrustReviewHub')}
              >
                <LinearGradient
                  colors={[colors.info + '20', colors.info + '10']}
                  style={styles.advancedGradient}
                >
                  <Icon name="verified-user" size={32} color={colors.info} />
                  <Text style={styles.advancedTitle}>Trust System</Text>
                  <Text style={styles.advancedDesc}>Video reviews for payment verification</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.advancedCard}
                onPress={() => navigation.navigate('WeeklyTargets')}
              >
                <LinearGradient
                  colors={[colors.tertiary + '20', colors.tertiary + '10']}
                  style={styles.advancedGradient}
                >
                  <Icon name="target" size={32} color={colors.tertiary} />
                  <Text style={styles.advancedTitle}>Weekly Targets</Text>
                  <Text style={styles.advancedDesc}>AI-powered personalized goals</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.advancedCard}
                onPress={() => navigation.navigate('UserLevels')}
              >
                <LinearGradient
                  colors={[colors.success + '20', colors.success + '10']}
                  style={styles.advancedGradient}
                >
                  <Icon name="trending-up" size={32} color={colors.success} />
                  <Text style={styles.advancedTitle}>Level System</Text>
                  <Text style={styles.advancedDesc}>XP progression with exclusive perks</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.advancedCard}
                onPress={() => navigation.navigate('CharitableNFTGallery')}
              >
                <LinearGradient
                  colors={[colors.warning + '20', colors.warning + '10']}
                  style={styles.advancedGradient}
                >
                  <Icon name="collections" size={32} color={colors.warning} />
                  <Text style={styles.advancedTitle}>NFT Gallery</Text>
                  <Text style={styles.advancedDesc}>Charitable NFTs with marketplace</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Coming Soon Features */}
            <View style={styles.comingSoonSection}>
              <Text style={styles.comingSoonTitle}>Coming Soon</Text>
              <View style={styles.comingSoonGrid}>
                <View style={styles.comingSoonCard}>
                  <Icon name="smart-toy" size={24} color={colors.text.secondary} />
                  <Text style={styles.comingSoonText}>AI Charity Matching</Text>
                </View>
                <View style={styles.comingSoonCard}>
                  <Icon name="social-distance" size={24} color={colors.text.secondary} />
                  <Text style={styles.comingSoonText}>Social Challenges</Text>
                </View>
                <View style={styles.comingSoonCard}>
                  <Icon name="local-activity" size={24} color={colors.text.secondary} />
                  <Text style={styles.comingSoonText}>Live Events</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'stats' && renderStats()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: layout.screenPadding,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.white,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  achievementsList: {
    paddingBottom: spacing.xl,
  },
  missionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  missionDesc: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  missionReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    gap: spacing.xxs,
  },
  rewardText: {
    ...typography.caption,
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  missionProgress: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  missionButton: {
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  missionButtonActive: {
    backgroundColor: colors.primary,
  },
  missionButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  missionButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  missionsList: {
    paddingBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (screenWidth - layout.screenPadding * 2 - spacing.md) / 2,
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.card,
  },
  statGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  advancedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  advancedCard: {
    width: (screenWidth - layout.screenPadding * 2 - spacing.md) / 2,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  advancedGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 120,
  },
  advancedTitle: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxs,
  },
  advancedDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  comingSoonSection: {
    marginTop: spacing.xl,
  },
  comingSoonTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  comingSoonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comingSoonCard: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  comingSoonText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default GamificationHubScreen;