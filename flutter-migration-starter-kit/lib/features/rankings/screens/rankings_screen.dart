import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/accessibility/cultural_gesture_detector.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';

// Mock data models
class UserRanking {
  final String id;
  final String name;
  final String avatar;
  final int rank;
  final int points;
  final String skillLevel;
  final String region;
  final double change; // percentage change

  const UserRanking({
    required this.id,
    required this.name,
    required this.avatar,
    required this.rank,
    required this.points,
    required this.skillLevel,
    required this.region,
    required this.change,
  });
}

enum TimePeriod { daily, weekly, monthly, allTime }
enum ViewType { global, local, friends }

class RankingsScreen extends ConsumerStatefulWidget {
  const RankingsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RankingsScreen> createState() => _RankingsScreenState();
}

class _RankingsScreenState extends ConsumerState<RankingsScreen>
    with TickerProviderStateMixin {
  TimePeriod _selectedPeriod = TimePeriod.weekly;
  ViewType _selectedView = ViewType.global;
  String _selectedSkillLevel = 'All';
  String _selectedRegion = 'All';
  late TabController _tabController;

  // Mock data
  final List<UserRanking> _rankings = [
    const UserRanking(
      id: '1',
      name: 'Alice Johnson',
      avatar: 'assets/images/avatar1.png',
      rank: 1,
      points: 15420,
      skillLevel: 'Expert',
      region: 'North America',
      change: 12.5,
    ),
    const UserRanking(
      id: '2',
      name: 'Bob Smith',
      avatar: 'assets/images/avatar2.png',
      rank: 2,
      points: 14890,
      skillLevel: 'Advanced',
      region: 'Europe',
      change: -2.1,
    ),
    const UserRanking(
      id: '3',
      name: 'Carol Davis',
      avatar: 'assets/images/avatar3.png',
      rank: 3,
      points: 14250,
      skillLevel: 'Intermediate',
      region: 'Asia',
      change: 8.7,
    ),
    // Add more mock data...
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rankings'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Leaderboard'),
            Tab(text: 'Statistics'),
            Tab(text: 'Trends'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilters,
          ),
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: _shareRankings,
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildLeaderboardTab(),
          _buildStatisticsTab(),
          _buildTrendsTab(),
        ],
      ),
    );
  }

  Widget _buildLeaderboardTab() {
    return Column(
      children: [
        _buildFiltersBar(),
        Expanded(
          child: ListView.builder(
            itemCount: _rankings.length,
            itemBuilder: (context, index) {
              final ranking = _rankings[index];
              return _buildRankingCard(ranking, index);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFiltersBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Theme.of(context).cardColor,
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: SegmentedButton<TimePeriod>(
                  segments: const [
                    ButtonSegment(
                      value: TimePeriod.daily,
                      label: Text('Daily'),
                    ),
                    ButtonSegment(
                      value: TimePeriod.weekly,
                      label: Text('Weekly'),
                    ),
                    ButtonSegment(
                      value: TimePeriod.monthly,
                      label: Text('Monthly'),
                    ),
                  ],
                  selected: {_selectedPeriod},
                  onSelectionChanged: (Set<TimePeriod> selected) {
                    setState(() {
                      _selectedPeriod = selected.first;
                    });
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: SegmentedButton<ViewType>(
                  segments: const [
                    ButtonSegment(
                      value: ViewType.global,
                      label: Text('Global'),
                    ),
                    ButtonSegment(
                      value: ViewType.local,
                      label: Text('Local'),
                    ),
                    ButtonSegment(
                      value: ViewType.friends,
                      label: Text('Friends'),
                    ),
                  ],
                  selected: {_selectedView},
                  onSelectionChanged: (Set<ViewType> selected) {
                    setState(() {
                      _selectedView = selected.first;
                    });
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRankingCard(UserRanking ranking, int index) {
    final theme = Theme.of(context);
    final isTopThree = ranking.rank <= 3;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: CulturalGestureDetector(
        onTap: () => _showUserProfile(ranking),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Rank indicator
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isTopThree
                      ? _getRankColor(ranking.rank)
                      : theme.colorScheme.surface,
                  border: Border.all(
                    color: theme.colorScheme.outline,
                    width: 1,
                  ),
                ),
                child: Center(
                  child: Text(
                    '${ranking.rank}',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isTopThree
                          ? Colors.white
                          : theme.colorScheme.onSurface,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),

              // Avatar
              CircleAvatar(
                radius: 24,
                backgroundImage: AssetImage(ranking.avatar),
                child: const Icon(Icons.person),
              ),
              const SizedBox(width: 16),

              // User info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ranking.name,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${ranking.skillLevel} • ${ranking.region}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),

              // Points and change
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${ranking.points.toStringAsFixed(0)} pts',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  Row(
                    children: [
                      Icon(
                        ranking.change >= 0
                            ? Icons.trending_up
                            : Icons.trending_down,
                        size: 16,
                        color: ranking.change >= 0
                            ? Colors.green
                            : Colors.red,
                      ),
                      Text(
                        '${ranking.change.abs().toStringAsFixed(1)}%',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: ranking.change >= 0
                              ? Colors.green
                              : Colors.red,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatisticsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Your Statistics',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildStatRow('Current Rank', '#42'),
                  _buildStatRow('Total Points', '12,450'),
                  _buildStatRow('Weekly Change', '+5.2%'),
                  _buildStatRow('Best Rank', '#15'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Global Statistics',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildStatRow('Total Users', '125,430'),
                  _buildStatRow('Active Today', '45,230'),
                  _buildStatRow('Average Points', '8,750'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrendsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ranking Trends',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Card(
            child: Container(
              height: 200,
              padding: const EdgeInsets.all(16),
              child: const Center(
                child: Text('Line Chart Placeholder\n(Interactive chart would go here)'),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Container(
              height: 200,
              padding: const EdgeInsets.all(16),
              child: const Center(
                child: Text('Heatmap Placeholder\n(Region-based activity heatmap)'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Color _getRankColor(int rank) {
    switch (rank) {
      case 1:
        return const Color(0xFFFFD700); // Gold
      case 2:
        return const Color(0xFFC0C0C0); // Silver
      case 3:
        return const Color(0xFFCD7F32); // Bronze
      default:
        return Colors.grey;
    }
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Filters',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedSkillLevel,
                decoration: const InputDecoration(labelText: 'Skill Level'),
                items: ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert']
                    .map((level) => DropdownMenuItem(
                          value: level,
                          child: Text(level),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() => _selectedSkillLevel = value!);
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedRegion,
                decoration: const InputDecoration(labelText: 'Region'),
                items: ['All', 'North America', 'Europe', 'Asia', 'Africa', 'South America']
                    .map((region) => DropdownMenuItem(
                          value: region,
                          child: Text(region),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() => _selectedRegion = value!);
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        // Apply filters
                        Navigator.of(context).pop();
                      },
                      child: const Text('Apply'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _shareRankings() {
    // TODO: Implement sharing functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Sharing functionality coming soon!')),
    );
  }

  void _showUserProfile(UserRanking ranking) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(ranking.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 40,
              backgroundImage: AssetImage(ranking.avatar),
            ),
            const SizedBox(height: 16),
            Text('Rank: #${ranking.rank}'),
            Text('Points: ${ranking.points}'),
            Text('Skill Level: ${ranking.skillLevel}'),
            Text('Region: ${ranking.region}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}