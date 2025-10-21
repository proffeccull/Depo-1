
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../shared/widgets/accessibility/cultural_gesture_detector.dart';
import '../../../core/config/theme.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ChainGiveTheme.clayBeige,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            AfricanMotifs.ubuntuPattern(size: 32),
            const SizedBox(width: 12),
            Text(
              'ChainGive',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: ChainGiveTheme.charcoal,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        actions: [
          CulturalGestureDetector(
            onTap: () => context.push('/profile'),
            child: Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Color.fromRGBO(ChainGiveTheme.savannaGold.red, ChainGiveTheme.savannaGold.green, ChainGiveTheme.savannaGold.blue, 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.person_outline,
                color: ChainGiveTheme.charcoal,
              ),
            ),
          ),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section with Cultural Greeting
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Color.fromRGBO(ChainGiveTheme.savannaGold.red, ChainGiveTheme.savannaGold.green, ChainGiveTheme.savannaGold.blue, 0.1),
                      Color.fromRGBO(ChainGiveTheme.acaciaGreen.red, ChainGiveTheme.acaciaGreen.green, ChainGiveTheme.acaciaGreen.blue, 0.1),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Color.fromRGBO(ChainGiveTheme.savannaGold.red, ChainGiveTheme.savannaGold.green, ChainGiveTheme.savannaGold.blue, 0.2),
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        AfricanMotifs.sankofaSymbol(size: 40),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Welcome to Ubuntu',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  color: ChainGiveTheme.charcoal,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'I am because we are',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Color.fromRGBO(ChainGiveTheme.charcoal.red, ChainGiveTheme.charcoal.green, ChainGiveTheme.charcoal.blue, 0.7),
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Quick Actions Grid
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: ChainGiveTheme.charcoal,
                  fontWeight: FontWeight.w600,
                ),
              ),

              const SizedBox(height: 16),

              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                children: [
                  _buildActionCard(
                    context,
                    'Make Donation',
                    Icons.volunteer_activism,
                    ChainGiveTheme.acaciaGreen,
                    () => context.push('/donate'),
                    AfricanMotifs.baobabTree(),
                  ),
                  _buildActionCard(
                    context,
                    'Coin Store',
                    Icons.store,
                    ChainGiveTheme.indigoBlue,
                    () => context.push('/coins'),
                    AfricanMotifs.kentePattern(),
                  ),
                  _buildActionCard(
                    context,
                    'Community',
                    Icons.people,
                    ChainGiveTheme.sunsetOrange,
                    () => context.push('/community'),
                    AfricanMotifs.unityCircles(),
                  ),
                  _buildActionCard(
                    context,
                    'AI Insights',
                    Icons.insights,
                    ChainGiveTheme.kenteRed,
                    () => context.push('/insights'),
                    AfricanMotifs.sankofaSymbol(),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Recent Activity Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Activity',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: ChainGiveTheme.charcoal,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  TextButton(
                    onPressed: () => context.push('/activity'),
                    child: Text(
                      'View All',
                      style: TextStyle(color: ChainGiveTheme.acaciaGreen),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Activity List (Placeholder for now)
              _buildActivityItem(
                context,
                'Donation to Education Fund',
                '\$50 • 2 hours ago',
                Icons.school,
                ChainGiveTheme.acaciaGreen,
              ),
              const SizedBox(height: 12),
              _buildActivityItem(
                context,
                'Coins earned from community',
                '+25 coins • Yesterday',
                Icons.monetization_on,
                ChainGiveTheme.indigoBlue,
              ),
              const SizedBox(height: 12),
              _buildActivityItem(
                context,
                'Joined Ubuntu Circle',
                'Tech Innovators • 3 days ago',
                Icons.group_add,
                ChainGiveTheme.sunsetOrange,
              ),

              const SizedBox(height: 32),

              // Cultural Quote Section
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Color.fromRGBO(ChainGiveTheme.charcoal.red, ChainGiveTheme.charcoal.green, ChainGiveTheme.charcoal.blue, 0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    AfricanMotifs.maasaiShield(size: 48),
                    const SizedBox(height: 16),
                    Text(
                      '"Alone we can do so little; together we can do so much."',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: ChainGiveTheme.charcoal,
                        fontStyle: FontStyle.italic,
                        height: 1.4,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Helen Keller',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Color.fromRGBO(ChainGiveTheme.charcoal.red, ChainGiveTheme.charcoal.green, ChainGiveTheme.charcoal.blue, 0.6),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),

      // Bottom Navigation
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Color.fromRGBO(ChainGiveTheme.charcoal.red, ChainGiveTheme.charcoal.green, ChainGiveTheme.charcoal.blue, 0.1),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          backgroundColor: Colors.white,
          selectedItemColor: ChainGiveTheme.savannaGold,
          unselectedItemColor: ChainGiveTheme.charcoal.withAlpha(128),
          currentIndex: 0,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.volunteer_activism),
              label: 'Donate',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.leaderboard),
              label: 'Rankings',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.chat),
              label: 'Community',
            ),
          ],
          onTap: (index) {
            switch (index) {
              case 0:
                // Already on home
                break;
              case 1:
                context.push('/donate');
                break;
              case 2:
                context.push('/rankings');
                break;
              case 3:
                context.push('/community');
                break;
            }
          },
        ),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
    Widget culturalMotif,
  ) {
    return DonationGestureDetector(
      onTap: onTap,
      onDonationGesture: () {
        // Special donation gesture handling
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Donation gesture detected! 💚'),
            backgroundColor: ChainGiveTheme.acaciaGreen,
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Color.fromRGBO(color.red, color.green, color.blue, 0.1),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(
            color: Color.fromRGBO(color.red, color.green, color.blue, 0.2),
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Color.fromRGBO(color.red, color.green, color.blue, 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 32),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: ChainGiveTheme.charcoal,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 24,
              child: culturalMotif,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Color.fromRGBO(ChainGiveTheme.charcoal.red, ChainGiveTheme.charcoal.green, ChainGiveTheme.charcoal.blue, 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: ChainGiveTheme.charcoal,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: ChainGiveTheme.charcoal.withAlpha(153),
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            color: ChainGiveTheme.charcoal.withAlpha(77),
          ),
        ],
      ),
    );
  }
}