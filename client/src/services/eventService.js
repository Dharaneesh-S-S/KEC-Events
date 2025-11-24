// services/eventService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL  || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Event API functions
export const eventAPI = {
  // Get all events with filters
  getEvents: (params = {}) => api.get('/events', { params }),

  // Get event by ID
  getEventById: (id) => api.get(`/events/${id}`),

  // Get club events
  getClubEvents: (clubId, params = {}) => 
    api.get(`/events/club/${clubId}`, { params }),

  // Get upcoming events
  getUpcomingEvents: (limit = 5) => 
    api.get('/events/upcoming', { params: { limit } }),

  // Create event
  createEvent: (eventData) => api.post('/events', eventData),

  // Update event
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),

  // Delete event
  deleteEvent: (id) => api.delete(`/events/${id}`),

  // Increment event views
  incrementEventViews: (id) => api.patch(`/events/${id}/views`),

  // Update participants count
  updateParticipantsCount: (id, action) => 
    api.patch(`/events/${id}/participants`, { action }),

  // Get event participants
  getEventParticipants: (id) => api.get(`/events/${id}/participants`),
};

// Club API functions
export const clubAPI = {
  getMyClubs: () => api.get('/clubs/my/clubs'),
  getClubById: (id) => api.get(`/clubs/${id}`),
  getClubBySlug: (slug) => api.get(`/clubs/slug/${slug}`),
};