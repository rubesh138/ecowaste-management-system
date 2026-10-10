import React, { useState, useEffect } from 'react';
import { recyclingService } from '../../services/recyclingService';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DashboardCard } from '../../components/common/DashboardCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  RecyclingRecord,
  RecyclingSummary,
  RecyclingStatus,
  WasteInventory,
} from '../../types';

import {
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Package,
  Layers,
  Trash2,
  Edit,
  Leaf,
  Calendar,
  AlertTriangle,
} from 'lucide-react';


export const AdminRecycling: React.FC = () => {
  const { showToast } = useToast();


  // ============================================================
  // DATA
  // ============================================================

  const [records, setRecords] =
    useState<RecyclingRecord[]>([]);

  const [summary, setSummary] =
    useState<RecyclingSummary | null>(null);

  const [inventory, setInventory] =
    useState<WasteInventory[]>([]);

  const [selectedWasteType, setSelectedWasteType] =
    useState<string>('All');


  // ============================================================
  // LOADING / ERROR
  // ============================================================

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>('');


  // ============================================================
  // ADD / EDIT MODAL
  // ============================================================

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingRecord, setEditingRecord] =
    useState<RecyclingRecord | null>(null);


  const [formData, setFormData] = useState({
    wasteType: 'Plastic',
    quantity: 0,
    unit: 'kg',
    method: 'Mechanical Shredding & Pelletizing',
    status: 'Recycled' as RecyclingStatus,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });


  const [isSaving, setIsSaving] =
    useState(false);


  // ============================================================
  // DELETE
  // ============================================================

  const [deleteTargetId, setDeleteTargetId] =
    useState<string | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);


  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchRecyclingData = async () => {
    try {
      setIsLoading(true);
      setError('');


      const [recordsRes, inventoryRes] =
        await Promise.all([
          recyclingService.getRecyclingRecords({
            wasteType: selectedWasteType,
          }),

          recyclingService.getWasteInventory(),
        ]);


      if (recordsRes.data) {
        setRecords(recordsRes.data);
      }


      if (recordsRes.summary) {
        setSummary(recordsRes.summary);
      }


      if (inventoryRes.data) {
        setInventory(inventoryRes.data);
      }

    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load recycling data';

      setError(message);

    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchRecyclingData();
  }, [selectedWasteType]);


  // ============================================================
  // GET CURRENT STOCK
  // ============================================================

  const getAvailableStock = (
    wasteType: string
  ): number => {
    const stock = inventory.find(
      (item) =>
        item.wasteType === wasteType
    );

    let available =
      stock?.available || 0;


    // While editing, add the current record
    // back temporarily because backend excludes it.
    if (
      editingRecord &&
      editingRecord.wasteType === wasteType &&
      ['Received', 'Processing', 'Recycled']
        .includes(editingRecord.status)
    ) {
      available +=
        Number(editingRecord.quantity || 0);
    }


    return Number(
      available.toFixed(1)
    );
  };


  // ============================================================
  // OPEN ADD
  // ============================================================

  const handleOpenAdd = () => {
    setEditingRecord(null);


    const defaultWasteType = 'Plastic';

    const available =
      getAvailableStock(
        defaultWasteType
      );


    setFormData({
      wasteType: defaultWasteType,

      quantity:
        available > 0
          ? available
          : 0,

      unit: 'kg',

      method:
        'Mechanical Shredding & Pelletizing',

      status: 'Recycled',

      notes: '',

      date:
        new Date()
          .toISOString()
          .split('T')[0],
    });


    setIsModalOpen(true);
  };


  // ============================================================
  // OPEN EDIT
  // ============================================================

  const handleOpenEdit = (
    rec: RecyclingRecord
  ) => {
    setEditingRecord(rec);


    setFormData({
      wasteType: rec.wasteType,

      quantity: rec.quantity,

      unit: rec.unit || 'kg',

      method: rec.method,

      status: rec.status,

      notes: rec.notes || '',

      date:
        rec.date
          ? rec.date.split('T')[0]
          : new Date()
              .toISOString()
              .split('T')[0],
    });


    setIsModalOpen(true);
  };


  // ============================================================
  // WASTE TYPE CHANGE
  // ============================================================

  const handleWasteTypeChange = (
    wasteType: string
  ) => {
    const available =
      getAvailableStock(wasteType);


    setFormData((previous) => ({
      ...previous,

      wasteType,

      quantity:
        available > 0
          ? Math.min(
              previous.quantity || available,
              available
            )
          : 0,
    }));
  };


  // ============================================================
  // STATUS CHANGE
  // ============================================================

  const handleStatusChange = (
    status: RecyclingStatus
  ) => {
    const available =
      getAvailableStock(
        formData.wasteType
      );


    setFormData((previous) => ({
      ...previous,

      status,

      quantity:
        ['Received', 'Processing', 'Recycled']
          .includes(status)
          ? Math.min(
              previous.quantity || available,
              available
            )
          : previous.quantity,
    }));
  };


  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();


    if (
      !formData.wasteType ||
      !formData.quantity ||
      !formData.method
    ) {
      showToast(
        'Please fill all required fields',
        'warning'
      );

      return;
    }


    const quantity =
      Number(formData.quantity);


    if (
      Number.isNaN(quantity) ||
      quantity <= 0
    ) {
      showToast(
        'Quantity must be greater than 0 kg',
        'warning'
      );

      return;
    }


    // ========================================================
    // STOCK VALIDATION
    // ========================================================

    if (
      ['Received', 'Processing', 'Recycled']
        .includes(formData.status)
    ) {
      const available =
        getAvailableStock(
          formData.wasteType
        );


      if (quantity > available) {
        showToast(
          `Only ${available} kg of ${formData.wasteType} is available.`,
          'error'
        );

        return;
      }
    }


    try {
      setIsSaving(true);


      const payload = {
        ...formData,
        quantity,
      };


      if (editingRecord) {
        await recyclingService.updateRecyclingRecord(
          editingRecord._id,
          payload
        );


        showToast(
          'Recycling batch updated successfully',
          'success'
        );

      } else {
        await recyclingService.createRecyclingRecord(
          payload
        );


        showToast(
          'New recycling batch recorded successfully',
          'success'
        );
      }


      setIsModalOpen(false);

      setEditingRecord(null);

      await fetchRecyclingData();

    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save recycling record';


      showToast(
        message,
        'error'
      );

    } finally {
      setIsSaving(false);
    }
  };


  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!deleteTargetId) {
      return;
    }


    try {
      setIsDeleting(true);


      await recyclingService.deleteRecyclingRecord(
        deleteTargetId
      );


      showToast(
        'Recycling record deleted. The quantity is available again.',
        'success'
      );


      setDeleteTargetId(null);


      await fetchRecyclingData();

    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete record';


      showToast(
        message,
        'error'
      );

    } finally {
      setIsDeleting(false);
    }
  };


  // ============================================================
  // WASTE TYPES
  // ============================================================

  const wasteTypes = [
    'All',
    'Plastic',
    'Paper',
    'Organic',
    'Glass',
    'Metal',
    'E-Waste',
    'Mixed Waste',
  ];


  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <LoadingSpinner
        size="lg"
        text="Loading recycling data..."
        className="py-20"
      />
    );
  }


  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="space-y-6">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Industrial Recycling & Processing
          </h1>

          <p className="text-xs text-slate-500">
            Log recycling conversion batches, track methods,
            and manage available waste inventory
          </p>
        </div>


        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />

          <span>
            Log Recycling Batch
          </span>
        </button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <ErrorState
          message={error}
          onRetry={fetchRecyclingData}
        />
      )}


      {/* ======================================================
          SUMMARY KPI
      ====================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

        <DashboardCard
          title="Total Waste Collected"
          value={`${summary?.totalCollectedWaste || 0} kg`}
          icon={Package}
          colorScheme="blue"
        />

        <DashboardCard
          title="Total Recycled"
          value={`${summary?.totalRecycled || 0} kg`}
          icon={RefreshCw}
          colorScheme="emerald"
        />

        <DashboardCard
          title="In Processing"
          value={`${summary?.totalProcessing || 0} kg`}
          icon={Layers}
          colorScheme="amber"
        />

        <DashboardCard
          title="Municipal Recycling Rate"
          value={`${summary?.recyclingRate || 0}%`}
          icon={TrendingUp}
          colorScheme="emerald"
        />

      </div>


      {/* ======================================================
          WASTE INVENTORY
      ====================================================== */}

      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2">

              <Leaf className="w-5 h-5 text-emerald-600" />

              <h2 className="text-base font-extrabold text-slate-900">
                Waste Inventory
              </h2>

            </div>

            <p className="text-xs text-slate-500 mt-1">
              Available waste calculated from employee collections
              and recycling batches
            </p>
          </div>

          <button
            onClick={fetchRecyclingData}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            title="Refresh inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead className="bg-slate-50 border-b border-slate-100">

              <tr>

                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Waste Type
                </th>

                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Collected
                </th>

                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Used
                </th>

                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Available
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {inventory.map((item) => (

                <tr
                  key={item.wasteType}
                  className="hover:bg-slate-50/70"
                >

                  <td className="px-5 py-3.5 font-bold text-slate-800">

                    <div className="flex items-center gap-2">

                      <span className="w-2 h-2 rounded-full bg-emerald-500" />

                      {item.wasteType}

                    </div>

                  </td>


                  <td className="px-5 py-3.5 font-semibold text-slate-600">
                    {item.collected} kg
                  </td>


                  <td className="px-5 py-3.5 font-semibold text-slate-600">
                    {item.used} kg
                  </td>


                  <td className="px-5 py-3.5">

                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 font-extrabold ${
                        item.available > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.available} kg
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">

        {wasteTypes.map((type) => (

          <button
            key={type}
            onClick={() =>
              setSelectedWasteType(type)
            }
            className={`rounded-xl px-3 py-1.5 font-semibold whitespace-nowrap transition-all ${
              selectedWasteType === type
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>

        ))}

      </div>


      {/* ======================================================
          RECORD TABLE
      ====================================================== */}

      {records.length === 0 ? (

        <EmptyState
          title="No recycling batches logged"
          description="Log completed recycling and processing runs to build the citywide sustainability ledger."
          actionText="Log First Batch"
          onAction={handleOpenAdd}
          icon={RefreshCw}
        />

      ) : (

        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs text-slate-600">

              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">

                <tr>

                  <th className="px-5 py-3.5">
                    Batch ID
                  </th>

                  <th className="px-5 py-3.5">
                    Waste Stream
                  </th>

                  <th className="px-5 py-3.5">
                    Batch Quantity
                  </th>

                  <th className="px-5 py-3.5">
                    Processing / Recycling Method
                  </th>

                  <th className="px-5 py-3.5">
                    Batch Date
                  </th>

                  <th className="px-5 py-3.5">
                    Batch Status
                  </th>

                  <th className="px-5 py-3.5 text-right">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {records.map((rec) => (

                  <tr
                    key={rec._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {rec.recordId}
                    </td>


                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {rec.wasteType}
                    </td>


                    <td className="px-5 py-3.5 font-bold text-emerald-700">
                      {rec.quantity}{' '}
                      {rec.unit || 'kg'}
                    </td>


                    <td
                      className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate"
                      title={rec.method}
                    >
                      {rec.method}
                    </td>


                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(
                        rec.date
                      ).toLocaleDateString()}
                    </td>


                    <td className="px-5 py-3.5 whitespace-nowrap">

                      <StatusBadge
                        status={rec.status}
                        size="sm"
                      />

                    </td>


                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1">

                      <button
                        onClick={() =>
                          handleOpenEdit(rec)
                        }
                        title="Edit Record"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>


                      <button
                        onClick={() =>
                          setDeleteTargetId(
                            rec._id
                          )
                        }
                        title="Delete Record"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      <Modal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        title={
          editingRecord
            ? `Edit Recycling Batch - ${editingRecord.recordId}`
            : 'Log New Recycling Batch'
        }
        subtitle="Only waste that is actually available can be processed or recycled"
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >


          {/* WASTE TYPE + QUANTITY */}

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Waste Category *
              </label>

              <select
                value={formData.wasteType}
                onChange={(e) =>
                  handleWasteTypeChange(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              >

                {wasteTypes
                  .filter(
                    (type) =>
                      type !== 'All'
                  )
                  .map((type) => (

                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>

                  ))}

              </select>

            </div>


            <div>

              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Quantity (kg) *
              </label>

              <input
                type="number"
                step="0.1"
                min="0.1"
                max={
                  ['Received', 'Processing', 'Recycled']
                    .includes(formData.status)
                    ? getAvailableStock(
                        formData.wasteType
                      )
                    : undefined
                }
                value={
                  formData.quantity || ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity:
                      parseFloat(
                        e.target.value
                      ) || 0,
                  })
                }
                required
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />

            </div>

          </div>


          {/* STOCK INFO */}

          {[
            'Received',
            'Processing',
            'Recycled',
          ].includes(formData.status) && (

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">

              <div className="flex items-start gap-2">

                <Package className="w-4 h-4 text-emerald-600 mt-0.5" />

                <div className="text-xs">

                  <p className="font-bold text-emerald-800">
                    Available {formData.wasteType} Stock
                  </p>

                  <p className="text-emerald-700 mt-0.5">
                    {getAvailableStock(
                      formData.wasteType
                    )}{' '}
                    kg available
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* WARNING */}

          {formData.quantity > 0 &&
            ['Received', 'Processing', 'Recycled']
              .includes(formData.status) &&
            formData.quantity >
              getAvailableStock(
                formData.wasteType
              ) && (

              <div className="rounded-xl border border-red-200 bg-red-50 p-3">

                <div className="flex items-start gap-2">

                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />

                  <div>

                    <p className="text-xs font-bold text-red-700">
                      Insufficient stock
                    </p>

                    <p className="text-xs text-red-600 mt-0.5">
                      Only{' '}
                      {getAvailableStock(
                        formData.wasteType
                      )}{' '}
                      kg of{' '}
                      {formData.wasteType}{' '}
                      is available.
                    </p>

                  </div>

                </div>

              </div>

            )}


          {/* METHOD */}

          <div>

            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Recycling / Conversion Method *
            </label>

            <input
              type="text"
              value={formData.method}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  method: e.target.value,
                })
              }
              placeholder="e.g. Mechanical Shredding & Pelletizing"
              required
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />

          </div>


          {/* STATUS + DATE */}

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Batch Status *
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as RecyclingStatus
                  )
                }
                className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              >

                <option value="Received">
                  Received (In Storage Depot)
                </option>

                <option value="Processing">
                  Processing (Active Line)
                </option>

                <option value="Recycled">
                  Recycled (Output Complete)
                </option>

                <option value="Rejected">
                  Rejected (Contaminated Batch)
                </option>

              </select>

            </div>


            <div>

              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Batch Processing Date *
              </label>

              <div className="relative">

                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />

                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />

              </div>

            </div>

          </div>


          {/* NOTES */}

          <div>

            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Facility Notes / Output Details
            </label>

            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value,
                })
              }
              placeholder="e.g. Converted into 95kg rPET pellets for secondary manufacturing..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />

          </div>


          {/* BUTTONS */}

          <div className="flex justify-end gap-3 pt-3 border-t">

            <button
              type="button"
              onClick={() =>
                setIsModalOpen(false)
              }
              className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                isSaving ||
                (
                  ['Received', 'Processing', 'Recycled']
                    .includes(formData.status) &&
                  formData.quantity >
                    getAvailableStock(
                      formData.wasteType
                    )
                )
              }
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? 'Saving...'
                : editingRecord
                ? 'Update Record'
                : 'Log Batch'}
            </button>

          </div>

        </form>

      </Modal>


      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() =>
          setDeleteTargetId(null)
        }
        onConfirm={handleDelete}
        title="Delete Recycling Record"
        message="Are you sure you want to remove this recycling record? The quantity will become available for recycling again."
        confirmText="Yes, Delete Record"
        variant="danger"
        isLoading={isDeleting}
      />

    </div>
  );
};