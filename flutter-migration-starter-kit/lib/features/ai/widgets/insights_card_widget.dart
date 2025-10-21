import 'package:flutter/material.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../core/config/theme.dart';
import '../models/ai_analytics_models.dart';

class InsightsCardWidget extends StatelessWidget {
  final List<AIInsight> insights;

  const InsightsCardWidget({
    Key? key,
    required this.insights,
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
          Row(
            children: [
              AfricanMotifs.sankofaSymbol(size: 24, color: ChainGiveTheme.indigoBlue),
              const SizedBox(width: 8),
              Text(
                'AI Insights',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: ChainGiveTheme.charcoal,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (insights.isEmpty)
            _buildEmptyState()
          else
            ...insights.map((insight) => _buildInsightItem(context, insight)).toList(),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          children: [
            Icon(
              Icons.lightbulb_outline,
              size: 48,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              'No insights available yet',
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Insights will appear as you use the app more',
              style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInsightItem(BuildContext context, AIInsight insight) {
    final color = _getInsightColor(insight.impact);
    final icon = _getInsightIcon(insight.type);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
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
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withAlpha(51),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      insight.title,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ChainGiveTheme.charcoal,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _buildImpactBadge(insight.impact),
                        const SizedBox(width: 8),
                        _buildTypeBadge(insight.type),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            insight.description,
            style: TextStyle(
              color: ChainGiveTheme.charcoal.withAlpha(179),
              fontSize: 13,
              height: 1.4,
            ),
          ),
          if (insight.actionText != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: color.withAlpha(77),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.arrow_forward,
                    size: 16,
                    color: color,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    insight.actionText!,
                    style: TextStyle(
                      color: color,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildImpactBadge(ImpactLevel impact) {
    final color = _getImpactColor(impact);
    final label = _getImpactLabel(impact);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withAlpha(51),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildTypeBadge(InsightType type) {
    final color = _getTypeColor(type);
    final label = _getTypeLabel(type);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withAlpha(51),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Color _getInsightColor(ImpactLevel impact) {
    switch (impact) {
      case ImpactLevel.high:
        return ChainGiveTheme.acaciaGreen;
      case ImpactLevel.medium:
        return ChainGiveTheme.savannaGold;
      case ImpactLevel.low:
        return ChainGiveTheme.kenteRed;
      case ImpactLevel.critical:
        return ChainGiveTheme.indigoBlue;
    }
  }

  Color _getImpactColor(ImpactLevel impact) {
    switch (impact) {
      case ImpactLevel.high:
        return ChainGiveTheme.acaciaGreen;
      case ImpactLevel.medium:
        return ChainGiveTheme.savannaGold;
      case ImpactLevel.low:
        return Colors.grey.shade500;
      case ImpactLevel.critical:
        return ChainGiveTheme.kenteRed;
    }
  }

  String _getImpactLabel(ImpactLevel impact) {
    switch (impact) {
      case ImpactLevel.high:
        return 'High Impact';
      case ImpactLevel.medium:
        return 'Medium';
      case ImpactLevel.low:
        return 'Low';
      case ImpactLevel.critical:
        return 'Critical';
    }
  }

  Color _getTypeColor(InsightType type) {
    switch (type) {
      case InsightType.pattern:
        return ChainGiveTheme.indigoBlue;
      case InsightType.opportunity:
        return ChainGiveTheme.acaciaGreen;
      case InsightType.geographic:
        return ChainGiveTheme.savannaGold;
      case InsightType.behavioral:
        return ChainGiveTheme.kenteRed;
      case InsightType.temporal:
        return Colors.purple.shade400;
    }
  }

  String _getTypeLabel(InsightType type) {
    switch (type) {
      case InsightType.pattern:
        return 'Pattern';
      case InsightType.opportunity:
        return 'Opportunity';
      case InsightType.geographic:
        return 'Location';
      case InsightType.behavioral:
        return 'Behavior';
      case InsightType.temporal:
        return 'Timing';
    }
  }

  IconData _getInsightIcon(InsightType type) {
    switch (type) {
      case InsightType.pattern:
        return Icons.analytics;
      case InsightType.opportunity:
        return Icons.trending_up;
      case InsightType.geographic:
        return Icons.location_on;
      case InsightType.behavioral:
        return Icons.psychology;
      case InsightType.temporal:
        return Icons.schedule;
    }
  }
}