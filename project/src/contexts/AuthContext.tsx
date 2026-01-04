import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { localDb } from '../lib/db';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createWorker: (email: string, password: string, name: string) => Promise<void>;
  isAdmin: boolean;
  isWorker: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_STORAGE_KEY = 'prophoneplus_auth';

const BUILT_IN_ACCOUNTS = [
  {
    id: 'admin-001',
    email: 'admin@prophoneplus.com',
    password: 'Admin2026!',
    role: 'admin' as const,
    name: 'Administrator',
  },
  {
    id: 'worker-001',
    email: 'worker@prophoneplus.com',
    password: 'Worker2026!',
    role: 'worker' as const,
    name: 'Worker',
  },
];

async function initializeBuiltInAccounts() {
  for (const account of BUILT_IN_ACCOUNTS) {
    const existing = await localDb.users.get(account.id);
    if (!existing) {
      await localDb.users.put({
        id: account.id,
        email: account.email,
        role: account.role,
        name: account.name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeBuiltInAccounts().then(() => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const userData = JSON.parse(stored) as User;
          setUser(userData);
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const normalizedEmail = email.toLowerCase().trim();

    const account = BUILT_IN_ACCOUNTS.find(
      (acc) => acc.email === normalizedEmail && acc.password === password
    );

    if (!account) {
      const allUsers = await localDb.users.toArray();
      const customUser = allUsers.find((u) => u.email === normalizedEmail);

      if (customUser) {
        const storedPassword = localStorage.getItem(`pwd_${customUser.id}`);
        if (storedPassword === password) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
          setUser(customUser);
          return;
        }
      }

      throw new Error('Invalid email or password');
    }

    const userData: User = {
      id: account.id,
      email: account.email,
      role: account.role,
      name: account.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async (): Promise<void> => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const createWorker = async (
    email: string,
    password: string,
    name: string
  ): Promise<void> => {
    const normalizedEmail = email.toLowerCase().trim();

    const allUsers = await localDb.users.toArray();
    const existing = allUsers.find((u) => u.email === normalizedEmail);

    if (existing) {
      throw new Error('User with this email already exists');
    }

    const newWorker: User = {
      id: `worker-${Date.now()}`,
      email: normalizedEmail,
      role: 'worker',
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await localDb.users.put(newWorker);
    localStorage.setItem(`pwd_${newWorker.id}`, password);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    createWorker,
    isAdmin: user?.role === 'admin',
    isWorker: user?.role === 'worker',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
