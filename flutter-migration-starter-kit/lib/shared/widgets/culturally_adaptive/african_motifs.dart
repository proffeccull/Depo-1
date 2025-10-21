import 'package:flutter/material.dart';

/// Cultural motifs inspired by African art and patterns
class AfricanMotifs {
  /// Baobab tree motif - symbol of strength and resilience
  static Widget baobabTree({
    double size = 60,
    Color? trunkColor,
    Color? leavesColor,
  }) {
    return CustomPaint(
      size: Size(size, size),
      painter: BaobabPainter(
        trunkColor: trunkColor ?? const Color(0xFF8B4513), // baobabBrown
        leavesColor: leavesColor ?? const Color(0xFF228B22), // acaciaGreen
      ),
    );
  }

  /// Maasai shield pattern - symbol of protection and community
  static Widget maasaiShield({
    double size = 50,
    Color? primaryColor,
    Color? secondaryColor,
  }) {
    return CustomPaint(
      size: Size(size, size),
      painter: MaasaiShieldPainter(
        primaryColor: primaryColor ?? const Color(0xFF4B0082), // indigoBlue
        secondaryColor: secondaryColor ?? const Color(0xFFDC143C), // kenteRed
      ),
    );
  }

  /// Kente cloth pattern - symbol of heritage and craftsmanship
  static Widget kentePattern({
    double width = 200,
    double height = 40,
    List<Color>? colors,
  }) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors ?? [
            const Color(0xFFDC143C), // kenteRed
            const Color(0xFF00BFFF), // adireBlue
            const Color(0xFFFFD700), // geleYellow
            const Color(0xFF228B22), // acaciaGreen
          ],
        ),
      ),
      child: CustomPaint(
        painter: KentePatternPainter(),
      ),
    );
  }

  /// Adinkra symbol - "Sankofa" (go back and get it) - symbol of learning from past
  static Widget sankofaSymbol({
    double size = 48,
    Color? color,
  }) {
    return CustomPaint(
      size: Size(size, size),
      painter: SankofaPainter(
        color: color ?? const Color(0xFF4B0082), // indigoBlue
      ),
    );
  }

  /// Ubuntu pattern - "I am because we are" - symbol of community
  static Widget ubuntuPattern({
    double size = 55,
    Color? color,
  }) {
    return CustomPaint(
      size: Size(size, size),
      painter: UbuntuPainter(
        color: color ?? const Color(0xFFD4AF37), // savannaGold
      ),
    );
  }

  /// Adinkra symbol - "Adinkra Unity" - symbol of unity and togetherness
  static Widget adinkraUnity({
    double size = 48,
    Color? color,
  }) {
    return CustomPaint(
      size: Size(size, size),
      painter: AdinkraUnityPainter(
        color: color ?? const Color(0xFF4B0082), // indigoBlue
      ),
    );
  }

  /// African unity symbol - interconnected circles representing community
  static Widget unityCircles({
    double size = 60,
    Color? color,
  }) {
    return CustomPaint(
      size: Size(size, size),
      painter: UnityCirclesPainter(
        color: color ?? const Color(0xFFFF8C00), // sunsetOrange
      ),
    );
  }
}

/// Baobab Tree Painter
class BaobabPainter extends CustomPainter {
  final Color trunkColor;
  final Color leavesColor;

  BaobabPainter({required this.trunkColor, required this.leavesColor});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint trunkPaint = Paint()
      ..color = trunkColor
      ..style = PaintingStyle.fill;

    final Paint leavesPaint = Paint()
      ..color = leavesColor
      ..style = PaintingStyle.fill;

    // Draw trunk
    final Rect trunkRect = Rect.fromCenter(
      center: Offset(size.width / 2, size.height * 0.7),
      width: size.width * 0.15,
      height: size.height * 0.5,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(trunkRect, Radius.circular(size.width * 0.05)),
      trunkPaint,
    );

