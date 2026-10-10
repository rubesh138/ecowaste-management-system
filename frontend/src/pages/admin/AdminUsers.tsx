import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { User } from '../../types';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ClipboardList,
  MessageSquareWarning,
  RefreshCw,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Toggle user status confirm
  const [statusTargetUser, setStatusTargetUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await userService.getUsers({
        search: searchTerm,
        status: selectedStatus,
      });
      if (res.data) setUsers(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load citizen list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async () => {
    if (!statusTargetUser) return;
    const newStatus = statusTargetUser.status === 'active' ? 'inactive' : 'active';
    try {
      setIsUpdating(true);
      await userService.updateUserStatus(statusTargetUser._id, newStatus);
      showToast(`User ${statusTargetUser.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
      setStatusTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Citizen Accounts Management
          </h1>
          <p className="text-xs text-slate-500">
            View registered residential waste accounts, participation stats, and manage access
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, or address..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          {['All', 'active', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 font-semibold capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading citizen directory..." className="py-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No citizens found"
          description="No registered citizens match the search or filter query."
          icon={Users}
        />
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Citizen Name</th>
                  <th className="px-5 py-3.5">Contact Info</th>
                  <th className="px-5 py-3.5">Registered Address</th>
                  <th className="px-5 py-3.5">Requests</th>
                  <th className="px-5 py-3.5">Complaints</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-800 font-medium">{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[180px] truncate" title={u.address}>
                      {u.address}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-700">
                      {u.totalRequests || 0}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-rose-600">
                      {u.totalComplaints || 0}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={u.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setStatusTargetUser(u)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl font-bold text-xs transition-colors ${
                          u.status === 'active'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!statusTargetUser}
        onClose={() => setStatusTargetUser(null)}
        onConfirm={handleToggleStatus}
        title={`${statusTargetUser?.status === 'active' ? 'Deactivate' : 'Activate'} Citizen Account`}
        message={`Are you sure you want to ${statusTargetUser?.status === 'active' ? 'deactivate' : 'activate'} the account for ${statusTargetUser?.name}?`}
        confirmText={statusTargetUser?.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
        variant={statusTargetUser?.status === 'active' ? 'danger' : 'primary'}
        isLoading={isUpdating}
      />
    </div>
  );
};
