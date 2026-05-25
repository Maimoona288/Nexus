import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define explicit types matching your Node engine parameters
interface User {
  id: string;
  name: string;
  email: string;
  role: 'entrepreneur' | 'investor';
  bio?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  investorDetails?: any;
  entrepreneurDetails?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (data: any) => Promise<void>;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  clearError: () => void;
}

// 1. Export the raw context explicitly so it can be picked up safely by hooks elsewhere
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure default base parameters for your backend port
const API = axios.create({
  baseURL: 'http://localhost:5000/api/auth'
});

// Automatically inject JWT validation token into every outgoing request header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

// 2. Main component export for the Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and validate identity state on load/refresh
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/profile');
        setUser(res.data);
      } catch (err: any) {
        console.error("📋 Session restoration profile fetch failed:", err.response?.data || err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, [token]);

  // Unified Registration Handler
  const register = async (formData: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log("📤 Dispatching Registration Payload:", formData);
      const res = await API.post('/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('nexus_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration pipeline error.';
      setError(errMsg);
      console.error("❌ Registration Exception:", errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unified Login Handler
  const login = async (credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log("📤 Dispatching Login Payload Keys:", { email: credentials.email, password: '***' });
      
      const res = await API.post('/login', {
        email: credentials.email,
        password: credentials.password
      });

      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('nexus_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      console.log("✅ Authenticated securely! Token initialized.");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid credentials or connection failure.';
      setError(errMsg);
      console.error("❌ Authentication Exception Context:", errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Secure Identity Profile Editor Path
  const updateProfile = async (profileData: any) => {
    setError(null);
    try {
      console.log("📤 Sending profile update payload structural fields:", profileData);
      const res = await API.put('/profile', profileData);
      
      setUser(res.data.user);
      console.log("✅ Profile changes committed smoothly inside Nexus Engine.");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Required improvements processing error during update.';
      setError(errMsg);
      console.error("❌ Profile Update Exception:", errMsg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, register, login, logout, updateProfile, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Keep the custom hook matching exactly but using the explicitly matching context object
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook must be evaluated within a valid structural AuthProvider enclosure.');
  }
  return context;
};