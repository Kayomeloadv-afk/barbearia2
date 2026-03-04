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

// Default admin user (fallback if API is unavailable)
const DEFAULT_ADMIN: User = {
  id: 0,
  name: 'Administrador',
  role: 'admin',
  pin: '1234',
};

// Map backend role names to frontend role names
function mapRole(backendRole: string): string {
  switch (backendRole) {
    case 'manager': return 'admin';
    case 'assistant': return 'operador';
    case 'barber': return 'barbeiro';
    default: return backendRole;
  }
}

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
      // Try to fetch users from the API
      const users = await appUsersApi.list();
      
      // Find user with matching PIN that is active
      const found = users.find((u: any) => {
        const userPin = String(u.pin);
        const isActive = u.isActive === true || u.isActive === 1 || u.is_active === true || u.is_active === 1;
        return userPin === pin && isActive;
      });

      if (found) {
        const userData: User = {
          id: found.id,
          name: found.name,
          role: mapRole(found.role || found.appRole || 'manager'),
          pin: String(found.pin),
        };
        setUser(userData);
        localStorage.setItem('barberpro_user', JSON.stringify(userData));
        return { success: true };
      }

      // If no users exist in the database and PIN matches default admin
      if (users.length === 0 && pin === DEFAULT_ADMIN.pin) {
        setUser(DEFAULT_ADMIN);
        localStorage.setItem('barberpro_user', JSON.stringify(DEFAULT_ADMIN));
        return { success: true };
      }

      return { success: false, error: 'PIN inválido ou usuário inativo' };
    } catch (err) {
      console.error('Login API error:', err);
      
      // Fallback: if API is unavailable, allow default admin login
      if (pin === DEFAULT_ADMIN.pin) {
        setUser(DEFAULT_ADMIN);
        localStorage.setItem('barberpro_user', JSON.stringify(DEFAULT_ADMIN));
        return { success: true };
      }
      
      return { success: false, error: 'Erro de conexão com o servidor. Tente novamente.' };
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
