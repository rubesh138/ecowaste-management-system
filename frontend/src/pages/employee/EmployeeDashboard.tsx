import React, { useState } from 'react';
import axios from 'axios';
import {
  Truck,
  Home,
  Factory,
  MapPin,
  Scale,
  Calendar,
  CheckCircle2,
  XCircle,
  Send,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

type CollectionType = 'house' | 'industry' | 'village';

export const EmployeeDashboard: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [collectionType, setCollectionType] =
    useState<CollectionType>('house');

  const [locationName, setLocationName] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [collected, setCollected] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!locationName.trim()) {
      showToast(
        'Please enter the house, industry or village name.',
        'error'
      );
      return;
    }

    if (!wasteType) {
      showToast(
        'Please select the waste type.',
        'error'
      );
      return;
    }

    if (collected && !quantity) {
      showToast(
        'Please enter the collected quantity.',
        'error'
      );
      return;
    }

    if (
      collected &&
      (Number(quantity) <= 0 || isNaN(Number(quantity)))
    ) {
      showToast(
        'Please enter a valid quantity in kg.',
        'error'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.post(
        'http://localhost:5000/api/collections',
        {
          collectionType,
          locationName: locationName.trim(),
          wasteType,
          quantity: collected
            ? Number(quantity)
            : 0,
          collectionDate,
          collected,
          remarks: remarks.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast(
        'Waste collection recorded successfully!',
        'success'
      );

      // Clear form
      setLocationName('');
      setWasteType('');
      setQuantity('');
      setRemarks('');
      setCollected(true);

    } catch (error: any) {
      console.error(
        'Collection submission error:',
        error
      );

      showToast(
        error?.response?.data?.message ||
          'Failed to record collection.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <Truck className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Employee Collection Portal
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Record waste collected from houses, industries and villages
              </p>
            </div>

          </div>

        </div>
      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">


          {/* =================================================
              LEFT INFORMATION
          ================================================= */}

          <div className="lg:col-span-1">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Collection Process
                  </h2>

                  <p className="text-xs text-slate-500">
                    Follow these steps
                  </p>
                </div>

              </div>


              <div className="space-y-5">

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Select location type
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Choose House, Industry or Village.
                    </p>
                  </div>

                </div>


                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Enter collection details
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Record waste type and actual quantity.
                    </p>
                  </div>

                </div>


                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    3
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Confirm collection
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Mark whether the waste was collected.
                    </p>
                  </div>

                </div>


                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    4
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Submit
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      The record will be stored in the system.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              COLLECTION FORM
          ================================================= */}

          <div className="lg:col-span-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Record Waste Collection
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the actual waste collected during your visit.
                </p>

              </div>


              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* LOCATION TYPE */}

                <div>

                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Collection Type
                  </label>

                  <div className="grid grid-cols-3 gap-3">

                    {/* HOUSE */}

                    <button
                      type="button"
                      onClick={() =>
                        setCollectionType('house')
                      }
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                        collectionType === 'house'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                      }`}
                    >
                      <Home className="h-6 w-6" />

                      <span className="text-sm font-semibold">
                        House
                      </span>

                    </button>


                    {/* INDUSTRY */}

                    <button
                      type="button"
                      onClick={() =>
                        setCollectionType('industry')
                      }
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                        collectionType === 'industry'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                      }`}
                    >
                      <Factory className="h-6 w-6" />

                      <span className="text-sm font-semibold">
                        Industry
                      </span>

                    </button>


                    {/* VILLAGE */}

                    <button
                      type="button"
                      onClick={() =>
                        setCollectionType('village')
                      }
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                        collectionType === 'village'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                      }`}
                    >
                      <MapPin className="h-6 w-6" />

                      <span className="text-sm font-semibold">
                        Village
                      </span>

                    </button>

                  </div>

                </div>


                {/* LOCATION NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {collectionType === 'house'
                      ? 'House / Resident Name'
                      : collectionType === 'industry'
                      ? 'Industry Name'
                      : 'Village Name'}
                  </label>

                  <div className="relative">

                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) =>
                        setLocationName(e.target.value)
                      }
                      placeholder={
                        collectionType === 'house'
                          ? 'Enter house / resident name'
                          : collectionType === 'industry'
                          ? 'Enter industry name'
                          : 'Enter village name'
                      }
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />

                  </div>

                </div>


                {/* WASTE TYPE + QUANTITY */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Waste Type
                    </label>

                    <select
                      value={wasteType}
                      onChange={(e) =>
                        setWasteType(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">
                        Select waste type
                      </option>

                      <option value="Organic Waste">
                        Organic Waste
                      </option>

                      <option value="Plastic">
                        Plastic
                      </option>

                      <option value="Paper & Cardboard">
                        Paper & Cardboard
                      </option>

                      <option value="Glass">
                        Glass
                      </option>

                      <option value="Metal">
                        Metal
                      </option>

                      <option value="E-Waste">
                        E-Waste
                      </option>

                      <option value="Mixed Waste">
                        Mixed Waste
                      </option>

                    </select>

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Collected Quantity
                    </label>

                    <div className="relative">

                      <Scale className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(e.target.value)
                        }
                        placeholder="Enter quantity"
                        disabled={!collected}
                        className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
                      />

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        kg
                      </span>

                    </div>

                  </div>

                </div>


                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Collection Date
                  </label>

                  <div className="relative">

                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      value={collectionDate}
                      onChange={(e) =>
                        setCollectionDate(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />

                  </div>

                </div>


                {/* COLLECTION STATUS */}

                <div>

                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Collection Status
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setCollected(true)
                      }
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                        collected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />

                      Yes, Waste Collected
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        setCollected(false)
                      }
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                        !collected
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      <XCircle className="h-5 w-5" />

                      No, Not Collected
                    </button>

                  </div>

                </div>


                {/* REMARKS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Employee Remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(e) =>
                      setRemarks(e.target.value)
                    }
                    rows={3}
                    placeholder="Enter any collection remarks..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving Collection...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Collection Record
                    </>
                  )}

                </button>

              </form>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default EmployeeDashboard;