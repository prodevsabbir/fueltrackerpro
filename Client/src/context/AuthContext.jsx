import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../helpers/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Refresh in background to get latest fields/images
          const freshProfile = await authService.getProfile();
          if (freshProfile) setUser(freshProfile);
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password, rememberMe) => {
    const result = await authService.login(email, password, rememberMe);
    if (result.success) {
      // Immediately fetch full profile to get all fields like phone, city, image
      const fullProfile = await authService.getProfile();
      setUser(fullProfile || result.user);
    }
    return result;
  };

  const register = async (name, email, phone, password, role) => {
    const result = await authService.register(name, email, phone, password, role);
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('user');
    }
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
