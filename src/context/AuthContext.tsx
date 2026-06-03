import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, getStoredToken, setStoredToken } from '../api/client';
import { setUnauthorizedHandler } from '../session';
import type { User } from '../types';

const USER_KEY = 'user';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  bootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const logout = useCallback(async () => {
    await setStoredToken(null);
    await AsyncStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          getStoredToken(),
          AsyncStorage.getItem(USER_KEY),
        ]);
        setToken(t);
        if (u) setUser(JSON.parse(u) as User);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const persistUser = useCallback(async (u: User | null) => {
    if (u) await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(USER_KEY);
    setUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    const { token: newToken, user: u } = res.data as {
      token: string;
      user: User;
    };
    
    if (u.role === 'admin' || u.role === 'superadmin' || u.role === 'doctor') {
      throw new Error('Staff login is not supported in the Patient App. Please use the Web Portal.');
    }

    await setStoredToken(newToken);
    await persistUser(u);
    setToken(newToken);
  }, [persistUser]);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      await apiRegister(data);
    },
    []
  );

  const value = useMemo(
    () => ({
      token,
      user,
      bootstrapping,
      login,
      register,
      logout,
    }),
    [token, user, bootstrapping, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