    // Draw crown (leaves)
    final Path leavesPath = Path();
    leavesPath.addOval(Rect.fromCenter(
      center: Offset(size.width / 2, size.height * 0.25),
      width: size.width * 0.8,
      height: size.height * 0.4,
    ));
    canvas.drawPath(leavesPath, leavesPaint);

    // Add texture lines on trunk
    final Paint texturePaint = Paint()
      ..color = trunkColor.withAlpha(179)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (int i = 0; i < 3; i++) {
      final double y = size.height * (0.5 + i * 0.1);
      canvas.drawLine(
        Offset(size.width * 0.45, y),
        Offset(size.width * 0.55, y),
        texturePaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Maasai Shield Painter
class MaasaiShieldPainter extends CustomPainter {
  final Color primaryColor;
  final Color secondaryColor;

  MaasaiShieldPainter({required this.primaryColor, required this.secondaryColor});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint primaryPaint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;

    final Paint secondaryPaint = Paint()
      ..color = secondaryColor
      ..style = PaintingStyle.fill;

    // Draw shield base
    final Path shieldPath = Path();
    shieldPath.moveTo(size.width * 0.2, size.height * 0.1);
    shieldPath.lineTo(size.width * 0.8, size.height * 0.1);
    shieldPath.lineTo(size.width * 0.9, size.height * 0.5);
    shieldPath.lineTo(size.width * 0.5, size.height * 0.9);
    shieldPath.lineTo(size.width * 0.1, size.height * 0.5);
    shieldPath.close();

    canvas.drawPath(shieldPath, primaryPaint);

    // Draw geometric patterns
    final Paint patternPaint = Paint()
      ..color = secondaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    // Horizontal lines
    for (int i = 1; i < 4; i++) {
      final double y = size.height * (0.2 + i * 0.15);
      canvas.drawLine(
        Offset(size.width * 0.25, y),
        Offset(size.width * 0.75, y),
        patternPaint,
      );
    }

    // Vertical lines
    for (int i = 1; i < 3; i++) {
      final double x = size.width * (0.3 + i * 0.2);
      canvas.drawLine(
        Offset(x, size.height * 0.25),
        Offset(x, size.height * 0.75),
        patternPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Kente Pattern Painter
class KentePatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..style = PaintingStyle.fill;

    // Draw alternating colored strips
    final List<Color> colors = [
      const Color(0xFFDC143C), // kenteRed
      const Color(0xFF00BFFF), // adireBlue
      const Color(0xFFFFD700), // geleYellow
      const Color(0xFF228B22), // acaciaGreen
      const Color(0xFF4B0082), // indigoBlue
    ];

    final double stripWidth = size.width / colors.length;

    for (int i = 0; i < colors.length; i++) {
      paint.color = colors[i];
      canvas.drawRect(
        Rect.fromLTWH(i * stripWidth, 0, stripWidth, size.height),
        paint,
      );
    }

    // Add subtle pattern overlay
    final Paint overlayPaint = Paint()
      ..color = Colors.white.withAlpha(26)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 10) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x + 5, size.height),
        overlayPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Sankofa Symbol Painter (Heart with bird)
class SankofaPainter extends CustomPainter {
  final Color color;

  SankofaPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    // Draw heart shape
    final Path heartPath = Path();
    heartPath.moveTo(size.width / 2, size.height * 0.7);

    // Left curve
    heartPath.cubicTo(
      size.width * 0.2, size.height * 0.5,
      size.width * 0.2, size.height * 0.2,
      size.width / 2, size.height * 0.3,
    );

    // Right curve
    heartPath.cubicTo(
      size.width * 0.8, size.height * 0.2,
      size.width * 0.8, size.height * 0.5,
      size.width / 2, size.height * 0.7,
    );

    canvas.drawPath(heartPath, paint);

    // Draw bird on top
    final Path birdPath = Path();
    birdPath.addOval(Rect.fromCenter(
      center: Offset(size.width / 2, size.height * 0.15),
      width: size.width * 0.25,
      height: size.height * 0.15,
    ));

    // Bird beak
    birdPath.moveTo(size.width * 0.625, size.height * 0.15);
    birdPath.lineTo(size.width * 0.7, size.height * 0.12);

    canvas.drawPath(birdPath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Ubuntu Pattern Painter
class UbuntuPainter extends CustomPainter {
  final Color color;

  UbuntuPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Draw interconnected circles representing community
    final double radius = size.width * 0.15;
    final List<Offset> centers = [
      Offset(size.width / 2, size.height / 2),
      Offset(size.width * 0.25, size.height * 0.25),
      Offset(size.width * 0.75, size.height * 0.25),
      Offset(size.width * 0.25, size.height * 0.75),
      Offset(size.width * 0.75, size.height * 0.75),
    ];

    // Draw circles
    for (final center in centers) {
      canvas.drawCircle(center, radius, paint);
    }

    // Draw connecting lines
    final Paint linePaint = Paint()
      ..color = color.withAlpha(153)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // Connect center to all others
    final Offset center = centers[0];
    for (int i = 1; i < centers.length; i++) {
      canvas.drawLine(center, centers[i], linePaint);
    }

    // Connect outer circles
    canvas.drawLine(centers[1], centers[2], linePaint);
    canvas.drawLine(centers[1], centers[3], linePaint);
    canvas.drawLine(centers[2], centers[4], linePaint);
    canvas.drawLine(centers[3], centers[4], linePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Unity Circles Painter
class UnityCirclesPainter extends CustomPainter {
  final Color color;

  UnityCirclesPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final Paint outlinePaint = Paint()
      ..color = color.withAlpha(204)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Draw overlapping circles representing unity
    final double radius = size.width * 0.2;
    final List<Offset> centers = [
      Offset(size.width * 0.3, size.height * 0.4),
      Offset(size.width * 0.7, size.height * 0.4),
      Offset(size.width * 0.5, size.height * 0.7),
    ];

    // Draw circles with slight overlap
    for (final center in centers) {
      canvas.drawCircle(center, radius, paint);
      canvas.drawCircle(center, radius, outlinePaint);
    }

    // Add connecting elements
    final Paint connectorPaint = Paint()
      ..color = color.withAlpha(102)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    // Draw curved connectors
    final Path connectorPath = Path();
    connectorPath.moveTo(size.width * 0.3, size.height * 0.4);
    connectorPath.quadraticBezierTo(
      size.width * 0.5, size.height * 0.3,
      size.width * 0.7, size.height * 0.4,
    );
    connectorPath.moveTo(size.width * 0.3, size.height * 0.4);
    connectorPath.quadraticBezierTo(
      size.width * 0.4, size.height * 0.6,
      size.width * 0.5, size.height * 0.7,
    );
    connectorPath.moveTo(size.width * 0.7, size.height * 0.4);
    connectorPath.quadraticBezierTo(
      size.width * 0.6, size.height * 0.6,
      size.width * 0.5, size.height * 0.7,
    );

    canvas.drawPath(connectorPath, connectorPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Adinkra Unity Painter
class AdinkraUnityPainter extends CustomPainter {
  final Color color;

  AdinkraUnityPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    // Draw interlocking circles representing unity
    final double radius = size.width * 0.2;
    final Offset center1 = Offset(size.width * 0.35, size.height * 0.4);
    final Offset center2 = Offset(size.width * 0.65, size.height * 0.4);
    final Offset center3 = Offset(size.width * 0.5, size.height * 0.65);

    // Draw circles
    canvas.drawCircle(center1, radius, paint);
    canvas.drawCircle(center2, radius, paint);
    canvas.drawCircle(center3, radius, paint);

    // Draw connecting lines
    final Paint linePaint = Paint()
      ..color = color.withAlpha(153)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    canvas.drawLine(center1, center2, linePaint);
    canvas.drawLine(center1, center3, linePaint);
    canvas.drawLine(center2, center3, linePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}