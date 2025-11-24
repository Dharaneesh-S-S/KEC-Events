import api from './api';

export const clubAPI = {
  fetchClubEvents: () => api.get('/club/events')
};

export default clubAPI;
