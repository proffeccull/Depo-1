import 'package:flutter/material.dart';
import '../../../core/config/theme.dart';
import '../culturally_adaptive/african_motifs.dart';

class ProgressRingWidget extends StatelessWidget {
  final double progress;
  final String label;
  final String value;
  final String subtitle;
  final Color color;
  final double size;
  final double strokeWidth;
  final Widget? centerIcon;

  const ProgressRingWidget({
    Key? key,
    required this.progress,
    required this.label,
    required this.value,
    required this.subtitle,
    required this.color,
    this.size = 120,
    this.strokeWidth = 8,
    this.centerIcon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: size,
          height: size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Background circle
              Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: color.withAlpha(25),
                ),
              ),
              // Progress ring
              SizedBox(
                width: size - strokeWidth,
                height: size - strokeWidth,
                child: CircularProgressIndicator(
                  value: progress.clamp(0.0, 1.0),
                  backgroundColor: Colors.transparent,
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                  strokeWidth: strokeWidth,
                ),
              ),
              // Center content
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (centerIcon != null) ...[
                    centerIcon!,
                    const SizedBox(height: 4),
                  ],
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: size * 0.15,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  Text(
                    '${(progress * 100).round()}%',
                    style: TextStyle(
                      fontSize: size * 0.1,
                      color: color.withAlpha(179),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: ChainGiveTheme.charcoal,
            fontSize: 14,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: TextStyle(
            color: ChainGiveTheme.charcoal.withAlpha(128),
            fontSize: 12,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class MultiProgressRingsWidget extends StatelessWidget {
  final List<ProgressRingData> rings;
  final double ringSize;
  final double spacing;

  const MultiProgressRingsWidget({
    Key? key,
    required this.rings,
    this.ringSize = 100,
    this.spacing = 16,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: rings.map((ring) {
        return ProgressRingWidget(
          progress: ring.progress,
          label: ring.label,
          value: ring.value,
          subtitle: ring.subtitle,
          color: ring.color,
          size: ringSize,
          centerIcon: ring.icon,
        );
      }).toList(),
    );
  }
}

class ProgressRingData {
  final double progress;
  final String label;
  final String value;
  final String subtitle;
  final Color color;
  final Widget? icon;

  const ProgressRingData({
    required this.progress,
    required this.label,
    required this.value,
    required this.subtitle,
    required this.color,
    this.icon,
  });
}

class AnimatedProgressRing extends StatefulWidget {
  final double targetProgress;
  final String label;
  final String value;
  final String subtitle;
  final Color color;
  final double size;
  final Duration animationDuration;

  const AnimatedProgressRing({
    Key? key,
    required this.targetProgress,
    required this.label,
    required this.value,
    required this.subtitle,
    required this.color,
    this.size = 120,
    this.animationDuration = const Duration(milliseconds: 1500),
  }) : super(key: key);

  @override
  State<AnimatedProgressRing> createState() => _AnimatedProgressRingState();
}

class _AnimatedProgressRingState extends State<AnimatedProgressRing>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: widget.targetProgress,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    _controller.forward();
  }

  @override
  void didUpdateWidget(AnimatedProgressRing oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.targetProgress != widget.targetProgress) {
      _progressAnimation = Tween<double>(
        begin: _progressAnimation.value,
        end: widget.targetProgress,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ));
      _controller
        ..reset()
        ..forward();
    }
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
        return ProgressRingWidget(
          progress: _progressAnimation.value,
          label: widget.label,
          value: widget.value,
          subtitle: widget.subtitle,
          color: widget.color,
          size: widget.size,
        );
      },
    );
  }
}