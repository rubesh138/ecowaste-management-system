import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Modal } from '../../components/common/Modal';
import { Complaint, ComplaintStatus } from '../../types';
import {
  MessageSquareWarning,
  Search,
  Filter,
  RefreshCw,
  Edit,
  MapPin,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

export const AdminComplaints: React.FC = () => {
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Update modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalStatus, setModalStatus] = useState<ComplaintStatus>('In Progress');
  const [adminResponse, setAdminResponse] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await complaintService.getComplaints({
        status: selectedStatus,
        search: searchTerm,
      });
      if (res.data) {
        setComplaints(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleUpdateSubmit = async () => {
    if (!selectedComplaint) return;
    try {
      setIsUpdating(true);
      await complaintService.updateComplaint(selectedComplaint._id, {
        status: modalStatus,
        adminResponse,
      });
      showToast(`Complaint ${selectedComplaint.complaintId} updated to "${modalStatus}". Citizen notified.`, 'success');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err: any) {
      showToast(err.message || 'Failed to update complaint', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusFilters = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Citizen Grievance Resolution
          </h1>
          <p className="text-xs text-slate-500">
            Investigate and resolve missed pickups, public bin overflow, and damage reports
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Complaints</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {statusFilters.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Complaint ID, address, or description..."
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
      </div>

      {/* Complaints Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading complaints..." className="py-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchComplaints} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={
            selectedStatus !== 'All'
              ? `No complaints currently marked as "${selectedStatus}".`
              : 'No citizen complaints in the registry.'
          }
          icon={MessageSquareWarning}
        />
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">Complaint ID</th>
                  <th className="px-4 py-3.5">Citizen</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Incident Location</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5">Reported</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Resolve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => {
                  const citizen = typeof c.citizen === 'object' ? c.citizen : null;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{c.complaintId}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{citizen?.name || 'Citizen'}</div>
                        <div className="text-[11px] text-slate-400">{citizen?.phone || citizen?.email || ''}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-[160px] truncate" title={c.address}>
                        {c.address}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-[200px] truncate" title={c.description}>
                        {c.description}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setModalStatus(c.status);
                            setAdminResponse(c.adminResponse || '');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Respond</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response / Status Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Grievance Resolution - ${selectedComplaint?.complaintId}`}
        subtitle="Review incident, provide official response, and update status"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border text-xs space-y-1.5">
            <p><span className="font-bold text-slate-700">Category:</span> {selectedComplaint?.category}</p>
            <p><span className="font-bold text-slate-700">Location:</span> {selectedComplaint?.address}</p>
            <p><span className="font-bold text-slate-700">Report:</span> {selectedComplaint?.description}</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Update Resolution Status *
            </label>
            <select
              value={modalStatus}
              onChange={(e) => setModalStatus(e.target.value as ComplaintStatus)}
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress (Field Team Dispatched)</option>
              <option value="Resolved">Resolved (Sanitation Complete)</option>
              <option value="Rejected">Rejected (Out of Municipal Scope)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Admin Official Resolution Note *
            </label>
            <textarea
              rows={3}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="e.g. Dispatched route driver to clear missed block and emptied overflow container."
              required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateSubmit}
              disabled={isUpdating}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save & Notify Citizen'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
