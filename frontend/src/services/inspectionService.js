import api from './api';

const multipartConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

export const inspectionService = {
  getInspections: async (params = {}) => {
    const response = await api.get('/inspections', { params });
    return response.data;
  },
  getInspectionById: async (id) => {
    const response = await api.get(`/inspections/${id}`);
    return response.data;
  },
  createInspection: async (payload) => {
    const response = await api.post('/inspections', payload, multipartConfig);
    return response.data;
  },
  updateInspection: async (id, payload) => {
    const response = await api.put(`/inspections/${id}`, payload, multipartConfig);
    return response.data;
  },
  deleteInspection: async (id) => {
    const response = await api.delete(`/inspections/${id}`);
    return response.data;
  },
};
