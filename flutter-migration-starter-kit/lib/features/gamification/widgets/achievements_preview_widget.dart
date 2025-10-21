import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../models/gamification_models.dart';

class AchievementsPreviewWidget extends ConsumerWidget {
  final List<Achievement> achievements;
  final int totalAchievements;

  const AchievementsPreviewWidget({
    super.key,
    required this.achievements,
    required this.totalAchievements,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unlockedCount = achievements.where((a) => a.isUnlocked == true).length;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.purple.shade50,
            Colors.indigo.shade50,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.purple.shade200,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.emoji_events,
                color: Colors.purple.shade600,
                size: 28,
              ),
              const SizedBox(width: 8),
              Text(
                'Achievements',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.purple.shade800,
                    ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.purple.shade100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '$unlockedCount / $totalAchievements',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.purple.shade800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (achievements.isNotEmpty) ...[
            SizedBox(
              height: 120,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: achievements.take(5).length,
                itemBuilder: (context, index) {
                  final achievement = achievements[index];
                  return _buildAchievementItem(context, achievement);
                },
              ),
            ),
          ] else ...[
            Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Icon(
                      Icons.emoji_events_outlined,
                      size: 48,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No achievements yet',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 16),
          _buildProgressIndicator(context, unlockedCount, totalAchievements),
        ],
      ),
    );
  }

  Widget _buildAchievementItem(BuildContext context, Achievement achievement) {
    final isUnlocked = achievement.isUnlocked == true;

    return Container(
      width: 80,
      margin: const EdgeInsets.only(right: 12),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isUnlocked ? Colors.amber.shade100 : Colors.grey.shade100,
              border: Border.all(
                color: isUnlocked ? Colors.amber.shade300 : Colors.grey.shade300,
                width: 2,
              ),
            ),
            child: Icon(
              _getAchievementIcon(achievement.category),
              color: isUnlocked ? Colors.amber.shade600 : Colors.grey.shade400,
              size: 24,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            achievement.name,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: isUnlocked ? Colors.purple.shade800 : Colors.grey.shade600,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  IconData _getAchievementIcon(String category) {
    switch (category.toLowerCase()) {
      case 'giving':
        return Icons.favorite;
      case 'earning':
        return Icons.monetization_on;
      case 'engagement':
        return Icons.people;
      case 'streak':
        return Icons.local_fire_department;
      case 'special':
        return Icons.star;
      default:
        return Icons.emoji_events;
    }
  }

  Widget _buildProgressIndicator(BuildContext context, int unlocked, int total) {
    final progress = total > 0 ? unlocked / total : 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Progress',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.purple.shade800,
              ),
            ),
            Text(
              '${(progress * 100).round()}%',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.purple.shade600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: Colors.purple.shade100,
          valueColor: AlwaysStoppedAnimation<Color>(Colors.purple.shade600),
        ),
        const SizedBox(height: 8),
        Text(
          '$unlocked of $total achievements unlocked',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}