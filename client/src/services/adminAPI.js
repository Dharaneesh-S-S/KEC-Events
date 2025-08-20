// client/src/services/adminAPI.js
import { apiRequest } from './api.js';

export const adminAPI = {
  // Get admin dashboard statistics
  getStats: async () => {
    return await apiRequest('/admin/stats', { method: 'GET' });
  },

  // Get all clubs with optional filters
  getClubs: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.department) queryParams.append('department', filters.department);
    if (filters.status) queryParams.append('status', filters.status);
    
    const url = `/admin/clubs${queryParams.toString() ? `?${queryParams}` : ''}`;
    return await apiRequest(url, { method: 'GET' });
  },

  // Create a new club
  createClub: async (clubData) => {
    return await apiRequest('/admin/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData)
    });
  },

  // Update club details
  updateClub: async (clubId, clubData) => {
    return await apiRequest(`/admin/clubs/${clubId}`, {
      method: 'PUT',
      body: JSON.stringify(clubData)
    });
  },

  // Delete a club
  deleteClub: async (clubId) => {
    return await apiRequest(`/admin/clubs/${clubId}`, { method: 'DELETE' });
  },

  // Get club by ID
  getClubById: async (clubId) => {
    return await apiRequest(`/admin/clubs/${clubId}`, { method: 'GET' });
  },

  // Get all departments
  getDepartments: async () => {
    return await apiRequest('/admin/departments', { method: 'GET' });
  }
};
