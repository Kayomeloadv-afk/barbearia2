import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { appointmentsApi, financialApi, barbersApi, clientsApi } from '@/lib/api';
import { formatCurrency, formatTime, getStatusLabel, todayISO, getInitials } from '@/lib/utils';

export default function Dashboard() {
  const today = todayISO();
  const { data: appointments = [] } = useQuery({ queryKey: ['appointments', today], queryFn: () => appointmentsApi.list({ date: today }), refetchInterval: 5000 });
  const { data: financial = [] } = useQuery({ queryKey: ['financial'], queryFn: () => financialApi.list(), refetchInterval: 5000 });
  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: () => barbersApi.list(), refetchInterval: 10000 });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.list(), refetchInterval: 10000 });

  const todayIncome = financial.filter((f: any) => f.date === today && f.type === 'income').reduce((sum: number, f: any) => sum + parseFloat(f.amount || '0'), 0);
  const monthIncome = financial.filter((f: any) => f.type === 'income' && f.date?.startsWith(today.substring(0, 7))).reduce((sum: number, f: any) => sum + parseFloat(f.amount || '0'), 0);
  const monthExpenses = financial.filter((f: any) => f.type === 'expense' && f.date?.startsWith(today.substring(0, 7))).reduce((sum: number, f: any) => sum + parseFloat(f.amount || '0'), 0);
  const todayCompleted = appointments.filter((a: any) => a.status === 'completed').length;
  const todayScheduled = appointments.filter((a: any) => a.status === 'scheduled' || a.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Agendamentos Hoje"
          value={appointments.length}
          icon={<Calendar className="w-5 h-5 text-white" />}
          color="bg-slate-900"
        />
        <StatCard
          label="Faturamento Hoje"
          value={formatCurrency(todayIncome)}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          color="bg-emerald-600"
        />
        <StatCard
          label="Clientes Cadastrados"
          value={clients.length}
          icon={<Users className="w-5 h-5 text-white" />}
          color="bg-blue-600"
        />
        <StatCard
          label="Faturamento Mensal"
          value={formatCurrency(monthIncome)}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="bg-gradient-to-br from-[#c8a45a] to-[#a88a3e]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Agenda de Hoje</h2>
            <div className="flex gap-2">
              <Badge variant="info" dot>{todayScheduled} pendentes</Badge>
              <Badge variant="success" dot>{todayCompleted} concluídos</Badge>
            </div>
          </div>
          <CardContent className="p-0">
            {appointments.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                <p className="text-sm text-slate-400">Nenhum agendamento para hoje</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {appointments.slice(0, 8).map((apt: any) => (
                  <div key={apt.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-slate-900/5 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-700">{formatTime(apt.time)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Agendamento #{apt.id}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(apt.totalPrice || '0')}</p>
                      </div>
                    </div>
                    <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'error' : 'info'} dot>
                      {getStatusLabel(apt.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Resumo Financeiro do Mês</h2>
          </div>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Receitas</p>
                <p className="text-2xl font-bold text-emerald-700 mt-0.5">{formatCurrency(monthIncome)}</p>
              </div>
              <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
              <div>
                <p className="text-sm text-red-600 font-medium">Despesas</p>
                <p className="text-2xl font-bold text-red-700 mt-0.5">{formatCurrency(monthExpenses)}</p>
              </div>
              <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
              <div>
                <p className="text-sm text-slate-300 font-medium">Lucro Líquido</p>
                <p className="text-2xl font-bold text-white mt-0.5">{formatCurrency(monthIncome - monthExpenses)}</p>
              </div>
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#c8a45a]" />
              </div>
            </div>

            {/* Barbers summary */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Equipe Ativa</h3>
              <div className="flex flex-wrap gap-2">
                {barbers.filter((b: any) => b.isActive).map((b: any) => (
                  <div key={b.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                      {getInitials(b.name)}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{b.name}</span>
                  </div>
                ))}
                {barbers.filter((b: any) => b.isActive).length === 0 && (
                  <p className="text-sm text-slate-400">Nenhum barbeiro cadastrado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
