import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { authService } from '../../services/authService';
import {
  ShieldCheck,
  User as UserIcon,
  Phone,
  MapPin,
  Lock,
  Save,
  Key,
} from 'lucide-react';

export const AdminProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    // Name validation
    if (trimmedName.length < 2) {
      showToast('Please enter a valid admin name', 'error');
      return;
    }

    // Phone validation
    const cleanPhone = trimmedPhone.replace(/\D/g, '');

    if (!/^\d{10}$/.test(cleanPhone)) {
      showToast(
        'Phone number must contain exactly 10 digits',
        'error'
      );
      return;
    }

    // Address validation
    if (!trimmedAddress) {
      showToast('Please enter admin address', 'error');
      return;
    }

    if (trimmedAddress.length < 5) {
      showToast(
        'Address must be at least 5 characters',
        'error'
      );
      return;
    }

    if (!/[A-Za-z]/.test(trimmedAddress)) {
      showToast(
        'Please enter a valid address containing letters',
        'error'
      );
      return;
    }

    try {
      setIsUpdating(true);

      await updateUserProfile({
        name: trimmedName,
        phone: cleanPhone,
        address: trimmedAddress,
      });

      showToast(
        'Admin profile updated successfully',
        'success'
      );
    } catch (err: any) {
      showToast(
        err.message || 'Failed to update profile',
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast(
        'Please enter your current password',
        'warning'
      );
      return;
    }

    if (newPassword.length < 6) {
      showToast(
        'Password must be at least 6 characters',
        'warning'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(
        'Passwords do not match',
        'warning'
      );
      return;
    }

    try {
      setIsChangingPassword(true);

      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      showToast(
        'Admin password changed successfully',
        'success'
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(
        err.message || 'Failed to change password',
        'error'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-emerald-400 font-black text-2xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900">
              {user?.name}
            </h1>

            <p className="text-xs text-slate-500">
              {user?.email}
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span>
                Municipal Operations Administrator
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0">
          <p>
            Role:{' '}
            <span className="font-bold text-slate-900 uppercase">
              Administrator
            </span>
          </p>

          <p>
            Access Level:{' '}
            <span className="font-bold text-emerald-600">
              Full System Control
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserIcon className="w-4 h-4 text-emerald-600" />

            <h2 className="text-sm font-bold text-slate-900">
              Administrator Information
            </h2>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter admin name"
              className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Email (System Identifier)
            </label>

            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Direct Contact Phone
            </label>

            <div className="flex">
              <div className="flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700">
                +91
              </div>

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone.replace(/\D/g, '').slice(0, 10)}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10)
                  )
                }
                required
                placeholder="9876543210"
                className="block w-full rounded-r-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <p className="mt-1 text-[11px] text-slate-400">
              Enter exactly 10 digits
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operations Center / Facility Address
            </label>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                required
                placeholder="150 Sathy Road, Erode"
                className="block w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <p className="mt-1 text-[11px] text-slate-400">
              Address must contain meaningful text.
            </p>
          </div>

          {/* Save */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />

              <span>
                {isUpdating
                  ? 'Saving...'
                  : 'Save Admin Details'}
              </span>
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key className="w-4 h-4 text-emerald-600" />

            <h2 className="text-sm font-bold text-slate-900">
              Security Credentials
            </h2>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              required
              className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              required
              className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
              className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Update Password */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-black disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />

              <span>
                {isChangingPassword
                  ? 'Updating...'
                  : 'Update Password'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;