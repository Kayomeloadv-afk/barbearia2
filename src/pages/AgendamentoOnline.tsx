import { useState, useEffect } from 'react';
import { Scissors, Calendar, Clock, User, CheckCircle2, ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { barbersApi, servicesApi, appointmentsApi } from '@/lib/api';

const HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export default function AgendamentoOnline() {
  const [step, setStep] = useState(1);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingAppts, setExistingAppts] = useState<any[]>([]);

  useEffect(() => {
    barbersApi.list().then(b => setBarbers((b || []).filter((x: any) => x.isActive))).catch(() => {});
    servicesApi.list().then(s => setServices((s || []).filter((x: any) => x.isActive))).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDate) {
      appointmentsApi.list({ date: selectedDate }).then(a => setExistingAppts(a || [])).catch(() => {});
    }
  }, [selectedDate]);

  const getAvailableHours = () => {
    if (!selectedBarber || !selectedDate) return HOURS;
    const taken = existingAppts
      .filter(a => a.barberId === selectedBarber.id && a.status !== 'cancelled')
      .map(a => a.time?.slice(0, 5));
    return HOURS.filter(h => !taken.includes(h));
  };

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('pt-BR', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return days;
  };

  const handleSubmit = async () => {
    if (!clientName || !clientPhone || !selectedBarber || !selectedService || !selectedDate || !selectedTime) return;
    setLoading(true);
    try {
      await appointmentsApi.create({
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        clientName,
        clientPhone,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        totalPrice: selectedService.price,
        notes: 'Agendamento online',
      });
      setSuccess(true);
    } catch (err) {
      alert('Erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center animate-scaleIn">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Agendamento Confirmado!</h2>
          <p className="text-slate-500 mb-6">Seu horário foi reservado com sucesso.</p>
          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Barbeiro</span>
              <span className="text-sm font-semibold text-slate-900">{selectedBarber?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Serviço</span>
              <span className="text-sm font-semibold text-slate-900">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Data</span>
              <span className="text-sm font-semibold text-slate-900">{new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Horário</span>
              <span className="text-sm font-semibold text-slate-900">{selectedTime}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span className="text-sm text-slate-500">Valor</span>
              <span className="text-lg font-bold text-[#c8a45a]">R$ {Number(selectedService?.price || 0).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          <button
            onClick={() => { setSuccess(false); setStep(1); setSelectedBarber(null); setSelectedService(null); setSelectedDate(''); setSelectedTime(''); setClientName(''); setClientPhone(''); }}
            className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#c8a45a]/25">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">BarberPro</h1>
            <p className="text-sm text-slate-400">Agende seu horário online</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center gap-3 mb-10">
          {[
            { num: 1, label: 'Serviço' },
            { num: 2, label: 'Barbeiro' },
            { num: 3, label: 'Data/Hora' },
            { num: 4, label: 'Confirmar' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                step >= s.num ? 'bg-[#c8a45a] text-white shadow-lg shadow-[#c8a45a]/30' : 'bg-white/10 text-slate-500'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
              {i < 3 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-[#c8a45a]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Escolher Serviço */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-2">Escolha o serviço</h2>
            <p className="text-slate-400 mb-8">Selecione o serviço que deseja agendar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep(2); }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 ${
                    selectedService?.id === s.id
                      ? 'bg-[#c8a45a]/10 border-[#c8a45a] shadow-lg shadow-[#c8a45a]/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-[#c8a45a]" />
                    </div>
                    <span className="text-lg font-bold text-[#c8a45a]">
                      R$ {Number(s.price || 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{s.name}</h3>
                  <p className="text-sm text-slate-400">{s.duration || 30} min</p>
                </button>
              ))}
              {services.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <p className="text-slate-400">Nenhum serviço disponível no momento</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Escolher Barbeiro */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-2">Escolha o barbeiro</h2>
            <p className="text-slate-400 mb-8">Selecione o profissional de sua preferência</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {barbers.map(b => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBarber(b); setStep(3); }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 ${
                    selectedBarber?.id === b.id
                      ? 'bg-[#c8a45a]/10 border-[#c8a45a] shadow-lg shadow-[#c8a45a]/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {b.name?.[0]?.toUpperCase() || 'B'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{b.name}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">{b.phone || 'Barbeiro profissional'}</p>
                    </div>
                  </div>
                </button>
              ))}
              {barbers.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <p className="text-slate-400">Nenhum barbeiro disponível no momento</p>
                </div>
              )}
            </div>
            <button onClick={() => setStep(1)} className="mt-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>
        )}

        {/* Step 3: Escolher Data e Hora */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-2">Escolha a data e horário</h2>
            <p className="text-slate-400 mb-8">Selecione o melhor dia e horário para você</p>

            {/* Date picker */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#c8a45a]" /> Data
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                {getNextDays().map(d => (
                  <button
                    key={d.date}
                    onClick={() => { setSelectedDate(d.date); setSelectedTime(''); }}
                    className={`flex-shrink-0 w-[80px] py-4 rounded-2xl border-2 text-center transition-all ${
                      selectedDate === d.date
                        ? 'bg-[#c8a45a] border-[#c8a45a] text-white shadow-lg shadow-[#c8a45a]/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className={`text-xs font-medium uppercase ${selectedDate === d.date ? 'text-white/80' : 'text-slate-500'}`}>{d.dayName}</p>
                    <p className={`text-2xl font-bold mt-1 ${selectedDate === d.date ? 'text-white' : 'text-white'}`}>{d.dayNum}</p>
                    <p className={`text-xs mt-0.5 ${selectedDate === d.date ? 'text-white/80' : 'text-slate-500'}`}>{d.monthName}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time picker */}
            {selectedDate && (
              <div className="animate-fadeIn">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#c8a45a]" /> Horário
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {getAvailableHours().map(h => (
                    <button
                      key={h}
                      onClick={() => setSelectedTime(h)}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        selectedTime === h
                          ? 'bg-[#c8a45a] border-[#c8a45a] text-white shadow-lg shadow-[#c8a45a]/30'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                  {getAvailableHours().length === 0 && (
                    <p className="col-span-6 text-center text-slate-400 py-6">Nenhum horário disponível nesta data</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              {selectedDate && selectedTime && (
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#c8a45a] text-white rounded-xl font-semibold hover:bg-[#b8943a] transition-colors shadow-lg shadow-[#c8a45a]/25"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Dados do Cliente e Confirmação */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-2">Confirme seus dados</h2>
            <p className="text-slate-400 mb-8">Preencha suas informações para finalizar</p>

            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
              <h3 className="text-sm font-semibold text-[#c8a45a] mb-4">Resumo do agendamento</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Serviço</span>
                  <span className="text-sm font-semibold text-white">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Barbeiro</span>
                  <span className="text-sm font-semibold text-white">{selectedBarber?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Data</span>
                  <span className="text-sm font-semibold text-white">{new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Horário</span>
                  <span className="text-sm font-semibold text-white">{selectedTime}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <span className="text-sm text-slate-400">Valor</span>
                  <span className="text-xl font-bold text-[#c8a45a]">R$ {Number(selectedService?.price || 0).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />Seu nome
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full px-5 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#c8a45a] focus:ring-2 focus:ring-[#c8a45a]/15 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />Seu telefone
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-5 py-3.5 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#c8a45a] focus:ring-2 focus:ring-[#c8a45a]/15 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !clientName || !clientPhone}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#c8a45a] to-[#a88a3e] text-white rounded-xl font-bold hover:from-[#d4b06a] hover:to-[#c8a45a] transition-all shadow-lg shadow-[#c8a45a]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Confirmar Agendamento
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
