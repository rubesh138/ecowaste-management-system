import React from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Recycle,
  Users,
  Tags,
  BarChart3,
  Bell,
  UserCircle,
  LogOut,
  X,
  Truck,
  UserCog,
} from 'lucide-react';

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    user,
    logout,
    isAdmin,
    isCitizen,
  } = useAuth();


  // =====================================================
  // CITIZEN MENU
  // =====================================================

  const citizenNav: NavItem[] = [
    {
      to: '/citizen/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/citizen/create-request',
      label: 'Create Request',
      icon: FileText,
    },
    {
      to: '/citizen/requests',
      label: 'My Requests',
      icon: FileText,
    },
    {
      to: '/citizen/complaints',
      label: 'Complaints',
      icon: MessageSquare,
    },
    {
      to: '/citizen/recycling-info',
      label: 'Recycling Info',
      icon: Recycle,
    },
    {
      to: '/citizen/notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      to: '/citizen/profile',
      label: 'Profile',
      icon: UserCircle,
    },
  ];


  // =====================================================
  // ADMIN MENU
  // =====================================================

  const adminNav: NavItem[] = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/requests',
      label: 'Requests',
      icon: FileText,
    },
    {
      to: '/admin/complaints',
      label: 'Complaints',
      icon: MessageSquare,
    },
    {
      to: '/admin/recycling',
      label: 'Recycling',
      icon: Recycle,
    },

    // Citizen Management
    {
      to: '/admin/users',
      label: 'Users',
      icon: Users,
    },

    // Employee Management - NEW
    {
      to: '/admin/employees',
      label: 'Employee Management',
      icon: UserCog,
    },

    // Employee Collections
    {
      to: '/admin/employee-collections',
      label: 'Employee Collections',
      icon: Truck,
    },

    {
      to: '/admin/categories',
      label: 'Waste Categories',
      icon: Tags,
    },
    {
      to: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      to: '/admin/notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      to: '/admin/profile',
      label: 'Profile',
      icon: UserCircle,
    },
  ];


  // =====================================================
  // EMPLOYEE MENU
  // =====================================================

  const employeeNav: NavItem[] = [
    {
      to: '/employee/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/employee/collections',
      label: 'My Collections',
      icon: Truck,
    },
    {
      to: '/employee/profile',
      label: 'Profile',
      icon: UserCircle,
    },
  ];


  // =====================================================
  // SELECT MENU BASED ON ROLE
  // =====================================================

  let navItems: NavItem[] = citizenNav;

  if (isAdmin) {
    navItems = adminNav;
  } else if (user?.role === 'employee') {
    navItems = employeeNav;
  } else if (isCitizen) {
    navItems = citizenNav;
  }


  // =====================================================
  // PORTAL NAME
  // =====================================================

  let portalName = 'Citizen Portal';

  if (isAdmin) {
    portalName = 'Admin Portal';
  } else if (user?.role === 'employee') {
    portalName = 'Employee Portal';
  }


  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200
          bg-white
          shadow-xl
          transition-transform duration-300
          lg:translate-x-0
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Recycle className="h-5 w-5" />
            </div>

            <div>

              <p className="text-sm font-bold text-slate-900">
                EcoWaste
              </p>

              <p className="text-xs text-slate-500">
                {portalName}
              </p>

            </div>

          </div>


          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1">

            {navItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >

                  <Icon className="h-5 w-5 shrink-0" />

                  <span>
                    {item.label}
                  </span>

                </NavLink>
              );

            })}

          </div>

        </nav>


        {/* =================================================
            USER / LOGOUT
        ================================================= */}

        <div className="border-t border-slate-100 p-4">

          <div className="mb-3 rounded-xl bg-slate-50 p-3">

            <p className="truncate text-sm font-bold text-slate-800">
              {user?.name || 'User'}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {user?.email || ''}
            </p>

          </div>


          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >

            <LogOut className="h-5 w-5" />

            Logout

          </button>

        </div>

      </aside>
    </>
  );
};