import { apiClient } from './client';

export interface CommunityEvent {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  maxAttendees?: number;
  currentAttendees: number;
  eventType: string;
  fundraisingGoal?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    trustScore: number;
  };
  rsvps?: Array<{
    id: string;
    userId: string;
    status: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  _count?: {
    rsvps: number;
  };
}

export interface CreateEventData {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  maxAttendees?: number;
  eventType: string;
  fundraisingGoal?: number;
}

export interface RSVPData {
  status: 'attending' | 'maybe' | 'declined';
}

export interface EventsResponse {
  events: CommunityEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RSVPStatusResponse {
  rsvpStatus: string | null;
}

export interface DonateToEventData {
  amount: number;
  message?: string;
}

export interface EventDonationsResponse {
  event: {
    id: string;
    title: string;
    fundraisingGoal: number;
    totalRaised: number;
    progressPercentage: number;
  };
  donations: Array<{
    id: string;
    amount: number;
    message?: string;
    receivedAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      trustScore: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Create a new community event
 */
export const createEvent = async (data: CreateEventData): Promise<CommunityEvent> => {
  const response = await apiClient.post('/community/events', data);
  return response.data.data.event;
};

/**
 * Get all community events with pagination
 */
export const getEvents = async (
  page = 1,
  limit = 20,
  status = 'active',
  eventType?: string
): Promise<EventsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
  });

  if (eventType) {
    params.append('eventType', eventType);
  }

  const response = await apiClient.get(`/community/events?${params}`);
  return response.data.data;
};

/**
 * Get single event by ID
 */
export const getEvent = async (id: string): Promise<CommunityEvent> => {
  const response = await apiClient.get(`/community/events/${id}`);
  return response.data.data.event;
};

/**
 * RSVP to an event
 */
export const rsvpEvent = async (id: string, data: RSVPData): Promise<any> => {
  const response = await apiClient.post(`/community/events/${id}/rsvp`, data);
  return response.data.data.rsvp;
};

/**
 * Get user's RSVP status for an event
 */
export const getEventRsvpStatus = async (id: string): Promise<RSVPStatusResponse> => {
  const response = await apiClient.get(`/community/events/${id}/rsvp`);
  return response.data.data;
};

/**
 * Update an event (only by creator)
 */
export const updateEvent = async (id: string, data: Partial<CreateEventData>): Promise<CommunityEvent> => {
  const response = await apiClient.put(`/community/events/${id}`, data);
  return response.data.data.event;
};

/**
 * Cancel an event (only by creator)
 */
export const cancelEvent = async (id: string): Promise<CommunityEvent> => {
  const response = await apiClient.delete(`/community/events/${id}`);
  return response.data.data.event;
};

/**
 * Donate to an event fundraising goal
 */
export const donateToEvent = async (id: string, data: DonateToEventData): Promise<any> => {
  const response = await apiClient.post(`/community/events/${id}/donate`, data);
  return response.data.data;
};

/**
 * Get event donations and fundraising progress
 */
export const getEventDonations = async (
  id: string,
  page = 1,
  limit = 20
): Promise<EventDonationsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await apiClient.get(`/community/events/${id}/donations?${params}`);
  return response.data.data;
};