import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../../../core/config/theme.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';

class FeedbackMechanismsWidget extends StatefulWidget {
  const FeedbackMechanismsWidget({Key? key}) : super(key: key);

  @override
  State<FeedbackMechanismsWidget> createState() => _FeedbackMechanismsWidgetState();
}

class _FeedbackMechanismsWidgetState extends State<FeedbackMechanismsWidget> {
  final TextEditingController _feedbackController = TextEditingController();
  double _overallRating = 0;
  double _usabilityRating = 0;
  double _designRating = 0;
  double _featuresRating = 0;
  String _selectedCategory = 'General';
  bool _isAnonymous = false;
  bool _allowFollowUp = true;

  final List<String> _categories = [
    'General',
    'Donation Process',
    'Gamification',
    'AI Features',
    'Community',
    'Security',
    'Accessibility',
    'Performance',
    'Bug Report',
    'Feature Request',
  ];

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 24),
          _buildRatingSection(),
          const SizedBox(height: 24),
          _buildCategorySelection(),
          const SizedBox(height: 24),
          _buildFeedbackInput(),
          const SizedBox(height: 24),
          _buildPrivacyOptions(),
          const SizedBox(height: 24),
          _buildSubmitButton(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ChainGiveTheme.indigoBlue.withAlpha(25),
            ChainGiveTheme.acaciaGreen.withAlpha(25),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: ChainGiveTheme.indigoBlue.withAlpha(51),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          AfricanMotifs.sankofaSymbol(size: 32, color: ChainGiveTheme.indigoBlue),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Share Your Feedback',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: ChainGiveTheme.charcoal,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Help us improve ChainGive with your valuable insights and suggestions.',
                  style: TextStyle(
                    color: ChainGiveTheme.charcoal.withAlpha(179),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRatingSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Rate Your Experience',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildRatingCard(
          'Overall Experience',
          'How would you rate your overall experience?',
          _overallRating,
          (rating) => setState(() => _overallRating = rating),
        ),
        const SizedBox(height: 16),
        _buildRatingCard(
          'Usability',
          'How easy is the app to use?',
          _usabilityRating,
          (rating) => setState(() => _usabilityRating = rating),
        ),
        const SizedBox(height: 16),
        _buildRatingCard(
          'Design & Aesthetics',
          'How do you like the visual design?',
          _designRating,
          (rating) => setState(() => _designRating = rating),
        ),
        const SizedBox(height: 16),
        _buildRatingCard(
          'Features & Functionality',
          'How satisfied are you with the features?',
          _featuresRating,
          (rating) => setState(() => _featuresRating = rating),
        ),
      ],
    );
  }

  Widget _buildRatingCard(String title, String subtitle, double rating, ValueChanged<double> onRatingUpdate) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
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
            subtitle,
            style: TextStyle(
              color: ChainGiveTheme.charcoal.withAlpha(128),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              RatingBar.builder(
                initialRating: rating,
                minRating: 1,
                direction: Axis.horizontal,
                allowHalfRating: true,
                itemCount: 5,
                itemSize: 24,
                unratedColor: Colors.grey.shade300,
                itemBuilder: (context, _) => Icon(
                  Icons.star,
                  color: ChainGiveTheme.savannaGold,
                ),
                onRatingUpdate: onRatingUpdate,
              ),
              const SizedBox(width: 12),
              Text(
                rating > 0 ? '${rating.toStringAsFixed(1)}/5' : 'Not rated',
                style: TextStyle(
                  color: ChainGiveTheme.charcoal.withAlpha(179),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Feedback Category',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: DropdownButtonFormField<String>(
            value: _selectedCategory,
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
            items: _categories.map((category) {
              return DropdownMenuItem(
                value: category,
                child: Text(category),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                setState(() => _selectedCategory = value);
              }
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFeedbackInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Detailed Feedback',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Share your thoughts, suggestions, or report issues you\'ve encountered.',
          style: TextStyle(
            color: ChainGiveTheme.charcoal.withAlpha(128),
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: TextField(
            controller: _feedbackController,
            maxLines: 6,
            maxLength: 1000,
            decoration: InputDecoration(
              hintText: 'Tell us what you think...',
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(16),
              counterText: '',
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          '${_feedbackController.text.length}/1000 characters',
          style: TextStyle(
            color: ChainGiveTheme.charcoal.withAlpha(128),
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildPrivacyOptions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Privacy Options',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Icon(
                    Icons.visibility_off,
                    color: ChainGiveTheme.indigoBlue,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Submit anonymously',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ChainGiveTheme.charcoal,
                      ),
                    ),
                  ),
                  Switch(
                    value: _isAnonymous,
                    onChanged: (value) => setState(() => _isAnonymous = value),
                    activeColor: ChainGiveTheme.indigoBlue,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.follow_the_signs,
                    color: ChainGiveTheme.acaciaGreen,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Allow follow-up contact',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ChainGiveTheme.charcoal,
                      ),
                    ),
                  ),
                  Switch(
                    value: _allowFollowUp,
                    onChanged: (value) => setState(() => _allowFollowUp = value),
                    activeColor: ChainGiveTheme.acaciaGreen,
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      child: ElevatedButton(
        onPressed: _canSubmit() ? _submitFeedback : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: ChainGiveTheme.acaciaGreen,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
        ),
        child: const Text(
          'Submit Feedback',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  bool _canSubmit() {
    return _overallRating > 0 ||
           _usabilityRating > 0 ||
           _designRating > 0 ||
           _featuresRating > 0 ||
           _feedbackController.text.trim().isNotEmpty;
  }

  void _submitFeedback() {
    // TODO: Implement feedback submission logic
    final feedback = {
      'overallRating': _overallRating,
      'usabilityRating': _usabilityRating,
      'designRating': _designRating,
      'featuresRating': _featuresRating,
      'category': _selectedCategory,
      'feedback': _feedbackController.text.trim(),
      'isAnonymous': _isAnonymous,
      'allowFollowUp': _allowFollowUp,
      'timestamp': DateTime.now().toIso8601String(),
    };

    // Show success message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Thank you for your feedback!'),
        backgroundColor: ChainGiveTheme.acaciaGreen,
        duration: const Duration(seconds: 3),
      ),
    );

    // Reset form
    setState(() {
      _overallRating = 0;
      _usabilityRating = 0;
      _designRating = 0;
      _featuresRating = 0;
      _selectedCategory = 'General';
      _feedbackController.clear();
      _isAnonymous = false;
      _allowFollowUp = true;
    });
  }
}

/// Survey widget for collecting structured feedback
class SurveyWidget extends StatefulWidget {
  final String surveyId;
  final String title;
  final String description;
  final List<SurveyQuestion> questions;

  const SurveyWidget({
    Key? key,
    required this.surveyId,
    required this.title,
    required this.description,
    required this.questions,
  }) : super(key: key);

  @override
  State<SurveyWidget> createState() => _SurveyWidgetState();
}

class _SurveyWidgetState extends State<SurveyWidget> {
  final Map<String, dynamic> _responses = {};

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSurveyHeader(),
          const SizedBox(height: 24),
          ...widget.questions.map((question) => _buildQuestion(question)),
          const SizedBox(height: 24),
          _buildSubmitSurveyButton(),
        ],
      ),
    );
  }

  Widget _buildSurveyHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ChainGiveTheme.savannaGold.withAlpha(25),
            ChainGiveTheme.kenteRed.withAlpha(25),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: ChainGiveTheme.savannaGold.withAlpha(51),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: ChainGiveTheme.charcoal,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            widget.description,
            style: TextStyle(
              color: ChainGiveTheme.charcoal.withAlpha(179),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestion(SurveyQuestion question) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            question.question,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: ChainGiveTheme.charcoal,
            ),
          ),
          const SizedBox(height: 12),
          _buildQuestionInput(question),
        ],
      ),
    );
  }

  Widget _buildQuestionInput(SurveyQuestion question) {
    switch (question.type) {
      case QuestionType.rating:
        return RatingBar.builder(
          initialRating: (_responses[question.id] ?? 0).toDouble(),
          minRating: 1,
          direction: Axis.horizontal,
          allowHalfRating: false,
          itemCount: 5,
          itemSize: 32,
          unratedColor: Colors.grey.shade300,
          itemBuilder: (context, _) => Icon(
            Icons.star,
            color: ChainGiveTheme.savannaGold,
          ),
          onRatingUpdate: (rating) {
            setState(() => _responses[question.id] = rating.toInt());
          },
        );
      case QuestionType.multipleChoice:
        return Column(
          children: question.options!.map((option) {
            return RadioListTile<String>(
              title: Text(option),
              value: option,
              groupValue: _responses[question.id],
              onChanged: (value) {
                setState(() => _responses[question.id] = value);
              },
              activeColor: ChainGiveTheme.acaciaGreen,
            );
          }).toList(),
        );
      case QuestionType.checkbox:
        return Column(
          children: question.options!.map((option) {
            final selectedOptions = _responses[question.id] as List<String>? ?? [];
            return CheckboxListTile(
              title: Text(option),
              value: selectedOptions.contains(option),
              onChanged: (checked) {
                setState(() {
                  if (checked == true) {
                    selectedOptions.add(option);
                  } else {
                    selectedOptions.remove(option);
                  }
                  _responses[question.id] = selectedOptions;
                });
              },
              activeColor: ChainGiveTheme.acaciaGreen,
            );
          }).toList(),
        );
      case QuestionType.text:
        return TextField(
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Enter your response',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: (value) => _responses[question.id] = value,
        );
    }
  }

  Widget _buildSubmitSurveyButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      child: ElevatedButton(
        onPressed: _canSubmitSurvey() ? _submitSurvey : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: ChainGiveTheme.savannaGold,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
        ),
        child: const Text(
          'Submit Survey',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  bool _canSubmitSurvey() {
    return widget.questions.every((question) =>
        question.required ? _responses.containsKey(question.id) : true);
  }

  void _submitSurvey() {
    // TODO: Implement survey submission logic
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Thank you for completing the survey!'),
        backgroundColor: ChainGiveTheme.savannaGold,
        duration: const Duration(seconds: 3),
      ),
    );
  }
}

enum QuestionType {
  rating,
  multipleChoice,
  checkbox,
  text,
}

class SurveyQuestion {
  final String id;
  final String question;
  final QuestionType type;
  final bool required;
  final List<String>? options;

  const SurveyQuestion({
    required this.id,
    required this.question,
    required this.type,
    this.required = false,
    this.options,
  });
}