import api from '../lib/axios';

export const adminService = {
  // User Management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/user/get-all-user', { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/user/update-status/${userId}`, { status });
    return response.data;
  },

  // Station Management
  createStation: async (stationData) => {
    const response = await api.post('/station/create', stationData);
    return response.data;
  },

  updateStation: async (stationId, stationData) => {
    const response = await api.patch(`/station/update-station-by-id/${stationId}`, stationData);
    return response.data;
  },

  deleteStation: async (stationId) => {
    const response = await api.delete(`/station/delete-station-by-id/${stationId}`);
    return response.data;
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    const data = response.data?.data || response.data || {};
    return {
      totalUsers: data.totalUsers || 0,
      totalStations: data.totalStations || 0,
      verifiedStations: data.verifiedStations || 0,
      pendingStations: data.pendingStations || 0,
      rejectedStations: data.rejectedStations || 0,
      activeUsers: data.activeUsers || 0,
      fuelDemandInsights: data.fuelDemandInsights || { octane: 0, diesel: 0, petrol: 0, cng: 0 },
      regionalDistribution: data.regionalDistribution || [],
      serverHealth: data.serverHealth || {
        database: { value: "Unknown", status: "warning" },
        redis: { value: "Unknown", status: "warning" },
        cloudinary: { value: "Unknown", status: "warning" },
        authentication: { value: "Unknown", status: "warning" }
      },
      trafficData: data.trafficData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      alerts: data.alerts || []
    };
  },

  // Settings & Danger Zone
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await api.patch('/admin/settings', settingsData);
    return response.data;
  },

  requestDangerOtp: async () => {
    const response = await api.post('/admin/danger-zone/request-otp');
    return response.data;
  },

  verifyDangerAction: async (otp, actionType) => {
    const response = await api.post('/admin/danger-zone/verify', { otp, actionType });
    return response.data;
  },

  // Review Management
  getAllReviews: async (params = {}) => {
    const response = await api.get('/review/all', { params });
    return response.data;
  }
};
