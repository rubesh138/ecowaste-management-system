import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Menu,
  User,
  LogOut,
  Recycle,
  ShieldCheck,
  BriefcaseBusiness,
  X,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [imageError, setImageError] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Profile route based on role
  const profileRoute =
    user?.role === 'admin'
      ? '/admin/profile'
      : user?.role === 'employee'
      ? '/employee/profile'
      : '/citizen/profile';

  // Dashboard route based on role
  const dashboardRoute =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'employee'
      ? '/employee/dashboard'
      : '/citizen/dashboard';

  // Employee profile photo
  const profilePhoto =
    user?.role === 'employee'
      ? (user as any)?.profilePhoto
      : '';

  const showEmployeePhoto =
    user?.role === 'employee' &&
    profilePhoto &&
    !imageError;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">

        {/* =====================================================
            LEFT SECTION
        ====================================================== */}
        <div className="flex items-center gap-3">

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link
            to={dashboardRoute}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                Eco<span className="text-emerald-600">Waste</span>
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Smart Platform
              </span>
            </div>
          </Link>
        </div>

        {/* =====================================================
            RIGHT SECTION
        ====================================================== */}
        <div className="flex items-center gap-2 sm:gap-4">

          {user ? (
            <>
              {/* =================================================
                  ROLE BADGE
              ================================================== */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-600 border-slate-200">

                {user.role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Admin Portal</span>
                  </>
                ) : user.role === 'employee' ? (
                  <>
                    <BriefcaseBusiness className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Employee Portal</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Citizen Portal</span>
                  </>
                )}

              </div>

              {/* =================================================
                  NOTIFICATIONS
              ================================================== */}
              <NotificationDropdown />

              {/* =================================================
                  USER PROFILE AREA
              ================================================== */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">

                {/* =================================================
                    EMPLOYEE PHOTO
                ================================================== */}
                {user.role === 'employee' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (profilePhoto && !imageError) {
                        setShowPhotoModal(true);
                      }
                    }}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    title="View profile photo"
                  >
                    {showEmployeePhoto ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-100 bg-emerald-50 ring-2 ring-emerald-500/10 hover:ring-emerald-500/30 transition-all">
                        <img
                          src={profilePhoto}
                          alt={user.name || 'Employee'}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs ring-2 ring-emerald-500/20">
                        {user.name?.charAt(0)?.toUpperCase() || 'E'}
                      </div>
                    )}
                  </button>
                ) : (
                  <Link
                    to={profileRoute}
                    className="flex items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs ring-2 ring-emerald-500/20">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </Link>
                )}

                {/* =================================================
                    USER NAME + ROLE
                ================================================== */}
                <Link
                  to={profileRoute}
                  className="hidden md:block text-left group"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors max-w-[120px] truncate">
                    {user.name}
                  </p>

                  <p className="text-[10px] text-slate-400 capitalize">
                    {user.role}
                  </p>
                </Link>

                {/* =================================================
                    LOGOUT
                ================================================== */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </div>
            </>
          ) : (
            /* =====================================================
               LOGGED OUT
            ====================================================== */
            <div className="flex items-center gap-2">

              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-emerald-600 px-3 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                Get Started
              </Link>

            </div>
          )}

        </div>
      </header>

      {/* =========================================================
          PROFILE PHOTO MODAL
      ========================================================== */}
      {showPhotoModal && profilePhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowPhotoModal(false)}
        >

          {/* Modal Content */}
          <div
            className="relative max-w-2xl w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPhotoModal(false)}
              className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100 transition-colors"
              aria-label="Close photo"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Large Profile Photo */}
            <div className="overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl">
              <img
                src={profilePhoto}
                alt={user?.name || 'Employee'}
                className="max-h-[80vh] max-w-[85vw] object-contain"
              />
            </div>

          </div>
        </div>
      )}
    </>
  );
};