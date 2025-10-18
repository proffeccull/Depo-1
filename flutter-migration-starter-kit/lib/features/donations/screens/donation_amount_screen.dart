import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';
import '../../../core/config/theme.dart';
import '../providers/donation_provider.dart';

class DonationAmountScreen extends ConsumerStatefulWidget {
  const DonationAmountScreen({super.key});

  @override
  ConsumerState<DonationAmountScreen> createState() => _DonationAmountScreenState();
}

class _DonationAmountScreenState extends ConsumerState<DonationAmountScreen> {
  final TextEditingController _customAmountController = TextEditingController();
  String _selectedCurrency = 'NGN';
  int? _selectedPresetAmount;
  bool _isCustomAmount = false;

  // Cultural preset amounts based on African giving traditions
  final List<Map<String, dynamic>> _presetAmounts = [
    {
      'amount': 500,
      'label': 'Community Share',
      'description': 'Basic community contribution',
      'impact': 'Helps 1 person for a day',
    },
    {
      'amount': 1000,
      'label': 'Ubuntu Gift',
      'description': 'I am because we are',
      'impact': 'Supports 2 people for a day',
    },
    {
      'amount': 2500,
      'label': 'Family Support',
      'description': 'Extended family assistance',
      'impact': 'Helps 5 people for a day',
    },
    {
      'amount': 5000,
      'label': 'Community Impact',
      'description': 'Significant community contribution',
      'impact': 'Supports 10 people for a day',
    },
  ];

  @override
  void dispose() {
    _customAmountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final supportedCurrenciesAsync = ref.watch(supportedCurrenciesProvider);

    return Scaffold(
      backgroundColor: ChainGiveTheme.lightTheme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Make a Donation'),
        backgroundColor: ChainGiveTheme.savannaGold,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
          tooltip: 'Back to Home',
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with cultural motif
              Center(
                child: Column(
                  children: [
                    AfricanMotifs.ubuntuPattern(size: 80, color: ChainGiveTheme.savannaGold),
                    const SizedBox(height: 16),
                    Text(
                      'Choose Your Gift',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: ChainGiveTheme.charcoal,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your donation creates Ubuntu - the spirit of togetherness',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: ChainGiveTheme.charcoal.withOpacity(0.7),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Currency Selection
              Text(
                'Currency',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: ChainGiveTheme.charcoal,
                ),
              ),
              const SizedBox(height: 12),
              supportedCurrenciesAsync.when(
                data: (currencies) => _buildCurrencySelector(currencies),
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => _buildCurrencySelector(['NGN', 'USD', 'EUR']),
              ),

              const SizedBox(height: 32),

              // Amount Selection
              Text(
                'Select Amount',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: ChainGiveTheme.charcoal,
                ),
              ),
              const SizedBox(height: 16),

              // Preset Amounts Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.2,
                ),
                itemCount: _presetAmounts.length,
                itemBuilder: (context, index) {
                  final preset = _presetAmounts[index];
                  final amount = preset['amount'] as int;
                  final isSelected = _selectedPresetAmount == amount && !_isCustomAmount;

                  return _buildPresetAmountCard(
                    amount: amount,
                    label: preset['label'] as String,
                    description: preset['description'] as String,
                    impact: preset['impact'] as String,
                    isSelected: isSelected,
                    onTap: () {
                      setState(() {
                        _selectedPresetAmount = amount;
                        _isCustomAmount = false;
                        _customAmountController.clear();
                      });
                    },
                  );
                },
              ),

              const SizedBox(height: 24),

              // Custom Amount Option
              Card(
                elevation: _isCustomAmount ? 4 : 1,
                color: _isCustomAmount ? ChainGiveTheme.savannaGold.withOpacity(0.1) : null,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: _isCustomAmount ? ChainGiveTheme.savannaGold : Colors.grey.shade300,
                    width: _isCustomAmount ? 2 : 1,
                  ),
                ),
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _isCustomAmount = true;
                      _selectedPresetAmount = null;
                    });
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Icon(
                          Icons.edit,
                          color: _isCustomAmount ? ChainGiveTheme.savannaGold : Colors.grey,
                          size: 32,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Custom Amount',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: _isCustomAmount ? ChainGiveTheme.savannaGold : ChainGiveTheme.charcoal,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _customAmountController,
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: ChainGiveTheme.charcoal,
                          ),
                          decoration: InputDecoration(
                            hintText: 'Enter amount',
                            border: InputBorder.none,
                            suffixText: _selectedCurrency,
                            suffixStyle: TextStyle(
                              color: ChainGiveTheme.charcoal.withOpacity(0.7),
                            ),
                          ),
                          onChanged: (value) {
                            setState(() {
                              _isCustomAmount = true;
                              _selectedPresetAmount = null;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Impact Preview
              if (_getSelectedAmount() != null) ...[
                _buildImpactPreview(),
                const SizedBox(height: 32),
              ],

              // Continue Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _canContinue() ? _handleContinue : null,
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
                    'Continue to Recipient Selection',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Back to Home
              Center(
                child: TextButton(
                  onPressed: () => context.go('/home'),
                  child: Text(
                    'Back to Home',
                    style: TextStyle(color: ChainGiveTheme.charcoal.withOpacity(0.7)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrencySelector(List<String> currencies) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedCurrency,
          isExpanded: true,
          items: currencies.map((currency) {
            return DropdownMenuItem(
              value: currency,
              child: Text(
                currency,
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                  color: ChainGiveTheme.charcoal,
                ),
              ),
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
      ),
    );
  }

  Widget _buildPresetAmountCard({
    required int amount,
    required String label,
    required String description,
    required String impact,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: isSelected ? 4 : 1,
      color: isSelected ? ChainGiveTheme.savannaGold.withOpacity(0.1) : null,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isSelected ? ChainGiveTheme.savannaGold : Colors.grey.shade300,
          width: isSelected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$amount $_selectedCurrency',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? ChainGiveTheme.savannaGold : ChainGiveTheme.charcoal,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: ChainGiveTheme.charcoal,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: TextStyle(
                  fontSize: 12,
                  color: ChainGiveTheme.charcoal.withOpacity(0.7),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                impact,
                style: TextStyle(
                  fontSize: 11,
                  color: ChainGiveTheme.acaciaGreen,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImpactPreview() {
    final amount = _getSelectedAmount();
    if (amount == null) return const SizedBox.shrink();

    // Calculate impact based on amount (mock calculation)
    final peopleHelped = (amount / 500).round().clamp(1, 100);
    final daysSupported = (amount / 200).round().clamp(1, 365);

    return Card(
      color: ChainGiveTheme.acaciaGreen.withOpacity(0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.volunteer_activism,
                  color: ChainGiveTheme.acaciaGreen,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Your Impact',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: ChainGiveTheme.acaciaGreen,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Your donation of $amount $_selectedCurrency will help approximately $peopleHelped people for about $daysSupported days.',
              style: TextStyle(
                color: ChainGiveTheme.charcoal.withOpacity(0.8),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  int? _getSelectedAmount() {
    if (_isCustomAmount) {
      final customAmount = int.tryParse(_customAmountController.text);
      return customAmount != null && customAmount > 0 ? customAmount : null;
    }
    return _selectedPresetAmount;
  }

  bool _canContinue() {
    final amount = _getSelectedAmount();
    return amount != null && amount > 0;
  }

  void _handleContinue() {
    final amount = _getSelectedAmount();
    if (amount != null) {
      // Update donation flow state
      ref.read(donationFlowProvider.notifier).setAmount(amount, _selectedCurrency);

      // Navigate to recipient selection
      context.go('/donate/recipient');
    }
  }
}