import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/donations/screens/donation_screen.dart';
import '../../features/donations/screens/donation_history_screen.dart';
import '../../features/coins/screens/coin_store_screen.dart';
import '../../features/ai/screens/ai_dashboard_screen.dart';
import 'package:flutter/material.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/settings/screens/settings_screen.dart';
import '../../features/community/screens/community_screen.dart';
import '../../features/rankings/screens/rankings_screen.dart';
// Phase 2: Advanced Features
import '../../features/gamification/screens/gamification_dashboard_screen.dart';
import '../../features/gamification/screens/missions_screen.dart';
import '../../features/gamification/screens/achievements_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/security/screens/security_settings_screen.dart';
import '../../features/accessibility/screens/accessibility_settings_screen.dart';
import '../../features/feedback/screens/feedback_screen.dart';
import '../../features/marketplace/screens/marketplace_screen.dart';

// Auth guard for protected routes
bool _authGuard() {
  // TODO: Implement actual authentication check
  // return ref.watch(authProvider).isAuthenticated;
  return true; // Temporarily allow all routes
}

// Router configuration
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/home', // Change to '/login' when auth is implemented
    routes: [
      // Authentication Routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // Main App Routes (Protected)
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
        redirect: (context, state) {
          // Redirect to login if not authenticated
          if (!_authGuard()) {
            return '/login';
          }
          return null;
        },
      ),

      // Donation Routes
      GoRoute(
        path: '/donate',
        builder: (context, state) => const DonationScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
      GoRoute(
        path: '/donation-history',
        builder: (context, state) => const DonationHistoryScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),

      // Coin System Routes
      GoRoute(
        path: '/coins',
        builder: (context, state) => const CoinStoreScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),

      // AI Features Routes
      GoRoute(
        path: '/ai-dashboard',
        builder: (context, state) => const AIDashboardScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),

      // Profile and Settings Routes
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(), // TODO: Implement ProfileScreen
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(), // TODO: Implement SettingsScreen
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),

      // Community Routes
      GoRoute(
        path: '/community',
        builder: (context, state) => const CommunityScreen(), // TODO: Implement CommunityScreen
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),

      // Leaderboard Routes
      GoRoute(
        path: '/rankings',
        builder: (context, state) => const RankingsScreen(), // TODO: Implement RankingsScreen
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),

      // Marketplace Routes (Future feature)
      GoRoute(
        path: '/marketplace',
        builder: (context, state) => const MarketplaceScreen(), // TODO: Implement MarketplaceScreen
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),

      // Phase 2: Advanced Features Routes
      GoRoute(
        path: '/gamification',
        builder: (context, state) => const GamificationDashboardScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
      GoRoute(
        path: '/security',
        builder: (context, state) => const SecuritySettingsScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
      GoRoute(
        path: '/accessibility',
        builder: (context, state) => const AccessibilitySettingsScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
      GoRoute(
        path: '/feedback',
        builder: (context, state) => const FeedbackScreen(),
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
      GoRoute(
        path: '/missions',
        builder: (context, state) => const MissionsScreen(), // TODO: Implement MissionsScreen
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
      GoRoute(
        path: '/achievements',
        builder: (context, state) => const AchievementsScreen(), // TODO: Implement AchievementsScreen
        redirect: (context, state) => _authGuard() ? null : '/login',
      ),
    ],

    // Error handling
    errorBuilder: (context, state) => Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(50), child: AppBar(title: const Text('Error'))),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(Icons.error_outline, size: 64, color: Colors.red),
            SizedBox(height: 16),
            Text('Page not found'),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: null,
              child: Text('Go Home'),
            ),
          ],
        ),
      ),
    ),

    // Deep linking support
    redirect: (context, state) {
      // Handle deep links and redirects
      final location = state.uri.path;

      // Redirect root to home
      if (location == '/') {
        return '/home';
      }

      return null;
    },

    // Debug logging in development
    debugLogDiagnostics: true,
  );
});

// Navigation helper functions
class AppRouter {
  static void goToHome(BuildContext context) => context.go('/home');
  static void goToDonate(BuildContext context) => context.go('/donate');
  static void goToCoins(BuildContext context) => context.go('/coins');
  static void goToCommunity(BuildContext context) => context.go('/community');
  static void goToRankings(BuildContext context) => context.go('/rankings');
  static void goToProfile(BuildContext context) => context.go('/profile');
  static void goToSettings(BuildContext context) => context.go('/settings');
  static void goToAIDashboard(BuildContext context) => context.go('/ai-dashboard');
  static void goToLogin(BuildContext context) => context.go('/login');

  // Phase 2: Advanced Features Navigation
  static void goToGamification(BuildContext context) => context.go('/gamification');
  static void goToNotifications(BuildContext context) => context.go('/notifications');
  static void goToSecurity(BuildContext context) => context.go('/security');
  static void goToAccessibility(BuildContext context) => context.go('/accessibility');
  static void goToFeedback(BuildContext context) => context.go('/feedback');
  static void goToMissions(BuildContext context) => context.go('/missions');
  static void goToAchievements(BuildContext context) => context.go('/achievements');

  // Push routes (with back navigation)
  static void pushToDonationHistory(BuildContext context) =>
      context.push('/donation-history');

  // Replace current route
  static void replaceWithHome(BuildContext context) =>
      context.replace('/home');

  // Go back
  static void goBack(BuildContext context) => context.pop();

  // Check if can go back
  static bool canGoBack(BuildContext context) => context.canPop();
}

// Route constants for consistency
class AppRoutes {
  static const String home = '/home';
  static const String login = '/login';
  static const String register = '/register';
  static const String donate = '/donate';
  static const String donationHistory = '/donation-history';
  static const String coins = '/coins';
  static const String community = '/community';
  static const String rankings = '/rankings';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String aiDashboard = '/ai-dashboard';
  static const String marketplace = '/marketplace';

  // Phase 2: Advanced Features Routes
  static const String gamification = '/gamification';
  static const String notifications = '/notifications';
  static const String security = '/security';
  static const String accessibility = '/accessibility';
  static const String feedback = '/feedback';
  static const String missions = '/missions';
  static const String achievements = '/achievements';
}

// Route guards for different user roles
class RouteGuards {
  static bool requireAuth() => _authGuard();
  static bool requireDonor() => _authGuard(); // All authenticated users are donors
  static bool requireAgent() {
    // TODO: Check if user has agent role
    return _authGuard();
  }
  static bool requireAdmin() {
    // TODO: Check if user has admin role
    return false;
  }
}

// Navigation observer for analytics and tracking
class AppNavigationObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    _trackNavigation(route.settings.name, 'push');
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    _trackNavigation(route.settings.name, 'pop');
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    _trackNavigation(newRoute?.settings.name, 'replace');
  }

  void _trackNavigation(String? routeName, String action) {
    if (routeName != null) {
      // TODO: Send analytics event
      debugPrint('Navigation: $action to $routeName');
    }
  }
}

// Helper function to create router (used in app.dart)
GoRouter createRouter(WidgetRef ref) {
  return ref.watch(routerProvider);
}