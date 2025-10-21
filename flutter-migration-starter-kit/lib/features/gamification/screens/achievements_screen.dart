import 'package:flutter/material.dart';
import '../../../core/config/theme.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../shared/widgets/accessibility/cultural_gesture_detector.dart';

class AchievementsScreen extends StatefulWidget {
  const AchievementsScreen({Key? key}) : super(key: key);

  @override
  State<AchievementsScreen> createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends State<AchievementsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            AfricanMotifs.sankofaSymbol(size: 24, color: ChainGiveTheme.savannaGold),
            const SizedBox(width: 8),
            const Text('Achievements'),
          ],
        ),
        backgroundColor: ChainGiveTheme.savannaGold,
        elevation: 0,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              ChainGiveTheme.savannaGold.withAlpha(25),
              Colors.white,
              ChainGiveTheme.clayBeige.withAlpha(51),
            ],
          ),
        ),
        child: const Center(
          child: Text('Achievements Screen - Coming Soon'),
        ),
      ),
    );
  }
}