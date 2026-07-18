import React, { createContext, useContext, useMemo, useState } from 'react';

export type ACOSRole = 'admin' | 'sales' | 'production' | 'finance' | 'marketing' | 'hr';

export type ACOSUser = {
  id: string;
  name: string;
  email: string;
  role: ACOSRole;
  phone?: string;
  enabled: boolean;
  lastLoginAt?: string;
};

type SignInResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  user: ACOSUser | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => SignInResult;
  signOut: () => void;
};

const SESSION_KEY = 'altercraft-acos-session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readSession = (): ACOSUser | null => {
  if (typeof window === 'undefined') return null;
  window.localStorage.removeItem(SESSION_KEY);
  return null;
};

const clearSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ACOSUser | null>(() => readSession());

  const value = useMemo<AuthContextValue>(() => {
    const signIn = (_email: string, _password: string): SignInResult => {
      clearSession();
      setUser(null);
      return {
        ok: false,
        message: 'Secure admin authentication is not connected yet.',
      };
    };

    const signOut = () => {
      clearSession();
      setUser(null);
    };

    return {
      user,
      isAdmin: false,
      signIn,
      signOut,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
