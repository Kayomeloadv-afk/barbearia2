import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Badge, EmptyState } from '@/components/ui/Badge';
import { productsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function Estoque() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', costPrice: '', quantity: '0', minQuantity: '5', supplier: '' });
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list(), refetchInterval: 5000 });

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); closeModal(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => productsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); closeModal(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  function closeModal() { setShowModal(false); setEditing(null); resetForm(); }
  function resetForm() { setForm({ name: '', category: '', price: '', costPrice: '', quantity: '0', minQuantity: '5', supplier: '' }); }

  function openEdit(p: any) {
    setEditing(p);
    setForm({ name: p.name, category: p.category || '', price: p.price || '', costPrice: p.costPrice || '', quantity: String(p.quantity), minQuantity: String(p.minQuantity || 5), supplier: p.supplier || '' });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, quantity: parseInt(form.quantity), minQuantity: parseInt(form.minQuantity) };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  }

  const lowStock = products.filter((p: any) => p.quantity <= (p.minQuantity || 5));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} produto(s) • {lowStock.length} com estoque baixo</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-5 h-5" /> Novo Produto
        </Button>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-6">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Estoque baixo</p>
              <p className="text-xs text-yellow-600">{lowStock.map((p: any) => p.name).join(', ')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {products.length === 0 ? (
        <EmptyState icon={<Package className="w-8 h-8" />} title="Nenhum produto" description="Cadastre seus produtos" action={<Button onClick={() => setShowModal(true)}>Adicionar Produto</Button>} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Produto</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">Categoria</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Preço</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase">Qtd</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-6">
                        <div className="w-9 h-9 bg-[#c8a45a]/10 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-[#c8a45a]" /></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{p.name}</p>
                          {p.supplier && <p className="text-xs text-slate-500">{p.supplier}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 hidden sm:table-cell capitalize">{p.category || '—'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 text-right">{formatCurrency(p.price || '0')}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={p.quantity <= (p.minQuantity || 5) ? 'warning' : 'success'}>{p.quantity}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => { if (confirm('Excluir?')) deleteMutation.mutate(p.id); }} className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={showModal} onClose={closeModal} title={editing ? 'Editar Produto' : 'Novo Produto'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[{ value: '', label: 'Selecione...' }, { value: 'cabelo', label: 'Cabelo' }, { value: 'barba', label: 'Barba' }, { value: 'finalizacao', label: 'Finalização' }, { value: 'higiene', label: 'Higiene' }, { value: 'outro', label: 'Outro' }]} />
          <div className="grid grid-cols-2 gap-6">
            <Input label="Preço Venda (R$)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Preço Custo (R$)" type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input label="Quantidade" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input label="Qtd Mínima" type="number" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} />
          </div>
          <Input label="Fornecedor" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
