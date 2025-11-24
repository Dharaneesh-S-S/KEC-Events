import api from './api';

export const studentAPI = {
  fetchRegistrations: () => api.get('/student/registrations')
};

export default studentAPI;
