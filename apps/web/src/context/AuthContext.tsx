import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';

export interface UserProfile {
  id: string;
  orgId: string;
  orgName: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('wac_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wac_access_token');
    if (token) {
      apiFetch<UserProfile>('/auth/me')
        .then((profile) => {
          setUser(profile);
          localStorage.setItem('wac_user', JSON.stringify(profile));
        })
        .catch(() => {
          localStorage.removeItem('wac_access_token');
          localStorage.removeItem('wac_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{
      accessToken: string;
      refreshToken: string;
      user: UserProfile;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('wac_access_token', data.accessToken);
    localStorage.setItem('wac_refresh_token', data.refreshToken);
    localStorage.setItem('wac_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('wac_access_token');
    localStorage.removeItem('wac_refresh_token');
    localStorage.removeItem('wac_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
