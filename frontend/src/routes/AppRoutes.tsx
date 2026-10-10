import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

// Public Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Unauthorized } from '../pages/Unauthorized';
import { NotFound } from '../pages/NotFound';

// Citizen Pages
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { CreateRequest } from '../pages/citizen/CreateRequest';
import { MyRequests } from '../pages/citizen/MyRequests';
import { CitizenRequestDetails } from '../pages/citizen/CitizenRequestDetails';
import { CitizenComplaints } from '../pages/citizen/CitizenComplaints';
import { CitizenRecyclingInfo } from '../pages/citizen/CitizenRecyclingInfo';
import { CitizenNotifications } from '../pages/citizen/CitizenNotifications';
import { CitizenProfile } from '../pages/citizen/CitizenProfile';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminRequests } from '../pages/admin/AdminRequests';
import { AdminComplaints } from '../pages/admin/AdminComplaints';
import { AdminRecycling } from '../pages/admin/AdminRecycling';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminEmployees } from '../pages/admin/AdminEmployees';
import { AdminWasteCategories } from '../pages/admin/AdminWasteCategories';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';
import { AdminNotifications } from '../pages/admin/AdminNotifications';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { AdminEmployeeCollections } from '../pages/admin/AdminEmployeeCollections';

// Employee Pages
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard';
import { EmployeeCollections } from '../pages/employee/EmployeeCollections';


// =====================================================
// Employee Profile Page
// =====================================================

const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();

  const profilePhoto = (user as any)?.profilePhoto;

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-4">

          {/* Profile Photo */}
          <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-emerald-100 bg-emerald-50 ring-2 ring-emerald-500/10">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={user?.name || 'Employee'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-emerald-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Employee Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View your employee account details
            </p>
          </div>

        </div>
      </div>


      {/* =====================================================
          PROFILE DETAILS
      ====================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-3">

          {/* =================================================
              LEFT SIDE - INFORMATION
          ================================================== */}
          <div className="md:col-span-2 grid gap-6 md:grid-cols-2">

            {/* Name */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Full Name
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {user?.name || 'Not available'}
              </p>
            </div>


            {/* Email */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email Address
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {user?.email || 'Not available'}
              </p>
            </div>


            {/* Phone */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phone Number
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {user?.phone || 'Not available'}
              </p>
            </div>


            {/* Role */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Role
              </p>

              <p className="mt-2">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                  {user?.role || 'Employee'}
                </span>
              </p>
            </div>


            {/* Address */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Address
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {user?.address || 'Not available'}
              </p>
            </div>


            {/* Status */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <p className="mt-2">
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Active
                </span>
              </p>
            </div>

          </div>


          {/* =================================================
              RIGHT SIDE - LARGE PROFILE PHOTO
          ================================================== */}
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">

            {profilePhoto ? (
              <div className="overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg ring-2 ring-emerald-100">
                <img
                  src={profilePhoto}
                  alt={user?.name || 'Employee'}
                  className="h-56 w-56 object-cover"
                />
              </div>
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-2xl border-4 border-white bg-emerald-100 text-7xl font-bold text-emerald-700 shadow-lg ring-2 ring-emerald-100">
                {user?.name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          EMPLOYEE INFORMATION
      ====================================================== */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

        <h3 className="text-sm font-bold text-emerald-800">
          Employee Responsibilities
        </h3>

        <p className="mt-2 text-sm leading-6 text-emerald-700">
          Use the Employee Collection Portal to record waste collected
          from houses, industries and villages. Enter the actual
          collected quantity in kilograms after each collection.
        </p>

      </div>

    </div>
  );
};


// =====================================================
// App Routes
// =====================================================

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />


      {/* =====================================================
          CITIZEN PROTECTED ROUTES
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={['citizen']} />
        }
      >
        <Route element={<AppLayout />}>

          <Route
            path="/citizen/dashboard"
            element={<CitizenDashboard />}
          />

          <Route
            path="/citizen/create-request"
            element={<CreateRequest />}
          />

          <Route
            path="/citizen/requests"
            element={<MyRequests />}
          />

          <Route
            path="/citizen/requests/:id"
            element={<CitizenRequestDetails />}
          />

          <Route
            path="/citizen/complaints"
            element={<CitizenComplaints />}
          />

          <Route
            path="/citizen/recycling-info"
            element={<CitizenRecyclingInfo />}
          />

          <Route
            path="/citizen/notifications"
            element={<CitizenNotifications />}
          />

          <Route
            path="/citizen/profile"
            element={<CitizenProfile />}
          />

        </Route>
      </Route>


      {/* =====================================================
          ADMIN PROTECTED ROUTES
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']} />
        }
      >
        <Route element={<AppLayout />}>

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/requests"
            element={<AdminRequests />}
          />

          <Route
            path="/admin/complaints"
            element={<AdminComplaints />}
          />

          <Route
            path="/admin/recycling"
            element={<AdminRecycling />}
          />

          {/* Citizen Management - KEEP EXISTING */}
          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          {/* Employee Management - NEW */}
          <Route
            path="/admin/employees"
            element={<AdminEmployees />}
          />

          <Route
            path="/admin/categories"
            element={<AdminWasteCategories />}
          />

          <Route
            path="/admin/analytics"
            element={<AdminAnalytics />}
          />

          <Route
            path="/admin/notifications"
            element={<AdminNotifications />}
          />

          <Route
            path="/admin/profile"
            element={<AdminProfile />}
          />

          {/* Employee Collection Management - KEEP EXISTING */}
          <Route
            path="/admin/employee-collections"
            element={<AdminEmployeeCollections />}
          />

        </Route>
      </Route>


      {/* =====================================================
          EMPLOYEE PROTECTED ROUTES
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={['employee']} />
        }
      >
        <Route element={<AppLayout />}>

          <Route
            path="/employee/dashboard"
            element={<EmployeeDashboard />}
          />

          <Route
            path="/employee/collections"
            element={<EmployeeCollections />}
          />

          <Route
            path="/employee/profile"
            element={<EmployeeProfile />}
          />

        </Route>
      </Route>


      {/* =====================================================
          404
      ====================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
};