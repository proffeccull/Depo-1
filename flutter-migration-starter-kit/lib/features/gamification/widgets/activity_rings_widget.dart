import 'package:flutter/material.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../core/config/theme.dart';
import '../models/gamification_models.dart';

class ActivityRingsWidget extends StatelessWidget {
  final DailyProgress progress;

  const ActivityRingsWidget({
    super.key,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                AfricanMotifs.unityCircles(size: 24, color: ChainGiveTheme.savannaGold),
                const SizedBox(width: 8),
                Text(
                  'Activity Rings',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: ChainGiveTheme.charcoal,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildRing(
                  context,
                  label: 'Give',
                  progress: _calculateProgress(progress.giveProgress, progress.giveGoal),
                  color: ChainGiveTheme.acaciaGreen,
                  isCompleted: progress.giveClosed,
                  current: progress.giveProgress,
                  goal: progress.giveGoal,
                ),
                _buildRing(
                  context,
                  label: 'Earn',
                  progress: _calculateProgress(progress.earnProgress, progress.earnGoal),
                  color: ChainGiveTheme.savannaGold,
                  isCompleted: progress.earnClosed,
                  current: progress.earnProgress,
                  goal: progress.earnGoal,
                ),
                _buildRing(
                  context,
                  label: 'Engage',
                  progress: _calculateProgress(progress.engageProgress, progress.engageGoal),
                  color: ChainGiveTheme.indigoBlue,
                  isCompleted: progress.engageClosed,
                  current: progress.engageProgress,
                  goal: progress.engageGoal,
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildProgressSummary(context),
          ],
        ),
      ),
    );
  }

  Widget _buildRing(
    BuildContext context, {
    required String label,
    required double progress,
    required Color color,
    required bool isCompleted,
    required int current,
    required int goal,
  }) {
    final progressValue = progress.clamp(0.0, 1.0);

    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 70,
              height: 70,
              child: CircularProgressIndicator(
                value: progressValue,
                backgroundColor: color.withOpacity(0.2),
                valueColor: AlwaysStoppedAnimation<Color>(
                  isCompleted ? color : color.withOpacity(0.7)
                ),
                strokeWidth: 6,
              ),
            ),
            if (isCompleted)
              Icon(
                Icons.check_circle,
                color: color,
                size: 24,
              )
            else
              Text(
                '${(progressValue * 100).round()}%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: isCompleted ? color : ChainGiveTheme.charcoal.withOpacity(0.7),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '$current/$goal',
          style: TextStyle(
            fontSize: 12,
            color: ChainGiveTheme.charcoal.withOpacity(0.6),
          ),
        ),
      ],
    );
  }

  Widget _buildProgressSummary(BuildContext context) {
    final totalProgress = (progress.giveProgress + progress.earnProgress + progress.engageProgress) / 3.0;
    final overallProgress = totalProgress / ((progress.giveGoal + progress.earnGoal + progress.engageGoal) / 3.0);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ChainGiveTheme.clayBeige.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Daily Progress',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: ChainGiveTheme.charcoal,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${(overallProgress * 100).round()}% complete',
                  style: TextStyle(
                    fontSize: 12,
                    color: ChainGiveTheme.charcoal.withOpacity(0.7),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
              value: overallProgress.clamp(0.0, 1.0),
              backgroundColor: ChainGiveTheme.savannaGold.withOpacity(0.2),
              valueColor: AlwaysStoppedAnimation<Color>(ChainGiveTheme.savannaGold),
              strokeWidth: 4,
            ),
          ),
        ],
      ),
    );
  }

  double _calculateProgress(int current, int goal) {
    if (goal == 0) return 0.0;
    return current / goal;
  }
}