'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (authToken) => {
    const t = authToken || token;
    if (!t) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me', { token: t });
      if (res && res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      // Remove invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smart_rent_token');
        localStorage.removeItem('smart_rent_user');
      }
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('smart_rent_token');
      const savedUser = localStorage.getItem('smart_rent_user');
      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {}
        }
        refreshUser(savedToken);
      } else {
        setIsLoading(false);
      }
    }
  }, [refreshUser]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_rent_token', userToken);
          localStorage.setItem('smart_rent_user', JSON.stringify(userData));
        }
        return { success: true, user: userData };
      }
      throw new Error(res.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_rent_token', userToken);
          localStorage.setItem('smart_rent_user', JSON.stringify(userData));
        }
        return { success: true, user: userData };
      }
      throw new Error(res.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smart_rent_token');
      localStorage.removeItem('smart_rent_user');
      window.location.href = '/login';
    }
  };

  const isNidVerified = user?.nid_status === 'verified';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isNidVerified,
      }}
    >
      {children}
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
