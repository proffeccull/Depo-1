import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'charity' | 'auction' | 'social' | 'educational' | 'networking';
  startDate: string;
  endDate: string;
  location?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isVirtual: boolean;
  virtualLink?: string;
  organizer: {
    id: string;
    name: string;
    type: 'user' | 'corporate' | 'merchant';
    profilePictureUrl?: string;
  };
  capacity: number;
  registeredCount: number;
  isRegistered?: boolean;
  isBookmarked?: boolean;
  tags: string[];
  imageUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category: string;
  targetAudience: string[];
  requirements?: string[];
  agenda?: {
    time: string;
    activity: string;
    description?: string;
  }[];
}

interface EventFilters {
  type?: string;
  category?: string;
  dateRange?: { start: string; end: string };
  location?: string;
  isVirtual?: boolean;
  priceRange?: { min: number; max: number };
  sortBy?: 'date' | 'popularity' | 'relevance' | 'distance';
}

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  registeredEvents: number;
  completedEvents: number;
  totalAttendees: number;
}

interface EventsState {
  events: Event[];
  userEvents: Event[];
  bookmarkedEvents: Event[];
  currentEvent: Event | null;
  filters: EventFilters;
  stats: EventStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: EventsState = {
  events: [],
  userEvents: [],
  bookmarkedEvents: [],
  currentEvent: null,
  filters: {
    sortBy: 'date'
  },
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (filters?: EventFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    const response = await apiClient.get(`/events?${params}`);
    return response.data.data;
  }
);

export const fetchEventDetails = createAsyncThunk(
  'events/fetchEventDetails',
  async (eventId: string) => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data.data;
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: Omit<Event, 'id' | 'registeredCount' | 'isRegistered' | 'isBookmarked' | 'organizer'>) => {
    const response = await apiClient.post('/events', eventData);
    return response.data.data;
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, updates }: { eventId: string; updates: Partial<Event> }) => {
    const response = await apiClient.put(`/events/${eventId}`, updates);
    return response.data.data;
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string) => {
    await apiClient.delete(`/events/${eventId}`);
    return eventId;
  }
);

export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async (eventId: string) => {
    const response = await apiClient.post(`/events/${eventId}/register`);
    return response.data.data;
  }
);

export const unregisterFromEvent = createAsyncThunk(
  'events/unregisterFromEvent',
  async (eventId: string) => {
    await apiClient.delete(`/events/${eventId}/register`);
    return eventId;
  }
);

export const bookmarkEvent = createAsyncThunk(
  'events/bookmarkEvent',
  async (eventId: string) => {
    const response = await apiClient.post(`/events/${eventId}/bookmark`);
    return response.data.data;
  }
);

export const unbookmarkEvent = createAsyncThunk(
  'events/unbookmarkEvent',
  async (eventId: string) => {
    await apiClient.delete(`/events/${eventId}/bookmark`);
    return eventId;
  }
);

export const fetchUserEvents = createAsyncThunk(
  'events/fetchUserEvents',
  async (userId: string) => {
    const response = await apiClient.get(`/events/user/${userId}`);
    return response.data.data;
  }
);

export const fetchBookmarkedEvents = createAsyncThunk(
  'events/fetchBookmarkedEvents',
  async (userId: string) => {
    const response = await apiClient.get(`/events/bookmarked/${userId}`);
    return response.data.data;
  }
);

