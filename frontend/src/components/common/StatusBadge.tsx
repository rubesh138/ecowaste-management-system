import React from 'react';
import { WasteStatus, ComplaintStatus, RecyclingStatus } from '../../types';

interface StatusBadgeProps {
  status: WasteStatus | ComplaintStatus | RecyclingStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      // Waste Request & Complaint Statuses
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/10';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200/80 ring-blue-500/10';
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10';
      case 'Scheduled':
        return 'bg-purple-50 text-purple-700 border-purple-200/80 ring-purple-500/10';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 ring-indigo-500/10';
      case 'Collected':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200/80 ring-cyan-500/10';
      case 'Completed':
      case 'Resolved':
      case 'Recycled':
        return 'bg-teal-50 text-teal-800 border-teal-200/80 ring-teal-500/10';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10';
      case 'Received':
        return 'bg-sky-50 text-sky-700 border-sky-200/80 ring-sky-500/10';
      case 'Processing':
        return 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10';
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10';
      case 'inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200/80 ring-slate-500/10';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500';
      case 'Under Review':
        return 'bg-blue-500';
      case 'Accepted':
        return 'bg-emerald-500';
      case 'Scheduled':
        return 'bg-purple-500';
      case 'In Progress':
        return 'bg-indigo-500';
      case 'Collected':
        return 'bg-cyan-500';
      case 'Completed':
      case 'Resolved':
      case 'Recycled':
        return 'bg-teal-600';
      case 'Rejected':
        return 'bg-rose-500';
      case 'Received':
        return 'bg-sky-500';
      case 'Processing':
        return 'bg-amber-500 animate-pulse';
      case 'active':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-400';
    }
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ring-1 ring-inset ${getStyles()} ${sizeStyles[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {status}
    </span>
  );
};
