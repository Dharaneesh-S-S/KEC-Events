import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // DEV MODE Configuration
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

  useEffect(() => {
    if (DEV_MODE) {
      // DEV MODE: Auto-login with specified role
      console.warn('🔧 DEV MODE: Using mock authentication');
      const mockUser = {
        _id: 'dev-123',
        name: 'Dev User',
        email: 'dev@kec.edu',
        department: 'CSE',
        year: 'III Year',
        isAdmin: false,
        isActive: true,
        clubRef: null,
        token: 'dev-token'
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'dev-token');
      setLoading(false);
      return;
    }

    // Production behavior - check for stored user data
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (DEV_MODE) {
      // DEV MODE: Auto login with role detection from email
      const isAdmin = email.includes('admin');
      const isClub = email.includes('club');
      
      const mockUser = {
        _id: 'dev-' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email: email,
        department: isClub || isAdmin ? null : 'CSE',
        year: isClub || isAdmin ? null : 'III Year',
        isAdmin: isAdmin,
        isActive: true,
        clubRef: isClub ? { _id: 'dev-club-123', name: 'Dev Club' } : null,
        token: 'dev-token-' + Math.random().toString(36).substr(2, 9)
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockUser.token);
      
      return { success: true, user: mockUser };
    }

    // Production login logic
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        
        return { success: true, user: userData };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    if (DEV_MODE) {
      // DEV MODE: Auto signup
      const mockUser = {
        _id: 'dev-' + Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email: userData.email,
        department: userData.department,
        year: userData.year,
        isAdmin: false,
        isActive: true,
        clubRef: null,
        token: 'dev-token-' + Math.random().toString(36).substr(2, 9)
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockUser.token);
      
      return { success: true, user: mockUser };
    }

    // Production signup logic
    try {
      const response = await authAPI.signup(userData);
      
      if (response.data) {
        const newUser = response.data;
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', newUser.token);
        
        return { success: true, user: newUser };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Determine user role for frontend routing
  const getUserRole = () => {
    if (!user) return null;
    if (user.isAdmin) return 'admin';
    if (user.clubRef) return 'club';
    return 'student';
  };

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    
    // Actions
    login,
    signup,
    logout,
    
    // DEV MODE Features
    devMode: DEV_MODE,
    
    // Utility methods
    hasRole: (role) => getUserRole() === role,
    isStudent: () => getUserRole() === 'student',
    isClub: () => getUserRole() === 'club',
    isAdmin: () => getUserRole() === 'admin',
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};