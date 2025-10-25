import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getEvents, CommunityEvent } from '../../api/community';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const EVENT_TYPES = [
  { label: 'All Events', value: '' },
  { label: 'Fundraising', value: 'fundraising' },
  { label: 'Meetings', value: 'community_meeting' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Celebrations', value: 'celebration' },
];

export const EventsListScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    hasMore: true,
  });

  useEffect(() => {
    loadEvents(true);
  }, [selectedType]);

  const loadEvents = async (reset = false) => {
    try {
      const page = reset ? 1 : pagination.page;
      const response = await getEvents(page, 20, 'active', selectedType || undefined);

      if (reset) {
        setEvents(response.events);
      } else {
        setEvents(prev => [...prev, ...response.events]);
      }

      setPagination({
        page: response.pagination.page,
        total: response.pagination.total,
        pages: response.pagination.pages,
        hasMore: response.pagination.page < response.pagination.pages,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents(true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && pagination.hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
      loadEvents();
    }
  };

  const handleEventPress = (event: CommunityEvent) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'fundraising': return 'cash-outline';
      case 'community_meeting': return 'people-outline';
      case 'workshop': return 'school-outline';
      case 'celebration': return 'party-outline';
      default: return 'calendar-outline';
    }
  };

  const renderEventItem = ({ item }: { item: CommunityEvent }) => (
    <Card style={styles.eventCard} onPress={() => handleEventPress(item)}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTypeContainer}>
          <Ionicons
            name={getEventTypeIcon(item.eventType) as any}
            size={16}
            color={colors.primary}
          />
          <Text style={styles.eventType}>
            {EVENT_TYPES.find(t => t.value === item.eventType)?.label || item.eventType}
          </Text>
        </View>
        <Text style={styles.eventDate}>{formatDate(item.eventDate)}</Text>
      </View>

      <Text style={styles.eventTitle}>{item.title}</Text>

      <View style={styles.eventMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{item.eventTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>

      <View style={styles.eventFooter}>
        <View style={styles.attendeesContainer}>
          <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.attendeesText}>
            {item.currentAttendees}
            {item.maxAttendees && `/${item.maxAttendees}`}
          </Text>
        </View>

        <View style={styles.creatorContainer}>
          <Text style={styles.creatorText}>
            by {item.creator.firstName} {item.creator.lastName}
          </Text>
        </View>
      </View>

      {item.fundraisingGoal && (
        <View style={styles.fundraisingContainer}>
          <Ionicons name="cash-outline" size={14} color={colors.primary} />
          <Text style={styles.fundraisingText}>
            Goal: ₦{item.fundraisingGoal.toLocaleString()}
          </Text>
        </View>
      )}
    </Card>
  );

  const renderFilterButton = (type: { label: string; value: string }) => (
    <TouchableOpacity
      key={type.value}
      style={[
        styles.filterButton,
        selectedType === type.value && styles.filterButtonSelected,
      ]}
      onPress={() => setSelectedType(type.value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedType === type.value && styles.filterButtonTextSelected,
        ]}
      >
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community Events</Text>
        <Text style={styles.subtitle}>Connect and participate in local events</Text>
      </View>

      {/* Create Event Button */}
      <View style={styles.createButtonContainer}>
        <Button
          title="Create Event"
          onPress={handleCreateEvent}
          style={styles.createButton}
          icon="add-circle-outline"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersList}>
            {EVENT_TYPES.map(renderFilterButton)}
          </View>
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedType ? `No ${selectedType} events available` : 'Be the first to create an event!'}
            </Text>
          </View>
        }
        ListFooterComponent={
          loading && events.length > 0 ? (
            <View style={styles.loadingMore}>
              <Text style={styles.loadingMoreText}>Loading more events...</Text>
            </View>
          ) : null
        }
      />
    </View>
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
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  createButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filtersList: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextSelected: {
    color: colors.surface,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  eventCard: {
    marginBottom: 16,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  eventDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeesText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  creatorContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  creatorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fundraisingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fundraisingText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingMore: {
    padding: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});