'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  currentAttendees: number;
  organizerId: string;
  organizerName: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isVirtual: boolean;
  meetingLink?: string;
  donationGoal?: number;
  currentDonations: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  status: 'attending' | 'maybe' | 'declined';
  rsvpDate: string;
  plusOnes: number;
}

interface EventFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  isVirtual: boolean;
  meetingLink: string;
  donationGoal: number;
  tags: string[];
}

export const EventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    maxAttendees: 50,
    isVirtual: false,
    meetingLink: '',
    donationGoal: 0,
    tags: [],
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/events');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventDetails = async (eventId: string) => {
    try {
      const [eventResponse, rsvpResponse] = await Promise.all([
        apiClient.get(`/api/v1/events/${eventId}`),
        apiClient.get(`/api/v1/events/${eventId}/rsvps`),
      ]);

      setSelectedEvent(eventResponse.data.event);
      setRsvps(rsvpResponse.data.rsvps || []);
    } catch (error) {
      console.error('Failed to load event details:', error);
    }
  };

  const createEvent = async () => {
    try {
      setLoading(true);
      await apiClient.post('/api/v1/events', formData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        startDate: '',
        endDate: '',
        maxAttendees: 50,
        isVirtual: false,
        meetingLink: '',
        donationGoal: 0,
        tags: [],
      });
      setShowCreateForm(false);

      // Reload events
      await loadEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, status: Event['status']) => {
    try {
      await apiClient.patch(`/api/v1/events/${eventId}`, { status });
      await loadEvents();
      if (selectedEvent?.id === eventId) {
        await loadEventDetails(eventId);
      }
    } catch (error) {
      console.error('Failed to update event status:', error);
    }
  };

  const rsvpToEvent = async (eventId: string, status: RSVP['status']) => {
    try {
      await apiClient.post(`/api/v1/events/${eventId}/rsvp`, { status });
      await loadEventDetails(eventId);
    } catch (error) {
      console.error('Failed to RSVP:', error);
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRSVPColor = (status: RSVP['status']) => {
    switch (status) {
      case 'attending': return 'text-green-600 bg-green-100';
      case 'maybe': return 'text-yellow-600 bg-yellow-100';
      case 'declined': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Community Events</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {showCreateForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Event title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Event description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select category</option>
                <option value="fundraising">Fundraising</option>
                <option value="community">Community</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="celebration">Celebration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Event location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Attendees</label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Donation Goal (₦)</label>
              <input
                type="number"
                value={formData.donationGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, donationGoal: parseInt(e.target.value) }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isVirtual"
                type="checkbox"
                checked={formData.isVirtual}
                onChange={(e) => setFormData(prev => ({ ...prev, isVirtual: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isVirtual" className="ml-2 block text-sm text-gray-900">
                Virtual Event
              </label>
            </div>

            {formData.isVirtual && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://zoom.us/..."
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={createEvent}
              disabled={loading || !formData.title || !formData.description}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Your Events
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage community events and track RSVPs
          </p>
        </div>

        {loading ? (
          <div className="px-4 py-5 sm:p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center text-gray-500">
              <span className="text-4xl">📅</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first community event to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {events.map((event) => (
                <li key={event.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {event.category.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(event.startDate).toLocaleDateString()} • {event.location}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.currentAttendees}/{event.maxAttendees} attendees
                            {event.donationGoal && event.donationGoal > 0 && (
                              <span className="ml-2">
                                • ₦{event.currentDonations.toLocaleString()}/₦{event.donationGoal.toLocaleString()} raised
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => loadEventDetails(event.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        View Details
                      </button>
                      {event.status === 'draft' && (
                        <button
                          onClick={() => updateEventStatus(event.id, 'published')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Description</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Date & Time</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEvent.startDate).toLocaleString()} - {new Date(selectedEvent.endDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Location</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                </div>
              </div>

              {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Meeting Link</h4>
                  <a
                    href={selectedEvent.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedEvent.meetingLink}
                  </a>
                </div>
              )}

              {/* RSVP Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">RSVP Status</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => rsvpToEvent(selectedEvent.id, 'attending')}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    Attending ({rsvps.filter(r => r.status === 'attending').length})
                  </button>
                  <button
                    onClick={() => rsvpToEvent(selectedEvent.id, 'maybe')}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                  >
                    Maybe ({rsvps.filter(r => r.status === 'maybe').length})
                  </button>
                  <button
                    onClick={() => rsvpToEvent(selectedEvent.id, 'declined')}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Declined ({rsvps.filter(r => r.status === 'declined').length})
                  </button>
                </div>
              </div>

              {/* Attendees List */}
              {rsvps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Attendees</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="divide-y divide-gray-200">
                      {rsvps.filter(r => r.status === 'attending').map((rsvp) => (
                        <li key={rsvp.id} className="py-2 flex justify-between items-center">
                          <span className="text-sm text-gray-900">{rsvp.userName}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRSVPColor(rsvp.status)}`}>
                            {rsvp.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};