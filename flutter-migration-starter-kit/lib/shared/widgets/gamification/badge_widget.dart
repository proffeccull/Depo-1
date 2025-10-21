import 'package:flutter/material.dart';
import '../../core/config/theme.dart';
import '../culturally_adaptive/african_motifs.dart';

class BadgeWidget extends StatelessWidget {
  final String badgeId;
  final String name;
  final String description;
  final String iconName;
  final bool isEarned;
  final Color? earnedColor;
  final Color? unearnedColor;
  final double size;

  const BadgeWidget({
    Key? key,
    required this.badgeId,
    required this.name,
    required this.description,
    required this.iconName,
    required this.isEarned,
    this.earnedColor,
    this.unearnedColor,
    this.size = 80,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final backgroundColor = isEarned
        ? (earnedColor ?? ChainGiveTheme.savannaGold)
        : (unearnedColor ?? Colors.grey.shade300);
    final iconColor = isEarned ? Colors.white : Colors.grey.shade500;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: isEarned
            ? LinearGradient(
                colors: [
                  backgroundColor,
                  backgroundColor.withAlpha(179),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isEarned ? null : backgroundColor,
        border: Border.all(
          color: isEarned ? backgroundColor.withAlpha(128) : Colors.grey.shade400,
          width: 2,
        ),
        boxShadow: isEarned
            ? [
                BoxShadow(
                  color: backgroundColor.withAlpha(77),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            _getIconData(iconName),
            color: iconColor,
            size: size * 0.5,
          ),
          if (isEarned)
            Positioned(
              top: 4,
              right: 4,
              child: Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: backgroundColor, width: 2),
                ),
                child: Icon(
                  Icons.check,
                  color: backgroundColor,
                  size: 10,
                ),
              ),
            ),
        ],
      ),
    );
  }

  IconData _getIconData(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'first_donation':
        return Icons.favorite;
      case 'giving_streak':
        return Icons.local_fire_department;
      case 'community_helper':
        return Icons.people;
      case 'impact_maker':
        return Icons.trending_up;
      case 'generous_heart':
        return Icons.heart_broken; // Using heart_broken as generous heart
      case 'ubuntu_spirit':
        return Icons.group_work;
      case 'chain_reaction':
        return Icons.link;
      case 'milestone_achiever':
        return Icons.emoji_events;
      case 'philanthropist':
        return Icons.star;
      case 'giving_champion':
        return Icons.military_tech;
      default:
        return Icons.badge;
    }
  }
}

class BadgeDetailCard extends StatelessWidget {
  final BadgeWidget badge;
  final String earnedDate;
  final int progress;
  final int totalRequired;

  const BadgeDetailCard({
    Key? key,
    required this.badge,
    required this.earnedDate,
    required this.progress,
    required this.totalRequired,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: badge.isEarned ? ChainGiveTheme.savannaGold.withAlpha(51) : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          badge,
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  badge.name,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: ChainGiveTheme.charcoal,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  badge.description,
                  style: TextStyle(
                    color: ChainGiveTheme.charcoal.withAlpha(179),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 8),
                if (badge.isEarned) ...[
                  Row(
                    children: [
                      Icon(
                        Icons.check_circle,
                        color: ChainGiveTheme.acaciaGreen,
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Earned $earnedDate',
                        style: TextStyle(
                          color: ChainGiveTheme.acaciaGreen,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      LinearProgressIndicator(
                        value: progress / totalRequired,
                        backgroundColor: Colors.grey.shade200,
                        valueColor: AlwaysStoppedAnimation<Color>(ChainGiveTheme.savannaGold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$progress / $totalRequired',
                        style: TextStyle(
                          color: ChainGiveTheme.charcoal.withAlpha(128),
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}