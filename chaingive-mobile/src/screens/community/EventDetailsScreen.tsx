import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getEvent, rsvpEvent, getEventRsvpStatus, donateToEvent, getEventDonations, CommunityEvent } from '../../api/community';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

type RouteParams = {
  eventId: string;
};

const RSVP_OPTIONS = [
  { label: 'Attending', value: 'attending', icon: 'checkmark-circle' },
  { label: 'Maybe', value: 'maybe', icon: 'help-circle' },
  { label: 'Not Attending', value: 'declined', icon: 'close-circle' },
];

export const EventDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { eventId } = route.params as RouteParams;

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [donations, setDonations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [donateLoading, setDonateLoading] = useState(false);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventData, rsvpData] = await Promise.all([
        getEvent(eventId),
        getEventRsvpStatus(eventId),
      ]);
      setEvent(eventData);
      setRsvpStatus(rsvpData.rsvpStatus);

      // Load donations if it's a fundraising event
      if (eventData.eventType === 'fundraising' && eventData.fundraisingGoal) {
        const donationsData = await getEventDonations(eventId);
        setDonations(donationsData);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status: string) => {
    setRsvpLoading(true);
    try {
      await rsvpEvent(eventId, { status });
      setRsvpStatus(status);
      Alert.alert('Success', `You are now ${status === 'attending' ? 'attending' : status === 'maybe' ? 'maybe attending' : 'not attending'} this event`);

      // Reload event data to get updated attendee count
      const updatedEvent = await getEvent(eventId);
      setEvent(updatedEvent);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDonate = () => {
    if (!event) return;

    Alert.prompt(
      'Donate to Event',
      `Enter donation amount for "${event.title}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Donate',
          onPress: async (amount) => {
            const numAmount = parseFloat(amount || '0');
            if (numAmount <= 0) {
              Alert.alert('Error', 'Please enter a valid amount');
              return;
            }

            setDonateLoading(true);
            try {
              const result = await donateToEvent(eventId, { amount: numAmount });
              Alert.alert(
                'Donation Successful!',
                result.message,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Reload donations data
                      loadEventData();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to donate');
            } finally {
              setDonateLoading(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      await Share.share({
        message: `Join me at "${event.title}" on ${new Date(event.eventDate).toLocaleDateString()} at ${event.eventTime}. Location: ${event.location}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      fundraising: 'Fundraising Event',
      community_meeting: 'Community Meeting',
      workshop: 'Workshop',
      celebration: 'Celebration',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending': return colors.success;
      case 'maybe': return colors.warning;
      case 'declined': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isCreator = event.creatorId === user?.id;
  const isPastEvent = new Date(event.eventDate) < new Date();
  const isFundraisingEvent = event.eventType === 'fundraising' && event.fundraisingGoal;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{event.title}</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.eventMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{formatDate(event.eventDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{event.eventTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        </View>
      </View>

      {/* Event Details */}
      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{getEventTypeLabel(event.eventType)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Organizer:</Text>
          <Text style={styles.detailValue}>
            {event.creator.firstName} {event.creator.lastName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Attendees:</Text>
          <Text style={styles.detailValue}>
            {event.currentAttendees}
            {event.maxAttendees && ` / ${event.maxAttendees}`}
          </Text>
        </View>

        {event.fundraisingGoal && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fundraising Goal:</Text>
            <Text style={styles.detailValue}>₦{event.fundraisingGoal.toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: event.status === 'active' ? colors.success : colors.error }]}>
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
        </View>
      </Card>

      {/* Fundraising Progress */}
      {isFundraisingEvent && donations && (
        <Card style={styles.fundraisingCard}>
          <Text style={styles.sectionTitle}>Fundraising Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(donations.event.progressPercentage, 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              ₦{donations.event.totalRaised.toLocaleString()} of ₦{donations.event.fundraisingGoal.toLocaleString()}
            </Text>
            <Text style={styles.progressPercentage}>
              {donations.event.progressPercentage.toFixed(1)}% funded
            </Text>
          </View>

          <TouchableOpacity
            style={styles.donateButton}
            onPress={handleDonate}
            disabled={donateLoading}
          >
            <Ionicons name="heart-outline" size={20} color={colors.surface} />
            <Text style={styles.donateButtonText}>
              {donateLoading ? 'Processing...' : 'Donate to Event'}
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Description */}
      <Card style={styles.descriptionCard}>
        <Text style={styles.sectionTitle}>About This Event</Text>
        <Text style={styles.description}>{event.description}</Text>
      </Card>

      {/* RSVP Section */}
      {!isPastEvent && event.status === 'active' && (
        <Card style={styles.rsvpCard}>
          <Text style={styles.sectionTitle}>Will you attend?</Text>

          {rsvpStatus && (
            <View style={styles.currentRsvp}>
              <Text style={styles.currentRsvpLabel}>Your response:</Text>
              <View style={[styles.rsvpStatus, { borderColor: getStatusColor(rsvpStatus) }]}>
                <Ionicons
                  name={RSVP_OPTIONS.find(opt => opt.value === rsvpStatus)?.icon as any}
                  size={16}
                  color={getStatusColor(rsvpStatus)}
                />
                <Text style={[styles.rsvpStatusText, { color: getStatusColor(rsvpStatus) }]}>
                  {RSVP_OPTIONS.find(opt => opt.value === rsvpStatus)?.label}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.rsvpOptions}>
            {RSVP_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.rsvpOption,
                  rsvpStatus === option.value && styles.rsvpOptionSelected,
                ]}
                onPress={() => handleRSVP(option.value)}
                disabled={rsvpLoading}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={rsvpStatus === option.value ? colors.surface : getStatusColor(option.value)}
                />
                <Text
                  style={[
                    styles.rsvpOptionText,
                    rsvpStatus === option.value && styles.rsvpOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* Attendees List */}
      {event.rsvps && event.rsvps.length > 0 && (
        <Card style={styles.attendeesCard}>
          <Text style={styles.sectionTitle}>Attendees ({event.rsvps.filter(r => r.status === 'attending').length})</Text>
          {event.rsvps
            .filter(rsvp => rsvp.status === 'attending')
            .slice(0, 10)
            .map((rsvp) => (
              <View key={rsvp.id} style={styles.attendeeItem}>
                <Text style={styles.attendeeName}>
                  {rsvp.user.firstName} {rsvp.user.lastName}
                </Text>
              </View>
            ))}
          {event.rsvps.filter(r => r.status === 'attending').length > 10 && (
            <Text style={styles.moreAttendees}>
              +{event.rsvps.filter(r => r.status === 'attending').length - 10} more attendees
            </Text>
          )}
        </Card>
      )}

      {/* Creator Actions */}
      {isCreator && (
        <Card style={styles.creatorActionsCard}>
          <Text style={styles.sectionTitle}>Event Management</Text>
          <View style={styles.creatorButtons}>
            <Button
              title="Edit Event"
              onPress={() => {/* TODO: Navigate to edit screen */}}
              style={styles.editButton}
            />
            <Button
              title="Cancel Event"
              onPress={() => {
                Alert.alert(
                  'Cancel Event',
                  'Are you sure you want to cancel this event?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Confirm',
                      style: 'destructive',
                      onPress: () => {/* TODO: Implement cancel */},
                    },
                  ]
                );
              }}
              style={styles.cancelButton}
            />
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.surface,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 16,
  },
  shareButton: {
    padding: 8,
  },
  eventMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  detailsCard: {
    margin: 20,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
    textTransform: 'uppercase',
  },
  fundraisingCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  descriptionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  rsvpCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  currentRsvp: {
    marginBottom: 16,
  },
  currentRsvpLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rsvpStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  rsvpStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rsvpOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  rsvpOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rsvpOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rsvpOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rsvpOptionTextSelected: {
    color: colors.surface,
  },
  attendeesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  attendeeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attendeeName: {
    fontSize: 16,
    color: colors.text,
  },
  moreAttendees: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 8,
  },
  creatorActionsCard: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
  },
  creatorButtons: {
    gap: 12,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
});