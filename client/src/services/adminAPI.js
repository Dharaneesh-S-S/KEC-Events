import api from './api';

export const adminAPI = {
  fetchUsers: () => api.get('/admin/users')
};

export default adminAPI;
