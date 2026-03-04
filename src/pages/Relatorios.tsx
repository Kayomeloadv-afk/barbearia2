import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Users, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { appointmentsApi, financialApi, barbersApi, clientsApi, commissionsApi } from '@/lib/api';
import { formatCurrency, todayISO } from '@/lib/utils';

export default function Relatorios() {
  const today = todayISO();
  const currentMonth = today.substring(0, 7);

  const { data: appointments = [] } = useQuery({ queryKey: ['appointments-all'], queryFn: () => appointmentsApi.list(), refetchInterval: 10000 });
  const { data: financial = [] } = useQuery({ queryKey: ['financial'], queryFn: () => financialApi.list(), refetchInterval: 10000 });
  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: () => barbersApi.list() });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.list() });
  const { data: commissions = [] } = useQuery({ queryKey: ['commissions'], queryFn: () => commissionsApi.list() });

  const monthAppointments = appointments.filter((a: any) => a.date?.startsWith(currentMonth));
  const monthIncome = financial.filter((f: any) => f.type === 'income' && f.date?.startsWith(currentMonth)).reduce((s: number, f: any) => s + parseFloat(f.amount || '0'), 0);
  const monthExpenses = financial.filter((f: any) => f.type === 'expense' && f.date?.startsWith(currentMonth)).reduce((s: number, f: any) => s + parseFloat(f.amount || '0'), 0);
  const monthCommissions = commissions.filter((c: any) => c.period?.startsWith(currentMonth)).reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0);

  const completedAppointments = monthAppointments.filter((a: any) => a.status === 'completed').length;
  const cancelledAppointments = monthAppointments.filter((a: any) => a.status === 'cancelled').length;

  // Barber performance
  const barberPerformance = barbers.filter((b: any) => b.isActive).map((b: any) => {
    const bAppointments = monthAppointments.filter((a: any) => a.barberId === b.id);
    const bCompleted = bAppointments.filter((a: any) => a.status === 'completed').length;
    const bRevenue = bAppointments.filter((a: any) => a.status === 'completed').reduce((s: number, a: any) => s + parseFloat(a.totalPrice || '0'), 0);
    return { name: b.name, appointments: bAppointments.length, completed: bCompleted, revenue: bRevenue };
  }).sort((a, b) => b.revenue - a.revenue);

  function exportPDF() {
    const content = `
RELATÓRIO MENSAL - ${currentMonth}
================================

RESUMO FINANCEIRO
- Receitas: ${formatCurrency(monthIncome)}
- Despesas: ${formatCurrency(monthExpenses)}
- Lucro Líquido: ${formatCurrency(monthIncome - monthExpenses)}
- Comissões: ${formatCurrency(monthCommissions)}

AGENDAMENTOS
- Total: ${monthAppointments.length}
- Concluídos: ${completedAppointments}
- Cancelados: ${cancelledAppointments}

DESEMPENHO POR BARBEIRO
${barberPerformance.map(b => `- ${b.name}: ${b.completed} atendimentos, ${formatCurrency(b.revenue)}`).join('\n')}

CLIENTES
- Total cadastrados: ${clients.length}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${currentMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-sm text-slate-500 mt-1">Análise de desempenho mensal</p>
        </div>
        <Button variant="accent" onClick={exportPDF}>
          <Download className="w-4 h-4" /> Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="text-center">
          <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(monthIncome)}</p>
          <p className="text-xs text-slate-500">Receita Mensal</p>
        </CardContent></Card>
        <Card><CardContent className="text-center">
          <DollarSign className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(monthExpenses)}</p>
          <p className="text-xs text-slate-500">Despesas</p>
        </CardContent></Card>
        <Card><CardContent className="text-center">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{monthAppointments.length}</p>
          <p className="text-xs text-slate-500">Agendamentos</p>
        </CardContent></Card>
        <Card><CardContent className="text-center">
          <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
          <p className="text-xs text-slate-500">Clientes</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><h2 className="text-lg font-semibold text-slate-900">Desempenho por Barbeiro</h2></CardHeader>
        <CardContent className="p-0">
          {barberPerformance.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">Nenhum barbeiro ativo</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Barbeiro</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase">Agendamentos</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase">Concluídos</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Faturamento</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {barberPerformance.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">{b.name?.[0]}</div>
                          <span className="text-sm font-medium text-slate-900">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600 text-center">{b.appointments}</td>
                      <td className="px-5 py-3 text-sm text-slate-600 text-center">{b.completed}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">{formatCurrency(b.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-slate-900">Taxa de Conclusão</h2></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Concluídos</span>
                  <span className="font-medium">{completedAppointments} ({monthAppointments.length > 0 ? Math.round((completedAppointments / monthAppointments.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${monthAppointments.length > 0 ? (completedAppointments / monthAppointments.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Cancelados</span>
                  <span className="font-medium">{cancelledAppointments} ({monthAppointments.length > 0 ? Math.round((cancelledAppointments / monthAppointments.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${monthAppointments.length > 0 ? (cancelledAppointments / monthAppointments.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-slate-900">Resumo de Comissões</h2></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-[#c8a45a]/10 rounded-xl">
              <div>
                <p className="text-sm text-[#b8903e] font-medium">Total de Comissões</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(monthCommissions)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#c8a45a]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
