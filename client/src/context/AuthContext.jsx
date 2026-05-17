import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tilematch_token');
    const savedUser = localStorage.getItem('tilematch_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('tilematch_token', data.token);
    localStorage.setItem('tilematch_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('tilematch_token', data.token);
    localStorage.setItem('tilematch_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tilematch_token');
    localStorage.removeItem('tilematch_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
