import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/common/Toast';
import { analyticsService } from '../../services/analyticsService';
import { requestService } from '../../services/requestService';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Modal } from '../../components/common/Modal';
import { WasteRequest, DashboardSummary, StatusDistribution, CollectionTrend, WasteTypeData } from '../../types';
import {
  Users,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  Calendar,
  PackageCheck,
  MessageSquareWarning,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentPendingRequests, setRecentPendingRequests] = useState<WasteRequest[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [collectionTrend, setCollectionTrend] = useState<CollectionTrend[]>([]);
  const [wasteTypeData, setWasteTypeData] = useState<WasteTypeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick Accept Modal State
  const [acceptModalReq, setAcceptModalReq] = useState<WasteRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [sumRes, reqsRes, chartsReqRes, wasteRes] = await Promise.all([
        analyticsService.getDashboardSummary(),
        requestService.getRequests({ status: 'Pending', sortBy: 'createdAt', order: 'desc' }),
        analyticsService.getRequestsAnalytics('all'),
        analyticsService.getWasteAnalytics('all'),
      ]);

      if (sumRes.data) setSummary(sumRes.data);
      if (reqsRes.data) setRecentPendingRequests(reqsRes.data.slice(0, 5));
      if (chartsReqRes.data) {
        setStatusDistribution(chartsReqRes.data.statusDistribution || []);
        setCollectionTrend(chartsReqRes.data.collectionTrend || []);
      }
      if (wasteRes.data) {
        setWasteTypeData(wasteRes.data.wasteTypeData || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admin analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickAccept = async () => {
    if (!acceptModalReq) return;
    try {
      setIsProcessing(true);
      await requestService.acceptRequest(acceptModalReq._id, {
        adminResponse: adminNote || 'Your waste collection request has been accepted by municipal operations.',
        scheduledDate: scheduledDate || undefined,
      });

      showToast(`Request ${acceptModalReq.requestId} accepted! Citizen notified.`, 'success');
      setAcceptModalReq(null);
      setAdminNote('');
      setScheduledDate('');
      loadDashboard();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading municipal analytics & operations..." className="py-20" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  const PIE_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#059669', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Municipal Operations Command</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Admin Management & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Real-time residential waste pickup orchestration, recycling batches, and citizen grievances
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/requests"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Manage All Requests</span>
          </Link>
        </div>
      </div>

      {/* 8 Primary Municipal Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard
          title="Total Citizens"
          value={summary?.totalCitizens || 0}
          icon={Users}
          colorScheme="blue"
          subtitle="Registered accounts"
        />
        <DashboardCard
          title="New Requests"
          value={summary?.newRequests || 0}
          icon={Clock}
          colorScheme="amber"
          subtitle="Awaiting review"
        />
        <DashboardCard
          title="Accepted Requests"
          value={summary?.acceptedRequests || 0}
          icon={CheckCircle2}
          colorScheme="emerald"
          subtitle="Approved for routing"
        />
        <DashboardCard
          title="Scheduled Pickups"
          value={summary?.scheduledCollections || 0}
          icon={Calendar}
          colorScheme="purple"
          subtitle="Route dates set"
        />
        <DashboardCard
          title="Completed Pickups"
          value={summary?.completedCollections || 0}
          icon={PackageCheck}
          colorScheme="cyan"
          subtitle="Successfully processed"
        />
        <DashboardCard
          title="Pending Complaints"
          value={summary?.pendingComplaints || 0}
          icon={MessageSquareWarning}
          colorScheme="rose"
          subtitle="Unresolved grievances"
        />
        <DashboardCard
          title="Recycled Waste"
          value={`${summary?.totalRecycledWaste || 0} kg`}
          icon={RefreshCw}
          colorScheme="emerald"
          subtitle="Verified batch output"
        />
        <DashboardCard
          title="Recycling Rate"
          value={`${summary?.recyclingRate || 0}%`}
          icon={TrendingUp}
          colorScheme="emerald"
          subtitle="Recovery efficiency"
        />
      </div>

      {/* Charts Grid using Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Request Status Distribution (Donut / Pie) */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Request Status Distribution</h3>
              <p className="text-[11px] text-slate-500">Breakdown of all collection requests across lifecycle</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {statusDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No request status data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Waste Type Collected (Bar Chart) */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Waste Volume by Category (kg)</h3>
              <p className="text-[11px] text-slate-500">Total estimated kg submitted across segregated streams</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {wasteTypeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: any) => [`${value} kg`, 'Total Weight']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="totalKg" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Collection Trend over time (Line Chart) */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Waste Collection Activity Trend</h3>
              <p className="text-[11px] text-slate-500">Daily submitted requests vs completed collections</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {collectionTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No recent activity trend recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collectionTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="submitted"
                    name="Requests Submitted"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Collections Completed"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Action Queue: New Pending Requests */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pending Request Dispatch Queue</h3>
            <p className="text-xs text-slate-500">Newly submitted citizen bookings awaiting municipal acceptance</p>
          </div>
          <Link
            to="/admin/requests"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPendingRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No pending requests in queue. All submissions have been processed!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Citizen</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Pickup Address</th>
                  <th className="px-4 py-3">Preferred Date</th>
                  <th className="px-4 py-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPendingRequests.map((req) => {
                  const citizenObj = typeof req.citizen === 'object' ? req.citizen : null;
                  return (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{req.requestId}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {citizenObj?.name || 'Citizen'}
                      </td>
                      <td className="px-4 py-3 font-medium">{req.wasteType}</td>
                      <td className="px-4 py-3">{req.quantity}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{req.address}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(req.preferredDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setAcceptModalReq(req);
                            setAdminNote(`Accepted for municipal collection on ${new Date(req.preferredDate).toLocaleDateString()}.`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                        <Link
                          to={`/admin/requests`}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Accept Modal */}
      <Modal
        isOpen={!!acceptModalReq}
        onClose={() => setAcceptModalReq(null)}
        title={`Accept Request ${acceptModalReq?.requestId}`}
        subtitle="Approve request and dispatch automated alert to citizen"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border text-xs text-slate-700 space-y-1">
            <p><span className="font-bold">Waste Type:</span> {acceptModalReq?.wasteType} ({acceptModalReq?.quantity})</p>
            <p><span className="font-bold">Address:</span> {acceptModalReq?.address}</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Admin Response Message
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Schedule Collection Date (Optional)
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              onClick={() => setAcceptModalReq(null)}
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleQuickAccept}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? 'Accepting...' : 'Confirm Acceptance'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
