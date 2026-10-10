import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  let homePath = '/';

  if (user?.role === 'admin') {
    homePath = '/admin/dashboard';
  } else if (user?.role === 'employee') {
    homePath = '/employee/dashboard';
  } else if (user?.role === 'citizen') {
    homePath = '/citizen/dashboard';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/10">
        <ShieldX className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
        Access Denied
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-600">
        You do not have permission to view this section of the municipal
        waste platform. Please navigate back to your authorized dashboard.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Go to Authorized Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-slate-300">
        404
      </h1>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Page Not Found
      </h2>

      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The waste management route you are looking for does not exist or has
        been moved.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
};