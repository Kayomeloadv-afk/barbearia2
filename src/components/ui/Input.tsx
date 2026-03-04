import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
      <input
        className={cn(
          'w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/15 focus:border-[#c8a45a]',
          error && 'border-red-400 focus:ring-red-200 focus:border-red-400',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
      <select
        className={cn(
          'w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/15 focus:border-[#c8a45a]',
          error && 'border-red-400 focus:ring-red-200 focus:border-red-400',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-700">{label}</label>}
      <textarea
        className={cn(
          'w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 resize-none',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/15 focus:border-[#c8a45a]',
          error && 'border-red-400 focus:ring-red-200 focus:border-red-400',
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}
