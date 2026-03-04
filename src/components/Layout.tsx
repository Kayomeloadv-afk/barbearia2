import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Scissors, DollarSign,
  Package, Settings, Menu, X, LogOut,
  UserCircle, TrendingUp, Award, BarChart3, Shield
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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[260px] bg-slate-900 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-[72px] px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-xl flex items-center justify-center shadow-lg shadow-[#c8a45a]/20">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">BarberPro</h1>
              <p className="text-[11px] text-slate-400 font-medium">Gestão Inteligente</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu Principal</p>
          {allNav.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#c8a45a] text-white shadow-md shadow-[#c8a45a]/25'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-white')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04]">
            <div className="w-9 h-9 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Usuário'}</p>
              <p className="text-[11px] text-slate-400 capitalize">{user?.role || 'operador'}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-slate-900">
                {allNav.find(n => n.href === location.pathname || (n.href !== '/' && location.pathname.startsWith(n.href)))?.name || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Usuário'}</p>
                <p className="text-[11px] text-slate-500 capitalize">{user?.role || 'operador'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
