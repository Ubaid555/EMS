import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '@/services/auth.service';
import { parseApiError } from '@/utils/api-error';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing session on application start via /auth/me
  const checkAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getCurrentEmployee();
      setUser(data);
    } catch (err) {
      // 401 simply means no active session cookie is present
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for silent token refresh failures from api.client.js
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [checkAuth]);

  /**
   * Log in employee
   */
  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authService.login(credentials);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      return { success: false, error: parsed };
    }
  };

  /**
   * Register new employee
   */
  const register = async (credentials) => {
    setError(null);
    try {
      const data = await authService.register(credentials);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      return { success: false, error: parsed };
    }
  };

  /**
   * Log out employee
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Continue client cleanup even if network fails
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    checkAuth,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
