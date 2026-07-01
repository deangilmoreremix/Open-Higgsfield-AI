"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('muapi_key') : null;
    if (storedKey) {
      setUser({ apiKey: storedKey });
    }
    setIsLoading(false);
  }, []);

  const login = (apiKey) => {
    localStorage.setItem('muapi_key', apiKey);
    setUser({ apiKey });
  };

  const logout = () => {
    localStorage.removeItem('muapi_key');
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