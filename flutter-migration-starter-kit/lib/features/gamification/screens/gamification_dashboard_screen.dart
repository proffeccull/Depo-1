import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../core/config/theme.dart';
import '../providers/gamification_provider.dart';
import '../widgets/activity_rings_widget.dart';
import '../widgets/missions_list_widget.dart';
import '../widgets/streaks_widget.dart';
import '../widgets/achievements_preview_widget.dart';

class GamificationDashboardScreen extends ConsumerStatefulWidget {
  const GamificationDashboardScreen({super.key});

  @override
  ConsumerState<GamificationDashboardScreen> createState() => _GamificationDashboardScreenState();
}

class _GamificationDashboardScreenState extends ConsumerState<GamificationDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    final missionsAsync = ref.watch(todaysMissionsProvider);
    final progressAsync = ref.watch(todaysProgressProvider);
    final streaksAsync = ref.watch(dailyStreakProvider);
    final achievementsAsync = ref.watch(achievementsProvider);

    return Scaffold(
      backgroundColor: ChainGiveTheme.lightTheme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Row(
          children: [
            AfricanMotifs.adinkraUnity(size: 24),
            const SizedBox(width: 8),
            const Text('Daily Challenges'),
          ],
        ),
        backgroundColor: ChainGiveTheme.savannaGold,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.go('/settings'),
            tooltip: 'Settings',
          ),
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () => context.go('/notifications'),
            tooltip: 'Notifications',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([
            ref.refresh(todaysMissionsProvider),
            ref.refresh(todaysProgressProvider),
            ref.refresh(dailyStreakProvider),
            ref.refresh(achievementsProvider),
          ]);
        },
        color: ChainGiveTheme.savannaGold,
        child: CustomScrollView(
          slivers: [
            // Welcome Header
            SliverToBoxAdapter(
              child: _buildWelcomeHeader(),
            ),

            // Activity Rings & Streaks
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Progress',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: ChainGiveTheme.charcoal,
                      ),
                    ),
                    const SizedBox(height: 16),
                    progressAsync.when(
                      data: (progress) => ActivityRingsWidget(progress: progress),
                      loading: () => const Center(child: CircularProgressIndicator()),
                      error: (e, _) => _buildErrorCard('Failed to load progress', e.toString()),
                    ),
                    const SizedBox(height: 16),
                    streaksAsync.when(
                      data: (streak) => StreaksWidget(streak: streak),
                      loading: () => const SizedBox.shrink(),
                      error: (e, _) => const SizedBox.shrink(),
                    ),
                  ],
                ),
              ),
            ),

            // Daily Missions
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Today\'s Missions',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: ChainGiveTheme.charcoal,
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.go('/missions'),
                          child: Text(
                            'View All',
                            style: TextStyle(color: ChainGiveTheme.savannaGold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                child: missionsAsync.when(
                  data: (missions) => MissionsListWidget(
                    missions: missions,
                    onMissionComplete: (mission) async {
                      try {
                        await ref.read(todaysMissionsProvider.notifier).completeMission(mission.id);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Mission completed! +${mission.rewardCoins} coins'),
                              backgroundColor: ChainGiveTheme.acaciaGreen,
                            ),
                          );
                        }
                      } catch (e) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Failed to complete mission: $e'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      }
                    },
                  ),
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                  error: (e, _) => _buildErrorCard('Failed to load missions', e.toString()),
                ),
              ),
            ),

            // Achievements Preview
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Recent Achievements',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: ChainGiveTheme.charcoal,
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.go('/achievements'),
                          child: Text(
                            'View All',
                            style: TextStyle(color: ChainGiveTheme.savannaGold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    achievementsAsync.when(
                      data: (achievements) => AchievementsPreviewWidget(
                        achievements: achievements.take(6).toList(),
                      ),
                      loading: () => const Center(child: CircularProgressIndicator()),
                      error: (e, _) => _buildErrorCard('Failed to load achievements', e.toString()),
                    ),
                  ],
                ),
              ),
            ),

            // Quick Actions
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                child: _buildQuickActions(context),
              ),
            ),

            // Bottom spacing
            const SliverToBoxAdapter(
              child: SizedBox(height: 32),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ChainGiveTheme.savannaGold,
            ChainGiveTheme.savannaGold.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Welcome back!',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Continue your journey of giving and earning rewards',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.local_fire_department,
                  color: Colors.orange,
                  size: 16,
                ),
                const SizedBox(width: 4),
                Text(
                  'Keep your streak alive!',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: ChainGiveTheme.charcoal,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                context,
                'Make Donation',
                Icons.volunteer_activism,
                ChainGiveTheme.acaciaGreen,
                () => context.go('/donate'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickActionCard(
                context,
                'Buy Coins',
                Icons.monetization_on,
                ChainGiveTheme.savannaGold,
                () => context.go('/coins'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                context,
                'Community',
                Icons.people,
                ChainGiveTheme.indigoBlue,
                () => context.go('/community'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildQuickActionCard(
                context,
                'Leaderboard',
                Icons.leaderboard,
                ChainGiveTheme.kenteRed,
                () => context.go('/rankings'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 24,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                  color: ChainGiveTheme.charcoal,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorCard(String title, String message) {
    return Card(
      color: Colors.red.withOpacity(0.1),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 32),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              message,
              style: TextStyle(
                color: Colors.red.withOpacity(0.8),
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () {
                // Refresh the data
                setState(() {});
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}