import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/axios';
import { initSocket, disconnectSocket, getSocket } from '../lib/socket';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const isAuthenticated = !!user;

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } catch {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Not authenticated');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe().catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    if (user && localStorage.getItem('accessToken')) {
      const s = initSocket(localStorage.getItem('accessToken'));
      const handleOnline = (ids) => {
        // Ensure current user is counted as online if socket is connected
        setOnlineUsers(ids || []);
      };
      const handlePresenceUpdate = ({ userId, status }) => {
        setOnlineUsers(prev => {
          if (status === 'online' && !prev.includes(userId)) return [...prev, userId];
          if (status === 'offline') return prev.filter(id => id !== userId);
          return prev;
        });
      };
      const handleUserOnline = ({ id }) => {
        setOnlineUsers(prev => prev.includes(id) ? prev : [...prev, id]);
      };
      const handleUserOffline = ({ id }) => {
        setOnlineUsers(prev => prev.filter(uid => uid !== id));
      };

      s.on('onlineUsers', handleOnline);
      s.on('presence:update', handlePresenceUpdate);
      s.on('user:online', handleUserOnline);
      s.on('user:offline', handleUserOffline);
      s.on('user:login', handleUserOnline);

      // Request immediately after connect
      if (s.connected) s.emit('presence:get');
      else s.once('connect', () => s.emit('presence:get'));

      return () => {
        s.off('onlineUsers', handleOnline);
        s.off('presence:update', handlePresenceUpdate);
        s.off('user:online', handleUserOnline);
        s.off('user:offline', handleUserOffline);
        s.off('user:login', handleUserOnline);
      };
    }
  }, [user]);

  const login = async ({ phone, password }) => {
    const { data } = await api.post('/auth/login', { phone, password });
    const { user: u, accessToken, refreshToken } = data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    const s = initSocket(accessToken);
    // Instant presence request
    setTimeout(()=> s.emit('presence:get'), 100);
    toast.success(t('toast.loginSuccess') || 'Kirish muvaffaqiyatli');
    return u;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    disconnectSocket();
    setUser(null);
    setOnlineUsers([]);
    toast.success(t('toast.logoutSuccess') || 'Chiqdingiz');
  };

  const value = { user, isAuthenticated, loading, login, logout, fetchMe, onlineUsers, socket: getSocket() };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
