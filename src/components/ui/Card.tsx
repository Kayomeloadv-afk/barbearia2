import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/60 shadow-sm',
        hover && 'hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300',
        'animate-fadeIn',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-7 py-5 border-b border-slate-100', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-7 py-6', className)}>{children}</div>;
}

export function StatCard({ label, value, icon, trend, color = 'bg-slate-900', subtitle }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  color?: string;
  subtitle?: string;
}) {
  return (
    <Card hover>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg', color)}>
            {icon}
          </div>
          {trend && (
            <span className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
              trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
      </div>
    </Card>
  );
}
