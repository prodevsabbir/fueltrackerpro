import api from '../lib/axios';

export const helplineService = {
  createRequest: async (data) => {
    const response = await api.post('/helpline/create', data);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get('/helpline/my-requests');
    return response.data;
  },

  // Admin only
  getAllRequests: async () => {
    const response = await api.get('/helpline/all');
    return response.data;
  },

  updateRequest: async (id, data) => {
    const response = await api.patch(`/helpline/update/${id}`, data);
    return response.data;
  },

  deleteRequest: async (id) => {
    const response = await api.delete(`/helpline/${id}`);
    return response.data;
  }
};
