import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { authService } from '../../services/authService';
import {
  User as UserIcon,
  Mail,
  Lock,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

export const CitizenProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  // =====================================================
  // PROFILE FIELDS
  // =====================================================

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isUpdatingProfile, setIsUpdatingProfile] =
    useState(false);

  // =====================================================
  // PASSWORD FIELDS
  // =====================================================

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  // =====================================================
  // ADDRESS VALIDATION
  // =====================================================

  const validateAddress = (value: string) => {
    const trimmedAddress = value.trim();

    // Empty address
    if (!trimmedAddress) {
      return 'Please provide your address.';
    }

    // Minimum length
    if (trimmedAddress.length < 5) {
      return 'Address must be at least 5 characters.';
    }

    // Address must contain at least one letter
    if (!/[A-Za-z]/.test(trimmedAddress)) {
      return 'Please enter a valid address containing letters.';
    }

    // Reject only symbols
    if (!/[A-Za-z0-9]/.test(trimmedAddress)) {
      return 'Please enter a valid address.';
    }

    return '';
  };

  // =====================================================
  // PROFILE SUBMIT
  // =====================================================

  const handleProfileSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (
      !trimmedName ||
      !trimmedPhone ||
      !trimmedAddress
    ) {
      showToast(
        'Please fill all profile fields',
        'warning'
      );
      return;
    }

    // Validate address
    const addressError =
      validateAddress(trimmedAddress);

    if (addressError) {
      showToast(addressError, 'warning');
      return;
    }

    try {
      setIsUpdatingProfile(true);

      await updateUserProfile({
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
      });

      showToast(
        'Profile updated successfully!',
        'success'
      );
    } catch (err: any) {
      showToast(
        err.message || 'Failed to update profile',
        'error'
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // =====================================================
  // PASSWORD SUBMIT
  // =====================================================

  const handlePasswordSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      showToast(
        'Please enter both current and new password',
        'warning'
      );
      return;
    }

    if (newPassword.length < 6) {
      showToast(
        'New password must be at least 6 characters',
        'warning'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(
        'New passwords do not match',
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
        'Password changed successfully!',
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

      {/* =====================================================
          TOP BANNER
      ===================================================== */}

      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">

            <h1 className="text-xl font-bold text-slate-900">
              {user?.name}
            </h1>

            <p className="text-xs text-slate-500">
              {user?.email}
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">

              <ShieldCheck className="w-3.5 h-3.5" />

              <span>
                Verified{' '}
                {user?.role === 'admin'
                  ? 'Municipal Administrator'
                  : 'Citizen Account'}
              </span>

            </div>

          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0">

          <p>
            Member Status:{' '}
            <span className="font-bold text-emerald-600 capitalize">
              {user?.status}
            </span>
          </p>

          <p>
            Registered:{' '}
            {user?.createdAt
              ? new Date(
                  user.createdAt
                ).toLocaleDateString()
              : 'N/A'}
          </p>

        </div>

      </div>

      {/* =====================================================
          TWO COLUMN SECTION
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* =====================================================
            PROFILE INFORMATION
        ===================================================== */}

        <form
          onSubmit={handleProfileSubmit}
          className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4"
        >

          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">

            <UserIcon className="w-4 h-4 text-emerald-600" />

            <h2 className="text-sm font-bold text-slate-900">
              Personal Information
            </h2>

          </div>

          {/* FULL NAME */}

          <div>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

          </div>

          {/* EMAIL */}

          <div>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email (Read-only)
            </label>

            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs text-slate-500 cursor-not-allowed"
            />

          </div>

          {/* PHONE */}

          <div>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              required
              className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

          </div>

          {/* ADDRESS */}

          <div>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Residential Address
            </label>

            <input
              type="text"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              onBlur={() => {
                const error =
                  validateAddress(address);

                if (error) {
                  showToast(error, 'warning');
                }
              }}
              placeholder="150 Sathy Road, Erode"
              required
              className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            <p className="mt-1 text-[10px] text-slate-400">
              Example: 150 Sathy Road, Erode
            </p>

          </div>

          {/* SAVE */}

          <div className="pt-2">

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >

              <Save className="w-4 h-4" />

              <span>
                {isUpdatingProfile
                  ? 'Saving...'
                  : 'Save Profile Changes'}
              </span>

            </button>

          </div>

        </form>

        {/* =====================================================
            SECURITY & PASSWORD
        ===================================================== */}

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4"
        >

          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">

            <Lock className="w-4 h-4 text-emerald-600" />

            <h2 className="text-sm font-bold text-slate-900">
              Security & Password
            </h2>

          </div>

          {/* CURRENT PASSWORD */}

          <div>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>

            <div className="relative">

              <input
                type={
                  showCurrentPassword
                    ? 'text'
                    : 'password'
                }
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
                required
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 pr-10 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-emerald-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          {/* NEW PASSWORD */}

          <div>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>

            <div className="relative">

              <input
                type={
                  showNewPassword
                    ? 'text'
                    : 'password'
                }
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Min. 6 characters"
                required
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 pr-10 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-emerald-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          {/* CONFIRM PASSWORD */}

          <div>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>

            <div className="relative">

              <input
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Repeat new password"
                required
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 pr-10 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-emerald-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          {/* UPDATE PASSWORD */}

          <div className="pt-2">

            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-900 transition-colors disabled:opacity-50"
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

export default CitizenProfile;