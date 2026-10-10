import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-3 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-emerald-600`} />
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};
