import api from '../lib/axios';

export const stationService = {
  getNearbyStations: async (lat, lng, radius = 10) => {
    const response = await api.get('/station/nearby', {
      params: { lat, lng, radius }
    });
    return response.data?.data || [];
  },
  
  getStationDetails: async (stationId) => {
    const response = await api.get(`/station/get-station-by-id/${stationId}`);
    return response.data?.data;
  },

  getAllStations: async (params = {}) => {
    const response = await api.get('/station/get-all', { params });
    return response.data?.data;
  },

  createStation: async (stationData) => {
    const response = await api.post('/station/create', stationData);
    return response.data;
  },

  updateStation: async (id, stationData) => {
    const response = await api.patch(`/station/update-station-by-id/${id}`, stationData);
    return response.data;
  },

  // 📝 REVIEW & FEEDBACK INTELLIGENCE
  createReview: async (stationId, rating, comment, isOverprice = false) => {
    const response = await api.post('/review/create', { 
      stationId, 
      rating, 
      comment, 
      isOverprice 
    });
    return response.data;
  },

  getReviewsByStation: async (stationId) => {
    const response = await api.get(`/review/get-by-station/${stationId}`);
    return response.data;
  },
  
  getAllReviews: async (params = {}) => {
    const response = await api.get('/review/all', { params });
    return response.data;
  }
};
