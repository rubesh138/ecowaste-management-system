import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Notification } from '../../types';
import {
  Bell,
  CheckCheck,
  Clock,
  ArrowRight,
  ShieldAlert,
  ClipboardList,
  MessageSquareWarning,
} from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await notificationService.getNotifications();
      if (res.data) setNotifications(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to mark all as read', 'error');
    }
  };

  const handleNotificationClick = (n: Notification) => {
    handleMarkAsRead(n._id);
    if (n.relatedRequest) {
      navigate('/admin/requests');
    } else if (n.relatedComplaint) {
      navigate('/admin/complaints');
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.isRead : true
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Municipal Alerts & Notifications
          </h1>
          <p className="text-xs text-slate-500">
            Real-time feed of new citizen requests, complaints, and system events
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading alert log..." className="py-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'No unread alerts' : 'No alerts in log'}
          description="All dispatch events and submissions have been acknowledged."
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.isRead
                  ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                    !n.isRead
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{n.message}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <span>Open Related</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
