import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getPhis: async (name = '') => {
    const response = await api.get(`/auth/phis?name=${encodeURIComponent(name)}`);
    return response.data;
  },
  getAllUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/auth/users?${query}`);
    return response.data;
  },
  updateUserByAdmin: async (id, payload) => {
    const response = await api.put(`/auth/users/${id}`, payload);
    return response.data;
  },
  deleteUserByAdmin: async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  }
};
