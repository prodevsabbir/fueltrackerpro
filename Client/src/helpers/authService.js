import api from '../lib/axios';

export const authService = {
  login: async (email, password, rememberMe) => {
    const response = await api.post('/user/login', { email, password, rememberMe });
    if (response.data.status === 'ok') {
      const { accessToken, refreshToken, _id, email: userEmail, name, role, profileImage } = response.data.data;
      const user = { _id, email: userEmail, name, role, profileImage };
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, success: true };
    }
    return { success: false, message: response.data.message };
  },

  register: async (name, email, phone, password, role, vehicleType) => {
    const response = await api.post('/user/register-user', { name, email, phone, password, role, vehicleType });
    return { ...response.data, success: response.data.status === 'ok' };
  },

  getProfile: async () => {
    const response = await api.get('/user/get-my-profile');
    if (response.data.status === 'ok') {
      const fullUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(fullUser));
      return fullUser;
    }
    return null;
  },

  logout: async () => {
    try {
      await api.post('/user/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (!user || user === 'undefined') return null;
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  }
};
