// services/clubService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Club API functions
export const clubAPI = {
  getClubs: (params = {}) => api.get('/clubs', { params }),
  getClubById: (id) => api.get(`/clubs/${id}`),
  getClubBySlug: (slug) => api.get(`/clubs/slug/${slug}`),
  getMyClubs: () => api.get('/clubs/my/clubs'),
  createClub: (clubData) => api.post('/clubs', clubData),
  updateClub: (id, clubData) => api.put(`/clubs/${id}`, clubData),
  deleteClub: (id) => api.delete(`/clubs/${id}`),
  addContact: (clubId, contactData) => api.post(`/clubs/${clubId}/contacts`, contactData),
  updateContact: (clubId, contactId, contactData) =>
    api.put(`/clubs/${clubId}/contacts/${contactId}`, contactData),
  deleteContact: (clubId, contactId) =>
    api.delete(`/clubs/${clubId}/contacts/${contactId}`),
};

// Event API functions
export const eventAPI = {
  getEvents: (params = {}) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  getClubEvents: (clubId) => api.get(`/events/club/${clubId}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};