import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import '../../../core/config/theme.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';

class SecuritySettingsWidget extends StatefulWidget {
  const SecuritySettingsWidget({Key? key}) : super(key: key);

  @override
  State<SecuritySettingsWidget> createState() => _SecuritySettingsWidgetState();
}

class _SecuritySettingsWidgetState extends State<SecuritySettingsWidget> {
  final LocalAuthentication _localAuth = LocalAuthentication();

  // Security settings state
  bool _biometricEnabled = false;
  bool _pinEnabled = false;
  bool _twoFactorEnabled = false;
  bool _sessionTimeoutEnabled = true;
  bool _loginNotificationsEnabled = true;
  bool _suspiciousActivityAlertsEnabled = true;

  // PIN setup
  String _currentPin = '';
  bool _isSettingUpPin = false;

  // Session timeout
  int _sessionTimeoutMinutes = 30;

  @override
  void initState() {
    super.initState();
    _checkBiometricAvailability();
  }

  Future<void> _checkBiometricAvailability() async {
    try {
      final canCheckBiometrics = await _localAuth.canCheckBiometrics;
      final availableBiometrics = await _localAuth.getAvailableBiometrics();

      setState(() {
        _biometricEnabled = canCheckBiometrics && availableBiometrics.isNotEmpty;
      });
    } catch (e) {
      setState(() {
        _biometricEnabled = false;
      });
    }
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
          _buildAuthenticationSection(),
          const SizedBox(height: 24),
          _buildSecurityMonitoringSection(),
          const SizedBox(height: 24),
          _buildAdvancedSecuritySection(),
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
            Colors.red.shade50,
            Colors.orange.shade50,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.red.shade200,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.security,
            color: Colors.red.shade600,
            size: 32,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Security Settings',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: ChainGiveTheme.charcoal,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Protect your account with advanced security features.',
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

  Widget _buildAuthenticationSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Authentication',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildBiometricToggle(),
        const SizedBox(height: 12),
        _buildPinSetup(),
        const SizedBox(height: 12),
        _buildTwoFactorToggle(),
        const SizedBox(height: 12),
        _buildSessionTimeout(),
      ],
    );
  }

  Widget _buildBiometricToggle() {
    return Container(
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
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.fingerprint,
                  color: Colors.blue.shade600,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Biometric Authentication',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ChainGiveTheme.charcoal,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Use fingerprint or face recognition to unlock the app',
                      style: TextStyle(
                        color: ChainGiveTheme.charcoal.withAlpha(128),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: _biometricEnabled,
                onChanged: _biometricEnabled
                    ? (value) => setState(() => _biometricEnabled = value)
                    : null,
                activeColor: Colors.blue.shade600,
              ),
            ],
          ),
          if (!_biometricEnabled) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.shade200),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.warning,
                    color: Colors.orange.shade600,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Biometric authentication is not available on this device',
                      style: TextStyle(
                        color: Colors.orange.shade800,
                        fontSize: 12,
                      ),
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

  Widget _buildPinSetup() {
    return Container(
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
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.lock,
                  color: Colors.green.shade600,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PIN Code',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ChainGiveTheme.charcoal,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _pinEnabled ? 'PIN code is set up' : 'Set up a 4-digit PIN for additional security',
                      style: TextStyle(
                        color: ChainGiveTheme.charcoal.withAlpha(128),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              if (_pinEnabled)
                TextButton(
                  onPressed: _showPinSetupDialog,
                  child: Text(
                    'Change',
                    style: TextStyle(color: Colors.green.shade600),
                  ),
                )
              else
                ElevatedButton(
                  onPressed: _showPinSetupDialog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: const Text('Set Up'),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTwoFactorToggle() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.purple.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.verified_user,
              color: Colors.purple.shade600,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Two-Factor Authentication',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: ChainGiveTheme.charcoal,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Add an extra layer of security with 2FA',
                  style: TextStyle(
                    color: ChainGiveTheme.charcoal.withAlpha(128),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: _twoFactorEnabled,
            onChanged: (value) {
              if (value) {
                _showTwoFactorSetupDialog();
              } else {
                setState(() => _twoFactorEnabled = false);
              }
            },
            activeColor: Colors.purple.shade600,
          ),
        ],
      ),
    );
  }

  Widget _buildSessionTimeout() {
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
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.indigo.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.timer,
                  color: Colors.indigo.shade600,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Auto-Lock',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ChainGiveTheme.charcoal,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Automatically lock the app after inactivity',
                      style: TextStyle(
                        color: ChainGiveTheme.charcoal.withAlpha(128),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: _sessionTimeoutEnabled,
                onChanged: (value) => setState(() => _sessionTimeoutEnabled = value),
                activeColor: Colors.indigo.shade600,
              ),
            ],
          ),
          if (_sessionTimeoutEnabled) ...[
            const SizedBox(height: 16),
            Text(
              'Lock after: $_sessionTimeoutMinutes minutes',
              style: TextStyle(
                color: ChainGiveTheme.charcoal.withAlpha(179),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 8),
            Slider(
              value: _sessionTimeoutMinutes.toDouble(),
              min: 5,
              max: 120,
              divisions: 23,
              onChanged: (value) => setState(() => _sessionTimeoutMinutes = value.round()),
              activeColor: Colors.indigo.shade600,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSecurityMonitoringSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Security Monitoring',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildSecurityToggle(
          'Login Notifications',
          'Get notified of new login attempts',
          Icons.login,
          Colors.teal.shade600,
          _loginNotificationsEnabled,
          (value) => setState(() => _loginNotificationsEnabled = value),
        ),
        const SizedBox(height: 12),
        _buildSecurityToggle(
          'Suspicious Activity Alerts',
          'Receive alerts for unusual account activity',
          Icons.warning,
          Colors.red.shade600,
          _suspiciousActivityAlertsEnabled,
          (value) => setState(() => _suspiciousActivityAlertsEnabled = value),
        ),
      ],
    );
  }

  Widget _buildSecurityToggle(
    String title,
    String description,
    IconData icon,
    Color color,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withAlpha(25),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
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
                    color: ChainGiveTheme.charcoal.withAlpha(128),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: color,
          ),
        ],
      ),
    );
  }

  Widget _buildAdvancedSecuritySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Advanced Security',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildAdvancedOption(
          'Change Password',
          'Update your account password',
          Icons.password,
          () {
            // TODO: Implement password change
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Password change coming soon')),
            );
          },
        ),
        const SizedBox(height: 12),
        _buildAdvancedOption(
          'Active Sessions',
          'View and manage your active sessions',
          Icons.devices,
          () {
            // TODO: Implement session management
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Session management coming soon')),
            );
          },
        ),
        const SizedBox(height: 12),
        _buildAdvancedOption(
          'Security Log',
          'View your account security activity',
          Icons.history,
          () {
            // TODO: Implement security log
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Security log coming soon')),
            );
          },
        ),
      ],
    );
  }

  Widget _buildAdvancedOption(String title, String subtitle, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            Icon(icon, color: ChainGiveTheme.indigoBlue, size: 20),
            const SizedBox(width: 16),
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
                    subtitle,
                    style: TextStyle(
                      color: ChainGiveTheme.charcoal.withAlpha(128),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: ChainGiveTheme.charcoal.withAlpha(128),
            ),
          ],
        ),
      ),
    );
  }

  void _showPinSetupDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Set Up PIN'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Enter a 4-digit PIN code'),
            const SizedBox(height: 16),
            TextField(
              obscureText: true,
              maxLength: 4,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                hintText: 'Enter PIN',
                counterText: '',
              ),
              onChanged: (value) => _currentPin = value,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (_currentPin.length == 4) {
                setState(() => _pinEnabled = true);
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('PIN set successfully')),
                );
              }
            },
            child: const Text('Set PIN'),
          ),
        ],
      ),
    );
  }

  void _showTwoFactorSetupDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enable Two-Factor Authentication'),
        content: const Text(
          'Two-factor authentication adds an extra layer of security to your account. '
          'You will need to verify your identity using a second method when signing in.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() => _twoFactorEnabled = true);
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('2FA enabled successfully')),
              );
            },
            child: const Text('Enable 2FA'),
          ),
        ],
      ),
    );
  }
}