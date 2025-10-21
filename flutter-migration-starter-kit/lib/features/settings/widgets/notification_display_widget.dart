import 'package:flutter/material.dart';
import '../../../core/config/theme.dart';
import '../../../shared/widgets/culturally_adaptive/african_motifs.dart';

class NotificationDisplayWidget extends StatelessWidget {
  final String title;
  final String message;
  final String timestamp;
  final NotificationType type;
  final bool isRead;
  final VoidCallback? onTap;
  final VoidCallback? onDismiss;

  const NotificationDisplayWidget({
    Key? key,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.type,
    this.isRead = false,
    this.onTap,
    this.onDismiss,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key('notification_${title.hashCode}'),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDismiss?.call(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red.shade100,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          Icons.delete,
          color: Colors.red.shade600,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isRead ? Colors.white : _getTypeColor(type).withAlpha(10),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isRead ? Colors.grey.shade200 : _getTypeColor(type).withAlpha(51),
              width: isRead ? 1 : 2,
            ),
            boxShadow: isRead
                ? null
                : [
                    BoxShadow(
                      color: _getTypeColor(type).withAlpha(25),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _getTypeColor(type).withAlpha(25),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _getTypeIcon(type),
                  color: _getTypeColor(type),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: ChainGiveTheme.charcoal,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        if (!isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _getTypeColor(type),
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      message,
                      style: TextStyle(
                        color: ChainGiveTheme.charcoal.withAlpha(179),
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      timestamp,
                      style: TextStyle(
                        color: ChainGiveTheme.charcoal.withAlpha(128),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              if (!isRead)
                Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: _getTypeColor(type).withAlpha(128),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getTypeColor(NotificationType type) {
    switch (type) {
      case NotificationType.donation:
        return ChainGiveTheme.acaciaGreen;
      case NotificationType.achievement:
        return ChainGiveTheme.savannaGold;
      case NotificationType.community:
        return ChainGiveTheme.indigoBlue;
      case NotificationType.security:
        return Colors.red.shade500;
      case NotificationType.system:
        return ChainGiveTheme.kenteRed;
      case NotificationType.promotion:
        return Colors.purple.shade500;
    }
  }

  IconData _getTypeIcon(NotificationType type) {
    switch (type) {
      case NotificationType.donation:
        return Icons.favorite;
      case NotificationType.achievement:
        return Icons.emoji_events;
      case NotificationType.community:
        return Icons.people;
      case NotificationType.security:
        return Icons.security;
      case NotificationType.system:
        return Icons.info;
      case NotificationType.promotion:
        return Icons.local_offer;
    }
  }
}

enum NotificationType {
  donation,
  achievement,
  community,
  security,
  system,
  promotion,
}

class NotificationListWidget extends StatelessWidget {
  final List<NotificationItem> notifications;
  final Function(NotificationItem)? onNotificationTap;
  final Function(NotificationItem)? onNotificationDismiss;

  const NotificationListWidget({
    Key? key,
    required this.notifications,
    this.onNotificationTap,
    this.onNotificationDismiss,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (notifications.isEmpty) {
      return _buildEmptyState();
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: notifications.length,
      itemBuilder: (context, index) {
        final notification = notifications[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: NotificationDisplayWidget(
            title: notification.title,
            message: notification.message,
            timestamp: notification.timestamp,
            type: notification.type,
            isRead: notification.isRead,
            onTap: () => onNotificationTap?.call(notification),
            onDismiss: () => onNotificationDismiss?.call(notification),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          children: [
            AfricanMotifs.sankofaSymbol(size: 48, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            Text(
              'No notifications yet',
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You\'ll see your notifications here when you receive them.',
              style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String timestamp;
  final NotificationType type;
  final bool isRead;
  final Map<String, dynamic>? data;

  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.type,
    this.isRead = false,
    this.data,
  });
}

class NotificationBadge extends StatelessWidget {
  final int count;
  final Color color;
  final double size;

  const NotificationBadge({
    Key? key,
    required this.count,
    this.color = Colors.red,
    this.size = 20,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (count == 0) return const SizedBox.shrink();

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(77),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Text(
          count > 99 ? '99+' : count.toString(),
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.4,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}