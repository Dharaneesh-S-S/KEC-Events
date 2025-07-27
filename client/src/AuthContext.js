// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure to install axios

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setError(err.response?.data?.message || 'Session expired');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/signup', userData);
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      
      // Redirect based on role
      const redirectPath = userData.role === 'club' ? '/dashboard/club' : '/dashboard/student';
      navigate(redirectPath);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', credentials);
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      
      // Redirect based on role
      const redirectPath = response.data.user.role === 'club' ? '/dashboard/club' : '/dashboard/student';
      navigate(redirectPath);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const updateProfile = async (updatedData) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/users/profile', updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setUser(response.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}