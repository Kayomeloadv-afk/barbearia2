import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { financialApi } from '@/lib/api';
import { formatCurrency, formatDateFull, todayISO } from '@/lib/utils';

export default function Financeiro() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [form, setForm] = useState({ description: '', amount: '', type: 'income', category: '', date: todayISO(), isRecurring: false, notes: '' });
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({ queryKey: ['financial'], queryFn: () => financialApi.list(), refetchInterval: 5000 });

  const createMutation = useMutation({
    mutationFn: (data: any) => financialApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['financial'] }); closeModal(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => financialApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['financial'] }); closeModal(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => financialApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financial'] }),
  });

  function closeModal() { setShowModal(false); setEditing(null); resetForm(); }
  function resetForm() { setForm({ description: '', amount: '', type: 'income', category: '', date: todayISO(), isRecurring: false, notes: '' }); }

  function openEdit(tx: any) {
    setEditing(tx);
    setForm({ description: tx.description, amount: tx.amount, type: tx.type, category: tx.category || '', date: tx.date, isRecurring: tx.isRecurring || false, notes: tx.notes || '' });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  }

  const filtered = filter === 'all' ? transactions : transactions.filter((t: any) => t.type === filter);
  const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + parseFloat(t.amount || '0'), 0);
  const totalExpenses = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + parseFloat(t.amount || '0'), 0);

  const categories = {
    income: [{ value: '', label: 'Selecione...' }, { value: 'servico', label: 'Serviço' }, { value: 'produto', label: 'Produto' }, { value: 'outro', label: 'Outro' }],
    expense: [{ value: '', label: 'Selecione...' }, { value: 'aluguel', label: 'Aluguel' }, { value: 'salario', label: 'Salário' }, { value: 'produto', label: 'Produto' }, { value: 'manutencao', label: 'Manutenção' }, { value: 'marketing', label: 'Marketing' }, { value: 'imposto', label: 'Imposto' }, { value: 'outro', label: 'Outro' }],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de receitas e despesas</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Nova Transação
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
          <div><p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p><p className="text-xs text-slate-500">Receitas</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center"><TrendingDown className="w-6 h-6 text-white" /></div>
          <div><p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p><p className="text-xs text-slate-500">Despesas</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
          <div><p className="text-2xl font-bold text-blue-700">{formatCurrency(totalIncome - totalExpenses)}</p><p className="text-xs text-slate-500">Saldo</p></div>
        </CardContent></Card>
      </div>

      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todos' : f === 'income' ? 'Receitas' : 'Despesas'}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<DollarSign className="w-8 h-8" />} title="Nenhuma transação" description="Registre suas receitas e despesas" action={<Button onClick={() => setShowModal(true)}>Adicionar</Button>} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Descrição</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">Categoria</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Data</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Valor</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.sort((a: any, b: any) => b.date?.localeCompare(a.date)).map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                          {tx.isRecurring && <Badge variant="info">Recorrente</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 hidden sm:table-cell capitalize">{tx.category || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 hidden md:table-cell">{formatDateFull(tx.date)}</td>
                    <td className={`px-5 py-3 text-sm font-semibold text-right ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(tx)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(tx.id); }} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={showModal} onClose={closeModal} title={editing ? 'Editar Transação' : 'Nova Transação'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor (R$)" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'income', label: 'Receita' }, { value: 'expense', label: 'Despesa' }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={categories[form.type as 'income' | 'expense']} />
            <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} className="rounded border-slate-300 text-slate-900" />
            <span className="text-sm text-slate-700">Despesa recorrente (fixa)</span>
          </label>
          <Textarea label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">{editing ? 'Salvar' : 'Registrar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
