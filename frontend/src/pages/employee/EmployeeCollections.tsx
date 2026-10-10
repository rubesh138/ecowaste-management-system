import React, { useCallback, useEffect, useState } from 'react';
import {
  Truck,
  Home,
  Factory,
  MapPin,
  Calendar,
  Scale,
  CheckCircle,
  XCircle,
  User,
  Phone,
  PackageCheck,
  Clock,
  RefreshCw,
} from 'lucide-react';

import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

interface Collection {
  _id: string;
  collectionType: 'house' | 'industry' | 'village';
  locationName: string;
  wasteType: string;
  quantity: number;
  collectionDate: string;
  collected: boolean;
  remarks: string;
}

interface AssignedEmployee {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Citizen {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface AssignedRequest {
  _id: string;
  requestId: string;
  citizen: Citizen | string;
  wasteType: string;
  quantity: string;
  quantityValue?: number;
  unit?: string;
  preferredDate: string;
  scheduledDate?: string;
  address: string;
  description?: string;
  status: string;
  assignedEmployee?: AssignedEmployee | string | null;
}

export const EmployeeCollections: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [assignedRequests, setAssignedRequests] = useState<AssignedRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [collectingId, setCollectingId] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      const response = await api.get('/collections/my');
      const data = response.data?.data;

