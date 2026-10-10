import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { requestService } from '../../services/requestService';
import { notificationService } from '../../services/notificationService';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { WasteRequest, Notification, DashboardSummary } from '../../types';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  PackageCheck,
  MessageSquareWarning,
  PlusCircle,
  ArrowRight,
  Bell,
  Sparkles,
  Calendar,
  Layers,
  Leaf,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentRequests, setRecentRequests] = useState<WasteRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [summaryRes, requestsRes, notificationsRes] = await Promise.all([
        analyticsService.getDashboardSummary(),
        requestService.getRequests({ sortBy: 'createdAt', order: 'desc' }),
        notificationService.getNotifications(),
      ]);

      if (summaryRes.data) setSummary(summaryRes.data);
      if (requestsRes.data) setRecentRequests(requestsRes.data.slice(0, 5));
      if (notificationsRes.data) setNotifications(notificationsRes.data.slice(0, 4));
    } catch (err: any) {
      setError(err.message || 'Failed to load citizen dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading citizen dashboard..." className="py-20" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-forest-700 to-teal-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Citizen Portal Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Manage your waste collection requests and help build a cleaner, sustainable community.
          </p>
          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              to="/citizen/create-request"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-emerald-50 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Submit New Request</span>
            </Link>
            <Link
              to="/citizen/recycling-info"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors"
            >
              <Leaf className="w-4 h-4 text-emerald-300" />
              <span>View Recycling Tips</span>
            </Link>
          </div>
        </div>
        {/* Background glow circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <DashboardCard
          title="Total Requests"
          value={summary?.totalRequests || 0}
          icon={ClipboardList}
          colorScheme="emerald"
        />
        <DashboardCard
          title="Pending Review"
          value={summary?.pending || 0}
          icon={Clock}
          colorScheme="amber"
        />
        <DashboardCard
          title="Accepted"
          value={summary?.accepted || 0}
          icon={CheckCircle2}
          colorScheme="blue"
        />
        <DashboardCard
          title="Scheduled"
          value={summary?.scheduled || 0}
          icon={Calendar}
          colorScheme="purple"
        />
        <DashboardCard
          title="Completed"
          value={summary?.completed || 0}
          icon={PackageCheck}
          colorScheme="cyan"
        />
        <DashboardCard
          title="Complaints"
          value={summary?.complaints || 0}
          icon={MessageSquareWarning}
          colorScheme="rose"
        />
      </div>

      {/* Main Grid: Recent Requests & Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Requests Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Collection Requests</h2>
              <p className="text-xs text-slate-500">Track status of your residential pickup bookings</p>
            </div>
            <Link
              to="/citizen/requests"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <EmptyState
              title="No requests submitted yet"
              description="Schedule your first recyclable waste collection pickup today."
              actionText="Create Request"
              onAction={() => window.location.assign('/citizen/create-request')}
            />
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Request ID</th>
                      <th className="px-4 py-3">Waste Type</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Preferred Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 font-mono">
                          {req.requestId}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {req.wasteType}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {req.quantity}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(req.preferredDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={req.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/citizen/requests/${req._id}`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Notifications & Segregation Quick Card */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Notifications</h3>
              </div>
              <Link
                to="/citizen/notifications"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                All
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent alerts</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-xs font-bold text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 pt-1">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Citizen Waste Segregation Quick Tip */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Pro Segregation Tip</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Rinsing plastic bottles and collapsing cardboard cartons before scheduled pickup saves up to 40% cargo volume in municipal collection vehicles.
            </p>
            <Link
              to="/citizen/recycling-info"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 pt-1"
            >
              <span>Learn Segregation Best Practices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
