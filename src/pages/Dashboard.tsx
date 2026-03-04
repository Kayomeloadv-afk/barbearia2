import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, Scissors } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-base text-slate-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Agendamentos Hoje"
          value={appointments.length}
          icon={<Calendar className="w-7 h-7 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
          subtitle={`${todayScheduled} pendentes`}
        />
        <StatCard
          label="Faturamento Hoje"
          value={formatCurrency(todayIncome)}
          icon={<DollarSign className="w-7 h-7 text-white" />}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
          subtitle={`${todayCompleted} serviços concluídos`}
        />
        <StatCard
          label="Clientes Cadastrados"
          value={clients.length}
          icon={<Users className="w-7 h-7 text-white" />}
          color="bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/30"
        />
        <StatCard
          label="Faturamento Mensal"
          value={formatCurrency(monthIncome)}
          icon={<TrendingUp className="w-7 h-7 text-white" />}
          color="bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] shadow-lg shadow-[#c8a45a]/30"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Appointments - 2 columns */}
        <Card className="xl:col-span-2">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Agenda de Hoje</h2>
            </div>
            <div className="flex gap-3">
              <Badge variant="info" dot size="md">{todayScheduled} pendentes</Badge>
              <Badge variant="success" dot size="md">{todayCompleted} concluídos</Badge>
            </div>
          </div>
          <CardContent className="p-0">
            {appointments.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-base font-medium text-slate-500">Nenhum agendamento para hoje</p>
                <p className="text-sm text-slate-400 mt-1">Os agendamentos aparecerão aqui</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {appointments.slice(0, 8).map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-slate-700">{formatTime(apt.time)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Agendamento #{apt.id}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{formatCurrency(apt.totalPrice || '0')}</p>
                      </div>
                    </div>
                    <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'error' : 'info'} dot size="md">
                      {getStatusLabel(apt.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <div className="px-7 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Resumo do Mês</h2>
              </div>
            </div>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">Receitas</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(monthIncome)}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100">
                <div>
                  <p className="text-sm text-red-600 font-semibold">Despesas</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(monthExpenses)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-slate-900 rounded-2xl">
                <div>
                  <p className="text-sm text-slate-300 font-semibold">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-white mt-1">{formatCurrency(monthIncome - monthExpenses)}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#c8a45a]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barbers */}
          <Card>
            <div className="px-7 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Equipe Ativa</h2>
              </div>
            </div>
            <CardContent>
              {barbers.filter((b: any) => b.isActive).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Nenhum barbeiro cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {barbers.filter((b: any) => b.isActive).map((b: any) => (
                    <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {getInitials(b.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{b.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Comissão: {b.commissionRate || 0}%</p>
                      </div>
                      <Badge variant="success" size="sm">Ativo</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
