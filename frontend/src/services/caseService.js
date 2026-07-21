import api from './api';

export const caseService = {
  getCases: async (params = {}) => {
    const response = await api.get('/cases', { params });
    return response.data;
  },
  getCaseById: async (id) => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },
  createCase: async (payload) => {
    const response = await api.post('/cases', payload);
    return response.data;
  },
  updateCase: async (id, payload) => {
    const response = await api.put(`/cases/${id}`, payload);
    return response.data;
  },
  deleteCase: async (id) => {
    const response = await api.delete(`/cases/${id}`);
    return response.data;
  },
};
