import api from './api';

const sanitizeParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const mapService = {
  getMapCases: async (params = {}) => {
    const response = await api.get('/map/cases', {
      params: sanitizeParams(params),
    });
    return response.data;
  },
  getMapCaseById: async (id) => {
    const response = await api.get(`/map/case/${id}`);
    return response.data;
  },
  getHotspots: async (params = {}) => {
    const response = await api.get('/map/hotspots', {
      params: sanitizeParams(params),
    });
    return response.data;
  },
  getStatistics: async (params = {}) => {
    const response = await api.get('/map/statistics', {
      params: sanitizeParams(params),
    });
    return response.data;
  },
};