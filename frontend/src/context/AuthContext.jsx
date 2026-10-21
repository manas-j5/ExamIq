import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app boot
    const storedToken = localStorage.getItem('exam_token');
    const storedUser = localStorage.getItem('exam_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('exam_token');
        localStorage.removeItem('exam_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { token, id, name, email: userEmail, role } = response.data;
    const userData = { id, name, email: userEmail, role };

    localStorage.setItem('exam_token', token);
    localStorage.setItem('exam_user', JSON.stringify(userData));

    setToken(token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role = 'STUDENT') => {
    const response = await authService.register({
      name,
      email,
      password,
      confirmPassword: password,
      role,
    });
    const { token, id, name: userName, email: userEmail, role: userRole } = response.data;
    const userData = { id, name: userName, email: userEmail, role: userRole };

    localStorage.setItem('exam_token', token);
    localStorage.setItem('exam_user', JSON.stringify(userData));

    setToken(token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('exam_token');
    localStorage.removeItem('exam_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
