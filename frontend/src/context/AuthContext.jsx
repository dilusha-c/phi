import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res && res.success) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to restore user session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authService.login(username, password);
      if (res && res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid server response structure' };
    } catch (err) {
      return { success: false, message: err.message || 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    try {
      const res = await authService.register(payload);
      if (res && res.success) {
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
