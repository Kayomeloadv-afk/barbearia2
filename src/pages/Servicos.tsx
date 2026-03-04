import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Clock, Scissors } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { servicesApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function Servicos() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', price: '', duration: '30' });
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => servicesApi.list(), refetchInterval: 5000 });

  const createMutation = useMutation({
    mutationFn: (data: any) => servicesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); closeModal(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => servicesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); closeModal(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  function closeModal() { setShowModal(false); setEditing(null); setForm({ name: '', price: '', duration: '30' }); }

  function openEdit(service: any) {
    setEditing(service);
    setForm({ name: service.name, price: service.price, duration: String(service.duration) });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name: form.name, price: form.price, duration: parseInt(form.duration) };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Serviços</h1>
          <p className="text-sm text-slate-500 mt-1">{services.length} serviço(s) cadastrado(s)</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setForm({ name: '', price: '', duration: '30' }); setShowModal(true); }}>
          Novo Serviço
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState icon={<Scissors className="w-7 h-7" />} title="Nenhum serviço" description="Cadastre os serviços oferecidos pela barbearia"
          action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>Adicionar Serviço</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: any) => (
            <Card key={service.id} hover>
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#c8a45a]/10 rounded-2xl flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-[#c8a45a]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{service.name}</h3>
                      <Badge variant={service.isActive ? 'success' : 'default'} dot size="sm">
                        {service.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-slate-900">{formatCurrency(service.price)}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg"><Clock className="w-3 h-3" />{service.duration}min</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(service)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm('Excluir serviço?')) deleteMutation.mutate(service.id); }} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={closeModal} title={editing ? 'Editar Serviço' : 'Novo Serviço'} subtitle="Defina o nome, preço e duração">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Nome do Serviço" placeholder="Ex: Corte Degradê" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Preço (R$)" type="number" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Duração (min)" type="number" placeholder="30" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
