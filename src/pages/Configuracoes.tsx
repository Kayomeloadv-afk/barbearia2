import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { settingsApi } from '@/lib/api';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function Configuracoes() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get(), refetchInterval: 10000 });

  const [form, setForm] = useState({
    shopName: '', address: '', phone: '', openTime: '09:00', closeTime: '19:00',
    workDays: [true, true, true, true, true, true, false],
    primaryColor: '#1a365d', accentColor: '#d4a853',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        shopName: settings.shopName || '',
        address: settings.address || '',
        phone: settings.phone || '',
        openTime: settings.openTime || '09:00',
        closeTime: settings.closeTime || '19:00',
        workDays: settings.workDays || [true, true, true, true, true, true, false],
        primaryColor: settings.primaryColor || '#1a365d',
        accentColor: settings.accentColor || '#d4a853',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => settingsApi.update(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); alert('Configurações salvas!'); },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Personalize sua barbearia</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-slate-900">Informações da Barbearia</h2></CardHeader>
          <CardContent className="space-y-6">
            <Input label="Nome da Barbearia" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
            <Input label="Endereço" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-slate-900">Horário de Funcionamento</h2></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Input label="Abertura" type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} />
              <Input label="Fechamento" type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dias de Funcionamento</label>
              <div className="flex flex-wrap gap-3">
                {DAYS.map((day, i) => (
                  <button key={day} type="button"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${form.workDays[i] ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                    onClick={() => {
                      const newDays = [...form.workDays];
                      newDays[i] = !newDays[i];
                      setForm({ ...form, workDays: newDays });
                    }}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-slate-900">Personalização de Cores</h2></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Cor Principal</label>
                <div className="flex items-center gap-6">
                  <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Cor de Destaque</label>
                <div className="flex items-center gap-6">
                  <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 rounded-xl" style={{ backgroundColor: form.primaryColor }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: form.accentColor }}>
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Preview</p>
                <p className="text-white/70 text-sm">Assim ficará o visual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={updateMutation.isPending} size="lg">
            <Save className="w-5 h-5" /> Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
