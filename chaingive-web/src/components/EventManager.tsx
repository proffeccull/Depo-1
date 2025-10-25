import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Components
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import EventCard from './events/EventCard';
import CreateEventModal from './events/CreateEventModal';

// Services
import { apiClient } from '../services/apiClient';

// Types
interface Event {
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
  status: 'active' | 'cancelled' | 'completed';
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  isAttending: boolean;
  canManage: boolean;
}

const EventManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my-events' | 'attending'>('all');

  // Fetch events
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? { filter } : {};
      const response = await apiClient.get('/api/v2/community/events', { params });
      return response.data.events as Event[];
    },
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, attending }: { eventId: string; attending: boolean }) => {
      if (attending) {
        await apiClient.post(`/api/v2/community/events/${eventId}/rsvp`);
      } else {
        await apiClient.delete(`/api/v2/community/events/${eventId}/rsvp`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      return apiClient.post('/api/v2/community/events', eventData);
    },
    onSuccess: () => {
      setShowCreateEvent(false);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return apiClient.delete(`/api/v2/community/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleRSVP = (eventId: string, currentlyAttending: boolean) => {
    rsvpMutation.mutate({ eventId, attending: !currentlyAttending });
  };

  const handleCreateEvent = (eventData: any) => {
    createEventMutation.mutate(eventData);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const filterButtons = [
    { id: 'all', label: 'All Events' },
    { id: 'my-events', label: 'My Events' },
    { id: 'attending', label: 'Attending' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message="Failed to load events" />
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="event-manager">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Community Events</h2>
          <p className="text-gray-400">
            Discover and create events that bring our community together
          </p>
        </div>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <span>+</span>
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => setFilter(button.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === button.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events && events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRSVP={(attending) => handleRSVP(event.id, attending)}
              onDelete={event.canManage ? () => handleDeleteEvent(event.id) : undefined}
              isLoading={rsvpMutation.isPending}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-400 mb-4">
              {filter === 'all'
                ? 'Be the first to create a community event!'
                : filter === 'my-events'
                ? 'You haven\'t created any events yet.'
                : 'You\'re not attending any events yet.'
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateEvent(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create First Event
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <CreateEventModal
          onClose={() => setShowCreateEvent(false)}
          onSubmit={handleCreateEvent}
          isLoading={createEventMutation.isPending}
        />
      )}
    </div>
  );
};

export default EventManager;