import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/accessibility/cultural_gesture_detector.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';

// Mock user data
class UserProfile {
  String name;
  String email;
  String bio;
  String avatar;
  String location;
  String website;
  bool isPublic;
  bool showEmail;
  bool showLocation;
  bool showActivity;
  List<String> interests;
  Map<String, dynamic> stats;

  UserProfile({
    required this.name,
    required this.email,
    required this.bio,
    required this.avatar,
    required this.location,
    required this.website,
    required this.isPublic,
    required this.showEmail,
    required this.showLocation,
    required this.showActivity,
    required this.interests,
    required this.stats,
  });
}

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;

  // Mock user data
  late UserProfile _userProfile;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _userProfile = UserProfile(
      name: 'John Doe',
      email: 'john.doe@example.com',
      bio: 'Passionate about making a difference through technology and community service.',
      avatar: 'assets/images/avatar1.png',
      location: 'San Francisco, CA',
      website: 'https://johndoe.dev',
      isPublic: true,
      showEmail: false,
      showLocation: true,
      showActivity: true,
      interests: ['Technology', 'Philanthropy', 'AI', 'Sustainability'],
      stats: {
        'totalDonated': 1250.50,
        'projectsSupported': 15,
        'rank': 42,
        'coinsEarned': 8750,
        'achievements': 23,
      },
    );
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
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            expandedHeight: 300,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: _buildProfileHeader(),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: _showEditProfile,
              ),
              IconButton(
                icon: const Icon(Icons.settings),
                onPressed: _showPrivacySettings,
              ),
            ],
            bottom: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Overview'),
                Tab(text: 'Activity'),
                Tab(text: 'Achievements'),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildOverviewTab(),
            _buildActivityTab(),
            _buildAchievementsTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.primaryContainer,
          ],
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            _buildAvatar(),
            const SizedBox(height: 16),
            Text(
              _userProfile.name,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _userProfile.bio,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white.withOpacity(0.9),
              ),
              textAlign: TextAlign.center,
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            _buildStatsRow(),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    return Stack(
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white,
              width: 4,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: ClipOval(
            child: Image.asset(
              _userProfile.avatar,
              fit: BoxFit.cover,
            ),
          ),
        ),
        Positioned(
          bottom: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.secondary,
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white,
                width: 2,
              ),
            ),
            child: Icon(
              Icons.verified,
              color: Colors.white,
              size: 20,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 32),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildStatItem('Rank', '#${_userProfile.stats['rank']}'),
          _buildStatItem('Donated', '\$${_userProfile.stats['totalDonated']}'),
          _buildStatItem('Projects', '${_userProfile.stats['projectsSupported']}'),
          _buildStatItem('Coins', '${_userProfile.stats['coinsEarned']}'),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoSection(),
          const SizedBox(height: 24),
          _buildInterestsSection(),
          const SizedBox(height: 24),
          _buildRecentActivity(),
        ],
      ),
    );
  }

  Widget _buildInfoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'About',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            if (_userProfile.showLocation)
              _buildInfoRow(Icons.location_on, _userProfile.location),
            if (_userProfile.showEmail)
              _buildInfoRow(Icons.email, _userProfile.email),
            _buildInfoRow(Icons.language, _userProfile.website),
            _buildInfoRow(Icons.calendar_today, 'Joined March 2023'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 12),
          Text(text),
        ],
      ),
    );
  }

  Widget _buildInterestsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Interests',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _userProfile.interests.map((interest) {
                return Chip(
                  label: Text(interest),
                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  labelStyle: TextStyle(
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            _buildActivityItem(
              'Donated to Education Project',
              '2 hours ago',
              Icons.volunteer_activism,
            ),
            _buildActivityItem(
              'Earned "Generous Donor" badge',
              '1 day ago',
              Icons.emoji_events,
            ),
            _buildActivityItem(
              'Joined Community Challenge',
              '3 days ago',
              Icons.group,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(String title, String time, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: Theme.of(context).colorScheme.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title),
                Text(
                  time,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 20, // Mock data
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.volunteer_activism,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            title: Text('Activity ${index + 1}'),
            subtitle: Text('${index + 1} hours ago'),
            trailing: IconButton(
              icon: const Icon(Icons.more_vert),
              onPressed: () {},
            ),
          ),
        );
      },
    );
  }

  Widget _buildAchievementsTab() {
    final achievements = [
      {'name': 'First Donation', 'description': 'Made your first donation', 'icon': Icons.star, 'unlocked': true},
      {'name': 'Generous Donor', 'description': 'Donated over \$100', 'icon': Icons.favorite, 'unlocked': true},
      {'name': 'Community Builder', 'description': 'Helped 10 projects', 'icon': Icons.group, 'unlocked': true},
      {'name': 'Philanthropist', 'description': 'Donated over \$1000', 'icon': Icons.diamond, 'unlocked': false},
      {'name': 'Legend', 'description': 'Top 10 donor', 'icon': Icons.local_fire_department, 'unlocked': false},
    ];

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: achievements.length,
      itemBuilder: (context, index) {
        final achievement = achievements[index];
        final isUnlocked = achievement['unlocked'] as bool;

        return Card(
          color: isUnlocked
              ? Theme.of(context).colorScheme.primaryContainer
              : Theme.of(context).colorScheme.surfaceVariant,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  achievement['icon'] as IconData,
                  size: 48,
                  color: isUnlocked
                      ? Theme.of(context).colorScheme.primary
                      : Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(height: 8),
                Text(
                  achievement['name'] as String,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  achievement['description'] as String,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isUnlocked
                        ? Theme.of(context).colorScheme.onPrimaryContainer
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                ),
                if (!isUnlocked) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.grey.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Locked',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  void _showEditProfile() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.9,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Edit Profile',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    _buildAvatarSelector(),
                    const SizedBox(height: 24),
                    TextFormField(
                      initialValue: _userProfile.name,
                      decoration: const InputDecoration(
                        labelText: 'Name',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) => _userProfile.name = value,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      initialValue: _userProfile.bio,
                      decoration: const InputDecoration(
                        labelText: 'Bio',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                      onChanged: (value) => _userProfile.bio = value,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      initialValue: _userProfile.location,
                      decoration: const InputDecoration(
                        labelText: 'Location',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) => _userProfile.location = value,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      initialValue: _userProfile.website,
                      decoration: const InputDecoration(
                        labelText: 'Website',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (value) => _userProfile.website = value,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              // Save changes
                              setState(() {});
                              Navigator.of(context).pop();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Profile updated!')),
                              );
                            },
                            child: const Text('Save Changes'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarSelector() {
    final avatars = [
      'assets/images/avatar1.png',
      'assets/images/avatar2.png',
      'assets/images/avatar3.png',
      'assets/images/avatar4.png',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Choose Avatar',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: avatars.length,
            itemBuilder: (context, index) {
              final avatar = avatars[index];
              final isSelected = avatar == _userProfile.avatar;

              return CulturalGestureDetector(
                onTap: () => setState(() => _userProfile.avatar = avatar),
                child: Container(
                  margin: const EdgeInsets.only(right: 12),
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected
                          ? Theme.of(context).colorScheme.primary
                          : Colors.transparent,
                      width: 3,
                    ),
                  ),
                  child: ClipOval(
                    child: Image.asset(
                      avatar,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  void _showPrivacySettings() {
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
                'Privacy Settings',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                title: const Text('Public Profile'),
                subtitle: const Text('Make your profile visible to everyone'),
                value: _userProfile.isPublic,
                onChanged: (value) => setState(() => _userProfile.isPublic = value),
              ),
              SwitchListTile(
                title: const Text('Show Email'),
                subtitle: const Text('Display your email on your profile'),
                value: _userProfile.showEmail,
                onChanged: (value) => setState(() => _userProfile.showEmail = value),
              ),
              SwitchListTile(
                title: const Text('Show Location'),
                subtitle: const Text('Display your location on your profile'),
                value: _userProfile.showLocation,
                onChanged: (value) => setState(() => _userProfile.showLocation = value),
              ),
              SwitchListTile(
                title: const Text('Show Activity'),
                subtitle: const Text('Display your recent activity'),
                value: _userProfile.showActivity,
                onChanged: (value) => setState(() => _userProfile.showActivity = value),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Save Settings'),
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
}