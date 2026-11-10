import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current authentication status on initial load
  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('spendwise_user', JSON.stringify(response.data.user));
      }
    } catch {
      // Not logged in or token invalid
      setUser(null);
      localStorage.removeItem('spendwise_user');
      localStorage.removeItem('spendwise_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Register
  const register = async (name, email, password, currency = 'INR') => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      currency,
    });
    if (response.data.success) {
      if (response.data.token) {
        localStorage.setItem('spendwise_token', response.data.token);
      }
      setUser(response.data.user);
      localStorage.setItem('spendwise_user', JSON.stringify(response.data.user));
    }
    return response.data;
  };

  // Login
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      if (response.data.token) {
        localStorage.setItem('spendwise_token', response.data.token);
      }
      setUser(response.data.user);
      localStorage.setItem('spendwise_user', JSON.stringify(response.data.user));
    }
    return response.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('spendwise_token');
      localStorage.removeItem('spendwise_user');
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.success) {
      setUser(response.data.user);
      localStorage.setItem('spendwise_user', JSON.stringify(response.data.user));
    }
    return response.data;
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

