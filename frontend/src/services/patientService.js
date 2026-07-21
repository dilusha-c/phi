import api from './api';

const sanitizeParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined));

export const patientService = {
  getPatients: async (params = {}) => {
    const response = await api.get('/patients', { params: sanitizeParams(params) });
    return response.data;
  },
  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  createPatient: async (payload) => {
    const response = await api.post('/patients', payload);
    return response.data;
  },
  updatePatient: async (id, payload) => {
    const response = await api.put(`/patients/${id}`, payload);
    return response.data;
  },
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },
};
