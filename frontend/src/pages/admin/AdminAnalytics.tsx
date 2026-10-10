import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { DashboardCard } from '../../components/common/DashboardCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  DashboardSummary,
  StatusDistribution,
  CollectionTrend,
  WasteTypeData,
  MonthlyTrend,
} from '../../types';
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  Layers,
  Calendar,
  PackageCheck,
  Clock,
  XCircle,
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const AdminAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [collectionTrend, setCollectionTrend] = useState<CollectionTrend[]>([]);
  const [wasteTypeData, setWasteTypeData] = useState<WasteTypeData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [recyclingStats, setRecyclingStats] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [sumRes, reqRes, wasteRes, recRes] = await Promise.all([
  analyticsService.getDashboardSummary(timeframe),
  analyticsService.getRequestsAnalytics(timeframe),
  analyticsService.getWasteAnalytics(timeframe),
  analyticsService.getRecyclingAnalytics(timeframe),
]);

      if (sumRes.data) setSummary(sumRes.data);
      if (reqRes.data) {
        setStatusDistribution(reqRes.data.statusDistribution || []);
        setCollectionTrend(reqRes.data.collectionTrend || []);
      }
      if (wasteRes.data) {
        setWasteTypeData(wasteRes.data.wasteTypeData || []);
        setMonthlyTrend(wasteRes.data.monthlyTrend || []);
      }
      if (recRes.data) {
        setRecyclingStats(recRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Calculating analytics metrics & charts..." className="py-20" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAnalytics} />;
  }

  const PIE_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#059669', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            City Waste Analytics & Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Real-time reporting across collection volumes, segregation rates, and circular economy metrics
          </p>
        </div>

        {/* Timeframe Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
            { id: 'all', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === t.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <DashboardCard
          title="Total Requests"
          value={summary?.totalRequests || 0}
          icon={BarChart3}
          colorScheme="blue"
        />
        <DashboardCard
          title="Completed"
          value={summary?.completedCollections || 0}
          icon={PackageCheck}
          colorScheme="emerald"
        />
        <DashboardCard
          title="Pending"
          value={summary?.pendingRequests || 0}
          icon={Clock}
          colorScheme="amber"
        />
        <DashboardCard
          title="Rejected"
          value={summary?.rejectedRequests || 0}
          icon={XCircle}
          colorScheme="rose"
        />
        <DashboardCard
          title="Total Collected"
          value={`${summary?.totalWasteCollected || 0} kg`}
          icon={Layers}
          colorScheme="slate"
        />
        <DashboardCard
          title="Total Recycled"
          value={`${summary?.totalRecycledWaste || 0} kg`}
          icon={RefreshCw}
          colorScheme="emerald"
        />
        <DashboardCard
          title="Recycling Rate"
          value={`${summary?.recyclingRate || 0}%`}
          icon={TrendingUp}
          colorScheme="emerald"
        />
      </div>

      {/* 4 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Line Chart - Waste Collection Trend */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Waste Collection Velocity</h3>
              <p className="text-[11px] text-slate-500">Submitted vs fulfilled residential collections</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {collectionTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity trend data recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collectionTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
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

        {/* Chart 2: Bar Chart - Waste by Type */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tonnage by Recyclable Stream (kg)</h3>
              <p className="text-[11px] text-slate-500">Segregated material weight breakdown</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {wasteTypeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} kg`, 'Total Weight']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="totalKg" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Pie Chart - Status Distribution */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Request Lifecycle Status Distribution</h3>
              <p className="text-[11px] text-slate-500">Proportion of requests in each processing phase</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {statusDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No status data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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

        {/* Chart 4: Area Chart - Monthly Collection Trend */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Municipal Volume Trend (kg)</h3>
              <p className="text-[11px] text-slate-500">Aggregated monthly collection capacity progression</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {monthlyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly historical data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} kg`, 'Monthly Weight']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volumeKg"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
