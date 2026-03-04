import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({ children, variant = 'primary', size = 'md', loading, icon, className, disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-md',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md shadow-red-500/20',
    accent: 'bg-gradient-to-r from-[#c8a45a] to-[#b8943a] text-white hover:from-[#d4b06a] hover:to-[#c8a45a] shadow-lg shadow-[#c8a45a]/25',
    outline: 'border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    sm: 'px-4 py-2 text-sm rounded-xl gap-2',
    md: 'px-5 py-3 text-sm rounded-xl gap-2.5',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-3',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
      {children}
    </button>
  );
}
