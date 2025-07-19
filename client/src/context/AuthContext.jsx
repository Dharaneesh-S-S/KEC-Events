//client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

// Create the context
const AuthContext = createContext(undefined);

// Custom hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Mock authentication
    if (password === 'password') {
      const userData = {
        id: email,
        email,
        name: email.startsWith('CLUB_') ? email.replace('CLUB_', '') : email.split('@')[0],
        role: email.startsWith('CLUB_') ? 'club' : 'student'
      };
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
