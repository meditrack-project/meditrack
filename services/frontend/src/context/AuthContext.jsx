import { createContext, useState, useEffect, useCallback } from 'react';
import { userApi } from '../lib/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('meditrack_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('meditrack_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await userApi.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
          setToken(savedToken);
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem('meditrack_token');
        localStorage.removeItem('meditrack_user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await userApi.post('/api/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      localStorage.setItem('meditrack_token', newToken);
      localStorage.setItem('meditrack_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    }
    throw new Error('Login failed');
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await userApi.post('/api/auth/register', { name, email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      localStorage.setItem('meditrack_token', newToken);
      localStorage.setItem('meditrack_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    }
    throw new Error('Registration failed');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('meditrack_token');
    localStorage.removeItem('meditrack_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('meditrack_user', JSON.stringify(userData));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
