// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  signup: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

// Events API
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  register: (eventId, registrationData) => api.post(`/events/${eventId}/register`, registrationData),
  getRegistrations: (eventId) => api.get(`/events/${eventId}/registrations`),
};

// Student API
export const studentAPI = {
  getEvents: () => api.get('/events'),
  registerForEvent: (eventId, data) => api.post(`/events/${eventId}/register`, data),
  getRegisteredEvents: () => api.get('/events/my-registrations'),
};

// Club API
export const clubAPI = {
  getDashboard: () => api.get('/club/dashboard'),
  createEvent: (eventData) => api.post('/events', eventData),
  getEvents: () => api.get('/events'),
  getEvent: (eventId) => api.get(`/events/${eventId}`),
  updateEvent: (eventId, eventData) => api.put(`/events/${eventId}`, eventData),
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
  getMyClubs: () => api.get('/clubs/my/clubs'),
  createClub: (clubData) => api.post('/clubs', clubData),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/students', { params }),
  getClubs: (params) => api.get('/admin/clubs', { params }),
  toggleUserAccess: (userId) => api.patch(`/admin/students/${userId}/access`),
  deleteClub: (clubId) => api.delete(`/admin/clubs/${clubId}`),
};

export default api;