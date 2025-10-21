import 'package:flutter/material.dart';
import '../../../core/config/theme.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';

class PushNotificationsSettingsWidget extends StatefulWidget {
  const PushNotificationsSettingsWidget({Key? key}) : super(key: key);

  @override
  State<PushNotificationsSettingsWidget> createState() =>
      _PushNotificationsSettingsWidgetState();
}

class _PushNotificationsSettingsWidgetState
    extends State<PushNotificationsSettingsWidget> {
  // Notification settings state
  bool _masterNotificationsEnabled = true;
  bool _donationRemindersEnabled = true;
  bool _achievementNotificationsEnabled = true;
  bool _communityUpdatesEnabled = false;
  bool _weeklyReportsEnabled = true;
  bool _specialOffersEnabled = false;
  bool _securityAlertsEnabled = true;
  bool _maintenanceUpdatesEnabled = false;

  // Time preferences
  TimeOfDay _quietHoursStart = const TimeOfDay(hour: 22, minute: 0);
  TimeOfDay _quietHoursEnd = const TimeOfDay(hour: 8, minute: 0);
  bool _quietHoursEnabled = false;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 24),
          _buildMasterToggle(),
          const SizedBox(height: 24),
          _buildNotificationCategories(),
          const SizedBox(height: 24),
          _buildQuietHoursSection(),
          const SizedBox(height: 24),
          _buildAdvancedSettings(),
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
            ChainGiveTheme.kenteRed.withAlpha(25),
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
                  'Push Notifications',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: ChainGiveTheme.charcoal,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Customize when and how you receive notifications about your giving journey.',
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

  Widget _buildMasterToggle() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _masterNotificationsEnabled
              ? ChainGiveTheme.acaciaGreen.withAlpha(51)
              : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _masterNotificationsEnabled
                  ? ChainGiveTheme.acaciaGreen.withAlpha(25)
                  : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _masterNotificationsEnabled ? Icons.notifications : Icons.notifications_off,
              color: _masterNotificationsEnabled
                  ? ChainGiveTheme.acaciaGreen
                  : Colors.grey.shade500,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Enable Push Notifications',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: ChainGiveTheme.charcoal,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Receive notifications about donations, achievements, and updates',
                  style: TextStyle(
                    color: ChainGiveTheme.charcoal.withAlpha(128),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: _masterNotificationsEnabled,
            onChanged: (value) {
              setState(() {
                _masterNotificationsEnabled = value;
              });
            },
            activeColor: ChainGiveTheme.acaciaGreen,
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCategories() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Notification Categories',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildNotificationToggle(
          'Donation Reminders',
          'Get reminded about upcoming donation opportunities and goals',
          Icons.favorite,
          ChainGiveTheme.acaciaGreen,
          _donationRemindersEnabled,
          (value) => setState(() => _donationRemindersEnabled = value),
        ),
        const SizedBox(height: 12),
        _buildNotificationToggle(
          'Achievement Notifications',
          'Celebrate when you unlock badges and reach milestones',
          Icons.emoji_events,
          ChainGiveTheme.savannaGold,
          _achievementNotificationsEnabled,
          (value) => setState(() => _achievementNotificationsEnabled = value),
        ),
        const SizedBox(height: 12),
        _buildNotificationToggle(
          'Community Updates',
          'Stay connected with community challenges and discussions',
          Icons.people,
          ChainGiveTheme.indigoBlue,
          _communityUpdatesEnabled,
          (value) => setState(() => _communityUpdatesEnabled = value),
        ),
        const SizedBox(height: 12),
        _buildNotificationToggle(
          'Weekly Reports',
          'Receive weekly summaries of your impact and progress',
          Icons.analytics,
          ChainGiveTheme.kenteRed,
          _weeklyReportsEnabled,
          (value) => setState(() => _weeklyReportsEnabled = value),
        ),
        const SizedBox(height: 12),
        _buildNotificationToggle(
          'Special Offers',
          'Get notified about limited-time campaigns and promotions',
          Icons.local_offer,
          Colors.purple.shade400,
          _specialOffersEnabled,
          (value) => setState(() => _specialOffersEnabled = value),
        ),
        const SizedBox(height: 12),
        _buildNotificationToggle(
          'Security Alerts',
          'Important security notifications and login alerts',
          Icons.security,
          Colors.red.shade400,
          _securityAlertsEnabled,
          (value) => setState(() => _securityAlertsEnabled = value),
        ),
        const SizedBox(height: 12),
        _buildNotificationToggle(
          'Maintenance Updates',
          'App updates, maintenance windows, and service changes',
          Icons.build,
          Colors.orange.shade400,
          _maintenanceUpdatesEnabled,
          (value) => setState(() => _maintenanceUpdatesEnabled = value),
        ),
      ],
    );
  }

  Widget _buildNotificationToggle(
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
        border: Border.all(
          color: value ? color.withAlpha(51) : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: value ? color.withAlpha(25) : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: value ? color : Colors.grey.shade500,
              size: 20,
            ),
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
            value: value && _masterNotificationsEnabled,
            onChanged: _masterNotificationsEnabled ? onChanged : null,
            activeColor: color,
          ),
        ],
      ),
    );
  }

  Widget _buildQuietHoursSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quiet Hours',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Pause notifications during specific hours to avoid disturbances.',
          style: TextStyle(
            color: ChainGiveTheme.charcoal.withAlpha(128),
            fontSize: 12,
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
                    Icons.nightlight,
                    color: ChainGiveTheme.indigoBlue,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Enable Quiet Hours',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: ChainGiveTheme.charcoal,
                      ),
                    ),
                  ),
                  Switch(
                    value: _quietHoursEnabled && _masterNotificationsEnabled,
                    onChanged: _masterNotificationsEnabled
                        ? (value) => setState(() => _quietHoursEnabled = value)
                        : null,
                    activeColor: ChainGiveTheme.indigoBlue,
                  ),
                ],
              ),
              if (_quietHoursEnabled) ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildTimePicker(
                        'Start Time',
                        _quietHoursStart,
                        (time) => setState(() => _quietHoursStart = time),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildTimePicker(
                        'End Time',
                        _quietHoursEnd,
                        (time) => setState(() => _quietHoursEnd = time),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimePicker(String label, TimeOfDay time, ValueChanged<TimeOfDay> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: ChainGiveTheme.charcoal.withAlpha(179),
          ),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: () async {
            final picked = await showTimePicker(
              context: context,
              initialTime: time,
            );
            if (picked != null) {
              onChanged(picked);
            }
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.access_time,
                  size: 16,
                  color: ChainGiveTheme.charcoal.withAlpha(128),
                ),
                const SizedBox(width: 8),
                Text(
                  time.format(context),
                  style: TextStyle(
                    color: ChainGiveTheme.charcoal,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAdvancedSettings() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Advanced Settings',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: ChainGiveTheme.charcoal,
              ),
        ),
        const SizedBox(height: 16),
        _buildAdvancedOption(
          'Notification Sound',
          'Choose notification sound',
          Icons.volume_up,
          () {
            // TODO: Implement sound selection
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Sound selection coming soon')),
            );
          },
        ),
        const SizedBox(height: 12),
        _buildAdvancedOption(
          'Vibration Pattern',
          'Customize vibration for notifications',
          Icons.vibration,
          () {
            // TODO: Implement vibration pattern selection
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Vibration settings coming soon')),
            );
          },
        ),
        const SizedBox(height: 12),
        _buildAdvancedOption(
          'Test Notification',
          'Send a test notification to verify settings',
          Icons.send,
          () {
            // TODO: Implement test notification
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Test notification sent')),
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
            Icon(
              icon,
              color: ChainGiveTheme.indigoBlue,
              size: 20,
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
}