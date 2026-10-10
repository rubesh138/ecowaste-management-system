import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Recycle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4">
        <Recycle className="w-6 h-6" />
      </div>
      <h1 className="text-7xl font-black text-slate-300">404</h1>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">Page Not Found</h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The waste management route you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
