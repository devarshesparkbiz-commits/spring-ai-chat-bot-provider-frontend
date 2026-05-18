import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Role } from '../types/user';

interface AuthState {
  token: string | null;
  userRole: Role | null;
  userName: string | null;
  companyId: number | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, role: Role, name: string, companyId: number | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStorage(): AuthState {
  const raw = localStorage.getItem('companyId');
  return {
    token: localStorage.getItem('token'),
    userRole: (localStorage.getItem('userRole') as Role) || null,
    userName: localStorage.getItem('userName'),
    companyId: raw != null ? Number(raw) : null,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(readStorage);

  const login = useCallback((token: string, role: Role, name: string, companyId: number | null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    if (companyId != null) localStorage.setItem('companyId', String(companyId));
    else localStorage.removeItem('companyId');
    setState({ token, userRole: role, userName: name, companyId });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('companyId');
    setState({ token: null, userRole: null, userName: null, companyId: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, isAuthenticated: !!state.token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
