import 'package:flutter/material.dart';
import '../../../core/config/theme.dart';
import '../culturally_adaptive/african_motifs.dart';

class LevelProgressWidget extends StatelessWidget {
  final int currentLevel;
  final int currentXP;
  final int xpForNextLevel;
  final int xpForCurrentLevel;
  final String levelName;
  final Color? progressColor;
  final double height;

  const LevelProgressWidget({
    Key? key,
    required this.currentLevel,
    required this.currentXP,
    required this.xpForNextLevel,
    required this.xpForCurrentLevel,
    required this.levelName,
    this.progressColor,
    this.height = 24,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final progress = _calculateProgress();
    final color = progressColor ?? ChainGiveTheme.savannaGold;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color.withAlpha(25),
            color.withAlpha(10),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withAlpha(51),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Level $currentLevel',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  levelName,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: ChainGiveTheme.charcoal,
                    fontSize: 16,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: color.withAlpha(51)),
                ),
                child: Text(
                  '$currentXP XP',
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            height: height,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(height / 2),
              border: Border.all(
                color: color.withAlpha(51),
                width: 1,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(height / 2),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.transparent,
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${xpForCurrentLevel} XP',
                style: TextStyle(
                  color: ChainGiveTheme.charcoal.withAlpha(128),
                  fontSize: 12,
                ),
              ),
              Text(
                '${xpForNextLevel} XP',
                style: TextStyle(
                  color: ChainGiveTheme.charcoal.withAlpha(128),
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '${xpForNextLevel - currentXP} XP to next level',
            style: TextStyle(
              color: ChainGiveTheme.charcoal.withAlpha(179),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  double _calculateProgress() {
    final xpInCurrentLevel = currentXP - xpForCurrentLevel;
    final xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    return xpNeededForNextLevel > 0 ? xpInCurrentLevel / xpNeededForNextLevel : 1.0;
  }
}

class LevelUpAnimation extends StatefulWidget {
  final int newLevel;
  final String levelName;
  final VoidCallback onComplete;

  const LevelUpAnimation({
    Key? key,
    required this.newLevel,
    required this.levelName,
    required this.onComplete,
  }) : super(key: key);

  @override
  State<LevelUpAnimation> createState() => _LevelUpAnimationState();
}

class _LevelUpAnimationState extends State<LevelUpAnimation>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.2).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.elasticOut),
      ),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.3, curve: Curves.easeIn),
      ),
    );

    _controller.forward().then((_) => widget.onComplete());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Opacity(
          opacity: _opacityAnimation.value,
          child: Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    ChainGiveTheme.savannaGold,
                    ChainGiveTheme.acaciaGreen,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: ChainGiveTheme.savannaGold.withAlpha(128),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AfricanMotifs.sankofaSymbol(size: 48, color: Colors.white),
                  const SizedBox(height: 16),
                  Text(
                    'Level Up!',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Level ${widget.newLevel}: ${widget.levelName}',
                    style: TextStyle(
                      color: Colors.white.withAlpha(230),
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(51),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '🎉 Congratulations! 🎉',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}