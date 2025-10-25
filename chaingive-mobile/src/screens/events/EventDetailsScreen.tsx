import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ProgressBar from '../../components/common/ProgressBar';

// Services
import { apiClient } from '../../services/apiClient';

// Styles
import styles from './EventDetailsScreen.styles';

// Types
interface EventDetails {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  eventType: 'community' | 'fundraising' | 'education' | 'health';
  fundraisingGoal?: number;
  currentRaised?: number;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  attendees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
  isAttending: boolean;
  canManage: boolean;
}

const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { eventId } = route.params as { eventId: string };
  const currentUser = useSelector((state: any) => state.auth.user);

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [donateLoading, setDonateLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/v2/community/events/${eventId}`);
      setEvent(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!event) return;

    try {
      setRsvpLoading(true);

      if (event.isAttending) {
        // Cancel RSVP
        await apiClient.delete(`/api/v2/community/events/${eventId}/rsvp`);
        setEvent(prev => prev ? {
          ...prev,
          isAttending: false,
          currentAttendees: prev.currentAttendees - 1
        } : null);
      } else {
        // RSVP to event
        await apiClient.post(`/api/v2/community/events/${eventId}/rsvp`);
        setEvent(prev => prev ? {
          ...prev,
          isAttending: true,
          currentAttendees: prev.currentAttendees + 1
        } : null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDonate = () => {
    if (!event) return;

    navigation.navigate('DonationAmount', {
      context: 'event',
      eventId: event.id,
      eventTitle: event.title,
      fundraisingGoal: event.fundraisingGoal
    });
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      const message = `Join me at "${event.title}" on ${new Date(event.eventDate).toLocaleDateString()} at ${event.location}. Download ChainGive to RSVP!`;

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Share.share({
          message,
          title: event.title,
        });
      } else {
        // Web sharing
        if (navigator.share) {
          await navigator.share({
            title: event.title,
            text: message,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(message);
          Alert.alert('Copied!', 'Event details copied to clipboard');
        }
      }
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const handleEditEvent = () => {
    if (!event?.canManage) return;

    navigation.navigate('CreateEvent', {
      event: event,
      isEditing: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'fundraising':
        return 'heart';
      case 'education':
        return 'graduation-cap';
      case 'health':
        return 'heartbeat';
      default:
        return 'users';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'fundraising':
        return '#2E8B57';
      case 'education':
        return '#007AFF';
      case 'health':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error || 'Event not found'} />
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchEventDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const progressPercentage = event.fundraisingGoal && event.currentRaised
    ? (event.currentRaised / event.fundraisingGoal) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {event.canManage && (
              <TouchableOpacity style={styles.actionButton} onPress={handleEditEvent}>
                <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Event Image/Illustration */}
        <View style={styles.eventImageContainer}>
          <View style={[styles.eventTypeIcon, { backgroundColor: getEventTypeColor(event.eventType) }]}>
            <FontAwesome5
              name={getEventTypeIcon(event.eventType)}
              size={32}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={[styles.eventTypeBadge, { backgroundColor: getEventTypeColor(event.eventType) }]}>
              <Text style={styles.eventTypeText}>
                {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailText}>
                {formatDate(event.eventDate)} at {event.eventTime}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailText}>
                {event.currentAttendees} / {event.maxAttendees || '∞'} attending
              </Text>
            </View>
          </View>

          {/* Fundraising Progress */}
          {event.fundraisingGoal && (
            <View style={styles.fundraisingSection}>
              <View style={styles.fundraisingHeader}>
                <Text style={styles.fundraisingTitle}>Fundraising Goal</Text>
                <Text style={styles.fundraisingAmount}>
                  ₦{event.currentRaised?.toLocaleString() || 0} / ₦{event.fundraisingGoal.toLocaleString()}
                </Text>
              </View>

              <ProgressBar
                progress={progressPercentage}
                height={8}
                backgroundColor="#1E1E1E"
                fillColor="#2E8B57"
                style={styles.progressBar}
              />

              <Text style={styles.progressText}>
                {progressPercentage.toFixed(1)}% funded
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Creator */}
          <View style={styles.creatorSection}>
            <Text style={styles.sectionTitle}>Organized by</Text>
            <View style={styles.creatorInfo}>
              <View style={styles.creatorAvatar}>
                <Text style={styles.creatorInitials}>
                  {event.creator.firstName[0]}{event.creator.lastName[0]}
                </Text>
              </View>
              <View style={styles.creatorDetails}>
                <Text style={styles.creatorName}>
                  {event.creator.firstName} {event.creator.lastName}
                </Text>
                <Text style={styles.creatorRole}>Event Organizer</Text>
              </View>
            </View>
          </View>

          {/* Attendees */}
          {event.attendees.length > 0 && (
            <View style={styles.attendeesSection}>
              <Text style={styles.sectionTitle}>Attendees ({event.currentAttendees})</Text>
              <View style={styles.attendeesList}>
                {event.attendees.slice(0, 6).map((attendee) => (
                  <View key={attendee.id} style={styles.attendeeAvatar}>
                    <Text style={styles.attendeeInitials}>
                      {attendee.firstName[0]}{attendee.lastName[0]}
                    </Text>
                  </View>
                ))}
                {event.currentAttendees > 6 && (
                  <View style={styles.moreAttendees}>
                    <Text style={styles.moreAttendeesText}>
                      +{event.currentAttendees - 6}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {event.fundraisingGoal && (
          <TouchableOpacity
            style={[styles.donateButton, donateLoading && styles.buttonDisabled]}
            onPress={handleDonate}
            disabled={donateLoading}
          >
            <MaterialIcons name="volunteer-activism" size={20} color="#FFFFFF" />
            <Text style={styles.donateButtonText}>
              {donateLoading ? 'Processing...' : 'Donate'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.rsvpButton,
            event.isAttending && styles.rsvpButtonAttending,
            rsvpLoading && styles.buttonDisabled
          ]}
          onPress={handleRSVP}
          disabled={rsvpLoading}
        >
          <Ionicons
            name={event.isAttending ? "checkmark-circle" : "add-circle-outline"}
            size={20}
            color={event.isAttending ? "#FFFFFF" : "#2E8B57"}
          />
          <Text style={[
            styles.rsvpButtonText,
            event.isAttending && styles.rsvpButtonTextAttending
          ]}>
            {rsvpLoading
              ? 'Updating...'
              : event.isAttending
                ? 'Attending'
                : 'RSVP'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EventDetailsScreen;