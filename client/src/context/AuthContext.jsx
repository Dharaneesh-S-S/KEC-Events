//client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and verify it
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const userData = await authAPI.verify();
      setUser(userData.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Use backend API for all logins including ADMIN_KEC
      const response = await authAPI.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.user.role);
      
      setUser(response.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
