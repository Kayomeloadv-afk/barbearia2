import { useState, useRef, useEffect } from 'react';
import { Scissors, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const PIN_LENGTH = 4;

export default function Login() {
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (value && index === PIN_LENGTH - 1) {
      const fullPin = newPin.join('');
      if (fullPin.length === PIN_LENGTH) {
        handleSubmit(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (pasted.length > 0) {
      const newPin = Array(PIN_LENGTH).fill('');
      for (let i = 0; i < pasted.length && i < PIN_LENGTH; i++) {
        newPin[i] = pasted[i];
      }
      setPin(newPin);
      if (pasted.length === PIN_LENGTH) {
        handleSubmit(pasted);
      } else {
        inputRefs.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus();
      }
    }
  };

  const handleSubmit = async (pinStr?: string) => {
    const fullPin = pinStr || pin.join('');
    if (fullPin.length !== PIN_LENGTH) {
      setError(`Digite o PIN completo de ${PIN_LENGTH} dígitos`);
      return;
    }
    setLoading(true);
    const result = await login(fullPin);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'PIN inválido');
      setPin(Array(PIN_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#c8a45a]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#c8a45a]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c8a45a]/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#c8a45a] to-[#a88a3e] rounded-2xl shadow-2xl shadow-[#c8a45a]/30 mb-6">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">BarberPro</h1>
          <p className="text-slate-400 mt-2 text-sm">Sistema de Gestão de Barbearia</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-[#c8a45a]" />
            <h2 className="text-base font-semibold text-white">Digite seu PIN de acesso</h2>
          </div>

          {/* PIN Input */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-16 bg-white/[0.08] border-2 border-white/[0.1] rounded-xl text-center text-2xl font-bold text-white
                  focus:outline-none focus:border-[#c8a45a] focus:bg-white/[0.12] focus:shadow-lg focus:shadow-[#c8a45a]/10
                  transition-all duration-200 placeholder:text-slate-600"
                placeholder="·"
                disabled={loading}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={() => handleSubmit()}
            disabled={loading || pin.some(d => !d)}
            className="w-full py-3.5 bg-gradient-to-r from-[#c8a45a] to-[#a88a3e] text-white font-semibold rounded-xl
              hover:from-[#d4b06a] hover:to-[#b8943a] active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              transition-all duration-200 shadow-lg shadow-[#c8a45a]/25
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-8">
          PIN padrão do administrador: <span className="text-slate-400 font-mono">1234</span>
        </p>
      </div>
    </div>
  );
}
