import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ski_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem('ski_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    let data;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      data = await res.json();
    } catch {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      data = await res.json();
    }
    if (!data || !data.success) throw new Error(data?.error || 'Login failed.');
    localStorage.setItem('ski_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    if (user?.id) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      } catch {
        try {
          await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });
        } catch {}
      }
    }
    localStorage.removeItem('ski_user');
    setUser(null);
  };

  const submitRegistrationRequest = async (formData) => {
    let data;
    try {
      const res = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      data = await res.json();
    } catch {
      const res = await fetch('http://localhost:5000/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      data = await res.json();
    }
    if (!data || !data.success) throw new Error(data?.error || 'Failed to submit request.');
    return data;
  };

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isAdmin, isCustomer, isLoading,
      login, logout, submitRegistrationRequest
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
