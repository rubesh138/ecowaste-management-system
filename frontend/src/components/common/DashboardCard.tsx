import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'cyan' | 'slate';
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'emerald',
  onClick,
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
      ring: 'group-hover:ring-emerald-500/20',
      accent: 'from-emerald-500/10 to-transparent',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-300',
      ring: 'group-hover:ring-blue-500/20',
      accent: 'from-blue-500/10 to-transparent',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-300',
      ring: 'group-hover:ring-purple-500/20',
      accent: 'from-purple-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300',
      ring: 'group-hover:ring-amber-500/20',
      accent: 'from-amber-500/10 to-transparent',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-300',
      ring: 'group-hover:ring-rose-500/20',
      accent: 'from-rose-500/10 to-transparent',
    },
    cyan: {
      bg: 'bg-cyan-50 text-cyan-600',
      border: 'hover:border-cyan-300',
      ring: 'group-hover:ring-cyan-500/20',
      accent: 'from-cyan-500/10 to-transparent',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-700',
      border: 'hover:border-slate-300',
      ring: 'group-hover:ring-slate-500/20',
      accent: 'from-slate-500/10 to-transparent',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${scheme.border}`}
    >
      {/* Subtle top gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.accent}`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${scheme.bg}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
