import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/config/theme.dart';
import '../models/ai_analytics_models.dart';

class AnalyticsChartWidget extends StatelessWidget {
  final List<AnalyticsDataPoint> data;
  final String title;

  const AnalyticsChartWidget({
    Key? key,
    required this.data,
    required this.title,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: ChainGiveTheme.charcoal,
                ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: LineChart(
              _buildChartData(),
            ),
          ),
          const SizedBox(height: 16),
          _buildLegend(),
        ],
      ),
    );
  }

  LineChartData _buildChartData() {
    final donationsSpots = data.asMap().entries.map((entry) {
      return FlSpot(entry.key.toDouble(), entry.value.donations.toDouble());
    }).toList();

    final impactSpots = data.asMap().entries.map((entry) {
      return FlSpot(entry.key.toDouble(), entry.value.impact / 100); // Scale down for better visualization
    }).toList();

    return LineChartData(
      gridData: FlGridData(
        show: true,
        drawVerticalLine: false,
        horizontalInterval: 500,
        getDrawingHorizontalLine: (value) {
          return FlLine(
            color: Colors.grey.withAlpha(51),
            strokeWidth: 1,
          );
        },
      ),
      titlesData: FlTitlesData(
        show: true,
        rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 30,
            interval: 1,
            getTitlesWidget: (value, meta) {
              if (value.toInt() >= 0 && value.toInt() < data.length) {
                return Text(
                  data[value.toInt()].month,
                  style: TextStyle(
                    color: ChainGiveTheme.charcoal.withAlpha(179),
                    fontSize: 12,
                  ),
                );
              }
              return const Text('');
            },
          ),
        ),
        leftTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            interval: 500,
            reservedSize: 40,
            getTitlesWidget: (value, meta) {
              return Text(
                value.toInt().toString(),
                style: TextStyle(
                  color: ChainGiveTheme.charcoal.withAlpha(179),
                  fontSize: 12,
                ),
              );
            },
          ),
        ),
      ),
      borderData: FlBorderData(
        show: true,
        border: Border.all(color: Colors.grey.withAlpha(51)),
      ),
      minX: 0,
      maxX: data.length.toDouble() - 1,
      minY: 0,
      maxY: _getMaxY(),
      lineBarsData: [
        // Donations line
        LineChartBarData(
          spots: donationsSpots,
          isCurved: true,
          color: ChainGiveTheme.acaciaGreen,
          barWidth: 3,
          isStrokeCapRound: true,
          dotData: FlDotData(
            show: true,
            getDotPainter: (spot, percent, barData, index) {
              return FlDotCirclePainter(
                radius: 4,
                color: ChainGiveTheme.acaciaGreen,
                strokeWidth: 2,
                strokeColor: Colors.white,
              );
            },
          ),
          belowBarData: BarAreaData(
            show: true,
            color: ChainGiveTheme.acaciaGreen.withAlpha(25),
          ),
        ),
        // Impact line
        LineChartBarData(
          spots: impactSpots,
          isCurved: true,
          color: ChainGiveTheme.savannaGold,
          barWidth: 3,
          isStrokeCapRound: true,
          dotData: FlDotData(
            show: true,
            getDotPainter: (spot, percent, barData, index) {
              return FlDotCirclePainter(
                radius: 4,
                color: ChainGiveTheme.savannaGold,
                strokeWidth: 2,
                strokeColor: Colors.white,
              );
            },
          ),
          belowBarData: BarAreaData(
            show: true,
            color: ChainGiveTheme.savannaGold.withAlpha(25),
          ),
        ),
      ],
      lineTouchData: LineTouchData(
        touchTooltipData: LineTouchTooltipData(
          getTooltipItems: (touchedSpots) {
            return touchedSpots.map((spot) {
              final dataPoint = data[spot.x.toInt()];
              final isDonations = spot.barIndex == 0;
              return LineTooltipItem(
                isDonations
                    ? '${dataPoint.month}\nDonations: ${dataPoint.donations}'
                    : '${dataPoint.month}\nImpact: \$${dataPoint.impact.toInt()}',
                TextStyle(
                  color: isDonations ? ChainGiveTheme.acaciaGreen : ChainGiveTheme.savannaGold,
                  fontWeight: FontWeight.bold,
                ),
              );
            }).toList();
          },
        ),
      ),
    );
  }

  Widget _buildLegend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildLegendItem('Donations', ChainGiveTheme.acaciaGreen),
        const SizedBox(width: 24),
        _buildLegendItem('Impact (\$)', ChainGiveTheme.savannaGold),
      ],
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: ChainGiveTheme.charcoal.withAlpha(179),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  double _getMaxY() {
    final maxDonations = data.map((d) => d.donations).reduce((a, b) => a > b ? a : b);
    final maxImpact = data.map((d) => d.impact / 100).reduce((a, b) => a > b ? a : b);
    return (maxDonations > maxImpact ? maxDonations : maxImpact) * 1.2;
  }
}