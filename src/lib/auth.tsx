import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { appUsersApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  role: string;
  pin: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('barberpro_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('barberpro_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await appUsersApi.list();
      const found = users.find((u: any) => u.pin === pin && u.isActive);
      if (found) {
        const userData: User = { id: found.id, name: found.name, role: found.role, pin: found.pin };
        setUser(userData);
        localStorage.setItem('barberpro_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: 'PIN inválido ou usuário inativo' };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('barberpro_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
