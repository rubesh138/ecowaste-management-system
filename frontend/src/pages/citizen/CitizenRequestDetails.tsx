import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { WasteRequest } from '../../types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const CitizenRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [request, setRequest] = useState<WasteRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchRequest = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await requestService.getRequestById(id);
      if (res.data) {
        setRequest(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCancelling(true);
      await requestService.deleteRequest(id);
      showToast('Waste collection request cancelled.', 'success');
      navigate('/citizen/requests');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel request', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading request details..." className="py-20" />;
  }

  if (error || !request) {
    return <ErrorState message={error || 'Request not found'} onRetry={fetchRequest} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/citizen/requests')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Requests</span>
        </button>

        <div className="flex items-center gap-2">
          {request.status === 'Pending' && (
            <button
              onClick={() => setIsCancelDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancel Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Overview Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-slate-900">
                {request.requestId}
              </span>
              <StatusBadge status={request.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Submitted on {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          {request.scheduledDate && (
            <div className="rounded-2xl bg-purple-50 border border-purple-200/80 p-3 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Scheduled Pickup</p>
                <p className="text-xs font-extrabold text-purple-950">
                  {new Date(request.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Visual Lifecycle Stepper Timeline */}
        <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-6 border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Collection Lifecycle Tracking
          </h3>
          <StatusTimeline
            status={request.status}
            createdAt={request.createdAt}
            scheduledDate={request.scheduledDate}
            completedAt={request.completedAt}
            rejectionReason={request.rejectionReason}
          />
        </div>

        {/* Official Municipal Admin Response Banner */}
        {request.adminResponse && (
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Municipal Operations Response:</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              "{request.adminResponse}"
            </p>
          </div>
        )}

        {/* Rejection Note */}
        {request.status === 'Rejected' && request.rejectionReason && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Rejection Reason:</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              {request.rejectionReason}
            </p>
          </div>
        )}

        {/* Request Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Waste Category</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{request.wasteType}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Declared Quantity</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{request.quantity}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Preferred Collection Date</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {new Date(request.preferredDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Collection Pickup Address</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{request.address}</span>
              </p>
            </div>

            {request.description && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Handling Description</p>
                <p className="text-xs text-slate-600 mt-0.5 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {request.description}
                </p>
              </div>
            )}

            {request.image && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Attached Photo</p>
                <img
                  src={request.image}
                  alt="Waste Attachment"
                  className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Collection Request"
        message="Are you sure you want to cancel this waste collection request? The municipal team will be notified."
        confirmText="Yes, Cancel Request"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
};
