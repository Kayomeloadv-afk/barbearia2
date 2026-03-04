import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Agenda from '@/pages/Agenda';
import Equipe from '@/pages/Equipe';
import Servicos from '@/pages/Servicos';
import Clientes from '@/pages/Clientes';
import Financeiro from '@/pages/Financeiro';
import Comissoes from '@/pages/Comissoes';
import Estoque from '@/pages/Estoque';
import Fidelidade from '@/pages/Fidelidade';
import Relatorios from '@/pages/Relatorios';
import Configuracoes from '@/pages/Configuracoes';
import Usuarios from '@/pages/Usuarios';
import AgendamentoOnline from '@/pages/AgendamentoOnline';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 3000,
    },
  },
});

function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#c8a45a]/30 border-t-[#c8a45a] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#c8a45a]/30 border-t-[#c8a45a] rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Página pública de agendamento online para clientes */}
            <Route path="/agendar" element={<AgendamentoOnline />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/equipe" element={<Equipe />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/comissoes" element={<Comissoes />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/fidelidade" element={<Fidelidade />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/usuarios" element={<AdminRoute><Usuarios /></AdminRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
