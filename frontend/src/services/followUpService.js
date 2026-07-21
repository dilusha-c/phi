import api from './api';

export const followUpService = {
  getFollowUps: async (params = {}) => {
    const response = await api.get('/followups', { params });
    return response.data;
  },
  getFollowUpById: async (id) => {
    const response = await api.get(`/followups/${id}`);
    return response.data;
  },
  createFollowUp: async (payload) => {
    const response = await api.post('/followups', payload);
    return response.data;
  },
  updateFollowUp: async (id, payload) => {
    const response = await api.put(`/followups/${id}`, payload);
    return response.data;
  },
  deleteFollowUp: async (id) => {
    const response = await api.delete(`/followups/${id}`);
    return response.data;
  },
};
