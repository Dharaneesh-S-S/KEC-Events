// services/analyticsService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Analytics API functions
export const analyticsAPI = {
  getClubAnalytics: (clubId, timeRange = '30days') => 
    api.get(`/analytics/club/${clubId}`, { params: { timeRange } }),

  getEventAnalytics: (eventId, timeRange = '30days') =>
    api.get(`/analytics/event/${eventId}`, { params: { timeRange } }),

  getParticipationTrends: (clubId, timeRange = '30days') =>
    api.get(`/analytics/participation-trends/${clubId}`, { params: { timeRange } }),

  getFormAnalytics: (clubId, eventId = null) =>
    api.get(`/analytics/form-responses/${clubId}`, { params: { eventId } }),

  exportAnalytics: (clubId, format, filters = {}) =>
    api.get(`/analytics/export/${clubId}`, { 
      params: { format, ...filters },
      responseType: 'blob'
    }),
};

// Event API functions
export const eventAPI = {
  getClubEvents: (clubId) => api.get(`/events/club/${clubId}`),
  getEventById: (id) => api.get(`/events/${id}`),
};

// Club API functions
export const clubAPI = {
  getMyClubs: () => api.get('/clubs/my/clubs'),
};
