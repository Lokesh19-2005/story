// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('story_token');
    if (token) {
      authAPI.me()
        .then(d => setUser(d.user))
        .catch(() => localStorage.removeItem('story_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const d = await authAPI.login({ email, password });
    localStorage.setItem('story_token', d.token);
    setUser(d.user);
    return d.user;
  };

  const register = async (name, email, password, phone) => {
    const d = await authAPI.register({ name, email, password, phone });
    localStorage.setItem('story_token', d.token);
    setUser(d.user);
    return d.user;
  };

  const logout = () => {
    localStorage.removeItem('story_token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const d = await authAPI.updateMe(data);
    setUser(d.user);
    return d.user;
  };

  const changePassword = async (data) => {
    await authAPI.changePassword(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
