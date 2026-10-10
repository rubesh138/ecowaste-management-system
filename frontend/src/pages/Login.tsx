import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import {
  Recycle,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Truck,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const expiredParam = searchParams.get('expired');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);

      const user = await login(email, password);

      showToast(`Welcome back, ${user.name}!`, 'success');

      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Failed to login. Please check your credentials.'
      );

      showToast(
        err.message || 'Login failed',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (
    role: 'admin' | 'citizen' | 'employee'
  ) => {
    if (role === 'admin') {
      setEmail('admin@smartwaste.gov');
      setPassword('admin123');
    } else if (role === 'employee') {
      setEmail('employee@smartwaste.gov');
      setPassword('employee123');
    } else {
      setEmail('citizen@gmail.com');
      setPassword('citizen123');
    }

    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      {/* LOGO + TITLE */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">

        <Link
          to="/"
          className="inline-flex items-center gap-2.5 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <Recycle className="w-6 h-6" />
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Eco<span className="text-emerald-600">Waste</span>
          </span>
        </Link>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Manage waste collection requests and municipal operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">

        {/* DEMO LOGIN */}
        <div className="mb-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 p-3.5 text-xs text-emerald-900">

          <div className="flex items-center gap-1.5 font-bold mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />

            <span>
              Quick Demo 1-Click Login
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">

            {/* CITIZEN */}
            <button
              type="button"
              onClick={() =>
                handleDemoFill('citizen')
              }
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white border border-emerald-300 font-semibold text-emerald-800 hover:bg-emerald-100/60 shadow-sm transition-all"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />

              <span>
                Citizen
              </span>
            </button>

            {/* ADMIN */}
            <button
              type="button"
              onClick={() =>
                handleDemoFill('admin')
              }
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white border border-emerald-300 font-semibold text-emerald-800 hover:bg-emerald-100/60 shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />

              <span>
                Admin
              </span>
            </button>

            {/* EMPLOYEE */}
            <button
              type="button"
              onClick={() =>
                handleDemoFill('employee')
              }
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white border border-emerald-300 font-semibold text-emerald-800 hover:bg-emerald-100/60 shadow-sm transition-all"
            >
              <Truck className="w-3.5 h-3.5 text-orange-600" />

              <span>
                Employee
              </span>
            </button>

          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200/80">

          {/* SESSION EXPIRED */}
          {expiredParam && (
            <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              Your session has expired. Please sign in again.
            </div>
          )}

          {/* ERROR */}
          {errorMessage && (
            <div className="mb-5 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200 font-medium">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* EMAIL */}
            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>

              <div className="relative">

                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="name@example.com"
                  required
                  className="block w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

              </div>
            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>

              <div className="relative">

                {/* Lock Icon */}
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>

                {/* Password Input */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  required
                  className="block w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-emerald-600 transition-colors"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center justify-between pt-1">

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />

                <span className="text-xs text-slate-600">
                  Remember me
                </span>

              </label>

              <button
                type="button"
                onClick={() =>
                  showToast(
                    'For demo accounts, use password "admin123", "citizen123" or "employee123"',
                    'info'
                  )
                }
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Forgot password?
              </button>

            </div>

            {/* SIGN IN */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
            >

              <span>
                {isLoading
                  ? 'Signing in...'
                  : 'Sign In'}
              </span>

              <ArrowRight className="w-4 h-4" />

            </button>

          </form>

          {/* REGISTER */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">

            <p className="text-xs text-slate-500">

              Don't have a citizen account?{' '}

              <Link
                to="/register"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Register here
              </Link>

            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;