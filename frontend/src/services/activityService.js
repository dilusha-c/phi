import api from "./api";

const sanitizeParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );

export const activityService = {
  getActivities: async (params = {}) => {
    const response = await api.get("/daily-activities", {
      params: sanitizeParams(params),
    });
    return response.data;
  },
  createActivity: async (payload) => {
    const response = await api.post("/daily-activities", payload);
    return response.data;
  },
  getActivityById: async (id) => {
    const response = await api.get(`/daily-activities/${id}`);
    return response.data;
  },
  updateActivity: async (id, payload) => {
    const response = await api.put(`/daily-activities/${id}`, payload);
    return response.data;
  },
};
