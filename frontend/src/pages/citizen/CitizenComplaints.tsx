import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { complaintService } from '../../services/complaintService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Complaint, ComplaintCategory } from '../../types';
import {
  MessageSquareWarning,
  PlusCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Upload,
  AlertTriangle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const CitizenComplaints: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<ComplaintCategory>('Missed Collection');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await complaintService.getComplaints();
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
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be under 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description || !address) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await complaintService.createComplaint({
        category,
        description,
        address,
        image,
      });

      showToast('Your complaint has been submitted successfully.', 'success');
      if (res.data) {
        setComplaints([res.data, ...complaints]);
      }
      // Reset form
      setDescription('');
      setImage('');
      setShowForm(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit complaint', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: ComplaintCategory[] = [
    'Missed Collection',
    'Improper Collection',
    'Waste Overflow',
    'Damaged Bin',
    'Illegal Dumping',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Grievance & Complaint Center
          </h1>
          <p className="text-xs text-slate-500">
            Report service issues, overflow bins, or damaged containers to municipal dispatch
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'File Complaint'}</span>
        </button>
      </div>

      {/* Complaint Submission Card */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-5 animate-slide-up">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquareWarning className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Submit New Grievance Report</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Complaint Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                required
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Incident Location Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Incident street, house, corner or landmark"
                required
                className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Issue Description & Details *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred (e.g. Wednesday recycling truck skipped house #742, bin remained untouched)..."
              required
              className="block w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Photo Evidence (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-slate-300 px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {image && (
                <div className="flex items-center gap-2">
                  <img src={image} alt="Preview" className="w-10 h-10 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="text-xs text-rose-600 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Grievance'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Complaint List */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading complaints..." className="py-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchComplaints} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints filed"
          description="If you notice missed pickups, overflow, or broken equipment, submit a grievance report here."
          actionText="File a Complaint"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {c.complaintId}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {c.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {c.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{c.address}</span>
                </div>
              </div>

              {/* Admin official response */}
              {c.adminResponse && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Municipal Response:</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.adminResponse}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
