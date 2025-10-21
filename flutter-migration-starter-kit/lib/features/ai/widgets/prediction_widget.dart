import 'package:flutter/material.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../core/config/theme.dart';
import '../models/ai_analytics_models.dart';

class PredictionWidget extends StatelessWidget {
  final List<ImpactPrediction> predictions;

  const PredictionWidget({
    Key? key,
    required this.predictions,
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
              AfricanMotifs.unityCircles(size: 24, color: ChainGiveTheme.kenteRed),
              const SizedBox(width: 8),
              Text(
                'Impact Predictions',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: ChainGiveTheme.charcoal,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (predictions.isEmpty)
            _buildEmptyState()
          else
            ...predictions.map((prediction) => _buildPredictionItem(context, prediction)).toList(),
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
              Icons.timeline,
              size: 48,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              'No predictions available',
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Predictions will be available with more donation data',
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

  Widget _buildPredictionItem(BuildContext context, ImpactPrediction prediction) {
    final confidenceColor = _getConfidenceColor(prediction.confidence);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            confidenceColor.withAlpha(25),
            confidenceColor.withAlpha(10),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: confidenceColor.withAlpha(51),
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
                  color: confidenceColor.withAlpha(51),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.trending_up,
                  color: confidenceColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      prediction.timeframe,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ChainGiveTheme.charcoal,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _buildConfidenceBadge(prediction.confidence),
                        const SizedBox(width: 8),
                        Text(
                          '\$${prediction.predictedImpact.toInt()} predicted impact',
                          style: TextStyle(
                            color: ChainGiveTheme.charcoal.withAlpha(179),
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (prediction.recommendation != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(179),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.lightbulb,
                    size: 16,
                    color: ChainGiveTheme.savannaGold,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      prediction.recommendation!,
                      style: TextStyle(
                        color: ChainGiveTheme.charcoal.withAlpha(179),
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
          Text(
            'Based on:',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: ChainGiveTheme.charcoal,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: prediction.factors.map((factor) => _buildFactorChip(factor)).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildConfidenceBadge(double confidence) {
    final percentage = (confidence * 100).round();
    final color = _getConfidenceColor(confidence);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withAlpha(51),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.verified,
            size: 12,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            '$percentage%',
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFactorChip(String factor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: ChainGiveTheme.clayBeige.withAlpha(77),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: ChainGiveTheme.clayBeige.withAlpha(128),
        ),
      ),
      child: Text(
        factor,
        style: TextStyle(
          color: ChainGiveTheme.charcoal.withAlpha(179),
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Color _getConfidenceColor(double confidence) {
    if (confidence >= 0.8) {
      return ChainGiveTheme.acaciaGreen;
    } else if (confidence >= 0.6) {
      return ChainGiveTheme.savannaGold;
    } else if (confidence >= 0.4) {
      return Colors.orange.shade500;
    } else {
      return ChainGiveTheme.kenteRed;
    }
  }

  String _getConfidenceLabel(double confidence) {
    if (confidence >= 0.8) {
      return 'Very High';
    } else if (confidence >= 0.6) {
      return 'High';
    } else if (confidence >= 0.4) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }
}