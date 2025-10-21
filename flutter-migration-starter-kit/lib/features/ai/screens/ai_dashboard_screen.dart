import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../core/config/theme.dart';
import '../widgets/analytics_chart_widget.dart';
import '../widgets/insights_card_widget.dart';
import '../widgets/prediction_widget.dart';
import '../models/ai_analytics_models.dart';

class AIDashboardScreen extends ConsumerStatefulWidget {
  const AIDashboardScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AIDashboardScreen> createState() => _AIDashboardScreenState();
}

class _AIDashboardScreenState extends ConsumerState<AIDashboardScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            AfricanMotifs.sankofaSymbol(size: 24, color: ChainGiveTheme.savannaGold),
            const SizedBox(width: 8),
            const Text('AI Dashboard'),
          ],
        ),
        backgroundColor: ChainGiveTheme.savannaGold,
        elevation: 0,
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Container(
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
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 24),
                _buildAnalyticsSection(),
                const SizedBox(height: 24),
                _buildInsightsSection(),
                const SizedBox(height: 24),
                _buildPredictionsSection(),
                const SizedBox(height: 24),
                _buildRecommendationsSection(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ChainGiveTheme.indigoBlue,
            ChainGiveTheme.kenteRed,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: ChainGiveTheme.indigoBlue.withAlpha(77),
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
              Icon(
                Icons.insights,
                color: Colors.white,
                size: 32,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'AI-Powered Analytics',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Discover patterns, predict trends, and optimize your giving impact with advanced AI insights.',
            style: TextStyle(
              color: Colors.white.withAlpha(230),
              fontSize: 14,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnalyticsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Analytics Overview',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        AnalyticsChartWidget(
          data: _getSampleAnalyticsData(),
          title: 'Donation Trends',
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                'Total Impact',
                '\$12,450',
                Icons.trending_up,
                ChainGiveTheme.acaciaGreen,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricCard(
                'Recipients Helped',
                '1,247',
                Icons.people,
                ChainGiveTheme.indigoBlue,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildMetricCard(
                'Success Rate',
                '94.2%',
                Icons.check_circle,
                ChainGiveTheme.savannaGold,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricCard(
                'Avg. Response',
                '2.3 days',
                Icons.schedule,
                ChainGiveTheme.kenteRed,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInsightsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'AI Insights',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        InsightsCardWidget(
          insights: _getSampleInsights(),
        ),
      ],
    );
  }

  Widget _buildPredictionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Impact Predictions',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        PredictionWidget(
          predictions: _getSamplePredictions(),
        ),
      ],
    );
  }

  Widget _buildRecommendationsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Personalized Recommendations',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildRecommendationCard(
          'Increase donation frequency',
          'Based on your pattern, donating weekly could increase your impact by 23%',
          Icons.trending_up,
          ChainGiveTheme.acaciaGreen,
        ),
        const SizedBox(height: 12),
        _buildRecommendationCard(
          'Try community challenges',
          'Joining group challenges increases engagement by 45%',
          Icons.group,
          ChainGiveTheme.indigoBlue,
        ),
        const SizedBox(height: 12),
        _buildRecommendationCard(
          'Focus on education sector',
          'Your donations to education have 31% higher success rate',
          Icons.school,
          ChainGiveTheme.savannaGold,
        ),
      ],
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withAlpha(51)),
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(25),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: ChainGiveTheme.charcoal.withAlpha(179),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendationCard(String title, String description, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withAlpha(51)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withAlpha(25),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
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
                    color: ChainGiveTheme.charcoal,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    color: ChainGiveTheme.charcoal.withAlpha(179),
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.arrow_forward_ios,
            size: 16,
            color: color,
          ),
        ],
      ),
    );
  }

  List<AnalyticsDataPoint> _getSampleAnalyticsData() {
    return [
      AnalyticsDataPoint(month: 'Jan', donations: 1200, impact: 8500),
      AnalyticsDataPoint(month: 'Feb', donations: 1350, impact: 9200),
      AnalyticsDataPoint(month: 'Mar', donations: 1180, impact: 8800),
      AnalyticsDataPoint(month: 'Apr', donations: 1420, impact: 10100),
      AnalyticsDataPoint(month: 'May', donations: 1380, impact: 9600),
      AnalyticsDataPoint(month: 'Jun', donations: 1560, impact: 11200),
    ];
  }

  List<AIInsight> _getSampleInsights() {
    return [
      AIInsight(
        title: 'Peak Giving Hours',
        description: 'Your donations have 40% higher success rate between 2-4 PM',
        type: InsightType.pattern,
        impact: ImpactLevel.high,
      ),
      AIInsight(
        title: 'Community Synergy',
        description: 'Combining donations with community challenges increases engagement by 55%',
        type: InsightType.opportunity,
        impact: ImpactLevel.medium,
      ),
      AIInsight(
        title: 'Geographic Focus',
        description: 'Recipients in East Africa respond 25% faster to your donations',
        type: InsightType.geographic,
        impact: ImpactLevel.medium,
      ),
    ];
  }

  List<ImpactPrediction> _getSamplePredictions() {
    return [
      ImpactPrediction(
        timeframe: 'Next Month',
        predictedImpact: 12500,
        confidence: 0.87,
        factors: ['Current trends', 'Seasonal patterns', 'Community engagement'],
      ),
      ImpactPrediction(
        timeframe: 'Next Quarter',
        predictedImpact: 45000,
        confidence: 0.76,
        factors: ['Growth trajectory', 'New initiatives', 'Market conditions'],
      ),
    ];
  }
}