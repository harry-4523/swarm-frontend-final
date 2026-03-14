import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('swarm_token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('swarm_token', token);
      api.setToken(token);
      checkUser();
    } else {
      localStorage.removeItem('swarm_token');
      api.setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const checkUser = async () => {
    try {
      const userData = await api.getMe();
      if (userData) {
        setUser(userData);
      } else {
        setToken(null);
      }
    } catch (err) {
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const data = await api.login({ username, password });
      setToken(data.access_token);
      toast.success('Logged in successfully');
      navigate('/');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await api.register(userData);
      toast.success('Registration successful. Please log in.');
      navigate('/login');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading ? children : <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>}
    </AuthContext.Provider>
  );
};
