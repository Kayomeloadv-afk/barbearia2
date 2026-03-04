import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Award, Gift, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { loyaltyApi } from '@/lib/api';

export default function Fidelidade() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', pointsRequired: '', type: 'discount' });
  const queryClient = useQueryClient();

  const { data: rewards = [] } = useQuery({ queryKey: ['rewards'], queryFn: () => loyaltyApi.rewards.list(), refetchInterval: 5000 });

  const createMutation = useMutation({
    mutationFn: (data: any) => loyaltyApi.rewards.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rewards'] }); closeModal(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => loyaltyApi.rewards.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rewards'] }); closeModal(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => loyaltyApi.rewards.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rewards'] }),
  });

  function closeModal() { setShowModal(false); setEditing(null); setForm({ name: '', description: '', pointsRequired: '', type: 'discount' }); }

  function openEdit(r: any) {
    setEditing(r);
    setForm({ name: r.name, description: r.description || '', pointsRequired: String(r.pointsRequired), type: r.type || 'discount' });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, pointsRequired: parseInt(form.pointsRequired) };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programa de Fidelidade</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie recompensas para seus clientes</p>
        </div>
        <Button onClick={() => { setForm({ name: '', description: '', pointsRequired: '', type: 'discount' }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Nova Recompensa
        </Button>
      </div>

      {rewards.length === 0 ? (
        <EmptyState icon={<Award className="w-8 h-8" />} title="Nenhuma recompensa" description="Crie recompensas para fidelizar clientes" action={<Button onClick={() => setShowModal(true)}>Criar Recompensa</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward: any) => (
            <Card key={reward.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-[#c8a45a]/10 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-[#c8a45a]" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(reward)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(reward.id); }} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{reward.name}</h3>
                {reward.description && <p className="text-sm text-slate-500 mb-3">{reward.description}</p>}
                <div className="flex items-center justify-between">
                  <Badge variant="info">{reward.pointsRequired} pontos</Badge>
                  <Badge variant={reward.isActive ? 'success' : 'default'}>{reward.isActive ? 'Ativo' : 'Inativo'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={closeModal} title={editing ? 'Editar Recompensa' : 'Nova Recompensa'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Pontos Necessários" type="number" value={form.pointsRequired} onChange={(e) => setForm({ ...form, pointsRequired: e.target.value })} required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
