import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api';

import {
  Users,
  Search,
  Plus,
  Pencil,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Truck,
  Scale,
  ClipboardList,
  RefreshCw,
  X,
  Lock,
  Trash2,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

// =====================================================
// TYPES
// =====================================================

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePhoto?: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  totalQuantity?: number;
  totalCollections?: number;
}

interface Collection {
  _id: string;
  collectionType: 'house' | 'industry' | 'village';
  locationName: string;
  wasteType: string;
  quantity: number;
  collectionDate: string;
  collected: boolean;
  remarks?: string;
}

interface EmployeeDetails extends Employee {
  collections?: Collection[];
}

interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePhoto: string;
  password: string;
}

interface CollectionForm {
  collectionType: 'house' | 'industry' | 'village';
  locationName: string;
  wasteType: string;
  quantity: string;
  collectionDate: string;
  collected: boolean;
  remarks: string;
}

// =====================================================
// COMPONENT
// =====================================================

export const AdminEmployees: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // =====================================================
  // EMPLOYEES
  // =====================================================

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // =====================================================
  // EMPLOYEE ADD / EDIT
  // =====================================================

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [form, setForm] = useState<EmployeeForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePhoto: '',
    password: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // =====================================================
  // EMPLOYEE DETAILS
  // =====================================================

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeDetails | null>(null);

  const [isDetailsLoading, setIsDetailsLoading] =
    useState(false);

  // =====================================================
  // EMPLOYEE STATUS
  // =====================================================

  const [statusTarget, setStatusTarget] =
    useState<Employee | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] =
    useState(false);

  // =====================================================
  // COLLECTION EDIT
  // =====================================================

  const [showCollectionForm, setShowCollectionForm] =
    useState(false);

  const [editingCollection, setEditingCollection] =
    useState<Collection | null>(null);

  const [isSavingCollection, setIsSavingCollection] =
    useState(false);

  const [collectionForm, setCollectionForm] =
    useState<CollectionForm>({
      collectionType: 'house',
      locationName: '',
      wasteType: '',
      quantity: '',
      collectionDate: '',
      collected: true,
      remarks: '',
    });

  // =====================================================
  // COLLECTION DELETE
  // =====================================================

  const [collectionDeleteTarget, setCollectionDeleteTarget] =
    useState<Collection | null>(null);

  const [isDeletingCollection, setIsDeletingCollection] =
    useState(false);

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params: Record<string, string> = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }

      const response = await api.get('/users/employees', {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEmployees(response.data?.data || []);
    } catch (err: any) {
      console.error('Fetch employees error:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load employees'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token, selectedStatus]);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  // =====================================================
  // EMPLOYEE FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      profilePhoto: '',
      password: '',
    });

    setEditingEmployee(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee);

    let phone = employee.phone || '';

    if (phone.startsWith('+91')) {
      phone = phone.replace('+91', '').replace(/\s/g, '');
    }

    setForm({
      name: employee.name || '',
      email: employee.email || '',
      phone,
      address: employee.address || '',
      profilePhoto: employee.profilePhoto || '',
      password: '',
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (isSaving) return;

    setShowForm(false);
    resetForm();
  };

  const handleFormChange = (
    field: keyof EmployeeForm,
    value: string
  ) => {
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // EMPLOYEE PHOTO
  // =====================================================

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo size must be less than 2 MB', 'error');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((previous) => ({
        ...previous,
        profilePhoto: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm((previous) => ({
      ...previous,
      profilePhoto: '',
    }));

    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // =====================================================
  // CREATE / UPDATE EMPLOYEE
  // =====================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast('Please enter employee name', 'error');
      return;
    }

    if (!form.email.trim()) {
      showToast('Please enter employee email', 'error');
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      showToast(
        'Phone number must contain exactly 10 digits',
        'error'
      );
      return;
    }

    const address = form.address.trim();

    if (!address) {
      showToast('Please enter employee address', 'error');
      return;
    }

    if (address.length < 5) {
      showToast(
        'Address must be at least 5 characters',
        'error'
      );
      return;
    }

    if (!/[A-Za-z]/.test(address)) {
      showToast(
        'Please enter a valid address containing letters',
        'error'
      );
      return;
    }

    if (!editingEmployee && form.password.length < 6) {
      showToast(
        'Password must be at least 6 characters',
        'error'
      );
      return;
    }

    if (
      editingEmployee &&
      form.password &&
      form.password.length < 6
    ) {
      showToast(
        'Password must be at least 6 characters',
        'error'
      );
      return;
    }

    try {
      setIsSaving(true);

      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        address,
        profilePhoto: form.profilePhoto,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editingEmployee) {
        await api.put(
          `/users/employees/${editingEmployee._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        showToast(
          'Employee details updated successfully',
          'success'
        );
      } else {
        await api.post(
          '/users/employees',
          {
            ...payload,
            password: form.password,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        showToast(
          'Employee account created successfully',
          'success'
        );
      }

      setShowForm(false);
      resetForm();

      await fetchEmployees();

      // Refresh currently opened employee.
      if (selectedEmployee) {
        await handleViewEmployee(selectedEmployee);
      }
    } catch (err: any) {
      console.error('Save employee error:', err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          'Failed to save employee',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // VIEW EMPLOYEE
  // =====================================================

  const handleViewEmployee = async (employee: Employee) => {
    try {
      setIsDetailsLoading(true);

      const response = await api.get(`/users/${employee._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedEmployee(response.data?.data || null);
    } catch (err: any) {
      console.error('View employee error:', err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          'Failed to load employee details',
        'error'
      );
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // =====================================================
  // ACTIVATE / DEACTIVATE EMPLOYEE
  // =====================================================

  const handleToggleStatus = async () => {
    if (!statusTarget) return;

    const newStatus =
      statusTarget.status === 'active' ? 'inactive' : 'active';

    try {
      setIsUpdatingStatus(true);

      await api.put(
        `/users/${statusTarget._id}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast(
        `Employee ${statusTarget.name} has been ${
          newStatus === 'active' ? 'activated' : 'deactivated'
        }`,
        'success'
      );

      setStatusTarget(null);

      await fetchEmployees();

      if (
        selectedEmployee &&
        selectedEmployee._id === statusTarget._id
      ) {
        await handleViewEmployee(statusTarget);
      }
    } catch (err: any) {
      console.error('Update employee status error:', err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          'Failed to update employee status',
        'error'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // =====================================================
  // COLLECTION FORM
  // =====================================================

  const resetCollectionForm = () => {
    setCollectionForm({
      collectionType: 'house',
      locationName: '',
      wasteType: '',
      quantity: '',
      collectionDate: '',
      collected: true,
      remarks: '',
    });

    setEditingCollection(null);
  };

  const openEditCollectionForm = (collection: Collection) => {
    setEditingCollection(collection);

    const date = collection.collectionDate
      ? new Date(collection.collectionDate).toISOString().split('T')[0]
      : '';

    setCollectionForm({
      collectionType: collection.collectionType,
      locationName: collection.locationName || '',
      wasteType: collection.wasteType || '',
      quantity: String(collection.quantity ?? ''),
      collectionDate: date,
      collected: collection.collected,
      remarks: collection.remarks || '',
    });

    setShowCollectionForm(true);
  };

  const closeCollectionForm = () => {
    if (isSavingCollection) return;

    setShowCollectionForm(false);
    resetCollectionForm();
  };

  const handleCollectionFormChange = (
    field: keyof CollectionForm,
    value: string | boolean
  ) => {
    setCollectionForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // UPDATE COLLECTION
  // =====================================================

  const handleCollectionSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingCollection) {
      return;
    }

    if (!collectionForm.locationName.trim()) {
      showToast('Please enter collection location', 'error');
      return;
    }

    if (!collectionForm.wasteType.trim()) {
      showToast('Please enter waste type', 'error');
      return;
    }

    if (!collectionForm.collectionDate) {
      showToast('Please select collection date', 'error');
      return;
    }

    const quantity = Number(collectionForm.quantity);

    if (
      collectionForm.collected &&
      (!Number.isFinite(quantity) || quantity <= 0)
    ) {
      showToast(
        'Collected quantity must be greater than 0 kg',
        'error'
      );
      return;
    }

    try {
      setIsSavingCollection(true);

      await api.put(
        `/collections/${editingCollection._id}`,
        {
          collectionType: collectionForm.collectionType,
          locationName: collectionForm.locationName.trim(),
          wasteType: collectionForm.wasteType.trim(),
          quantity: collectionForm.collected ? quantity : 0,
          collectionDate: collectionForm.collectionDate,
          collected: collectionForm.collected,
          remarks: collectionForm.remarks.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast(
        'Collection record updated successfully',
        'success'
      );

      setShowCollectionForm(false);
      resetCollectionForm();

      await fetchEmployees();

      if (selectedEmployee) {
        await handleViewEmployee(selectedEmployee);
      }
    } catch (err: any) {
      console.error('Update collection error:', err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          'Failed to update collection record',
        'error'
      );
    } finally {
      setIsSavingCollection(false);
    }
  };

  // =====================================================
  // DELETE COLLECTION
  // =====================================================

  const handleDeleteCollection = async () => {
    if (!collectionDeleteTarget) {
      return;
    }

    try {
      setIsDeletingCollection(true);

      await api.delete(
        `/collections/${collectionDeleteTarget._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast(
        'Collection record deleted successfully',
        'success'
      );

      setCollectionDeleteTarget(null);

      await fetchEmployees();

      if (selectedEmployee) {
        await handleViewEmployee(selectedEmployee);
      }
    } catch (err: any) {
      console.error('Delete collection error:', err);

      showToast(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete collection record',
        'error'
      );
    } finally {
      setIsDeletingCollection(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === 'active'
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.status === 'inactive'
  ).length;

  const totalWaste = employees.reduce(
    (total, employee) =>
      total + Number(employee.totalQuantity || 0),
    0
  );

  const totalCollections = employees.reduce(
    (total, employee) =>
      total + Number(employee.totalCollections || 0),
    0
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Truck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Employee Management
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Create, view, edit and manage employee accounts
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchEmployees}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
        />

        <SummaryCard
          title="Active"
          value={activeEmployees}
          icon={CheckCircle}
        />

        <SummaryCard
          title="Inactive"
          value={inactiveEmployees}
          icon={XCircle}
        />

        <SummaryCard
          title="Waste Collected"
          value={`${totalWaste.toFixed(1)} kg`}
          icon={Scale}
        />

        <SummaryCard
          title="Collection Records"
          value={totalCollections}
          icon={ClipboardList}
        />
      </div>

      {/* SEARCH + FILTER */}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={handleSearch}
          className="flex w-full gap-2 sm:max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-4 text-xs font-bold text-white hover:bg-slate-900"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          {['All', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-xl px-3 py-2 text-xs font-bold capitalize ${
                selectedStatus === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* EMPLOYEE TABLE */}

      {isLoading ? (
        <LoadingSpinner
          size="lg"
          text="Loading employee directory..."
          className="py-20"
        />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployees} />
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="No employees match the current search or status filter."
          icon={Users}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 font-bold uppercase tracking-wide text-slate-400">
                    Employee
                  </th>
                  <th className="px-5 py-4 font-bold uppercase tracking-wide text-slate-400">
                    Contact
                  </th>
                  <th className="px-5 py-4 font-bold uppercase tracking-wide text-slate-400">
                    Address
                  </th>
                  <th className="px-5 py-4 font-bold uppercase tracking-wide text-slate-400">
                    Collections
                  </th>
                  <th className="px-5 py-4 font-bold uppercase tracking-wide text-slate-400">
                    Total Waste
                  </th>
                  <th className="px-5 py-4 font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right font-bold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-slate-50"
                  >
                    {/* Employee */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            {employee.name}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            Joined {formatDate(employee.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {employee.email}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {employee.phone}
                      </p>
                    </td>

                    {/* Address */}

                    <td
                      className="max-w-[180px] truncate px-5 py-4"
                      title={employee.address}
                    >
                      {employee.address}
                    </td>

                    {/* Collections */}

                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800">
                        {employee.totalCollections || 0}
                      </span>
                    </td>

                    {/* Total Waste */}

                    <td className="px-5 py-4">
                      <span className="font-bold text-emerald-700">
                        {Number(employee.totalQuantity || 0).toFixed(1)} kg
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">
                      <StatusBadge status={employee.status} size="sm" />
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          title="View employee"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openEditForm(employee)}
                          title="Edit employee"
                          className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setStatusTarget(employee)}
                          title={
                            employee.status === 'active'
                              ? 'Deactivate employee'
                              : 'Activate employee'
                          }
                          className={`rounded-lg border p-2 ${
                            employee.status === 'active'
                              ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {employee.status === 'active' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT EMPLOYEE MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingEmployee
                    ? 'Update employee account information'
                    : 'Create a new employee account'}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Employee Photo */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Employee Photo
                </label>

                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-emerald-100 bg-emerald-50">
                    {form.profilePhoto ? (
                      <img
                        src={form.profilePhoto}
                        alt="Employee Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-emerald-600">
                        <Users className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={photoInputRef}
                      id="employee-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-700 hover:file:bg-emerald-100"
                    />

                    {form.profilePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="mt-2 inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Remove Photo
                      </button>
                    )}

                    <p className="mt-1 text-[11px] text-slate-400">
                      JPG, PNG • Maximum 2 MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleFormChange('name', e.target.value)
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      handleFormChange('email', e.target.value)
                    }
                    placeholder="employee@example.com"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Phone */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Phone Number
                </label>

                <div className="flex">
                  <div className="flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700">
                    +91
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      handleFormChange('phone', e.target.value)
                    }
                    placeholder="9876543210"
                    className="w-full rounded-r-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <p className="mt-1 text-[11px] text-slate-400">
                  Enter exactly 10 digits
                </p>
              </div>

              {/* Address */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Address
                </label>

                <textarea
                  value={form.address}
                  onChange={(e) =>
                    handleFormChange('address', e.target.value)
                  }
                  placeholder="Enter employee address"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Password */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Password

                  {editingEmployee && (
                    <span className="ml-2 font-normal text-slate-400">
                      Leave empty to keep current password
                    </span>
                  )}
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      handleFormChange('password', e.target.value)
                    }
                    placeholder={
                      editingEmployee
                        ? 'Optional'
                        : 'Minimum 6 characters'
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSaving
                    ? 'Saving...'
                    : editingEmployee
                    ? 'Save Changes'
                    : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE DETAILS MODAL */}

      {(selectedEmployee || isDetailsLoading) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Employee Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Employee profile and collection history
                </p>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isDetailsLoading ? (
              <LoadingSpinner
                size="lg"
                text="Loading employee details..."
                className="py-20"
              />
            ) : selectedEmployee ? (
              <div className="space-y-6 p-6">
                {/* PROFILE */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-emerald-100">
                      {selectedEmployee.profilePhoto ? (
                        <img
                          src={selectedEmployee.profilePhoto}
                          alt={selectedEmployee.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-emerald-700">
                          {selectedEmployee.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900">
                          {selectedEmployee.name}
                        </h3>

                        <StatusBadge
                          status={selectedEmployee.status}
                          size="sm"
                        />
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {selectedEmployee.email}
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          {selectedEmployee.phone}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {selectedEmployee.address}
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          Joined {formatDate(selectedEmployee.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLLECTION SUMMARY */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                          Total Waste Collected
                        </p>

                        <p className="mt-2 text-3xl font-extrabold text-emerald-800">
                          {Number(
                            selectedEmployee.totalQuantity || 0
                          ).toFixed(1)}{' '}
                          kg
                        </p>
                      </div>

                      <Scale className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Collection Records
                        </p>

                        <p className="mt-2 text-3xl font-extrabold text-slate-900">
                          {selectedEmployee.totalCollections || 0}
                        </p>
                      </div>

                      <ClipboardList className="h-8 w-8 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* COLLECTION HISTORY */}

                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Collection History
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Admin can edit or delete collection records
                      </p>
                    </div>
                  </div>

                  {!selectedEmployee.collections ||
                  selectedEmployee.collections.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                      No collection records found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-400">
                          <tr>
                            <th className="px-5 py-3 font-bold">
                              Type
                            </th>
                            <th className="px-5 py-3 font-bold">
                              Location
                            </th>
                            <th className="px-5 py-3 font-bold">
                              Waste
                            </th>
                            <th className="px-5 py-3 font-bold">
                              Quantity
                            </th>
                            <th className="px-5 py-3 font-bold">
                              Date
                            </th>
                            <th className="px-5 py-3 font-bold">
                              Status
                            </th>
                            <th className="px-5 py-3 font-bold">
                              Remarks
                            </th>
                            <th className="px-5 py-3 text-right font-bold">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {selectedEmployee.collections.map(
                            (collection) => (
                              <tr
                                key={collection._id}
                                className="hover:bg-slate-50"
                              >
                                <td className="px-5 py-3 font-semibold capitalize">
                                  {collection.collectionType}
                                </td>

                                <td className="px-5 py-3">
                                  {collection.locationName}
                                </td>

                                <td className="px-5 py-3">
                                  {collection.wasteType}
                                </td>

                                <td className="px-5 py-3 font-bold text-emerald-700">
                                  {Number(collection.quantity || 0).toFixed(1)}{' '}
                                  kg
                                </td>

                                <td className="px-5 py-3">
                                  {formatDate(collection.collectionDate)}
                                </td>

                                <td className="px-5 py-3">
                                  {collection.collected ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-bold text-emerald-700">
                                      <CheckCircle className="h-3 w-3" />
                                      Collected
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 font-bold text-rose-700">
                                      <XCircle className="h-3 w-3" />
                                      Not Collected
                                    </span>
                                  )}
                                </td>

                                <td className="max-w-[180px] truncate px-5 py-3">
                                  {collection.remarks || '-'}
                                </td>

                                {/* Collection Actions */}

                                <td className="px-5 py-3">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() =>
                                        openEditCollectionForm(collection)
                                      }
                                      title="Edit collection"
                                      className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>

                                    <button
                                      onClick={() =>
                                        setCollectionDeleteTarget(collection)
                                      }
                                      title="Delete collection"
                                      className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* EDIT COLLECTION MODAL */}

      {showCollectionForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Collection Record
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Admin can modify this employee collection
                </p>
              </div>

              <button
                onClick={closeCollectionForm}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCollectionSubmit}
              className="space-y-5 p-6"
            >
              {/* Collection Type */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Collection Type
                </label>

                <select
                  value={collectionForm.collectionType}
                  onChange={(e) =>
                    handleCollectionFormChange(
                      'collectionType',
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="house">House</option>
                  <option value="industry">Industry</option>
                  <option value="village">Village</option>
                </select>
              </div>

              {/* Location */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Location
                </label>

                <input
                  type="text"
                  value={collectionForm.locationName}
                  onChange={(e) =>
                    handleCollectionFormChange(
                      'locationName',
                      e.target.value
                    )
                  }
                  placeholder="Enter location"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Waste Type */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Waste Type
                </label>

                <input
                  type="text"
                  value={collectionForm.wasteType}
                  onChange={(e) =>
                    handleCollectionFormChange(
                      'wasteType',
                      e.target.value
                    )
                  }
                  placeholder="Example: Organic Waste"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Quantity */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Quantity (kg)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={collectionForm.quantity}
                  onChange={(e) =>
                    handleCollectionFormChange(
                      'quantity',
                      e.target.value
                    )
                  }
                  placeholder="Example: 45"
                  disabled={!collectionForm.collected}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />

                <p className="mt-1 text-[11px] text-slate-400">
                  Quantity is stored as a number and displayed in kg.
                </p>
              </div>

              {/* Date */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Collection Date
                </label>

                <input
                  type="date"
                  value={collectionForm.collectionDate}
                  onChange={(e) =>
                    handleCollectionFormChange(
                      'collectionDate',
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Collected */}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={collectionForm.collected}
                    onChange={(e) =>
                      handleCollectionFormChange(
                        'collected',
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Waste Collected
                    </p>

                    <p className="text-xs text-slate-500">
                      Enable this when the waste was actually collected.
                    </p>
                  </div>
                </label>
              </div>

              {/* Remarks */}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Remarks
                </label>

                <textarea
                  value={collectionForm.remarks}
                  onChange={(e) =>
                    handleCollectionFormChange(
                      'remarks',
                      e.target.value
                    )
                  }
                  placeholder="Enter remarks (optional)"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCollectionForm}
                  disabled={isSavingCollection}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingCollection}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSavingCollection ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE COLLECTION CONFIRMATION */}

      <ConfirmDialog
        isOpen={!!collectionDeleteTarget}
        onClose={() => {
          if (!isDeletingCollection) {
            setCollectionDeleteTarget(null);
          }
        }}
        onConfirm={handleDeleteCollection}
        title="Delete Collection Record"
        message={
          collectionDeleteTarget
            ? `Are you sure you want to delete the collection record for "${collectionDeleteTarget.locationName}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isDeletingCollection}
      />

      {/* ACTIVATE / DEACTIVATE CONFIRMATION */}

      <ConfirmDialog
        isOpen={!!statusTarget}
        onClose={() => {
          if (!isUpdatingStatus) {
            setStatusTarget(null);
          }
        }}
        onConfirm={handleToggleStatus}
        title={
          statusTarget?.status === 'active'
            ? 'Deactivate Employee'
            : 'Activate Employee'
        }
        message={
          statusTarget
            ? `Are you sure you want to ${
                statusTarget.status === 'active'
                  ? 'deactivate'
                  : 'activate'
              } ${statusTarget.name}'s employee account?`
            : ''
        }
        confirmText={
          statusTarget?.status === 'active'
            ? 'Deactivate'
            : 'Activate'
        }
        variant={statusTarget?.status === 'active' ? 'danger' : 'primary'}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
};

// =====================================================
// SUMMARY CARD
// =====================================================

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400">{title}</p>

          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default AdminEmployees;