export const searchEvents = createAsyncThunk(
  'events/searchEvents',
  async (query: string) => {
    const response = await apiClient.get(`/events/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  }
);

export const fetchEventStats = createAsyncThunk(
  'events/fetchEventStats',
  async (userId: string) => {
    const response = await apiClient.get(`/events/stats/${userId}`);
    return response.data.data;
  }
);

export const shareEvent = createAsyncThunk(
  'events/shareEvent',
  async ({ eventId, platform }: { eventId: string; platform: string }) => {
    const response = await apiClient.post(`/events/${eventId}/share`, { platform });
    return response.data.data;
  }
);

// Slice
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<EventFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    updateEventLocally: (state, action: PayloadAction<{ id: string; updates: Partial<Event> }>) => {
      const { id, updates } = action.payload;
      const index = state.events.findIndex(event => event.id === id);
      if (index !== -1) {
        state.events[index] = { ...state.events[index], ...updates };
      }
      if (state.currentEvent?.id === id) {
        state.currentEvent = { ...state.currentEvent, ...updates };
      }
      const userIndex = state.userEvents.findIndex(event => event.id === id);
      if (userIndex !== -1) {
        state.userEvents[userIndex] = { ...state.userEvents[userIndex], ...updates };
      }
      const bookmarkIndex = state.bookmarkedEvents.findIndex(event => event.id === id);
      if (bookmarkIndex !== -1) {
        state.bookmarkedEvents[bookmarkIndex] = { ...state.bookmarkedEvents[bookmarkIndex], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch events';
      })

      // Fetch event details
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
        // Update in events list if exists
        const index = state.events.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch event details';
      })

      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
        state.userEvents.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create event';
      })

      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEvent = action.payload;
        // Update in all relevant lists
        const eventIndex = state.events.findIndex(e => e.id === updatedEvent.id);
        if (eventIndex !== -1) {
          state.events[eventIndex] = updatedEvent;
        }
        const userIndex = state.userEvents.findIndex(e => e.id === updatedEvent.id);
        if (userIndex !== -1) {
          state.userEvents[userIndex] = updatedEvent;
        }
        const bookmarkIndex = state.bookmarkedEvents.findIndex(e => e.id === updatedEvent.id);
        if (bookmarkIndex !== -1) {
          state.bookmarkedEvents[bookmarkIndex] = updatedEvent;
        }
        if (state.currentEvent?.id === updatedEvent.id) {
          state.currentEvent = updatedEvent;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update event';
      })

      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        const eventId = action.payload;
        state.events = state.events.filter(e => e.id !== eventId);
        state.userEvents = state.userEvents.filter(e => e.id !== eventId);
        state.bookmarkedEvents = state.bookmarkedEvents.filter(e => e.id !== eventId);
        if (state.currentEvent?.id === eventId) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete event';
      })

      // Register for event
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.loading = false;
        // Update registration status
        const event = state.events.find(e => e.id === action.meta.arg);
        if (event) {
          event.isRegistered = true;
          event.registeredCount += 1;
        }
        if (state.currentEvent?.id === action.meta.arg) {
          state.currentEvent.isRegistered = true;
          state.currentEvent.registeredCount += 1;
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to register for event';
      })

      // Unregister from event
      .addCase(unregisterFromEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unregisterFromEvent.fulfilled, (state, action) => {
        state.loading = false;
        // Update registration status
        const event = state.events.find(e => e.id === action.payload);
        if (event) {
          event.isRegistered = false;
          event.registeredCount = Math.max(0, event.registeredCount - 1);
        }
        if (state.currentEvent?.id === action.payload) {
          state.currentEvent.isRegistered = false;
          state.currentEvent.registeredCount = Math.max(0, state.currentEvent.registeredCount - 1);
        }
      })
      .addCase(unregisterFromEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to unregister from event';
      })

      // Bookmark event
      .addCase(bookmarkEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookmarkEvent.fulfilled, (state, action) => {
        state.loading = false;
        const event = state.events.find(e => e.id === action.payload.id);
        if (event) {
          event.isBookmarked = true;
        }
        if (state.currentEvent && state.currentEvent.id === action.payload.id) {
          state.currentEvent.isBookmarked = true;
        }
        state.bookmarkedEvents.unshift(action.payload);
      })
      .addCase(bookmarkEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to bookmark event';
      })

      // Unbookmark event
      .addCase(unbookmarkEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unbookmarkEvent.fulfilled, (state, action) => {
        state.loading = false;
        const event = state.events.find(e => e.id === action.payload);
        if (event) {
          event.isBookmarked = false;
        }
        if (state.currentEvent?.id === action.payload) {
          state.currentEvent.isBookmarked = false;
        }
        state.bookmarkedEvents = state.bookmarkedEvents.filter(e => e.id !== action.payload);
      })
      .addCase(unbookmarkEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to unbookmark event';
      })

      // Fetch user events
      .addCase(fetchUserEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.userEvents = action.payload;
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user events';
      })

      // Fetch bookmarked events
      .addCase(fetchBookmarkedEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookmarkedEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarkedEvents = action.payload;
      })
      .addCase(fetchBookmarkedEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookmarked events';
      })

      // Search events
      .addCase(searchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search events';
      })

      // Fetch event stats
      .addCase(fetchEventStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchEventStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch event stats';
      })

      // Share event
      .addCase(shareEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shareEvent.fulfilled, (state, action) => {
        state.loading = false;
        // Handle share success
      })
      .addCase(shareEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to share event';
      });
  }
});

export const {
  clearError,
  setFilters,
  clearCurrentEvent,
  updateEventLocally
} = eventsSlice.actions;

export default eventsSlice.reducer;