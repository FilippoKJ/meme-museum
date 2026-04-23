/**
 * context/AuthContext.jsx
 * Stato globale autenticazione: user, token, login, logout.
 * Disponibile in tutta l'app via useAuth().
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true finché non verifichiamo il token salvato
  const [error, setError]     = useState(null);

  /* ── Al mount: verifica token salvato ── */
  useEffect(() => {
    const token = localStorage.getItem('mm_token');
    if (!token) { setLoading(false); return; }

    getMe()
      .then(u => setUser(u))
      .catch(() => {
        localStorage.removeItem('mm_token');
        localStorage.removeItem('mm_user');
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Logout automatico su 401 ── */
  useEffect(() => {
    const handler = () => { setUser(null); };
    window.addEventListener('mm:logout', handler);
    return () => window.removeEventListener('mm:logout', handler);
  }, []);

  /* ── Login ── */
  const login = useCallback(async (username, password) => {
    setError(null);
    const { token, user: u } = await apiLogin(username, password);
    localStorage.setItem('mm_token', token);
    localStorage.setItem('mm_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  /* ── Registrazione ── */
  const register = useCallback(async (username, password) => {
    setError(null);
    const { token, user: u } = await apiRegister(username, password);
    localStorage.setItem('mm_token', token);
    localStorage.setItem('mm_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  /* ── Logout ── */
  const logout = useCallback(() => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return ctx;
};
