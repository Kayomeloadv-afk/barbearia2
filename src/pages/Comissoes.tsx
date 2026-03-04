import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { commissionsApi, barbersApi } from '@/lib/api';
import { formatCurrency, getInitials } from '@/lib/utils';

export default function Comissoes() {
  const { data: commissions = [] } = useQuery({ queryKey: ['commissions'], queryFn: () => commissionsApi.list(), refetchInterval: 5000 });
  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: () => barbersApi.list() });

  const getBarberName = (id: number) => barbers.find((b: any) => b.id === id)?.name || '—';
  const getBarberRate = (id: number) => barbers.find((b: any) => b.id === id)?.commissionRate || '50';

  // Group commissions by barber
  const byBarber: Record<number, any[]> = {};
  commissions.forEach((c: any) => {
    if (!byBarber[c.barberId]) byBarber[c.barberId] = [];
    byBarber[c.barberId].push(c);
  });

  const barberSummaries = barbers.filter((b: any) => b.isActive).map((b: any) => {
    const bCommissions = byBarber[b.id] || [];
    const totalEarned = bCommissions.reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0);
    const totalPaid = bCommissions.filter((c: any) => c.status === 'paid').reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0);
    const pending = totalEarned - totalPaid;
    return { ...b, totalEarned, totalPaid, pending, count: bCommissions.length };
  });

  const totalPending = barberSummaries.reduce((s, b) => s + b.pending, 0);
  const totalPaid = barberSummaries.reduce((s, b) => s + b.totalPaid, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Comissões</h1>
        <p className="text-sm text-slate-500 mt-1">Controle de comissões da equipe</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card><CardContent className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#c8a45a] rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
          <div><p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPending)}</p><p className="text-xs text-slate-500">Pendente</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
          <div><p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</p><p className="text-xs text-slate-500">Pago</p></div>
        </CardContent></Card>
      </div>

      {barberSummaries.length === 0 ? (
        <EmptyState icon={<Users className="w-8 h-8" />} title="Nenhum barbeiro" description="Cadastre barbeiros para ver comissões" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barberSummaries.map((b) => (
            <Card key={b.id}>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(b.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{b.name}</h3>
                    <p className="text-sm text-slate-500">Taxa: {b.commissionRate}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(b.totalEarned)}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-green-700">{formatCurrency(b.totalPaid)}</p>
                    <p className="text-xs text-slate-500">Pago</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-yellow-700">{formatCurrency(b.pending)}</p>
                    <p className="text-xs text-slate-500">Pendente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
