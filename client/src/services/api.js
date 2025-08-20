// client/src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    // Safe request logging (do not log Authorization token)
    const { headers, body, method } = config;
    const safeHeaders = { ...(headers || {}) };
    if (safeHeaders.Authorization) safeHeaders.Authorization = '[REDACTED]';
    let parsedBody = body;
    try { parsedBody = typeof body === 'string' ? JSON.parse(body) : body; } catch (_) {}
    console.debug('[apiRequest] ->', { url, method: method || 'GET', headers: safeHeaders, body: parsedBody });

    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      // Try to read error body as JSON, fallback to text
      const errorData = contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : await response.text().catch(() => '');
      console.error('[apiRequest] <- ERROR', { url, status: response.status, error: errorData });
      const message = typeof errorData === 'object' && errorData?.message
        ? errorData.message
        : (typeof errorData === 'string' && errorData) || `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }
    
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
    console.debug('[apiRequest] <- OK', { url, status: response.status });
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  signup: (userData) => apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  verify: () => apiRequest('/auth/verify')
};

// User API
export const userAPI = {
  updateProfile: (profileData) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  })
};

// Events API
export const eventsAPI = {
  getAll: () => apiRequest('/events'),
  getById: (id) => apiRequest(`/events/${id}`),
  create: (eventData) => apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  }),
  update: (id, eventData) => apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData)
  }),
  delete: (id) => apiRequest(`/events/${id}`, {
    method: 'DELETE'
  })
};

// Venues API
export const venuesAPI = {
  getAll: () => apiRequest('/venues'),
  getAvailableForSlot: ({ date, startTime, endTime, venueType, department }) => {
    const params = new URLSearchParams({ date, startTime, endTime });
    if (venueType) params.append('venueType', venueType);
    if (department) params.append('department', department);
    return apiRequest(`/availability/available-venues?${params.toString()}`);
  }
};

// Bookings API
export const bookingsAPI = {
  getAll: () => apiRequest('/bookings'),
  getById: (id) => apiRequest(`/bookings/${id}`),
  create: (bookingData) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  updateStatus: (id, status) => apiRequest(`/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  delete: (id) => apiRequest(`/bookings/${id}`, {
    method: 'DELETE'
  }),
  getByClub: (clubId, params = {}) => {
    const search = new URLSearchParams(params);
    return apiRequest(`/bookings/club/${clubId}?${search.toString()}`);
  },
  getStats: (params = {}) => {
    const search = new URLSearchParams(params);
    return apiRequest(`/bookings/stats?${search.toString()}`);
  }
};

// Aggregated counts API helpers
export const statsAPI = {
  getCounts: async () => {
    const [bookings, events] = await Promise.all([
      bookingsAPI.getStats(),
      eventsAPI.getAll()
    ]);
    return {
      totalBookings: bookings.totalBookings || 0,
      totalEvents: Array.isArray(events) ? events.length : (events?.length || 0)
    };
  }
};

// Availability API
export const availabilityAPI = {
  getVenueAvailability: (params) => {
    const search = new URLSearchParams(params);
    return apiRequest(`/availability?${search.toString()}`);
  },
  
  checkAvailability: (data) => apiRequest('/availability/check', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getAvailableVenues: (params) => {
    const search = new URLSearchParams(params);
    return apiRequest(`/availability/available-venues?${search.toString()}`);
  }
};

export const adminAPI = {
  createClub: (clubData) => apiRequest('/admin/create-club', {
    method: 'POST',
    body: JSON.stringify(clubData)
  }),
  
  getAllClubs: () => apiRequest('/admin/clubs'),
  
  getAllDepartments: () => apiRequest('/admin/departments')
};
