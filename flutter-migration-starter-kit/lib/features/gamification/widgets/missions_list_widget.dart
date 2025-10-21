import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../models/gamification_models.dart';

class MissionsListWidget extends ConsumerWidget {
  final DailyMission missions;

  const MissionsListWidget({
    super.key,
    required this.missions,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Daily Missions',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        _buildMissionItem(
          context,
          missions.mission1Name,
          missions.mission1Desc,
          missions.mission1Done,
          missions.mission1Reward,
        ),
        const SizedBox(height: 12),
        _buildMissionItem(
          context,
          missions.mission2Name,
          missions.mission2Desc,
          missions.mission2Done,
          missions.mission2Reward,
        ),
        const SizedBox(height: 12),
        _buildMissionItem(
          context,
          missions.mission3Name,
          missions.mission3Desc,
          missions.mission3Done,
          missions.mission3Reward,
        ),
        if (missions.allCompleted) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.amber.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber.shade200),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.star,
                  color: Colors.amber.shade600,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'All missions completed! Bonus: ${missions.bonusReward} coins',
                    style: TextStyle(
                      color: Colors.amber.shade800,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildMissionItem(
    BuildContext context,
    String title,
    String description,
    bool isCompleted,
    int reward,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCompleted ? Colors.green.shade50 : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCompleted ? Colors.green.shade200 : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isCompleted ? Colors.green : Colors.grey.shade300,
            ),
            child: Icon(
              isCompleted ? Icons.check : Icons.circle,
              size: 16,
              color: isCompleted ? Colors.white : Colors.grey.shade600,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: isCompleted ? Colors.green.shade800 : Colors.black87,
                    decoration: isCompleted ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.amber.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.monetization_on,
                  size: 14,
                  color: Colors.amber.shade700,
                ),
                const SizedBox(width: 4),
                Text(
                  '+$reward',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.amber.shade800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}