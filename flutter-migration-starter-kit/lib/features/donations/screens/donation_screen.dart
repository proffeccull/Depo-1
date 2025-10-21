import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/accessibility/progressive_image.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../core/config/theme.dart';
import '../providers/donation_provider.dart';
import '../models/donation_model.dart';
import '../models/recipient_model.dart';

class DonationScreen extends ConsumerStatefulWidget {
  const DonationScreen({super.key});

  @override
  ConsumerState<DonationScreen> createState() => _DonationScreenState();
}

class _DonationScreenState extends ConsumerState<DonationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  RecipientModel? _selectedRecipient;
  String _selectedCurrency = 'NGN';
  String? _message;
  bool _isAnonymous = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Announce screen for accessibility
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ScreenReader.announceScreen(
        'Donation Screen',
        description: 'Make a donation to support someone in need. Choose a recipient and amount.'
      );
    });
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _loadAIRecommendations() async {
    final donationNotifier = ref.read(donationProvider.notifier);
    await donationNotifier.loadRecipientRecommendations();
  }

  Future<void> _makeDonation() async {
    if (!_formKey.currentState!.validate()) {
      ScreenReader.announceAction('Form validation failed. Please check your input.');
      return;
    }

    if (_selectedRecipient == null) {
      ScreenReader.announceError('Please select a recipient for your donation.');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final donationNotifier = ref.read(donationProvider.notifier);
      final amount = double.parse(_amountController.text);

      final donation = DonationModel(
        id: '', // Will be set by backend
        userId: 'current_user_id', // Get from auth provider
        recipientId: _selectedRecipient!.id,
        recipient: _selectedRecipient!,
        amount: amount,
        currency: _selectedCurrency,
        message: _message,
        isAnonymous: _isAnonymous,
        status: DonationStatus.pending,
        createdAt: DateTime.now(),
        aiInsights: await _getDonationInsights(amount),
      );

      final success = await donationNotifier.makeDonation(donation);

      if (success && mounted) {
        ScreenReader.announceSuccess(
          'Donation of ${_formatCurrency(amount, _selectedCurrency)} completed successfully!'
        );

        // Navigate to success screen
        context.go('/donation/success', extra: donation);
      }
    } catch (e) {
      ScreenReader.announceError('Donation failed: ${e.toString()}');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Donation failed: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<Map<String, dynamic>> _getDonationInsights(double amount) async {
    try {
      final donationNotifier = ref.read(donationProvider.notifier);
      return await donationNotifier.getDonationImpact(
        amount: amount,
        recipientId: _selectedRecipient!.id,
      );
    } catch (e) {
      return {};
    }
  }

  String _formatCurrency(double amount, String currency) {
    // Simple currency formatting - in production, use intl package
    switch (currency) {
      case 'NGN':
        return '₦${amount.toStringAsFixed(0)}';
      case 'USD':
        return '\$${amount.toStringAsFixed(2)}';
      case 'EUR':
        return '€${amount.toStringAsFixed(2)}';
      default:
        return '${amount.toStringAsFixed(2)} $currency';
    }
  }

  @override
  Widget build(BuildContext context) {
    final donationState = ref.watch(donationProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: ChainGiveTheme.lightTheme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Make a Donation'),
        backgroundColor: ChainGiveTheme.savannaGold,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () {
              // Show donation help
              ScreenReader.announceAction('Opening donation help guide');
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Cultural Header
                Center(
                  child: AfricanMotifs.adinkraUnity(size: 60),
                ),
                const SizedBox(height: 16),
                Text(
                  'Give With Ubuntu',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: ChainGiveTheme.savannaGold,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                Text(
                  'Your donation creates ripples of change',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // AI Recipient Recommendations
                Text(
                  'AI Recommended Recipients',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),

                donationState.recommendations.when(
                  data: (recommendations) => recommendations.isEmpty
                      ? const Text('No recommendations available')
                      : SizedBox(
                          height: 200,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: recommendations.length,
                            itemBuilder: (context, index) {
                              final recipient = recommendations[index];
                              return RecipientCard(
                                recipient: recipient,
                                isSelected: _selectedRecipient?.id == recipient.id,
                                onTap: () {
                                  setState(() {
                                    _selectedRecipient = recipient;
                                  });
                                  ScreenReader.announceAction(
                                    'Selected recipient: ${recipient.name}'
                                  );
                                },
                              );
                            },
                          ),
                        ),
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (error, stack) => Text('Error loading recommendations: $error'),
                ),

                const SizedBox(height: 32),

                // Selected Recipient Display
                if (_selectedRecipient != null) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Color.fromRGBO(ChainGiveTheme.savannaGold.red, ChainGiveTheme.savannaGold.green, ChainGiveTheme.savannaGold.blue, 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Color.fromRGBO(ChainGiveTheme.savannaGold.red, ChainGiveTheme.savannaGold.green, ChainGiveTheme.savannaGold.blue, 0.3)),
                    ),
                    child: Row(
                      children: [
                        ProgressiveImage(
                          imageUrl: _selectedRecipient!.profileImageUrl ?? '',
                          altText: 'Profile picture of ${_selectedRecipient!.name}',
                          width: 50,
                          height: 50,
                          fit: BoxFit.cover,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _selectedRecipient!.name,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                _selectedRecipient!.location,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () {
                            setState(() {
                              _selectedRecipient = null;
                            });
                            ScreenReader.announceAction('Recipient selection cleared');
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Amount Input
                TextFormField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Donation Amount',
                    hintText: 'Enter amount',
                    prefixIcon: const Icon(Icons.attach_money),
                    suffixText: _selectedCurrency,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter an amount';
                    }
                    final amount = double.tryParse(value);
                    if (amount == null || amount <= 0) {
                      return 'Please enter a valid amount';
                    }
                    if (amount < 10) {
                      return 'Minimum donation is ₦10';
                    }
                    return null;
                  },
                  onChanged: (value) {
                    // Update AI insights in real-time
                    if (value.isNotEmpty && _selectedRecipient != null) {
                      final amount = double.tryParse(value);
                      if (amount != null) {
                        _getDonationInsights(amount);
                      }
                    }
                  },
                ),
                const SizedBox(height: 16),

                // Currency Selector
                DropdownButtonFormField<String>(
                  value: _selectedCurrency,
                  decoration: InputDecoration(
                    labelText: 'Currency',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  items: ['NGN', 'USD', 'EUR'].map((currency) {
                    return DropdownMenuItem(
                      value: currency,
                      child: Text(currency),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _selectedCurrency = value;
                      });
                    }
                  },
                ),
                const SizedBox(height: 24),

                // Message Input
                TextFormField(
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Message (Optional)',
                    hintText: 'Add an encouraging message...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  onChanged: (value) {
                    _message = value.isEmpty ? null : value;
                  },
                ),
                const SizedBox(height: 16),

                // Anonymous Toggle
                SwitchListTile(
                  title: const Text('Make donation anonymous'),
                  subtitle: const Text('Your identity will not be revealed to the recipient'),
                  value: _isAnonymous,
                  onChanged: (value) {
                    setState(() {
                      _isAnonymous = value;
                    });
                    ScreenReader.announceAction(
                      value ? 'Anonymous donation enabled' : 'Anonymous donation disabled'
                    );
                  },
                  activeColor: ChainGiveTheme.savannaGold,
                ),
                const SizedBox(height: 32),

                // Donate Button
                ElevatedButton(
                  onPressed: (_isLoading || _selectedRecipient == null)
                      ? null
                      : _makeDonation,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ChainGiveTheme.savannaGold,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          _selectedRecipient == null
                              ? 'Select a Recipient'
                              : 'Donate ${_formatCurrency(
                                  double.tryParse(_amountController.text) ?? 0,
                                  _selectedCurrency
                                )}',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 16),

                // AI Insights Display
                if (_selectedRecipient != null && _amountController.text.isNotEmpty)
                  donationState.impactPrediction.when(
                    data: (impact) => Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.blue.withAlpha(26),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.blue.withAlpha(77)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.insights, color: Colors.blue),
                              const SizedBox(width: 8),
                              Text(
                                'AI Impact Prediction',
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            impact['description'] ?? 'This donation will make a meaningful impact.',
                            style: theme.textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    loading: () => const SizedBox.shrink(),
                    error: (error, stack) => const SizedBox.shrink(),
                  ),

                // Cultural Footer
                const SizedBox(height: 40),
                Center(
                  child: Text(
                    'Building Ubuntu Through Technology',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class RecipientCard extends StatelessWidget {
  final RecipientModel recipient;
  final bool isSelected;
  final VoidCallback onTap;

  const RecipientCard({
    super.key,
    required this.recipient,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 160,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: isSelected ? ChainGiveTheme.savannaGold.withAlpha(26) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? ChainGiveTheme.savannaGold : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(26),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              ProgressiveImage(
                imageUrl: recipient.profileImageUrl ?? '',
                altText: 'Profile picture of ${recipient.name}',
                width: 60,
                height: 60,
                fit: BoxFit.cover,
              ),
              const SizedBox(height: 8),
              Text(
                recipient.name,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                recipient.location,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: ChainGiveTheme.acaciaGreen.withAlpha(26),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'AI Match',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: ChainGiveTheme.acaciaGreen,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}