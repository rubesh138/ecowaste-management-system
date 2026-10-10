import React, { useState, useEffect } from 'react';
import { requestService } from '../../services/requestService';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Modal } from '../../components/common/Modal';
import { WasteRequest, WasteStatus } from '../../types';
import {
  Search,
  Check,
  X,
  Calendar,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackageCheck,
  ShieldCheck,
  Edit,
  Users,
} from 'lucide-react';

export const AdminRequests: React.FC = () => {
  const { showToast } = useToast();

  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<WasteRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Accept Modal
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptResponse, setAcceptResponse] = useState('');
  const [acceptScheduleDate, setAcceptScheduleDate] = useState('');

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectResponse, setRejectResponse] = useState('');

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduleResponse, setScheduleResponse] = useState('');

  // Status Update Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<WasteStatus>('Accepted');
  const [statusResponse, setStatusResponse] = useState('');

  const [isActionLoading, setIsActionLoading] = useState(false);
  // Employee assignment
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setIsEmployeeLoading(true);
      const res = await api.get('/users/employees');
      setEmployees(res.data?.data || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to load employees', 'error');
    } finally {
      setIsEmployeeLoading(false);
    }
  };

  const openAssignModal = async (req: WasteRequest) => {
    setSelectedRequest(req);
    setSelectedEmployeeId(
      typeof (req as any).assignedEmployee === 'object'
        ? (req as any).assignedEmployee?._id || ''
        : (req as any).assignedEmployee || ''
    );
    setAssignModalOpen(true);
    await fetchEmployees();
  };

  const handleAssignEmployee = async () => {
    if (!selectedRequest || !selectedEmployeeId) {
      showToast('Please select an employee', 'warning');
      return;
    }

    try {
      setIsActionLoading(true);
      const res = await api.put(
        `/requests/${selectedRequest._id}/assign`,
        { employeeId: selectedEmployeeId }
      );

      showToast(
        `Request ${selectedRequest.requestId} assigned successfully. Employee notified.`,
        'success'
      );

      setAssignModalOpen(false);

      if (res.data?.data) {
        setSelectedRequest(res.data.data);
      }

      await fetchRequests();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || err.message || 'Failed to assign employee',
        'error'
      );
    } finally {
      setIsActionLoading(false);
    }
  };


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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  // 1. Accept Request
  const handleAcceptSubmit = async () => {
    if (!selectedRequest) return;
    try {
      setIsActionLoading(true);
      const res = await requestService.acceptRequest(selectedRequest._id, {
        adminResponse: acceptResponse || 'Your waste collection request has been accepted by municipal operations.',
        scheduledDate: acceptScheduleDate || undefined,
      });
      showToast(`Request ${selectedRequest.requestId} accepted successfully. Citizen notified.`, 'success');
      setAcceptModalOpen(false);
      fetchRequests();
      if (res.data) setSelectedRequest(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to accept request', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 2. Reject Request
  const handleRejectSubmit = async () => {
    if (!selectedRequest || !rejectionReason) {
      showToast('Please provide a rejection reason', 'warning');
      return;
    }
    try {
      setIsActionLoading(true);
      const res = await requestService.rejectRequest(selectedRequest._id, {
        rejectionReason,
        adminResponse: rejectResponse || `Request rejected: ${rejectionReason}`,
      });
      showToast(`Request ${selectedRequest.requestId} rejected. Reason saved and citizen notified.`, 'success');
      setRejectModalOpen(false);
      fetchRequests();
      if (res.data) setSelectedRequest(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to reject request', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Schedule Collection
  const handleScheduleSubmit = async () => {
    if (!selectedRequest || !scheduledDate) {
      showToast('Please select a collection date', 'warning');
      return;
    }
    try {
      setIsActionLoading(true);
      const res = await requestService.scheduleRequest(selectedRequest._id, {
        scheduledDate,
        adminResponse: scheduleResponse || `Collection scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
      });
      showToast(`Collection scheduled for ${new Date(scheduledDate).toLocaleDateString()}. Citizen notified.`, 'success');
      setScheduleModalOpen(false);
      fetchRequests();
      if (res.data) setSelectedRequest(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule collection', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. Update Status Directly
  const handleStatusSubmit = async () => {
    if (!selectedRequest) return;
    try {
      setIsActionLoading(true);
      const res = await requestService.updateStatus(selectedRequest._id, {
        status: newStatus,
        adminResponse: statusResponse || `Request status updated to ${newStatus}.`,
      });
      showToast(`Request status updated to ${newStatus}. Citizen notified.`, 'success');
      setStatusModalOpen(false);
      fetchRequests();
      if (res.data) setSelectedRequest(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setIsActionLoading(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Waste Request Management
          </h1>
          <p className="text-xs text-slate-500">
            Review, accept, schedule, dispatch, and track municipal residential collections
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm space-y-4">
        {/* Status Tabs */}
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

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Request ID, citizen name, address, or waste stream..."
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

      {/* Main Request Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading municipal collection requests..." className="py-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests found"
          description={
            selectedStatus !== 'All'
              ? `No requests match status "${selectedStatus}".`
              : 'No collection requests found in the system.'
          }
        />
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">Request ID</th>
                  <th className="px-4 py-3.5">Citizen Details</th>
                  <th className="px-4 py-3.5">Waste Stream</th>
                  <th className="px-4 py-3.5">Quantity</th>
                  <th className="px-4 py-3.5">Pickup Address</th>
                  <th className="px-4 py-3.5">Preferred Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const citizen = typeof req.citizen === 'object' ? req.citizen : null;
                  return (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {req.requestId}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{citizen?.name || 'Citizen'}</div>
                        <div className="text-[11px] text-slate-400">{citizen?.phone || citizen?.email || ''}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {req.wasteType}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {req.quantity}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 max-w-[180px] truncate" title={req.address}>
                        {req.address}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {new Date(req.preferredDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsDetailsOpen(true);
                          }}
                          title="View Request Details"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Accept Button (if Pending or Under Review) */}
                        {['Pending', 'Under Review'].includes(req.status) && (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setAcceptResponse(`Accepted for collection on ${new Date(req.preferredDate).toLocaleDateString()}.`);
                              setAcceptScheduleDate(req.preferredDate.split('T')[0]);
                              setAcceptModalOpen(true);
                            }}
                            title="Accept Request"
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reject Button (if Pending, Under Review, Accepted) */}
                        {['Pending', 'Under Review', 'Accepted'].includes(req.status) && (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setRejectionReason('');
                              setRejectResponse('');
                              setRejectModalOpen(true);
                            }}
                            title="Reject Request"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Schedule Button */}
                        {['Accepted', 'Under Review'].includes(req.status) && (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setScheduledDate(req.preferredDate.split('T')[0]);
                              setScheduleResponse(`Scheduled collection for ${new Date(req.preferredDate).toLocaleDateString()}.`);
                              setScheduleModalOpen(true);
                            }}
                            title="Schedule Date"
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Assign Employee Button */}
                        {['Accepted', 'Scheduled'].includes(req.status) && (
                          <button
                            onClick={() => openAssignModal(req)}
                            title={(req as any).assignedEmployee ? 'Reassign Employee' : 'Assign Employee'}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Status Progression Button */}
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setNewStatus(req.status);
                            setStatusResponse('');
                            setStatusModalOpen(true);
                          }}
                          title="Update Status"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
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

      {/* 1. Details Modal */}
      <Modal
        isOpen={isDetailsOpen && !!selectedRequest}
        onClose={() => setIsDetailsOpen(false)}
        title={`Request Details - ${selectedRequest?.requestId}`}
        subtitle="Full residential waste collection inspection report"
        maxWidth="xl"
      >
        {selectedRequest && (
          <div className="space-y-5">
            {/* Status & Citizen Summary */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-base font-bold text-slate-900">
                  {selectedRequest.requestId}
                </span>
                <p className="text-xs text-slate-400">
                  Submitted: {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={selectedRequest.status} size="md" />
            </div>

            {/* Lifecycle Timeline */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border">
              <StatusTimeline
                status={selectedRequest.status}
                createdAt={selectedRequest.createdAt}
                scheduledDate={selectedRequest.scheduledDate}
                completedAt={selectedRequest.completedAt}
                rejectionReason={selectedRequest.rejectionReason}
              />
            </div>

            {/* Citizen Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-4 rounded-2xl border">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Citizen Name</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {(typeof selectedRequest.citizen === 'object' && selectedRequest.citizen?.name) || 'Citizen'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Contact Phone / Email</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {(typeof selectedRequest.citizen === 'object' && `${selectedRequest.citizen?.phone} • ${selectedRequest.citizen?.email}`) || 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase text-slate-400">Pickup Location Address</p>
                <p className="font-medium text-slate-800 mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{selectedRequest.address}</span>
                </p>
              </div>
            </div>

            {/* Assigned Employee */}
            {(selectedRequest as any).assignedEmployee && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-amber-700" />
                  <p className="text-[10px] font-bold uppercase text-amber-700">
                    Assigned Collection Employee
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Employee Name</p>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {typeof (selectedRequest as any).assignedEmployee === 'object'
                        ? (selectedRequest as any).assignedEmployee?.name
                        : 'Assigned Employee'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Contact</p>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {typeof (selectedRequest as any).assignedEmployee === 'object'
                        ? ((selectedRequest as any).assignedEmployee?.phone ||
                          (selectedRequest as any).assignedEmployee?.email ||
                          'N/A')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Waste Specifications */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border">
                <p className="text-[10px] font-bold uppercase text-slate-400">Waste Stream</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRequest.wasteType}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border">
                <p className="text-[10px] font-bold uppercase text-slate-400">Estimated Quantity</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRequest.quantity}</p>
              </div>
            </div>

            {selectedRequest.description && (
              <div className="text-xs">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Citizen Handling Notes</p>
                <p className="bg-slate-50 p-3 rounded-xl border text-slate-700 leading-relaxed">
                  {selectedRequest.description}
                </p>
              </div>
            )}

            {selectedRequest.adminResponse && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs">
                <p className="font-bold text-emerald-900 mb-0.5">Admin Response:</p>
                <p className="text-emerald-800">"{selectedRequest.adminResponse}"</p>
              </div>
            )}

            {selectedRequest.rejectionReason && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs">
                <p className="font-bold text-rose-900 mb-0.5">Rejection Reason:</p>
                <p className="text-rose-800">{selectedRequest.rejectionReason}</p>
              </div>
            )}

            {selectedRequest.image && (
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Attached Photo</p>
                <img
                  src={selectedRequest.image}
                  alt="Attachment"
                  className="w-32 h-32 object-cover rounded-xl border"
                />
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Accept Modal */}
      <Modal
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        title={`Accept Request ${selectedRequest?.requestId}`}
        subtitle="Confirm acceptance and notify citizen"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Admin Response Message
            </label>
            <textarea
              rows={3}
              value={acceptResponse}
              onChange={(e) => setAcceptResponse(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Schedule Collection Pickup Date (Optional)
            </label>
            <input
              type="date"
              value={acceptScheduleDate}
              onChange={(e) => setAcceptScheduleDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              onClick={() => setAcceptModalOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAcceptSubmit}
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              {isActionLoading ? 'Accepting...' : 'Accept Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Request ${selectedRequest?.requestId}`}
        subtitle="Provide explicit reason for municipal rejection"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Rejection Reason *
            </label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Hazardous materials not accepted in residential stream"
              required
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Additional Response Message
            </label>
            <textarea
              rows={2}
              value={rejectResponse}
              onChange={(e) => setRejectResponse(e.target.value)}
              placeholder="Optional response explanation..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
            >
              {isActionLoading ? 'Rejecting...' : 'Reject Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Schedule Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={`Schedule Collection - ${selectedRequest?.requestId}`}
        subtitle="Set definitive collection date and dispatch notification"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Collection Pickup Date *
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Admin Response / Note
            </label>
            <textarea
              rows={2}
              value={scheduleResponse}
              onChange={(e) => setScheduleResponse(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              onClick={() => setScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleSubmit}
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              {isActionLoading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Assign Employee Modal */}
      <Modal
        isOpen={assignModalOpen && !!selectedRequest}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Employee - ${selectedRequest?.requestId}`}
        subtitle="Assign an active collection employee to this waste request"
      >
        <div className="space-y-5">
          {selectedRequest && (
            <div className="rounded-2xl bg-slate-50 border p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Citizen</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {typeof selectedRequest.citizen === 'object'
                      ? selectedRequest.citizen?.name
                      : 'Citizen'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Waste</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedRequest.wasteType} • {selectedRequest.quantity}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Pickup Address</p>
                  <p className="font-medium text-slate-800 mt-0.5 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{selectedRequest.address}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Select Employee *
            </label>

            {isEmployeeLoading ? (
              <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-500">
                Loading employees...
              </div>
            ) : employees.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                No active employees found. Create an employee from Admin → Employees first.
              </div>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Choose an employee...</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} — {employee.phone || employee.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
              <p>
                The employee will see the citizen details, phone number, waste type,
                quantity, pickup address, and scheduled date in their assigned requests.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignEmployee}
              disabled={isActionLoading || isEmployeeLoading || employees.length === 0}
              className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 disabled:opacity-50"
            >
              {isActionLoading ? 'Assigning...' : 'Assign Employee'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 6. Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status - ${selectedRequest?.requestId}`}
        subtitle="Progress the collection lifecycle directly"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Select Lifecycle Status *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as WasteStatus)}
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            >
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Collected">Collected</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Admin Response Message
            </label>
            <textarea
              rows={2}
              value={statusResponse}
              onChange={(e) => setStatusResponse(e.target.value)}
              placeholder="e.g. Collection completed and delivered to recycling plant."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusSubmit}
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black disabled:opacity-50"
            >
              {isActionLoading ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
