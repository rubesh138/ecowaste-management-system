import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Truck,
  Users,
  Scale,
  Home,
  Factory,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EmployeeSummary {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  employeePhone: string;
  totalQuantity: number;
  totalCollections: number;
}

interface Collection {
  _id: string;
  employee: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  collectionType: 'house' | 'industry' | 'village';
  locationName: string;
  wasteType: string;
  quantity: number;
  collectionDate: string;
  collected: boolean;
  remarks: string;
}

export const AdminEmployeeCollections: React.FC = () => {
  const { token } = useAuth();

  const [summary, setSummary] = useState<EmployeeSummary[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalCollections, setTotalCollections] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      setError('');

      const [summaryResponse, collectionsResponse] =
        await Promise.all([
          axios.get(
            'http://localhost:5000/api/collections/summary',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            'http://localhost:5000/api/collections/all',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      const summaryData =
        summaryResponse.data?.data || {};

      setSummary(summaryData.employees || []);

      setTotalQuantity(
        Number(
          summaryData.overall?.totalQuantity || 0
        )
      );

      setTotalCollections(
        Number(
          summaryData.overall?.totalCollections || 0
        )
      );

      setCollections(
        collectionsResponse.data?.data || []
      );
    } catch (err: any) {
      console.error(
        'Error loading employee collections:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to load employee collection data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCollectionData();
    }
  }, [token]);

  const getTypeIcon = (
    type: Collection['collectionType']
  ) => {
    if (type === 'house') {
      return <Home className="h-4 w-4" />;
    }

    if (type === 'industry') {
      return <Factory className="h-4 w-4" />;
    }

    return <MapPin className="h-4 w-4" />;
  };

  const getTypeName = (
    type: Collection['collectionType']
  ) => {
    if (type === 'house') return 'House';
    if (type === 'industry') return 'Industry';

    return 'Village';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Truck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Employee Collections
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor waste collected by all employees
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchCollectionData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? 'animate-spin' : ''
            }`}
          />

          Refresh
        </button>

      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Overall Waste Collected
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-800">
                {totalQuantity.toFixed(1)} kg
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600">
              <Scale className="h-6 w-6" />
            </div>

          </div>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Total Collection Records
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalCollections}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Truck className="h-6 w-6" />
            </div>

          </div>
        </div>

      </div>


      {/* Employee Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">

            <Users className="h-5 w-5 text-emerald-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Employee Collection Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Total waste collected by each employee
              </p>
            </div>

          </div>
        </div>


        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading employee collection summary...
          </div>
        ) : summary.length === 0 ? (
          <div className="p-10 text-center">

            <Truck className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-600">
              No employee collection records yet
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50">
                <tr>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Records
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Total Collected
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {summary.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {employee.employeeName
                            ?.charAt(0)
                            ?.toUpperCase() || 'E'}
                        </div>

                        <span className="text-sm font-semibold text-slate-800">
                          {employee.employeeName}
                        </span>

                      </div>
                    </td>


                    <td className="px-6 py-4 text-sm text-slate-600">
                      {employee.employeeEmail}
                    </td>


                    <td className="px-6 py-4 text-sm text-slate-600">
                      {employee.employeePhone}
                    </td>


                    <td className="px-6 py-4">

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {employee.totalCollections}
                      </span>

                    </td>


                    <td className="px-6 py-4">

                      <span className="text-base font-bold text-emerald-700">
                        {Number(
                          employee.totalQuantity || 0
                        ).toFixed(1)}{' '}
                        kg
                      </span>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* Detailed Collection Records */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-4">

          <h2 className="text-lg font-bold text-slate-900">
            Collection Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed records submitted by employees
          </p>

        </div>


        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading collection records...
          </div>
        ) : collections.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No collection records available.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Waste
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

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Remarks
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

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {collection.employee?.name ||
                            'Unknown Employee'}
                        </p>

                        <p className="text-xs text-slate-400">
                          {collection.employee?.email ||
                            ''}
                        </p>
                      </div>

                    </td>


                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">

                        <span className="text-emerald-600">
                          {getTypeIcon(
                            collection.collectionType
                          )}
                        </span>

                        {getTypeName(
                          collection.collectionType
                        )}

                      </div>

                    </td>


                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2 text-sm text-slate-700">

                        <MapPin className="h-4 w-4 text-slate-400" />

                        {collection.locationName}

                      </div>

                    </td>


                    <td className="px-6 py-4 text-sm text-slate-700">
                      {collection.wasteType}
                    </td>


                    <td className="px-6 py-4">

                      <span className="font-bold text-slate-900">
                        {Number(
                          collection.quantity || 0
                        ).toFixed(1)}{' '}
                        kg
                      </span>

                    </td>


                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2 text-sm text-slate-700">

                        <Calendar className="h-4 w-4 text-slate-400" />

                        {formatDate(
                          collection.collectionDate
                        )}

                      </div>

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


                    <td className="px-6 py-4 text-sm text-slate-600">
                      {collection.remarks || '-'}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

    </div>
  );
};

export default AdminEmployeeCollections;