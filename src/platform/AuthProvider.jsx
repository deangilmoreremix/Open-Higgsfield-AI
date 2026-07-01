"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { apiKeyManager } from '../../lib/apiKeyManager.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkStoredKey() {
      const storedKey = await apiKeyManager.getKey('muapi');
      if (!cancelled && storedKey) {
        setUser({ apiKey: storedKey });
      }
      if (!cancelled) {
        setIsLoading(false);
      }
    }
    checkStoredKey();
    return () => { cancelled = true; };
  }, []);

  const login = async (apiKey) => {
    await apiKeyManager.setKey(apiKey, 'muapi');
    setUser({ apiKey });
  };

  const logout = async () => {
    await apiKeyManager.clearKey('muapi');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user?.apiKey,
    login,
    logout,
    apiKey: user?.apiKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthProvider;