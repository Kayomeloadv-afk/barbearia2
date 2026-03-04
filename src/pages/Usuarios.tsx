import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, Trash2, Edit2, Eye, EyeOff, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { appUsersApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';

export default function Usuarios() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPin, setShowPin] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState({ name: '', pin: '', role: 'operator' });
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['app-users'],
    queryFn: () => appUsersApi.list(),
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => appUsersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['app-users'] }); setShowModal(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => appUsersApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['app-users'] }); setShowModal(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => appUsersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-users'] }),
  });

  function resetForm() {
    setForm({ name: '', pin: '', role: 'operator' });
    setEditingId(null);
  }

  function openEdit(user: any) {
    setForm({ name: user.name, pin: user.pin, role: user.role });
    setEditingId(user.id);
    setShowModal(true);
  }

  function generatePin(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { name: form.name, pin: form.pin, role: form.role } });
    } else {
      createMutation.mutate({ name: form.name, pin: form.pin, role: form.role, isActive: true });
    }
  }

  function toggleActive(user: any) {
    updateMutation.mutate({ id: user.id, data: { isActive: !user.isActive } });
  }

  const activeUsers = users.filter((u: any) => u.isActive);
  const inactiveUsers = users.filter((u: any) => !u.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Usuários</h1>
          <p className="text-sm text-slate-500 mt-1">Adicione e gerencie os PINs de acesso da sua equipe</p>
        </div>
        <Button icon={<Plus className="w-5 h-5" />} onClick={() => { resetForm(); setShowModal(true); }}>
          Novo Usuário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-6">
            <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              <p className="text-xs text-slate-500">Total de Usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-6">
            <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeUsers.length}</p>
              <p className="text-xs text-slate-500">Usuários Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-6">
            <div className="w-11 h-11 bg-red-500 rounded-xl flex items-center justify-center">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{inactiveUsers.length}</p>
              <p className="text-xs text-slate-500">Usuários Inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <div className="px-7 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Usuários Cadastrados</h2>
        </div>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <EmptyState
              icon={<Shield className="w-7 h-7" />}
              title="Nenhum usuário cadastrado"
              description="Adicione o primeiro usuário para que sua equipe possa acessar o sistema"
              action={<Button size="sm" icon={<Plus className="w-5 h-5" />} onClick={() => { resetForm(); setShowModal(true); }}>Adicionar Usuário</Button>}
            />
          ) : (
            <div className="divide-y divide-slate-50">
              {users.map((user: any) => (
                <div key={user.id} className="px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white ${user.isActive ? 'bg-gradient-to-br from-[#c8a45a] to-[#a88a3e]' : 'bg-slate-300'}`}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={user.role === 'admin' ? 'accent' : 'default'} size="sm">
                          {user.role === 'admin' ? 'Administrador' : 'Operador'}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          PIN: {showPin[user.id] ? user.pin : '••••••'}
                        </span>
                        <button
                          onClick={() => setShowPin(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPin[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.isActive ? 'success' : 'error'} dot>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button variant="ghost" size="xs" onClick={() => toggleActive(user)}>
                      {user.isActive ? <UserX className="w-5 h-5 text-red-500" /> : <UserCheck className="w-5 h-5 text-emerald-500" />}
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => openEdit(user)}>
                      <Edit2 className="w-5 h-5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="xs" onClick={() => { if (confirm('Excluir este usuário?')) deleteMutation.mutate(user.id); }}>
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Editar Usuário' : 'Novo Usuário'} subtitle="Defina o nome, função e PIN de acesso">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome Completo"
            placeholder="Ex: João Silva"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Select
            label="Função"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'admin', label: 'Administrador — Acesso total + gerenciar usuários' },
              { value: 'operator', label: 'Operador — Acesso ao sistema (sem gerenciar usuários)' },
            ]}
          />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">PIN de Acesso (6 dígitos)</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, pin: generatePin() })}
                className="text-xs font-medium text-[#c8a45a] hover:text-[#a88a3e] transition-colors"
              >
                Gerar PIN aleatório
              </button>
            </div>
            <Input
              placeholder="000000"
              value={form.pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setForm({ ...form, pin: val });
              }}
              maxLength={6}
              required
              hint="O usuário usará este PIN para fazer login no sistema"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">
              {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