      setCollections(Array.isArray(data) ? data : []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching collections:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load collection records'
      );
    }
  }, []);

  const fetchAssignedRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      setRequestError('');

      const response = await api.get('/requests');
      const requests = response.data?.data;

      if (!Array.isArray(requests)) {
        throw new Error('The server returned an invalid requests response.');
      }

      // The backend filters requests by the logged-in employee.
      // Keep only assigned requests that are ready for collection.
      const filteredRequests = requests.filter(
        (request: AssignedRequest) => {
          const hasEmployeeAssignment = Boolean(request.assignedEmployee);

          return (
            hasEmployeeAssignment &&
            ['Accepted', 'Scheduled'].includes(request.status)
          );
        }
      );

      setAssignedRequests(filteredRequests);
    } catch (err: any) {
      console.error('Error fetching assigned requests:', err);

      setRequestError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load assigned requests'
      );

      setAssignedRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);

    try {
      await Promise.all([
        fetchCollections(),
        fetchAssignedRequests(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchCollections, fetchAssignedRequests]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setRequestsLoading(false);
      setRequestError('Please log in again to view your assigned requests.');
      return;
    }

    void refreshData();
  }, [token, refreshData]);

  const handleMarkCollected = async (request: AssignedRequest) => {
    const confirmed = window.confirm(
      `Mark request ${request.requestId} as collected?`
    );

    if (!confirmed) return;

    try {
      setCollectingId(request._id);

      await api.put(`/requests/${request._id}/collect`, {});

      showToast(
        `${request.requestId} marked as collected successfully.`,
        'success'
      );

      await refreshData();
    } catch (err: any) {
      console.error('Error marking request collected:', err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          'Unable to mark request as collected',
        'error'
      );
    } finally {
      setCollectingId(null);
    }
  };

  const totalCollected = collections
    .filter((item) => item.collected)
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

  const houseTotal = collections
    .filter(
      (item) => item.collected && item.collectionType === 'house'
    )
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

  const industryTotal = collections
    .filter(
      (item) => item.collected && item.collectionType === 'industry'
    )
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

  const villageTotal = collections
    .filter(
      (item) => item.collected && item.collectionType === 'village'
    )
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

  const getTypeIcon = (type: Collection['collectionType']) => {
    if (type === 'house') return <Home className="h-5 w-5" />;
    if (type === 'industry') return <Factory className="h-5 w-5" />;
    return <MapPin className="h-5 w-5" />;
  };

  const getTypeName = (type: Collection['collectionType']) => {
    if (type === 'house') return 'House';
    if (type === 'industry') return 'Industry';
    return 'Village';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not scheduled';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Truck className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Collections
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View assigned pickups and your recorded waste collection history
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refreshData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Assigned Requests */}
      <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="border-b border-amber-100 bg-amber-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-6 w-6 text-amber-700" />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Assigned Pickup Requests
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Requests assigned to you by the municipal administrator
              </p>
            </div>
          </div>
        </div>

        {requestsLoading && (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading assigned requests...
          </div>
        )}

        {!requestsLoading && requestError && (
          <div className="p-8 text-center">
            <p className="text-sm text-rose-600">{requestError}</p>

            <button
              type="button"
              onClick={() => void fetchAssignedRequests()}
              className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!requestsLoading &&
          !requestError &&
          assignedRequests.length === 0 && (
            <div className="p-10 text-center">
              <Truck className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-600">
                No pickup requests assigned
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Requests assigned by Admin will appear here after they are
                accepted or scheduled.
              </p>
            </div>
          )}

        {!requestsLoading &&
          !requestError &&
          assignedRequests.length > 0 && (
            <div className="divide-y divide-slate-100">
              {assignedRequests.map((request) => {
                const citizen =
                  typeof request.citizen === 'object'
                    ? request.citizen
                    : null;

                return (
                  <div
                    key={request._id}
                    className="p-6 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-white">
                            {request.requestId}
                          </span>

                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            {request.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Citizen
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-bold text-slate-900">
                                {citizen?.name || 'Citizen'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Contact
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span className="break-all text-sm text-slate-700">
                                {citizen?.phone ||
                                  citizen?.email ||
                                  'Not available'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Waste & Quantity
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <Scale className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-bold text-slate-900">
                                {request.wasteType} —{' '}
                                {request.quantity ||
                                  `${request.quantityValue || 0} ${
                                    request.unit || 'kg'
                                  }`}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Pickup Date
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-700">
                                {formatDate(
                                  request.scheduledDate ||
                                    request.preferredDate
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            Pickup Address
                          </p>

                          <div className="mt-1 flex items-start gap-2">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <span className="text-sm font-semibold text-slate-800">
                              {request.address}
                            </span>
                          </div>
                        </div>

                        {request.description && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Citizen Notes
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {request.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="xl:w-52 xl:border-l xl:border-slate-100 xl:pl-6">
                        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-4 w-4 shrink-0" />
                          <span>Collect the waste at the listed address.</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleMarkCollected(request)}
                          disabled={collectingId === request._id}
                          className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {collectingId === request._id
                            ? 'Recording...'
                            : 'Mark as Collected'}
                        </button>

                        <p className="mt-2 text-center text-[10px] text-slate-400">
                          This records the collection in the system.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-emerald-700">
              Total Collected
            </p>
            <Scale className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-800">
            {totalCollected.toFixed(1)} kg
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-500">House</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {houseTotal.toFixed(1)} kg
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-500">Industry</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {industryTotal.toFixed(1)} kg
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-500">Village</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {villageTotal.toFixed(1)} kg
          </p>
        </div>
      </div>

      {/* Collection History */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            Collection History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            All collection records submitted by you
          </p>
        </div>

        {loading && (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading collection records...
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <p className="text-sm text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => void refreshData()}
              className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && collections.length === 0 && (
          <div className="p-10 text-center">
            <Truck className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              No collection records yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Collection records will appear here after you complete a pickup.
            </p>
          </div>
        )}

        {!loading && !error && collections.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Location
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Waste Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {collections.map((collection) => (
                  <tr
                    key={collection._id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          {getTypeIcon(collection.collectionType)}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                          {getTypeName(collection.collectionType)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {collection.locationName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {collection.wasteType}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {Number(collection.quantity || 0).toFixed(1)} kg
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {formatDate(collection.collectionDate)}
                    </td>

                    <td className="px-6 py-4">
                      {collection.collected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Collected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                          <XCircle className="h-3.5 w-3.5" />
                          Not Collected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCollections;