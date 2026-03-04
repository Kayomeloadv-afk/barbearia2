import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Phone, Mail, Star, Edit2, Trash2, Instagram, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { barbersApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';

const SPECIALTIES = ['Corte Masculino', 'Barba', 'Degradê', 'Navalhado', 'Coloração', 'Tratamento Capilar', 'Design de Sobrancelha', 'Infantil'];

export default function Equipe() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', bio: '', specialties: [] as string[], yearsExperience: '', instagram: '', commissionRate: '50' });
  const queryClient = useQueryClient();

  const { data: barbers = [] } = useQuery({ queryKey: ['barbers'], queryFn: () => barbersApi.list(), refetchInterval: 5000 });

  const createMutation = useMutation({
    mutationFn: (data: any) => barbersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['barbers'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => barbersApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['barbers'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => barbersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['barbers'] }),
  });

  function closeModal() { setShowModal(false); setEditing(null); resetForm(); }
  function resetForm() { setForm({ name: '', phone: '', email: '', bio: '', specialties: [], yearsExperience: '', instagram: '', commissionRate: '50' }); }

  function openEdit(barber: any) {
    setEditing(barber);
    setForm({
      name: barber.name || '', phone: barber.phone || '', email: barber.email || '',
      bio: barber.bio || '', specialties: barber.specialties || [], yearsExperience: String(barber.yearsExperience || ''),
      instagram: barber.instagram || '', commissionRate: barber.commissionRate || '50',
    });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined, commissionRate: form.commissionRate };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe</h1>
          <p className="text-sm text-slate-500 mt-1">{barbers.length} barbeiro(s) cadastrado(s)</p>
        </div>
        <Button icon={<Plus className="w-5 h-5" />} onClick={() => { resetForm(); setShowModal(true); }}>
          Novo Barbeiro
        </Button>
      </div>

      {barbers.length === 0 ? (
        <EmptyState icon={<Users className="w-7 h-7" />} title="Nenhum barbeiro" description="Cadastre sua equipe para começar"
          action={<Button size="sm" icon={<Plus className="w-5 h-5" />} onClick={() => setShowModal(true)}>Adicionar Barbeiro</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {barbers.map((barber: any) => (
            <Card key={barber.id} hover>
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md shadow-[#c8a45a]/20">
                      {getInitials(barber.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{barber.name}</h3>
                      <Badge variant={barber.isActive ? 'success' : 'default'} dot size="sm">
                        {barber.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(barber)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => { if (confirm('Excluir barbeiro?')) deleteMutation.mutate(barber.id); }} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {barber.bio && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{barber.bio}</p>}

                <div className="space-y-2 text-sm text-slate-600">
                  {barber.phone && <div className="flex items-center gap-2.5"><Phone className="w-5 h-5 text-slate-400" />{barber.phone}</div>}
                  {barber.email && <div className="flex items-center gap-2.5"><Mail className="w-5 h-5 text-slate-400" />{barber.email}</div>}
                  {barber.instagram && <div className="flex items-center gap-2.5"><Instagram className="w-5 h-5 text-slate-400" />@{barber.instagram}</div>}
                  <div className="flex items-center gap-2.5"><Star className="w-5 h-5 text-[#c8a45a]" />Comissão: {barber.commissionRate}%</div>
                </div>

                {barber.specialties?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {barber.specialties.map((s: string) => (
                      <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={closeModal} title={editing ? 'Editar Barbeiro' : 'Novo Barbeiro'} subtitle="Preencha os dados do profissional" size="md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Nome" placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-6">
            <Input label="Telefone" placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input label="Email" type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input label="Comissão (%)" type="number" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} />
            <Input label="Anos de Experiência" type="number" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} />
          </div>
          <Input label="Instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="usuario" />
          <Textarea label="Bio" placeholder="Breve descrição do profissional..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Especialidades</label>
            <div className="flex flex-wrap gap-3">
              {SPECIALTIES.map((s) => (
                <button key={s} type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${form.specialties.includes(s) ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  onClick={() => setForm({ ...form, specialties: form.specialties.includes(s) ? form.specialties.filter(x => x !== s) : [...form.specialties, s] })}>
                  {s}
                </button>
              ))}
            </div>
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
