import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronLeft, ChevronRight, Clock, Trash2, Check, CalendarDays } from 'lucide-react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { appointmentsApi, barbersApi, clientsApi, servicesApi } from '@/lib/api';
import { formatCurrency, formatTime, getStatusLabel } from '@/lib/utils';

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientId: '', barberId: '', serviceIds: [] as string[], date: '', time: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({ queryKey: ['appointments', selectedDate], queryFn: () => appointmentsApi.list({ date: selectedDate }), refetchInterval: 5000 });
  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: () => barbersApi.list() });
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.list() });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => servicesApi.list() });

  const createMutation = useMutation({
    mutationFn: (data: any) => appointmentsApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appointments'] }); setShowModal(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => appointmentsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => appointmentsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  function resetForm() {
    setForm({ clientId: '', barberId: '', serviceIds: [], date: selectedDate, time: '', notes: '' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selServices = services.filter((s: any) => form.serviceIds.includes(String(s.id)));
    const totalPrice = selServices.reduce((sum: number, s: any) => sum + parseFloat(s.price || '0'), 0);
    createMutation.mutate({
      clientId: parseInt(form.clientId),
      barberId: parseInt(form.barberId),
      serviceIds: form.serviceIds.map(Number),
      date: form.date || selectedDate,
      time: form.time,
      totalPrice: String(totalPrice),
      notes: form.notes || undefined,
    });
  }

  const dateLabel = format(parseISO(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR });
  const sortedAppointments = [...appointments].sort((a: any, b: any) => a.time.localeCompare(b.time));
  const getBarberName = (id: number) => barbers.find((b: any) => b.id === id)?.name || '--';
  const getClientName = (id: number) => clients.find((c: any) => c.id === id)?.name || '--';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agenda</h1>
          <p className="text-sm text-slate-500 mt-1 capitalize">{dateLabel}</p>
        </div>
        <Button icon={<Plus className="w-5 h-5" />} onClick={() => { resetForm(); setShowModal(true); }}>
          Novo Agendamento
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="relative">
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-auto !py-1.5" />
        </div>
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}>Hoje</Button>
      </div>

      {/* Appointments List */}
      <Card>
        <CardContent className="p-0">
          {sortedAppointments.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="w-7 h-7" />}
              title="Nenhum agendamento"
              description="Não há agendamentos para esta data"
              action={<Button size="sm" icon={<Plus className="w-5 h-5" />} onClick={() => { resetForm(); setShowModal(true); }}>Agendar</Button>}
            />
          ) : (
            <div className="divide-y divide-slate-50">
              {sortedAppointments.map((apt: any) => (
                <div key={apt.id} className="px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-900/5 rounded-2xl flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-slate-800">{formatTime(apt.time)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{getClientName(apt.clientId)}</p>
                      <p className="text-sm text-slate-500 mt-0.5">Barbeiro: {getBarberName(apt.barberId)}</p>
                      <p className="text-sm font-semibold text-[#c8a45a] mt-0.5">{formatCurrency(apt.totalPrice || '0')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'error' : apt.status === 'confirmed' ? 'success' : 'info'} dot>
                      {getStatusLabel(apt.status)}
                    </Badge>
                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                      <>
                        <Button variant="ghost" size="xs" onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'completed' } })}>
                          <Check className="w-5 h-5 text-emerald-600" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => { if (confirm('Cancelar agendamento?')) updateMutation.mutate({ id: apt.id, data: { status: 'cancelled' } }); }}>
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Appointment Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Agendamento" subtitle="Preencha os dados do agendamento">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select label="Cliente" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            options={[{ value: '', label: 'Selecione o cliente...' }, ...clients.map((c: any) => ({ value: String(c.id), label: c.name }))]} />
          <Select label="Barbeiro" value={form.barberId} onChange={(e) => setForm({ ...form, barberId: e.target.value })}
            options={[{ value: '', label: 'Selecione o barbeiro...' }, ...barbers.filter((b: any) => b.isActive).map((b: any) => ({ value: String(b.id), label: b.name }))]} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Serviços</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3">
              {services.filter((s: any) => s.isActive).map((s: any) => (
                <label key={s.id} className="flex items-center gap-2.5 cursor-pointer py-1 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <input type="checkbox" checked={form.serviceIds.includes(String(s.id))}
                    onChange={(e) => {
                      const id = String(s.id);
                      setForm({ ...form, serviceIds: e.target.checked ? [...form.serviceIds, id] : form.serviceIds.filter(i => i !== id) });
                    }}
                    className="rounded border-slate-300" />
                  <span className="text-sm text-slate-700">{s.name}</span>
                  <span className="text-sm font-semibold text-[#c8a45a] ml-auto">{formatCurrency(s.price)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input label="Data" type="date" value={form.date || selectedDate} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Horário" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <Textarea label="Observações" placeholder="Observações opcionais..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending} className="flex-1">Agendar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
