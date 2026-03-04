import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Scissors, DollarSign,
  Package, Settings, Menu, X, LogOut, ChevronRight,
  UserCircle, TrendingUp, Award, BarChart3, Shield, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Equipe', href: '/equipe', icon: Users },
  { name: 'Serviços', href: '/servicos', icon: Scissors },
  { name: 'Clientes', href: '/clientes', icon: UserCircle },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Comissões', href: '/comissoes', icon: TrendingUp },
  { name: 'Estoque', href: '/estoque', icon: Package },
  { name: 'Fidelidade', href: '/fidelidade', icon: Award },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

const adminNavigation = [
  { name: 'Usuários', href: '/usuarios', icon: Shield },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const allNav = user?.role === 'admin' ? [...navigation, ...adminNavigation] : navigation;

  const currentPage = allNav.find(n => n.href === location.pathname || (n.href !== '/' && location.pathname.startsWith(n.href)));

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto flex flex-col shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#c8a45a]/25">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">BarberPro</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Gestão Inteligente</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">Menu Principal</p>
          {allNav.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-[#c8a45a] to-[#b8943a] text-white shadow-lg shadow-[#c8a45a]/30'
                    : 'text-slate-400 hover:bg-white/[0.07] hover:text-white'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Agendamento Online Link */}
        <div className="px-4 pb-3">
          <Link
            to="/agendar"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#c8a45a]/10 border border-[#c8a45a]/20 text-[#c8a45a] hover:bg-[#c8a45a]/20 transition-all text-sm font-medium"
          >
            <Globe className="w-5 h-5" />
            <span>Link de Agendamento</span>
          </Link>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/[0.05]">
            <div className="w-11 h-11 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role || 'operador'}</p>
            </div>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Sair do sistema"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[80px] bg-white/90 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {currentPage?.name || 'Dashboard'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'operador'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
