import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user on startup
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('medfinder_token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          setPharmacy(data.pharmacy);
        } catch (error) {
          console.error('Session restoration failed:', error);
          localStorage.removeItem('medfinder_token');
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('medfinder_token', data.token);
      setUser(data.user);
      setPharmacy(data.pharmacy);
      
      toast.success(`Welcome back, ${data.user.name}!`);

      // Redirect depending on user role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'owner') {
        if (data.pharmacy) {
          navigate('/owner');
        } else {
          navigate('/owner/register-pharmacy'); // Need to register pharmacy first
        }
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { name, email, password, role });
      
      localStorage.setItem('medfinder_token', data.token);
      setUser(data.user);
      setPharmacy(null);

      toast.success('Registration successful!');

      if (role === 'owner') {
        navigate('/owner/register-pharmacy');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medfinder_token');
    setUser(null);
    setPharmacy(null);
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const updatePharmacyState = (pharmacyDetails) => {
    setPharmacy(pharmacyDetails);
  };

  const value = {
    user,
    pharmacy,
    loading,
    login,
    register,
    logout,
    updatePharmacyState
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
