import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { WasteRequest, WasteStatus } from '../../types';
import {
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  Trash2,
  Calendar,
  Layers,
  MapPin,
  Clock,
} from 'lucide-react';

export const MyRequests: React.FC = () => {
  const { showToast } = useToast();

  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Cancel dialog state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await requestService.getRequests({
        status: selectedStatus,
        search: searchTerm,
      });
      if (res.data) {
        setRequests(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleCancelRequest = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await requestService.deleteRequest(deleteTargetId);
      showToast('Waste collection request cancelled.', 'success');
      setRequests((prev) => prev.filter((r) => r._id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel request', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusFilters = [
    'All',
    'Pending',
    'Under Review',
    'Accepted',
    'Scheduled',
    'Collected',
    'Completed',
    'Rejected',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Waste Requests
          </h1>
          <p className="text-xs text-slate-500">
            Track and manage your scheduled recyclable waste collection bookings
          </p>
        </div>

        <Link
          to="/citizen/create-request"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm space-y-4">
        {/* Status Pills */}
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

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Request ID, address, or waste type..."
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

      {/* Content Area */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading requests..." className="py-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No waste requests found"
          description={
            selectedStatus !== 'All'
              ? `No collection requests with status "${selectedStatus}".`
              : 'You have not submitted any waste collection requests yet.'
          }
          actionText="Create Request"
          onAction={() => window.location.assign('/citizen/create-request')}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Request ID</th>
                    <th className="px-5 py-3.5">Waste Category</th>
                    <th className="px-5 py-3.5">Quantity</th>
                    <th className="px-5 py-3.5">Preferred Date</th>
                    <th className="px-5 py-3.5">Submitted On</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {req.requestId}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {req.wasteType}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {req.quantity}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {new Date(req.preferredDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <Link
                          to={`/citizen/requests/${req._id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => setDeleteTargetId(req._id)}
                            title="Cancel Request"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {requests.map((req) => (
              <div
                key={req._id}
                className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {req.requestId}
                  </span>
                  <StatusBadge status={req.status} size="sm" />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-bold text-slate-800">{req.wasteType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity:</span>
                    <span className="font-medium text-slate-700">{req.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preferred Date:</span>
                    <span className="text-slate-700">{new Date(req.preferredDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => setDeleteTargetId(req._id)}
                        className="text-xs text-rose-600 font-semibold p-1 hover:bg-rose-50 rounded"
                      >
                        Cancel
                      </button>
                    )}
                    <Link
                      to={`/citizen/requests/${req._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"
                    >
                      <span>Track Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Dialog for Request Cancellation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleCancelRequest}
        title="Cancel Waste Request"
        message="Are you sure you want to cancel this pending collection request? This action cannot be undone."
        confirmText="Yes, Cancel Request"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
