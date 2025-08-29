import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const userProfile = await ApiService.getUserProfile();
        setUser(userProfile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await AsyncStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await ApiService.login(username, password);
      const userProfile = await ApiService.getUserProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.log('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};